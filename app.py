from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from functools import wraps
from datetime import datetime
import flask

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
import os
from werkzeug.utils import secure_filename
import pickle
import cv2
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import json
import matplotlib.pyplot as plt
from imutils import paths
import base64
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    return add_cors_headers(response)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.urandom(24)

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_features(image):
    try:
        print("\nExtracting features from image...")
        print(f"Input image shape: {image.shape}")
        
        # Convert to grayscale
        print("Converting to grayscale...")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        print(f"Grayscale shape: {gray.shape}")
        
        # Calculate HOG features
        print("Setting up HOG descriptor...")
        win_size = (64, 64)
        block_size = (16, 16)
        block_stride = (8, 8)
        cell_size = (8, 8)
        nbins = 9
        hog = cv2.HOGDescriptor(win_size, block_size, block_stride, cell_size, nbins)
        
        # Resize image to match win_size
        print(f"Resizing image to {win_size}...")
        resized = cv2.resize(gray, win_size)
        print(f"Resized shape: {resized.shape}")
        
        print("Computing HOG features...")
        hog_features = hog.compute(resized)
        print(f"HOG features shape: {hog_features.shape}")
        
        return hog_features.flatten()
    except Exception as e:
        print(f"Error in extract_features: {str(e)}")
        raise

def load_dataset():
    # Load dataset paths
    bio_paths = list(paths.list_images('dataset/Bio'))
    non_bio_paths = list(paths.list_images('dataset/Non-Bio'))
    
    # Create some dummy features (3 samples with 10 features each)
    features = np.random.rand(3, 10)
    # Create corresponding labels (1 for Bio, 0 for Non-Bio)
    labels = np.array([1, 0, 1])
    
    return features, labels

# Load or train the model
MODEL_PATH = 'model.pkl'

if os.path.exists(MODEL_PATH):
    try:
        print("Attempting to load existing model...")
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
            print("Model loaded successfully")
            print(f"Model type: {type(model)}")
            print(f"Model parameters: {model.get_params()}\n")
    except EOFError:
        print("Error: Model file corrupted")
        print("Removing corrupted model file and creating new model...")
        os.remove(MODEL_PATH)
        
        try:
            features, labels = load_dataset()
            model = KNeighborsClassifier(n_neighbors=3)
            print("\nTraining new model...")
            model.fit(features, labels)
            print("\nModel training completed successfully")
            
            with open(MODEL_PATH, 'wb') as f:
                pickle.dump(model, f)
                print("\nNew model saved successfully")
                print(f"Model type: {type(model)}")
                print(f"Model parameters: {model.get_params()}\n")
        except Exception as e:
            print(f"Error creating new model: {str(e)}")
            raise
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise
else:
    print("No existing model found. Creating new model...")
    
    try:
        features, labels = load_dataset()
        model = KNeighborsClassifier(n_neighbors=3)
        print("\nTraining new model...")
        model.fit(features, labels)
        print("\nModel training completed successfully")
        
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model, f)
            print("\nNew model saved successfully")
            print(f"Model type: {type(model)}")
            print(f"Model parameters: {model.get_params()}\n")
    except Exception as e:
        print(f"Error creating new model: {str(e)}")
        raise

@app.route('/api/predict', methods=['POST'])
def predict():
    print("\nReceived prediction request")
    try:
        data = request.json
        print(f"Request data: {data}")
        
        if 'image' not in data:
            print("Error: No image provided in request")
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        print("Decoding image...")
        image_data = base64.b64decode(data['image'])
        print(f"Image data size: {len(image_data)} bytes")
        
        # Convert to PIL Image
        print("Converting to PIL Image...")
        try:
            image = Image.open(io.BytesIO(image_data))
            print(f"Image size: {image.size}")
            
            # Convert to numpy array
            print("Converting to numpy array...")
            image = np.array(image)
            print(f"Numpy array shape: {image.shape}")
            
            # Extract features
            print("Extracting features...")
            features = extract_features(image)
            print(f"Feature shape: {features.shape}")
            
            # Make prediction
            print("Making prediction...")
            try:
                prediction = model.predict([features])[0]
                confidence = model.predict_proba([features]).max()
                
                # Convert prediction to class name
                class_name = 'Biodegradable' if prediction == 1 else 'Non-Biodegradable'
                
                print(f"Prediction: {class_name} (confidence: {confidence:.2f})")
                
                # Emit to WebSocket
                print("Emitting prediction to WebSocket...")
                socketio.emit('new_prediction', {
                    'prediction': class_name,
                    'confidence': float(confidence)
                })
                
                return jsonify({
                    'prediction': class_name,
                    'confidence': float(confidence)
                })
            except Exception as pred_err:
                print(f"Prediction error: {str(pred_err)}")
                return jsonify({'error': f'Prediction failed: {str(pred_err)}'}), 500
                
        except Exception as img_err:
            print(f"Image processing error: {str(img_err)}")
            return jsonify({'error': f'Image processing failed: {str(img_err)}'}), 500
            
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Load and process the image
        image = cv2.imread(filepath)
        if image is None:
            return jsonify({'error': 'Failed to load image'}), 400
            
        # Extract features
        features = extract_features(image)
        features = features.reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features)[0]
        confidence = model.predict_proba(features)[0]
        
        result = {
            'prediction': 'biodegradable' if prediction == 1 else 'non-biodegradable',
            'confidence': float(confidence[prediction])
        }
        
        return jsonify(result)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/ws')
def websocket():
    return socketio.handle_request(request)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def save_to_database(result):
    # TODO: Implement database saving logic
    pass

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Flask version: {flask.__version__}")
    print(f"SocketIO version: {socketio.__version__}")
    print("\nAvailable endpoints:")
    print("/ - Main page")
    print("/api/test - GET endpoint for testing")
    print("/api/predict - POST endpoint for image prediction")
    print("/ws - WebSocket endpoint")
    print("\nServer running on port 5000")
    
    try:
        # Try to load existing model
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
            print("Loaded existing model successfully")
    except (FileNotFoundError, EOFError, pickle.UnpicklingError) as e:
        print(f"Error loading model: {str(e)}")
        print("Creating new model...")
        
        try:
            # Load dataset
            features, labels = load_dataset()
            print(f"Training model with {len(features)} samples")
            
            # Create and train model
            model = KNeighborsClassifier(n_neighbors=3)
            model.fit(features, labels)
            print("Model trained successfully")
            
            # Save model
            with open('model.pkl', 'wb') as f:
                pickle.dump(model, f)
                print("Model saved successfully")
        except Exception as e:
            print(f"Error creating new model: {str(e)}")
            raise
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
