import os
import sys
import uuid
import pandas as pd
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
import logging
from datetime import datetime, timedelta 
import json
from sqlalchemy import text
import ssl

# NEW ADD UPDATE
import string
import random
from flask_mail import Mail, Message


# FIXED TensorFlow imports
import tensorflow as tf
# Use tf.keras instead of tensorflow.keras
load_model = tf.keras.models.load_model

# Add cv2 import if not already there
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    print("⚠️ OpenCV not installed. Run: pip install opencv-python")
    CV2_AVAILABLE = False

# Clean TensorFlow imports
import tensorflow as tf
print(f"✅ TensorFlow version: {tf.__version__}")

from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

# Only use try-except for optional packages
try:
    from ultralytics import YOLO
except ImportError:
    print("❌ ultralytics not installed. Run: pip install ultralytics")

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model # type: ignore
    from tensorflow.keras.preprocessing import image # type: ignore
    from tensorflow.keras.utils import img_to_array # type: ignore
    
    # Set a flag to indicate TensorFlow is available
    TENSORFLOW_AVAILABLE = True
except ImportError:
    print("❌ tensorflow not installed. Run: pip install tensorflow")
    TENSORFLOW_AVAILABLE = False
    # Define fallbacks to avoid unbound errors
    tf = None
    load_model = None
    image = None
    img_to_array = None

# ================= FLASK APP =================
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# ================= DATABASE CONFIGURATION =================
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.environ.get('DB_USERNAME')}:{os.environ.get('DB_PASSWORD')}"
    f"@{os.environ.get('DB_HOST', 'localhost')}/{os.environ.get('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# NEW UPDATE
# ================= MAILER CONFIGURATION =================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = (
    os.getenv('EMAIL_SENDER_NAME'),
    os.getenv('EMAIL_USERNAME')
)


# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
# NEW UPDATE
mail = Mail(app)


# ================= EMAIL FUNCTION FOR ADMIN UPDATES =================
def send_admin_update_email(user_email, user_name, report_species, admin_message, report_status=None, report_details=None):
    """Send email notification to user about admin update on their report"""
    try:
        print(f"📧 Preparing to send email to {user_email} for {report_species} report")
        
        # Create message
        msg = Message(
            subject=f"📢 AnimalCare+ Update: Your {report_species} Report",
            recipients=[user_email],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Prepare admin message HTML-safe
        admin_message_html = admin_message.replace('\n', '<br>')

        # Create HTML email
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; }}
                .message-box {{ background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐾 AnimalCare+ Report Update</h1>
                </div>
                
                <div class="content">
                    <h2>Hello {user_name},</h2>
                    <p>Your wildlife report has been updated by our admin team.</p>
                    
                    <h3 style="color: #2E7D32;">Report: {report_species}</h3>
                    
                    {f"<p><strong>Status:</strong> {report_status.replace('_', ' ').title()}</p>" if report_status else ""}
                    
                    <div class="message-box">
                        <h4 style="margin-top: 0; color: #2E7D32;">Admin Message:</h4>
                        <p>{admin_message_html}</p>
                    </div>
                    
                    {f'<p><strong>Details:</strong><br>{report_details}</p>' if report_details else ''}
                    
                    <p>You can view your report and check for updates by logging into your AnimalCare+ dashboard.</p>
                    
                    <p>Thank you for helping protect wildlife!</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message from AnimalCare+ Wildlife Monitoring System.</p>
                    <p>📍 Wildlife Conservation Center | 🌍 Protecting Endangered Species</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        msg.body = f"""
AnimalCare+ Report Update

Hello {user_name},

Your wildlife report for {report_species} has been updated by our admin team.

Admin Message:
{admin_message}

{("Status: " + report_status.replace('_', ' ').title()) if report_status else ""}

You can view your report and check for updates by logging into your AnimalCare+ dashboard.

Thank you for helping protect wildlife!

Best regards,
The AnimalCare+ Team

This is an automated message. Please do not reply to this email.
"""
        
        # Send the email
        mail.send(msg)
        print(f"✅ Email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email to {user_email}: {e}")
        return False

# ================= FIXED DATABASE MODELS =================
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')
    is_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(6), nullable=True) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    sightings = db.relationship('Sighting', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

class Sighting(db.Model):
    __tablename__ = 'sighting'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    species = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(50))
    condition_confidence = db.Column(db.Float)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    image_path = db.Column(db.String(200))
    detection_type = db.Column(db.String(20))
    
    # Animal information fields
    conservation_status = db.Column(db.String(50))
    habitat = db.Column(db.String(200))
    lifespan = db.Column(db.String(50))
    population = db.Column(db.String(100))
    recommended_care = db.Column(db.Text)
    character_traits = db.Column(db.Text)  # ADDED: Character traits field
    
    # NEW: Detailed sighting information
    sighting_date = db.Column(db.DateTime)
    specific_location = db.Column(db.Text)
    number_of_animals = db.Column(db.Integer, default=1)
    behavior_observed = db.Column(db.String(200))
    observer_notes = db.Column(db.Text)
    user_contact = db.Column(db.String(100))
    urgency_level = db.Column(db.String(20), default='medium')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': {
                'username': user.username if user else 'Unknown User',
                'email': user.email if user else 'unknown@email.com'
            },
            'species': self.species,
            'confidence': round(self.confidence, 2),
            'condition': self.condition,
            'condition_confidence': self.condition_confidence,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'image_path': self.image_path,
            'detection_type': self.detection_type,
            'conservation_status': self.conservation_status,
            'habitat': self.habitat,
            'lifespan': self.lifespan,
            'population': self.population,
            'recommended_care': self.recommended_care,
            'character_traits': self.character_traits,  # ADDED: Character traits
            'sighting_date': self.sighting_date.isoformat() if self.sighting_date else None,
            'specific_location': self.specific_location,
            'number_of_animals': self.number_of_animals,
            'behavior_observed': self.behavior_observed,
            'observer_notes': self.observer_notes,
            'user_contact': self.user_contact,
            'urgency_level': self.urgency_level,
            'created_at': self.created_at.isoformat()
        }

# ✅ FIXED: Admin History Model with corrected relationship
class AdminHistory(db.Model):
    __tablename__ = 'admin_history'
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'), nullable=False)
    admin_name = db.Column(db.String(100), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    previous_status = db.Column(db.String(20))
    new_status = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    report = db.relationship('Report', backref=db.backref('admin_histories', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'admin_name': self.admin_name,
            'action': self.action,
            'notes': self.notes,
            'previous_status': self.previous_status,
            'new_status': self.new_status,
            'created_at': self.created_at.isoformat()
        }

class Report(db.Model):
    __tablename__ = 'report'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sighting_id = db.Column(db.Integer, db.ForeignKey('sighting.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    urgency = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    evidence_images = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    detailed_sighting_data = db.Column(db.JSON)
    admin_notes = db.Column(db.Text)
    
    # ✅ FIXED: Relationships with proper typing
    user = db.relationship('User', backref=db.backref('reports', lazy=True))
    sighting = db.relationship('Sighting', backref=db.backref('report', uselist=False))
    
    def to_dict(self):
        sighting_data = {}
        detailed_data = {}
        
        if self.sighting:
            sighting_data = {
                'species': self.sighting.species,
                'confidence': self.sighting.confidence,
                'condition': self.sighting.condition,
                'condition_confidence': self.sighting.condition_confidence,
                'conservation_status': self.sighting.conservation_status,
                'habitat': self.sighting.habitat,
                'lifespan': self.sighting.lifespan,
                'population': self.sighting.population,
                'recommended_care': self.sighting.recommended_care,
                'character_traits': self.sighting.character_traits,  # ADDED: Character traits
                'image_path': self.sighting.image_path,
                'detection_type': self.sighting.detection_type,
                'sighting_date': self.sighting.sighting_date.isoformat() if self.sighting.sighting_date else None,
                'specific_location': self.sighting.specific_location,
                'number_of_animals': self.sighting.number_of_animals,
                'behavior_observed': self.sighting.behavior_observed,
                'observer_notes': self.sighting.observer_notes,
                'user_contact': self.sighting.user_contact,
                'urgency_level': self.sighting.urgency_level
            }
        else:
            sighting_data = {
                'species': 'Unknown Species',
                'confidence': 0,
                'condition': 'Unknown',
                'condition_confidence': 0,
                'conservation_status': None,
                'habitat': None,
                'lifespan': None,
                'population': None,
                'recommended_care': None,
                'character_traits': None,  # ADDED: Character traits
                'image_path': None,
                'detection_type': 'manual_report'
            }
        
        if self.detailed_sighting_data:
            detailed_data = self.detailed_sighting_data
        
        # Get admin history for this report
        admin_history = AdminHistory.query.filter_by(report_id=self.id).all()
        admin_history_data = [history.to_dict() for history in admin_history]
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else 'Unknown User',
            'user_email': self.user.email if self.user else 'Unknown Email',
            'sighting_id': self.sighting_id,
            'title': self.title,
            'description': self.description,
            'report_type': self.report_type,
            'urgency': self.urgency,
            'status': self.status,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'evidence_images': self.evidence_images or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'detailed_sighting_data': detailed_data,
            'admin_notes': self.admin_notes,
            'admin_history': admin_history_data,  # ✅ Now properly fetched from AdminHistory
            **sighting_data
        }

class UserNotification(db.Model):
    __tablename__ = 'user_notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50))
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    report_data = db.Column(db.JSON)
    
    # ✅ ADD THESE 2 LINES:
    email_sent = db.Column(db.Boolean, default=False)
    email_error = db.Column(db.Text)
    
    # Relationships
    user = db.relationship('User', backref='notifications')
    report = db.relationship('Report', backref='notifications')

    def __init__(self, user_id=None, report_id=None, message=None, status=None, admin_notes=None, report_data=None):
        if user_id is not None:
            self.user_id = user_id
        if report_id is not None:
            self.report_id = report_id
        if message is not None:
            self.message = message
        if status is not None:
            self.status = status
        if admin_notes is not None:
            self.admin_notes = admin_notes
        if report_data is not None:
            self.report_data = report_data

    def to_dict(self):
        species = 'Unknown Species'
        confidence = 0
        condition = 'Unknown'
        condition_confidence = 0
        detection_type = 'manual_report'
        conservation_status = None
        habitat = None
        population = None
        recommended_care = None
        character_traits = None  # ADDED: Character traits
        image_path = None
        evidence_images = []
        
        detailed_sighting_data = {}
        sighting_date = None
        specific_location = None
        number_of_animals = None
        behavior_observed = None
        observer_notes = None
        urgency_level = None
        
        if self.report_data:
            species = self.report_data.get('species', 'Unknown Species')
            confidence = self.report_data.get('confidence', 0)
            condition = self.report_data.get('condition', 'Unknown')
            condition_confidence = self.report_data.get('condition_confidence', 0)
            detection_type = self.report_data.get('detection_type', 'manual_report')
            conservation_status = self.report_data.get('conservation_status')
            habitat = self.report_data.get('habitat')
            population = self.report_data.get('population')
            recommended_care = self.report_data.get('recommended_care')
            character_traits = self.report_data.get('character_traits')  # ADDED: Character traits
            image_path = self.report_data.get('image_path')
            evidence_images = self.report_data.get('evidence_images', [])
            
            detailed_sighting_data = self.report_data.get('detailed_sighting_data', {})
            sighting_date = self.report_data.get('sighting_date')
            specific_location = self.report_data.get('specific_location')
            number_of_animals = self.report_data.get('number_of_animals')
            behavior_observed = self.report_data.get('behavior_observed')
            observer_notes = self.report_data.get('observer_notes')
            urgency_level = self.report_data.get('urgency_level')
        elif self.report and self.report.sighting:
            species = self.report.sighting.species
            confidence = self.report.sighting.confidence
            condition = self.report.sighting.condition
            condition_confidence = self.report.sighting.condition_confidence
            detection_type = self.report.sighting.detection_type
            conservation_status = self.report.sighting.conservation_status
            habitat = self.report.sighting.habitat
            population = self.report.sighting.population
            recommended_care = self.report.sighting.recommended_care
            character_traits = self.report.sighting.character_traits  # ADDED: Character traits
            image_path = self.report.sighting.image_path
            evidence_images = self.report.evidence_images or []
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_id': self.report_id,
            'species': species,
            'message': self.message,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat(),
            'is_read': self.is_read,
             # ✅ ADD THESE 2 LINES:
            'email_sent': self.email_sent,
            'email_error': self.email_error,
            'confidence': confidence,
            'condition': condition,
            'condition_confidence': condition_confidence,
            'detection_type': detection_type,
            'conservation_status': conservation_status,
            'habitat': habitat,
            'population': population,
            'recommended_care': recommended_care,
            'character_traits': character_traits,  # ADDED: Character traits
            'image_path': image_path,
            'evidence_images': evidence_images,
            'detailed_sighting_data': detailed_sighting_data,
            'sighting_date': sighting_date,
            'specific_location': specific_location,
            'number_of_animals': number_of_animals,
            'behavior_observed': behavior_observed,
            'observer_notes': observer_notes,
            'urgency_level': urgency_level
        }

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ================= RELATIVE PATHS =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"📁 Our project folder is: {BASE_DIR}")

MODEL_DIR = os.path.join(BASE_DIR, "public", "models", "onnx_models")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
CONDITION_MODEL_PATH = os.path.join(BASE_DIR, "public", "models", "conditions_models", "cnn_final_model.h5")
ANIMAL_DATA_PATH = os.path.join(BASE_DIR, "animal_data.csv")

# ================= AUTOMATIC DIRECTORY CREATION =================
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"✅ Created uploads folder: {UPLOAD_DIR}")

# ================= BETTER ERROR HANDLING =================
print("🔄 Checking if all model files exist...")

required_files = {
    "Mammals Model": os.path.join(MODEL_DIR, "best.onnx"),
    "Birds Model": os.path.join(MODEL_DIR, "best2.onnx"),
    "Condition Model": CONDITION_MODEL_PATH,
    "Animal Data": ANIMAL_DATA_PATH
}

for file_name, file_path in required_files.items():
    if os.path.exists(file_path):
        print(f"✅ {file_name}: FOUND")
    else:
        print(f"❌ {file_name}: MISSING - {file_path}")

# ================= LOAD MODELS WITH ERROR HANDLING =================
print("\n🔄 Loading AI models...")

models = {}
condition_model = None
animal_data_df = None
condition_labels = ["Healthy", "Injured", "Malnourished"]

try:
    models = {
        "mammals": [YOLO(os.path.join(MODEL_DIR, "best.onnx"), task='detect')],
        "birds": [YOLO(os.path.join(MODEL_DIR, "best2.onnx"), task='detect')],
    }
    print("✅ YOLO models loaded successfully!")
    
    print("\n🔍 Model Loading Debug Info:")
    for model_type, model_list in models.items():
        print(f"  {model_type}: {len(model_list)} models loaded")
        for i, model in enumerate(model_list):
            print(f"    Model 1: {model}")
            
except Exception as e:
    print(f"❌ Failed to load YOLO models: {e}")


try:
    if TENSORFLOW_AVAILABLE:
        print(f"🔄 Loading condition model from: {CONDITION_MODEL_PATH}")
        
        if not os.path.exists(CONDITION_MODEL_PATH):
            print(f"❌ Model file not found!")
            condition_model = None
        else:
            # WORKAROUND 1: Try loading with custom objects first
            print("🔄 Attempting to load with batch_shape workaround...")
            
            from tensorflow.keras.layers import InputLayer
            
            # Create a custom InputLayer that handles batch_shape parameter
            class CompatibleInputLayer(InputLayer):
                def __init__(self, *args, **kwargs):
                    # Check if batch_shape is in kwargs (this is the problematic parameter)
                    if 'batch_shape' in kwargs:
                        print(f"⚠️  Detected batch_shape parameter: {kwargs['batch_shape']}")
                        # Convert batch_shape to input_shape
                        batch_shape_val = kwargs.pop('batch_shape')
                        if batch_shape_val and len(batch_shape_val) == 4:
                            # batch_shape is (None, 150, 150, 3)
                            # input_shape should be (150, 150, 3)
                            kwargs['input_shape'] = batch_shape_val[1:]
                            print(f"✅ Converted batch_shape to input_shape: {kwargs['input_shape']}")
                    
                    # Call parent constructor
                    super().__init__(*args, **kwargs)
            
            try:
                # Method 1: Try with custom objects
                condition_model = tf.keras.models.load_model(
                    CONDITION_MODEL_PATH,
                    custom_objects={'InputLayer': CompatibleInputLayer},
                    compile=False
                )
                print("✅ Condition model loaded successfully with batch_shape workaround!")
            except Exception as e1:
                print(f"⚠️  Method 1 failed: {e1}")
                
                # Method 2: Try loading just the architecture and weights separately
                print("🔄 Trying alternative loading method...")
                try:
                    # Load model without custom objects first
                    condition_model = tf.keras.models.load_model(
                        CONDITION_MODEL_PATH,
                        compile=False
                    )
                    print("✅ Condition model loaded (simple method worked!)")
                except:
                    # Method 3: Try to rebuild the model
                    print("🔄 Attempting to rebuild model architecture...")
                    try:
                        # Based on your model's input shape (150, 150, 3) and 3 output classes
                        from tensorflow.keras.models import Sequential
                        from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
                        
                        # Build a model with similar architecture
                        model = Sequential([
                            Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
                            MaxPooling2D(2, 2),
                            Conv2D(64, (3, 3), activation='relu'),
                            MaxPooling2D(2, 2),
                            Conv2D(128, (3, 3), activation='relu'),
                            MaxPooling2D(2, 2),
                            Flatten(),
                            Dense(512, activation='relu'),
                            Dropout(0.5),
                            Dense(3, activation='softmax')
                        ])
                        
                        # Try to load weights
                        model.load_weights(CONDITION_MODEL_PATH)
                        condition_model = model
                        print("✅ Model rebuilt and weights loaded!")
                    except Exception as e3:
                        print(f"❌ All loading methods failed: {e3}")
                        condition_model = None
            
            if condition_model:
                # Print model details
                print(f"📋 Model details:")
                print(f"   Input shape: {condition_model.input_shape}")
                print(f"   Output shape: {condition_model.output_shape}")
                
                # Test prediction
                try:
                    import numpy as np
                    # Create dummy input matching the model's expected input shape
                    dummy_input = np.random.random((1, 150, 150, 3)).astype(np.float32)
                    prediction = condition_model.predict(dummy_input, verbose=0)
                    print(f"✅ Model test passed!")
                    print(f"   Output shape: {prediction.shape}")
                    print(f"   Sample output: {prediction[0]}")
                except Exception as test_error:
                    print(f"⚠️ Model test warning: {test_error}")
        
    else:
        print("❌ TensorFlow not available")
        condition_model = None
        
except Exception as e:
    print(f"❌ Failed to load condition model: {e}")
    import traceback
    traceback.print_exc()
    condition_model = None

try:
    if os.path.exists(ANIMAL_DATA_PATH):
        animal_data_df = pd.read_csv(ANIMAL_DATA_PATH)
        print(f"✅ Animal data loaded: {len(animal_data_df)} species")
        print(f"📊 Sample species: {animal_data_df['animal_type'].head(3).tolist()}")
        print(f"🔍 Animal data columns: {animal_data_df.columns.tolist()}")
    else:
        print("ℹ️  No animal_data.csv found - running without animal info")
except Exception as e:
    print(f"❌ Failed to load animal data: {e}")

print("🚀 Backend initialization complete!")

# ================= DATABASE INITIALIZATION =================
def initialize_database():
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully!")

            # Check if detailed_sighting_data column exists, if not add it
            try:
                result = db.session.execute(text("DESCRIBE report"))
                columns = [row[0] for row in result]
                if 'detailed_sighting_data' not in columns:
                    print("🔄 Adding missing column: detailed_sighting_data")
                    db.session.execute(text("ALTER TABLE report ADD COLUMN detailed_sighting_data JSON"))
                    db.session.commit()
                    print("✅ Added detailed_sighting_data column to report table")
            except Exception as e:
                print(f"⚠️ Could not check/alter table structure: {e}")
            
            try:
                result = db.session.execute(text("DESCRIBE user_notification"))
                columns = [row[0] for row in result]
                
                if 'email_sent' not in columns:
                    print("🔄 Adding email_sent column...")
                    db.session.execute(text("ALTER TABLE user_notification ADD COLUMN email_sent BOOLEAN DEFAULT FALSE"))
                
                if 'email_error' not in columns:
                    print("🔄 Adding email_error column...")
                    db.session.execute(text("ALTER TABLE user_notification ADD COLUMN email_error TEXT"))
                
                db.session.commit()
                print("✅ Email fields added")
            except Exception as e:
                print(f"⚠️ Email fields: {e}")
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")   
            
            # ✅ ADD: Check and add report_data column to user_notification
            try:
                result = db.session.execute(text("DESCRIBE user_notification"))
                columns = [row[0] for row in result]
                if 'report_data' not in columns:
                    print("🔄 Adding missing column: report_data to user_notification")
                    db.session.execute(text("ALTER TABLE user_notification ADD COLUMN report_data JSON"))
                    db.session.commit()
                    print("✅ Added report_data column to user_notification table")
            except Exception as e:
                print(f"⚠️ Could not check/alter user_notification table structure: {e}")
            
            # ✅ ADD: Check and add admin_notes column to report
            try:
                result = db.session.execute(text("DESCRIBE report"))
                columns = [row[0] for row in result]
                if 'admin_notes' not in columns:
                    print("🔄 Adding missing column: admin_notes to report")
                    db.session.execute(text("ALTER TABLE report ADD COLUMN admin_notes TEXT"))
                    db.session.commit()
                    print("✅ Added admin_notes column to report table")
            except Exception as e:
                print(f"⚠️ Could not check/alter report table structure: {e}")
            
            # ✅ ADD: Check and create admin_history table if it doesn't exist
            try:
                result = db.session.execute(text("SHOW TABLES LIKE 'admin_history'"))
                if not result.fetchone():
                    print("🔄 Creating admin_history table...")
                    db.session.execute(text("""
                        CREATE TABLE admin_history (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            report_id INT NOT NULL,
                            admin_name VARCHAR(100) NOT NULL,
                            action VARCHAR(50) NOT NULL,
                            notes TEXT,
                            previous_status VARCHAR(20),
                            new_status VARCHAR(20),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE
                        )
                    """))
                    db.session.commit()
                    print("✅ Created admin_history table")
            except Exception as e:
                print(f"⚠️ Could not create admin_history table: {e}")
            
            # ✅ ADD: Check and add character_traits column to sighting
            try:
                result = db.session.execute(text("DESCRIBE sighting"))
                columns = [row[0] for row in result]
                if 'character_traits' not in columns:
                    print("🔄 Adding missing column: character_traits to sighting")
                    db.session.execute(text("ALTER TABLE sighting ADD COLUMN character_traits TEXT"))
                    db.session.commit()
                    print("✅ Added character_traits column to sighting table")
            except Exception as e:
                print(f"⚠️ Could not check/alter sighting table structure: {e}")
            
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User()
                admin.username = 'admin'
                admin.email = 'admin@wildlife.com'
                admin.role = 'admin'
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("✅ Default admin user created: admin / admin123")
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")

def fix_database_schema():
    """Fix the location column naming issue"""
    with app.app_context():
        try:
            # Check and fix the location_lng column
            result = db.session.execute(text("DESCRIBE report"))
            columns = [row[0] for row in result]
            
            if 'location_Ing' in columns and 'location_lng' not in columns:
                print("🔄 Renaming location_Ing to location_lng")
                db.session.execute(text("ALTER TABLE report CHANGE location_Ing location_lng FLOAT"))
                db.session.commit()
                print("✅ Fixed column name from location_Ing to location_lng")
            elif 'location_lng' not in columns:
                print("🔄 Adding location_lng column")
                db.session.execute(text("ALTER TABLE report ADD COLUMN location_lng FLOAT"))
                db.session.commit()
                print("✅ Added location_lng column")
                
        except Exception as e:
            print(f"⚠️ Could not fix database schema: {e}")

# Initialize database and fix schema
initialize_database()
fix_database_schema()

# ================= HELPER FUNCTIONS =================
def analyze_condition(img_path: str):
    """Analyze animal condition using your trained CNN model"""
    if condition_model is None:
        print("⚠️ Condition model not available!")
        return {"label": "Unknown", "confidence": 0.0}
    
    try:
        print(f"🔍 Analyzing condition for: {os.path.basename(img_path)}")
        
        import cv2
        import numpy as np
        
        # 1. Load image with OpenCV
        img = cv2.imread(img_path)
        if img is None:
            print(f"❌ Could not read image")
            return {"label": "Unknown", "confidence": 0.0}
        
        print(f"✅ Image loaded: {img.shape}")
        
        # 2. Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # 3. Resize to 150x150 (MATCHES YOUR CNN TRAINING SIZE!)
        img_resized = cv2.resize(img_rgb, (150, 150))
        
        # 4. Normalize to [0, 1]
        img_normalized = img_resized.astype(np.float32) / 255.0
        
        # 5. Add batch dimension: (1, 150, 150, 3)
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        print(f"✅ Preprocessed shape: {img_batch.shape}")
        
        # 6. Get prediction from your CNN model
        preds = condition_model.predict(img_batch, verbose=0)[0]
        
        # 7. Apply softmax (your model already has softmax, but for safety)
        exp_preds = np.exp(preds - np.max(preds))
        preds_softmax = exp_preds / np.sum(exp_preds)
        
        # 8. Get top prediction
        # Your CNN classes: ["healthy", "injured", "malnourished"]
        class_names = ["Healthy", "Injured", "Malnourished"]
        top_idx = int(np.argmax(preds_softmax))
        top_confidence = float(preds_softmax[top_idx]) * 100
        top_condition = class_names[top_idx]
        
        # Debug output
        print(f"📊 Condition probabilities:")
        for i, (name, prob) in enumerate(zip(class_names, preds_softmax)):
            arrow = " ⬅ PREDICTED" if i == top_idx else ""
            print(f"   {name}: {prob*100:5.1f}%{arrow}")
        
        print(f"🎯 Final prediction: {top_condition} ({top_confidence:.1f}%)")
        
        return {
            "label": top_condition, 
            "confidence": round(top_confidence, 2),
            "probabilities": {
                "healthy": float(preds_softmax[0]) * 100,
                "injured": float(preds_softmax[1]) * 100,
                "malnourished": float(preds_softmax[2]) * 100
            }
        }
        
    except Exception as e:
        print(f"❌ Condition analysis error: {e}")
        import traceback
        traceback.print_exc()
        return {"label": "Unknown", "confidence": 0.0}

def get_animal_info(species_name: str):
    # Fixed: Check if animal_data_df is not None and is a DataFrame
    if animal_data_df is None or not isinstance(animal_data_df, pd.DataFrame):
        return None
    
    try:
        possible_columns = ['animal_type', 'species', 'common_name', 'name', 'animal', 'class']
        found_data = None
        
        for col in possible_columns:
            if col in animal_data_df.columns:
                animal_data_df[col] = animal_data_df[col].fillna('')
                match = animal_data_df[animal_data_df[col].str.lower() == species_name.lower()]
                if not match.empty:
                    # Fixed: Ensure we're working with a proper pandas Series, not bytes
                    row_data = match.iloc[0]
                    if hasattr(row_data, 'to_dict'):
                        found_data = row_data.to_dict()
                    else:
                        # Fallback: manually create dict if to_dict() fails
                        found_data = {}
                        for key in match.columns:
                            found_data[key] = row_data[key] if key in row_data else None
                    break
        
        if found_data:
            clean_data = {}
            column_mapping = {
                'animal_type': 'species',
                'conservation_status': 'conservation_status', 
                'estimated_population': 'population',
                'habitat': 'habitat',
                'lifespan': 'lifespan',
                'health_recommendation_injured': 'care_injured',
                'health_recommendation_malnourished': 'care_malnourished',
                'health_recommendation': 'care_general',
                'character_traits': 'character_traits'  # ADDED: Character traits mapping
            }
            
            for original_key, value in found_data.items():
                # Fixed: Properly check for NaN/None values
                if value is not None and not (isinstance(value, float) and np.isnan(value)) and original_key in column_mapping:
                    new_key = column_mapping[original_key]
                    clean_data[new_key] = value
            
            return clean_data if clean_data else None
        
        return None
    except Exception as e:
        print(f"⚠️  Error looking up animal info for {species_name}: {e}")
        return None

def process_frame(frame, model_choice):
    try:
        temp_path = os.path.join(UPLOAD_DIR, f"temp_frame_{uuid.uuid4()}.jpg")
        cv2.imwrite(temp_path, frame)
        
        aggregated = {}
        selected_models = models.get(model_choice, [])
        print(f"🔍 Using {len(selected_models)} models for {model_choice}")
        
        for i, model in enumerate(selected_models):
            try:
                print(f"🔍 Running model {i+1}...")
                
                # FIX: Add cleanup for ONNX runtime between predictions
                if hasattr(model, '_session'):
                    try:
                        # Release ONNX session resources
                        import gc
                        del model._session
                        gc.collect()
                    except:
                        pass
                
                # FIX: Use smaller batch size and explicit cleanup
                results = model.predict(
                    temp_path, 
                    conf=0.25,
                    verbose=False,  # Reduce output noise
                    imgsz=640,
                    max_det=10  # Limit max detections per frame
                )
                
                print(f"🔍 Model {i+1} returned {len(results)} results")
                
                for r in results:
                    if hasattr(r, 'boxes') and r.boxes is not None:
                        print(f"🔍 Model {i+1} found {len(r.boxes)} boxes")
                        for box in r.boxes:
                            cls_name = r.names[int(box.cls)]
                            conf = float(box.conf)
                            print(f"🎯 Detected: {cls_name} ({conf:.2f})")
                            
                            if cls_name not in aggregated or conf > aggregated[cls_name]["confidence"]:
                                animal_info = get_animal_info(cls_name)
                                aggregated[cls_name] = {
                                    "class": cls_name, 
                                    "confidence": conf,
                                    "animal_info": animal_info
                                }
                
                # FIX: Force cleanup after each model
                if hasattr(model, '_session'):
                    try:
                        import gc
                        del model
                        gc.collect()
                    except:
                        pass
                        
            except Exception as e:
                print(f"❌ Model {i+1} error in frame processing: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return list(aggregated.values())
    except Exception as e:
        print(f"❌ Frame processing error: {e}")
        import traceback
        traceback.print_exc()
        return []

# ================= UPDATED DATABASE FUNCTIONS =================
def create_sighting_record(user_id, detection_data, condition_result, image_filename, detection_type, location_data=None, sighting_details=None):
    try:
        sighting = Sighting()
        sighting.user_id = int(user_id)
        sighting.species = detection_data.get('class', 'Unknown')
        sighting.confidence = float(detection_data.get('confidence', 0))
        sighting.condition = condition_result.get('label', 'Unknown')
        sighting.condition_confidence = float(condition_result.get('confidence', 0))
        sighting.image_path = image_filename
        sighting.detection_type = detection_type
        
        animal_info = detection_data.get('animal_info', {})
        print(f"🔍 Animal info for {sighting.species}: {animal_info}")
        
        if animal_info:
            sighting.conservation_status = animal_info.get('conservation_status')
            sighting.habitat = animal_info.get('habitat')
            sighting.lifespan = animal_info.get('lifespan')
            sighting.population = animal_info.get('population')
            sighting.character_traits = animal_info.get('character_traits')  # ADDED: Character traits
            
            # FIXED: Better condition detection for care recommendations
            condition_label = condition_result.get('label', '').lower()
            print(f"🔍 Condition label: {condition_label}")
            
            if condition_label == 'injured':
                sighting.recommended_care = animal_info.get('care_injured') or animal_info.get('care_general') or "Provide medical attention and safe shelter"
                print(f"🔍 Setting injured care: {sighting.recommended_care}")
            elif condition_label == 'malnourished':
                sighting.recommended_care = animal_info.get('care_malnourished') or animal_info.get('care_general') or "Provide proper nutrition and hydration"
                print(f"🔍 Setting malnourished care: {sighting.recommended_care}")
            else:
                sighting.recommended_care = animal_info.get('care_general') or "Monitor condition and provide appropriate habitat"
                print(f"🔍 Setting default care: {sighting.recommended_care}")
        
        if location_data:
            sighting.location_lat = location_data.get('lat')
            sighting.location_lng = location_data.get('lng')
        else:
            sighting.location_lat = None
            sighting.location_lng = None
        
        # FIXED: Extract and set ALL detailed fields with proper fallbacks
        if sighting_details:
            print(f"🔍 Processing COMPLETE sighting details: {sighting_details}")
            
            # Extract all possible fields with proper fallbacks
            date_time = sighting_details.get('date_time') or sighting_details.get('sighting_date')
            specific_location = sighting_details.get('specific_location') or sighting_details.get('location', '')
            number_of_animals = sighting_details.get('number_of_animals', 1)
            behavior_observed = sighting_details.get('behavior_observed') or sighting_details.get('behavior', '')
            observer_notes = sighting_details.get('observer_notes') or sighting_details.get('your_observations') or sighting_details.get('notes', '')
            user_contact = sighting_details.get('user_contact') or sighting_details.get('contact_info', '')
            urgency_level = sighting_details.get('urgency_level') or sighting_details.get('urgency', 'medium')
            
            if date_time:
                try:
                    sighting.sighting_date = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
                    print(f"✅ Set sighting date: {sighting.sighting_date}")
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Could not parse date {date_time}: {e}")
                    sighting.sighting_date = datetime.utcnow()
            
            sighting.specific_location = specific_location
            sighting.number_of_animals = number_of_animals
            sighting.behavior_observed = behavior_observed
            sighting.observer_notes = observer_notes
            sighting.user_contact = user_contact
            sighting.urgency_level = urgency_level
            
            print(f"✅ Set all detailed fields:")
            print(f"   - Location: {sighting.specific_location}")
            print(f"   - Animals: {sighting.number_of_animals}")
            print(f"   - Behavior: {sighting.behavior_observed}")
            print(f"   - Notes: {sighting.observer_notes}")
            print(f"   - Contact: {sighting.user_contact}")
            print(f"   - Urgency: {sighting.urgency_level}")
        
        db.session.add(sighting)
        db.session.commit()
        
        print(f"✅ Sighting saved with COMPLETE detailed info: {sighting.species} (ID: {sighting.id})")
        
        return sighting
        
    except Exception as e:
        print(f"❌ Error creating sighting record: {e}")
        db.session.rollback()
        return None

def create_report_record(user_id, sighting_id, image_filename, detection_type, sighting_details=None):
    try:
        sighting = Sighting.query.get(sighting_id)
        if not sighting:
            print(f"❌ Sighting {sighting_id} not found for report creation")
            return None
            
        report = Report()
        report.user_id = int(user_id)
        report.sighting_id = sighting_id
        report.title = f"{detection_type.title()} Sighting: {sighting.species}"
        
        description = (
            f"Automated {detection_type} detection of {sighting.species} with "
            f"{(sighting.confidence * 100):.1f}% confidence. "
            f"Condition: {sighting.condition} ({sighting.condition_confidence:.1f}%). "
        )
        
        if sighting.specific_location:
            description += f"Location: {sighting.specific_location}. "
        if sighting.sighting_date:
            description += f"Sighting Date: {sighting.sighting_date.strftime('%Y-%m-%d %H:%M')}. "
        if sighting.number_of_animals and sighting.number_of_animals > 1:
            description += f"Number of Animals: {sighting.number_of_animals}. "
        if sighting.behavior_observed:
            description += f"Behavior: {sighting.behavior_observed}. "
        if sighting.observer_notes:
            description += f"Observer Notes: {sighting.observer_notes}. "
        
        if sighting.conservation_status:
            description += f"Conservation Status: {sighting.conservation_status}. "
        if sighting.habitat:
            description += f"Habitat: {sighting.habitat}. "
        if sighting.lifespan:
            description += f"Lifespan: {sighting.lifespan}. "
        if sighting.population:
            description += f"Population: {sighting.population}. "
        if sighting.recommended_care:
            description += f"Recommended Care: {sighting.recommended_care}"
        if sighting.character_traits:  # ADDED: Character traits in description
            description += f"Character Traits: {sighting.character_traits}"
            
        report.description = description
        report.report_type = 'sighting'
        report.urgency = sighting.urgency_level or 'medium'
        report.evidence_images = [image_filename]
        report.location_lat = sighting.location_lat
        report.location_lng = sighting.location_lng
        
        if sighting_details:
            report.detailed_sighting_data = {
                'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                'specific_location': sighting.specific_location,
                'number_of_animals': sighting.number_of_animals,
                'behavior_observed': sighting.behavior_observed,
                'observer_notes': sighting.observer_notes,
                'user_contact': sighting.user_contact,
                'urgency_level': sighting.urgency_level,
                'reporter_name': sighting_details.get('reporter_name', 'Unknown User')
            }
        
        db.session.add(report)
        db.session.commit()
        
        print(f"✅ Report created with detailed data for sighting {sighting_id}")
        return report
        
    except Exception as e:
        print(f"❌ Error creating report record: {e}")
        db.session.rollback()
        return None

# ✅ ADDED: Function to create admin history record
def create_admin_history(report_id, admin_name, action, notes=None, previous_status=None, new_status=None):
    try:
        history = AdminHistory()
        history.report_id = report_id
        history.admin_name = admin_name
        history.action = action
        history.notes = notes
        history.previous_status = previous_status
        history.new_status = new_status
        
        db.session.add(history)
        db.session.commit()
        
        print(f"✅ Admin history recorded for report {report_id}: {action}")
        return history
    except Exception as e:
        print(f"❌ Error creating admin history: {e}")
        db.session.rollback()
        return None

# ================= AUTO-NOTIFICATION FOR REPORT STATUS CHANGES =================
def create_auto_notification(report_id, status_change=False):
    """Automatically create notifications when report status changes"""
    try:
        report = Report.query.get(report_id)
        if not report:
            return None
        
        user_id = report.user_id
        species = report.sighting.species if report.sighting else 'Reported Wildlife'
        
        # Determine message based on status
        if status_change:
            status_messages = {
                'under_review': f'Your {species} report is now under review by our wildlife team.',
                'resolved': f'Your {species} report has been resolved. Thank you for your contribution!',
                'dismissed': f'Your {species} report has been reviewed and dismissed.',
                'pending': f'Your {species} report has been reopened for review.'
            }
            message = status_messages.get(report.status, f'Status updated for your {species} report.')
        else:
            message = f'We have received your {species} report and it is currently pending review.'
        
        # Create notification
        notification = UserNotification(
            user_id=user_id,
            report_id=report_id,
            message=message,
            status=report.status
        )
        
        db.session.add(notification)
        db.session.commit()
        
        print(f"✅ Auto-notification created for user {user_id}: {species}")
        return notification
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating auto-notification: {e}")
        return None

# ================= ROUTES =================

# NEW ADD CODE UPDATE =================
# GENERATE TOKEN OTP
def generate_token(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# MAILER
from flask_mail import Message

def send_verification_email(email, token):
    msg = Message(
        subject="Verify Your Email",
        recipients=[email]
    )

    # ✅ HTML email (BIG + BOLD TOKEN)
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Thank you for registering.</p>
        <p>Your verification code is:</p>

        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #16a34a;
            margin: 20px 0;
        ">
            {token}
        </div>

        <p>This code will expire soon.</p>
        <p>If you did not request this, please ignore this email.</p>
    </div>
    """

    mail.send(msg)



@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400

        token = generate_token(6)

        user = User(
            username=username,
            email=email,
            email_verification_token=token,
            is_verified=False
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # 🔥 Send verification email
        send_verification_email(email, token)

        return jsonify({
            'message': 'User registered successfully. Verification email sent.',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE =================
@app.route('/verify-email', methods=['POST'])
def verify_email():
    try:
        data = request.get_json()
        email = data.get('email')
        token = data.get('token')

        if not email or not token:
            return jsonify({'error': 'Email and token are required'}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.is_verified:
            return jsonify({'message': 'Email is already verified'}), 200

        if user.email_verification_token == token:
            user.is_verified = True
            user.email_verification_token = None  # clear token after verification
            db.session.commit()
            return jsonify({'message': 'Email verified successfully'}), 200
        else:
            return jsonify({'error': 'Invalid token'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403
                
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# ================= DEBUG & UTILITY ROUTES =================
@app.route('/debug-sightings', methods=['GET'])
def debug_sightings():
    sightings = Sighting.query.all()
    result = []
    
    for s in sightings:
        user = User.query.get(s.user_id)
        result.append({
            'id': s.id,
            'user_id': s.user_id,
            'username': user.username if user else 'Unknown',
            'species': s.species,
            'confidence': s.confidence,
            'condition': s.condition,
            'condition_confidence': s.condition_confidence,
            'location_lat': s.location_lat,
            'location_lng': s.location_lng,
            'image_path': s.image_path,
            'detection_type': s.detection_type,
            'conservation_status': s.conservation_status,
            'habitat': s.habitat,
            'lifespan': s.lifespan,
            'population': s.population,
            'recommended_care': s.recommended_care,
            'character_traits': s.character_traits,  # ADDED: Character traits
            'sighting_date': s.sighting_date.isoformat() if s.sighting_date else None,
            'specific_location': s.specific_location,
            'number_of_animals': s.number_of_animals,
            'behavior_observed': s.behavior_observed,
            'observer_notes': s.observer_notes,
            'user_contact': s.user_contact,
            'urgency_level': s.urgency_level,
            'created_at': s.created_at.isoformat() if s.created_at else None
        })
    
    return jsonify({
        'total_sightings': len(sightings),
        'sightings': result
    })

@app.route('/api/uploaded-images/<filename>')
def get_uploaded_image(filename):
    try:
        if '..' in filename or filename.startswith('/'):
            return jsonify({'error': 'Invalid filename'}), 400
            
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            print(f"❌ Image not found: {file_path}")
            return jsonify({'error': 'Image not found'}), 404
            
        return send_from_directory(UPLOAD_DIR, filename)
    except Exception as e:
        print(f"❌ Error serving image {filename}: {e}")
        return jsonify({'error': 'Image not found'}), 404

@app.route('/uploads/<filename>')
def serve_uploaded_image(filename):
    return get_uploaded_image(filename)

@app.route('/api/debug-images', methods=['GET'])
def debug_images():
    try:
        files = os.listdir(UPLOAD_DIR)
        image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.mp4'))]
        
        return jsonify({
            'upload_dir': UPLOAD_DIR,
            'total_files': len(files),
            'image_files': len(image_files),
            'recent_images': image_files[-10:] if image_files else []
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================= FIXED DETECTION ROUTES - NO AUTO SAVING =================
@app.route('/detect', methods=['POST'])
def detect():
    try:
        print("📨 Received IMAGE detection request")
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        model_choice = request.form.get('model_choice', 'mammals')
        user_id = request.form.get('user_id')
        
        location_lat = request.form.get('location_lat')
        location_lng = request.form.get('location_lng')
        
        # Get COMPLETE sighting details from form data
        sighting_details = {}
        sighting_details_str = request.form.get('sighting_details')
        if sighting_details_str and sighting_details_str.strip():
            try:
                sighting_details = json.loads(sighting_details_str)
                print(f"🔍 COMPLETE Sighting details received in detect: {sighting_details}")
            except Exception as e:
                print(f"⚠️ Could not parse sighting details: {e}")
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        unique_filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        file.save(file_path)
        print(f"💾 Saved image: {unique_filename}")

        aggregated = {}
        selected_models = models.get(model_choice, [])
        print(f"🔍 Using {len(selected_models)} models for {model_choice}")
        
        for i, model in enumerate(selected_models):
            try:
                results = model.predict(file_path, conf=0.25)
                
                for r in results:
                    if hasattr(r, 'boxes') and r.boxes is not None:
                        for box in r.boxes:
                            cls_name = r.names[int(box.cls)]
                            conf = float(box.conf)
                            
                            if cls_name not in aggregated or conf > aggregated[cls_name]["confidence"]:
                                animal_info = get_animal_info(cls_name)
                                aggregated[cls_name] = {
                                    "class": cls_name, 
                                    "confidence": conf,
                                    "animal_info": animal_info
                                }
            except Exception as e:
                print(f"❌ Model {i+1} error: {e}")
                continue

        detections = list(aggregated.values())
        condition_result = analyze_condition(file_path)

        # ✅ FIXED: REMOVED automatic database storage
        # Detection results are returned but NOT automatically saved to database
        best_detection = max(detections, key=lambda x: x["confidence"]) if detections else None
        
        response = {
            "filename": unique_filename,
            "detections": detections,
            "condition": condition_result,
            "model_used": model_choice,
            "animal_data_available": animal_data_df is not None,
            "detection_type": "image",
            "image_path": unique_filename,
            "report_created": False,  # ✅ Always false now - no auto-saving
            "report_data": None,  # ✅ No report data since nothing is saved
            "can_create_report": bool(detections)  # ✅ Indicate that user CAN create report manually
        }
        
        print(f"✅ Image detection complete: {len(detections)} animals found - NOT saved to database")
        return jsonify(response)

    except Exception as e:
        print(f"💥 Image detection error: {e}")
        return jsonify({"error": f"Image detection failed: {str(e)}"}), 500

@app.route('/detect-video', methods=['POST'])
def detect_video():
    try:
        print("🎞 Received VIDEO detection request")
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        model_choice = request.form.get('model_choice', 'mammals')
        user_id = request.form.get('user_id')
        
        location_lat = request.form.get('location_lat')
        location_lng = request.form.get('location_lng')
        
        # Get COMPLETE sighting details from form data
        sighting_details = {}
        sighting_details_str = request.form.get('sighting_details')
        if sighting_details_str and sighting_details_str.strip():
            try:
                sighting_details = json.loads(sighting_details_str)
                print(f"🔍 COMPLETE Sighting details received in video detect: {sighting_details}")
            except Exception as e:
                print(f"⚠️ Could not parse sighting details: {e}")
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        unique_filename = f"{uuid.uuid4()}.mp4"
        video_path = os.path.join(UPLOAD_DIR, unique_filename)
        file.save(video_path)
        print(f"💾 Saved video: {unique_filename}")
        
        # ✅ ADDED: Verify the video was saved successfully
        if os.path.exists(video_path):
            file_size = os.path.getsize(video_path)
            print(f"✅ Video file verified: {unique_filename} ({file_size} bytes)")
        else:
            print(f"❌ ERROR: Video file was not saved!")
            return jsonify({"error": "Failed to save video file"}), 500

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            # Don't delete the video file if it can't be opened
            print(f"❌ Could not open video file: {unique_filename}")
            return jsonify({"error": "Could not open video file"}), 400

        all_detections = []
        frame_count = 0
        sample_rate = 30  # Increased to process fewer frames
        max_frames = 50   # Limit total frames processed
        
        condition_result = {"label": "Unknown", "confidence": 0}
        frame_detections = []
        
        # FIX: Initialize model once at the beginning
        selected_models = models.get(model_choice, [])
        
        while True:
            ret, frame = cap.read()
            if not ret or frame_count >= max_frames:
                break
                
            frame_count += 1
            if frame_count % sample_rate != 0:
                continue
                
            print(f"📊 Processing frame {frame_count}...")
            
            detections = process_frame(frame, model_choice)
            all_detections.extend(detections)
            
            # Save a frame for condition analysis if we have detections
            if detections and not frame_detections:
                frame_detections = detections
                # Save frame for condition analysis
                temp_condition_path = os.path.join(UPLOAD_DIR, f"temp_condition_{uuid.uuid4()}.jpg")
                cv2.imwrite(temp_condition_path, frame)
                
                try:
                    condition_result = analyze_condition(temp_condition_path)
                    print(f"✅ Condition analyzed: {condition_result}")
                except Exception as e:
                    print(f"⚠️ Condition analysis failed for video frame: {e}")
                    condition_result = {"label": "Unknown", "confidence": 0}
                
                # Clean up temp file
                if os.path.exists(temp_condition_path):
                    os.remove(temp_condition_path)
            
            # FIX: Explicit garbage collection after each frame
            import gc
            gc.collect()

        cap.release()
        
        # ✅ FIXED: DO NOT DELETE THE VIDEO FILE!
        # The video file must stay in uploads so it can be used when creating reports
        # if os.path.exists(video_path):
        #     os.remove(video_path)  # ❌ REMOVED THIS LINE!
        
        # ✅ ADDED: Create a thumbnail for video preview
        thumbnail_filename = None
        try:
            # Extract first frame as thumbnail
            cap = cv2.VideoCapture(video_path)
            if cap.isOpened():
                ret, thumbnail_frame = cap.read()
                if ret:
                    thumbnail_filename = f"thumb_{unique_filename.replace('.mp4', '.jpg')}"
                    thumbnail_path = os.path.join(UPLOAD_DIR, thumbnail_filename)
                    cv2.imwrite(thumbnail_path, thumbnail_frame)
                    print(f"✅ Created video thumbnail: {thumbnail_filename}")
                cap.release()
        except Exception as e:
            print(f"⚠️ Could not create video thumbnail: {e}")
        
        # ✅ FIXED: REMOVED automatic database storage
        best_detection = max(all_detections, key=lambda x: x["confidence"]) if all_detections else None
        
        response = {
            "filename": unique_filename,
            "thumbnail": thumbnail_filename,  # ✅ ADDED: Thumbnail for preview
            "detections": [best_detection] if best_detection else [],
            "condition": condition_result,
            "model_used": model_choice,
            "frames_processed": frame_count,
            "animal_data_available": animal_data_df is not None,
            "detection_type": "video",
            "report_created": False,  # ✅ Always false now - no auto-saving
            "report_data": None,  # ✅ No report data since nothing is saved
            "can_create_report": bool(best_detection)  # ✅ Indicate that user CAN create report manually
        }
        
        print(f"✅ Video processing complete: {1 if best_detection else 0} detections - Video file preserved: {unique_filename}")
        return jsonify(response)

    except Exception as e:
        print(f"💥 Video processing error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Video processing failed: {str(e)}"}), 500

@app.route('/detect-frame', methods=['POST'])
def detect_frame():
    try:
        print("🎥 Received REAL-TIME frame detection request")
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        model_choice = request.form.get('model_choice', 'mammals')
        user_id = request.form.get('user_id')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # ✅ FIXED: Read the file data and save it IMMEDIATELY
        file_data = file.read()
        nparr = np.frombuffer(file_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            print(f"❌ Could not decode frame from uploaded data")
            return jsonify({"error": "Failed to process frame"}), 500
        
        # ✅ FIXED: ALWAYS save the frame when there's a detection request
        # This ensures we have a file to reference when creating reports
        permanent_filename = f"realtime_{uuid.uuid4()}.jpg"
        permanent_path = os.path.join(UPLOAD_DIR, permanent_filename)
        cv2.imwrite(permanent_path, frame)
        print(f"💾 Saved frame as: {permanent_filename}")
        
        # Process the frame for detection
        temp_path = None
        try:
            # Create a temporary file for condition analysis
            temp_filename = f"temp_frame_{uuid.uuid4()}.jpg"
            temp_path = os.path.join(UPLOAD_DIR, temp_filename)
            
            # Save temporarily for condition analysis
            cv2.imwrite(temp_path, frame)
            
            # Get detections
            detections = process_frame(frame, model_choice)
            
            # Analyze condition for the frame
            try:
                condition_result = analyze_condition(temp_path)
            except Exception as e:
                print(f"⚠️ Condition analysis failed for real-time frame: {e}")
                condition_result = {"label": "Unknown", "confidence": 0}
                
        finally:
            # Clean up temporary file (but keep permanent file)
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
                print(f"🗑️  Cleaned up temporary frame: {os.path.basename(temp_path)}")

        # Find best detection
        best_detection = max(detections, key=lambda x: x["confidence"]) if detections else None
        
        # ✅ FIXED: Return the filename so frontend can use it for reporting
        response = {
            "detections": detections,
            "condition": condition_result,
            "model_used": model_choice,
            "animal_data_available": animal_data_df is not None,
            "detection_type": "real-time",
            "image_saved": True,  # ✅ Always true now
            "filename": permanent_filename,  # ✅ CRITICAL: Include filename
            "can_create_report": bool(detections),
            "note": f"Frame saved as {permanent_filename}. Ready for reporting." if detections else "No animals detected."
        }
        
        print(f"✅ Real-time frame processing complete: {len(detections)} detections (File saved: {permanent_filename})")
        return jsonify(response)

    except Exception as e:
        print(f"💥 Real-time frame processing error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Real-time processing failed: {str(e)}"}), 500

# ================= FIXED MANUAL REPORT CREATION ENDPOINT =================
@app.route('/create-report', methods=['POST'])
def create_report():
    """Manual report creation endpoint - creates both sighting and report when user clicks Report button"""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        print("🔍 DEBUG: Received create-report request")
        print(f"🔍 DEBUG: Full request data keys: {list(data.keys())}")
        
        user_id = data.get('user_id')
        if not user_id:
            admin_user = User.query.filter_by(role='admin').first()
            if admin_user:
                user_id = admin_user.id
            else:
                return jsonify({"error": "No user ID provided and no admin user found"}), 400
        
        # ✅ NEW: Handle base64 image data for real-time frames
        image_data = data.get('image_data')  # base64 encoded image from real-time
        image_filename = data.get('image_filename')  # existing filename for image/video uploads
        
        # Check if we need to save a base64 image (for real-time frames)
        if image_data and not image_filename:
            try:
                import base64
                print("🔍 Processing base64 image data for real-time frame...")
                
                # Handle data URL format (e.g., "data:image/jpeg;base64,/9j/4AAQSkZ...")
                if ',' in image_data:
                    # Extract the base64 part after the comma
                    header, image_data = image_data.split(',', 1)
                    print(f"🔍 Extracted base64 data from data URL, header: {header[:50]}...")
                
                # Decode base64 to image bytes
                image_bytes = base64.b64decode(image_data)
                print(f"🔍 Decoded base64 to {len(image_bytes)} bytes")
                
                # Generate unique filename and save to uploads folder
                unique_filename = f"realtime_{uuid.uuid4()}.jpg"
                file_path = os.path.join(UPLOAD_DIR, unique_filename)
                
                with open(file_path, 'wb') as f:
                    f.write(image_bytes)
                
                image_filename = unique_filename
                print(f"💾 Saved real-time frame as: {image_filename}")
                
            except Exception as e:
                print(f"❌ Failed to save base64 image: {e}")
                import traceback
                traceback.print_exc()
                # Don't return error, continue with filename generation
                # We'll create a placeholder filename
                image_filename = f"realtime_error_{uuid.uuid4()}.jpg"
        
        # ✅ If we still don't have a filename but have detection data, generate one
        if not image_filename:
            image_filename = f"detection_{uuid.uuid4()}.jpg"
            print(f"⚠️ No image filename provided, generated: {image_filename}")
        
        # Extract detection data
        detection_data = data.get('detection_data', {})
        condition_result = data.get('condition_result', {})
        detection_type = data.get('detection_type', 'image')
        
        # ✅ CHECK: For real-time detection, we might not have detection_data yet
        # If detection_data is empty but we have image_filename, we can still create a manual report
        if not detection_data and not image_filename:
            return jsonify({"error": "Missing detection data"}), 400
        
        # Extract location data
        location_data = data.get('location_data', {})
        
        # Extract sighting details
        sighting_details = data.get('sighting_details', {})
        print(f"🔍 Sighting details for manual report: {sighting_details}")
        
        # Get animal info for the detected species
        species_name = detection_data.get('class', 'Unknown Species') if detection_data else 'Unknown Species'
        animal_info = get_animal_info(species_name)
        print(f"🔍 Animal info for {species_name}: {animal_info}")
        
        # Create sighting record
        sighting = Sighting()
        sighting.user_id = int(user_id)
        sighting.species = species_name
        
        # Set confidence from detection_data or default to 0 for manual reports
        if detection_data:
            sighting.confidence = float(detection_data.get('confidence', 0))
        else:
            sighting.confidence = 0
        
        # Set condition information
        if condition_result:
            sighting.condition = condition_result.get('label', 'Unknown')
            sighting.condition_confidence = float(condition_result.get('confidence', 0))
        else:
            sighting.condition = 'Unknown'
            sighting.condition_confidence = 0
        
        sighting.image_path = image_filename
        sighting.detection_type = detection_type
        
        # Set animal information
        if animal_info:
            sighting.conservation_status = animal_info.get('conservation_status')
            sighting.habitat = animal_info.get('habitat')
            sighting.lifespan = animal_info.get('lifespan')
            sighting.population = animal_info.get('population')
            sighting.character_traits = animal_info.get('character_traits')  # ADDED: Character traits
            
            # Set care recommendations based on condition
            condition_label = sighting.condition.lower()
            print(f"🔍 Condition label: {condition_label}")
            
            if condition_label == 'injured':
                sighting.recommended_care = animal_info.get('care_injured') or animal_info.get('care_general') or "Provide medical attention and safe shelter"
            elif condition_label == 'malnourished':
                sighting.recommended_care = animal_info.get('care_malnourished') or animal_info.get('care_general') or "Provide proper nutrition and hydration"
            else:
                sighting.recommended_care = animal_info.get('care_general') or "Monitor condition and provide appropriate habitat"
            print(f"🔍 Setting care: {sighting.recommended_care}")
        else:
            # Default care based on condition
            condition_label = sighting.condition.lower()
            if condition_label == 'injured':
                sighting.recommended_care = "Provide medical attention and safe shelter"
            elif condition_label == 'malnourished':
                sighting.recommended_care = "Provide proper nutrition and hydration"
            else:
                sighting.recommended_care = "Monitor condition and provide appropriate habitat"
        
        # Set location data
        if location_data:
            sighting.location_lat = location_data.get('lat')
            sighting.location_lng = location_data.get('lng')
        
        # Process sighting details
        if sighting_details:
            print(f"🔍 Processing COMPLETE sighting details: {sighting_details}")
            
            # Extract all fields
            date_time = sighting_details.get('date_time') or sighting_details.get('sighting_date')
            specific_location = sighting_details.get('specific_location') or sighting_details.get('location', '')
            number_of_animals = sighting_details.get('number_of_animals', 1)
            behavior_observed = sighting_details.get('behavior_observed') or sighting_details.get('behavior', '')
            observer_notes = sighting_details.get('observer_notes') or sighting_details.get('your_observations') or sighting_details.get('notes', '')
            user_contact = sighting_details.get('user_contact') or sighting_details.get('contact_info', '')
            urgency_level = sighting_details.get('urgency_level') or sighting_details.get('urgency', 'medium')
            
            if date_time:
                try:
                    sighting.sighting_date = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
                    print(f"✅ Set sighting date: {sighting.sighting_date}")
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Could not parse date {date_time}: {e}")
                    sighting.sighting_date = datetime.utcnow()
            
            sighting.specific_location = specific_location
            sighting.number_of_animals = number_of_animals
            sighting.behavior_observed = behavior_observed
            sighting.observer_notes = observer_notes
            sighting.user_contact = user_contact
            sighting.urgency_level = urgency_level
            
            print(f"✅ Set all detailed fields:")
            print(f"   - Location: {sighting.specific_location}")
            print(f"   - Animals: {sighting.number_of_animals}")
            print(f"   - Behavior: {sighting.behavior_observed}")
            print(f"   - Notes: {sighting.observer_notes}")
            print(f"   - Contact: {sighting.user_contact}")
            print(f"   - Urgency: {sighting.urgency_level}")
        
        db.session.add(sighting)
        db.session.commit()
        
        print(f"✅ Sighting saved with COMPLETE detailed info: {sighting.species} (ID: {sighting.id})")
        
        # Create report record
        report = Report()
        report.user_id = int(user_id)
        report.sighting_id = sighting.id
        
        # Set report title based on detection type
        if detection_type == 'realtime':
            report.title = f"Real-Time Camera Sighting: {sighting.species}"
        else:
            report.title = f"{detection_type.title()} Sighting: {sighting.species}"
        
        # Build comprehensive description
        description = f"Automated {detection_type} detection of {sighting.species}. "
        
        if sighting.confidence > 0:
            description += f"Confidence: {(sighting.confidence * 100):.1f}%. "
        
        if sighting.condition and sighting.condition != 'Unknown':
            description += f"Condition: {sighting.condition} "
            if sighting.condition_confidence > 0:
                description += f"({sighting.condition_confidence:.1f}%). "
            else:
                description += ". "
        
        if sighting.specific_location:
            description += f"Location: {sighting.specific_location}. "
        if sighting.sighting_date:
            description += f"Sighting Date: {sighting.sighting_date.strftime('%Y-%m-%d %H:%M')}. "
        if sighting.number_of_animals and sighting.number_of_animals > 1:
            description += f"Number of Animals: {sighting.number_of_animals}. "
        if sighting.behavior_observed:
            description += f"Behavior: {sighting.behavior_observed}. "
        if sighting.observer_notes:
            description += f"Observer Notes: {sighting.observer_notes}. "
        
        if sighting.conservation_status:
            description += f"Conservation Status: {sighting.conservation_status}. "
        if sighting.habitat:
            description += f"Habitat: {sighting.habitat}. "
        if sighting.lifespan:
            description += f"Lifespan: {sighting.lifespan}. "
        if sighting.population:
            description += f"Population: {sighting.population}. "
        if sighting.recommended_care:
            description += f"Recommended Care: {sighting.recommended_care}. "
        if sighting.character_traits:  # ADDED: Character traits in description
            description += f"Character Traits: {sighting.character_traits}. "
        
        report.description = description.strip()
        report.report_type = 'sighting'
        report.urgency = sighting.urgency_level or 'medium'
        report.evidence_images = [image_filename] if image_filename else []
        report.location_lat = sighting.location_lat
        report.location_lng = sighting.location_lng
        
        # Store detailed sighting data
        if sighting_details:
            report.detailed_sighting_data = {
                'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                'specific_location': sighting.specific_location,
                'number_of_animals': sighting.number_of_animals,
                'behavior_observed': sighting.behavior_observed,
                'observer_notes': sighting.observer_notes,
                'user_contact': sighting.user_contact,
                'urgency_level': sighting.urgency_level,
                'reporter_name': sighting_details.get('reporter_name', 'Unknown User')
            }
        
        db.session.add(report)
        db.session.commit()
        
        print(f"✅ Report created with detailed data for sighting {sighting.id}")
        print(f"✅ Manual report created: {sighting.species} (Sighting ID: {sighting.id}, Report ID: {report.id})")
        
        return jsonify({
            "status": "success", 
            "message": f"Report for {sighting.species} created successfully",
            "sighting_id": sighting.id,
            "report_id": report.id,
            "sighting": sighting.to_dict(),
            "report": report.to_dict()
        })
            
    except Exception as e:
        print(f"❌ Error in create-report: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/report-sighting', methods=['POST'])
def report_sighting():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        print("🔍 DEBUG: Received report-sighting request")
        print(f"🔍 DEBUG: Full request data keys: {list(data.keys())}")
        
        user_id = data.get('user_id')
        if not user_id:
            admin_user = User.query.filter_by(role='admin').first()
            if admin_user:
                user_id = admin_user.id
            else:
                return jsonify({"error": "No user ID provided and no admin user found"}), 400
        
        # Extract from ROOT LEVEL first, then fallback to sighting_details
        sighting_details = data.get('sighting_details', {})
        date_time = data.get('date_time')
        specific_location = data.get('location', '')
        number_of_animals = data.get('number_of_animals', 1)
        behavior_observed = data.get('behavior_observed', '')
        observer_notes = data.get('observer_notes', '')
        user_contact = data.get('user_contact', '')
        urgency_level = data.get('urgency', 'medium')
        reporter_name = data.get('reporter_name', '')
        
        # Fallback to sighting_details if root level fields are empty
        if not date_time and sighting_details:
            date_time = sighting_details.get('date_time')
        if not specific_location and sighting_details:
            specific_location = sighting_details.get('specific_location') or sighting_details.get('location', '')
        if number_of_animals == 1 and sighting_details:
            number_of_animals = sighting_details.get('number_of_animals', 1)
        if not behavior_observed and sighting_details:
            behavior_observed = sighting_details.get('behavior_observed', '')
        if not observer_notes and sighting_details:
            observer_notes = sighting_details.get('observer_notes') or sighting_details.get('your_observations', '')
        if not user_contact and sighting_details:
            user_contact = sighting_details.get('user_contact', '')
        if urgency_level == 'medium' and sighting_details:
            urgency_level = sighting_details.get('urgency_level') or sighting_details.get('urgency', 'medium')
        if not reporter_name and sighting_details:
            reporter_name = sighting_details.get('reporter_name', '')
        
        print(f"🔍 FINAL Extracted detailed fields:")
        print(f"   - Date/Time: {date_time}")
        print(f"   - Location: {specific_location}")
        print(f"   - Number of Animals: {number_of_animals}")
        print(f"   - Behavior: {behavior_observed}")
        print(f"   - Notes: {observer_notes}")
        print(f"   - Contact: {user_contact}")
        print(f"   - Urgency: {urgency_level}")
        print(f"   - Reporter: {reporter_name}")
        
        existing_sighting = None
        image_path = data.get('image_path', '')
        species = data.get('species', 'Unknown')
        
        if species:
            try:
                existing_sighting = Sighting.query.filter(
                    Sighting.user_id == user_id,
                    Sighting.species == species
                ).order_by(Sighting.created_at.desc()).first()
            except Exception as query_error:
                print(f"⚠️ Query error, will create new sighting: {query_error}")
                existing_sighting = None
        
        sighting = None
        if existing_sighting:
            sighting = existing_sighting
            print(f"✅ Using existing sighting: {sighting.id}")
            
            if date_time:
                try:
                    sighting.sighting_date = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Could not parse date {date_time}: {e}")
                    sighting.sighting_date = datetime.utcnow()
            
            sighting.specific_location = specific_location
            sighting.number_of_animals = number_of_animals
            sighting.behavior_observed = behavior_observed
            sighting.observer_notes = observer_notes
            sighting.user_contact = user_contact
            sighting.urgency_level = urgency_level
            
            db.session.commit()
            print(f"✅ Updated existing sighting with detailed information")
        else:
            sighting = Sighting()
            sighting.user_id = user_id
            sighting.species = species
            sighting.confidence = float(data.get('confidence', 0))
            
            condition_data = data.get('condition', {})
            if isinstance(condition_data, dict):
                sighting.condition = condition_data.get('label', 'Unknown')
                sighting.condition_confidence = float(condition_data.get('confidence', 0))
            else:
                sighting.condition = 'Unknown'
                sighting.condition_confidence = 0
                
            sighting.image_path = image_path
            sighting.detection_type = data.get('detection_type', 'image')
            
            animal_info = data.get('animal_info', {})
            if animal_info:
                sighting.conservation_status = animal_info.get('conservation_status')
                sighting.habitat = animal_info.get('habitat')
                sighting.lifespan = animal_info.get('lifespan')
                sighting.population = animal_info.get('population')
                sighting.character_traits = animal_info.get('character_traits')  # ADDED: Character traits
                condition_label = sighting.condition.lower() if sighting.condition else ''
                if condition_label == 'injured':
                    sighting.recommended_care = animal_info.get('care_injured') or animal_info.get('care_general') or "Provide medical attention"
                elif condition_label == 'malnourished':
                    sighting.recommended_care = animal_info.get('care_malnourished') or animal_info.get('care_general') or "Provide proper nutrition"
                else:
                    sighting.recommended_care = animal_info.get('care_general') or "Monitor condition"
            
            location_data = data.get('location', {})
            if location_data and isinstance(location_data, dict):
                sighting.location_lat = location_data.get('lat')
                sighting.location_lng = location_data.get('lng')
            else:
                sighting.location_lat = None
                sighting.location_lng = None
            
            if date_time:
                try:
                    sighting.sighting_date = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Could not parse date {date_time}: {e}")
                    sighting.sighting_date = datetime.utcnow()
            
            sighting.specific_location = specific_location
            sighting.number_of_animals = number_of_animals
            sighting.behavior_observed = behavior_observed
            sighting.observer_notes = observer_notes
            sighting.user_contact = user_contact
            sighting.urgency_level = urgency_level
            
            db.session.add(sighting)
            db.session.commit()
            print(f"✅ Sighting saved with FULL detailed info: {sighting.species} (ID: {sighting.id})")
        
        existing_report = None
        try:
            existing_report = Report.query.filter_by(sighting_id=sighting.id).first()
        except Exception as e:
            print(f"⚠️ Error querying report: {e}")
            existing_report = None
        
        report = None
        if existing_report:
            report = existing_report
            print(f"✅ Using existing report: {report.id}")
            
            description = (
                f"User reported sighting of {sighting.species} with {sighting.confidence:.1%} confidence. "
                f"Condition: {sighting.condition} ({sighting.condition_confidence}%). "
            )
            
            if sighting.specific_location:
                description += f"Location: {sighting.specific_location}. "
            if sighting.sighting_date:
                description += f"Sighting Date: {sighting.sighting_date.strftime('%Y-%m-%d %H:%M')}. "
            if sighting.number_of_animals and sighting.number_of_animals > 1:
                description += f"Number of Animals: {sighting.number_of_animals}. "
            if sighting.behavior_observed:
                description += f"Behavior: {sighting.behavior_observed}. "
            if sighting.observer_notes:
                description += f"Observer Notes: {sighting.observer_notes}. "
            
            if sighting.conservation_status:
                description += f"Conservation Status: {sighting.conservation_status}. "
            if sighting.habitat:
                description += f"Habitat: {sighting.habitat}. "
            if sighting.lifespan:
                description += f"Lifespan: {sighting.lifespan}. "
            if sighting.population:
                description += f"Population: {sighting.population}. "
            if sighting.recommended_care:
                description += f"Recommended Care: {sighting.recommended_care}"
            if sighting.character_traits:  # ADDED: Character traits in description
                description += f"Character Traits: {sighting.character_traits}"
                
            report.description = description
            report.urgency = sighting.urgency_level or 'medium'
            
            report.detailed_sighting_data = {
                'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                'specific_location': sighting.specific_location,
                'number_of_animals': sighting.number_of_animals,
                'behavior_observed': sighting.behavior_observed,
                'observer_notes': sighting.observer_notes,
                'user_contact': sighting.user_contact,
                'urgency_level': sighting.urgency_level,
                'reporter_name': reporter_name
            }
            
            db.session.commit()
            print(f"✅ Updated report with complete detailed data")
        else:
            report = Report()
            report.user_id = user_id
            report.sighting_id = sighting.id
            report.title = f"Reported Sighting: {sighting.species}"
            
            description = f"User reported sighting of {sighting.species} with {sighting.confidence:.1%} confidence. "
            description += f"Condition: {sighting.condition} ({sighting.condition_confidence}%). "
            
            if sighting.specific_location:
                description += f"Location: {sighting.specific_location}. "
            if sighting.sighting_date:
                description += f"Sighting Date: {sighting.sighting_date.strftime('%Y-%m-%d %H:%M')}. "
            if sighting.number_of_animals and sighting.number_of_animals > 1:
                description += f"Number of Animals: {sighting.number_of_animals}. "
            if sighting.behavior_observed:
                description += f"Behavior: {sighting.behavior_observed}. "
            if sighting.observer_notes:
                description += f"Observer Notes: {sighting.observer_notes}. "
            
            if sighting.conservation_status:
                description += f"Conservation Status: {sighting.conservation_status}. "
            if sighting.habitat:
                description += f"Habitat: {sighting.habitat}. "
            if sighting.lifespan:
                description += f"Lifespan: {sighting.lifespan}. "
            if sighting.population:
                description += f"Population: {sighting.population}. "
            if sighting.recommended_care:
                description += f"Recommended Care: {sighting.recommended_care}"
            if sighting.character_traits:  # ADDED: Character traits in description
                description += f"Character Traits: {sighting.character_traits}"
                
            report.description = description
            report.report_type = 'sighting'
            report.urgency = sighting.urgency_level or 'medium'
            report.evidence_images = [sighting.image_path] if sighting.image_path else []
            report.location_lat = sighting.location_lat
            report.location_lng = sighting.location_lng
            
            report.detailed_sighting_data = {
                'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                'specific_location': sighting.specific_location,
                'number_of_animals': sighting.number_of_animals,
                'behavior_observed': sighting.behavior_observed,
                'observer_notes': sighting.observer_notes,
                'user_contact': sighting.user_contact,
                'urgency_level': sighting.urgency_level,
                'reporter_name': reporter_name
            }
            
            db.session.add(report)
            db.session.commit()
            print(f"✅ Created new report with complete detailed data")
        
        return jsonify({
            "status": "success", 
            "message": f"Reported {sighting.species} successfully with detailed information",
            "sighting_id": sighting.id,
            "report_id": report.id if report else None,
            "sighting": sighting.to_dict(),
            "is_new_sighting": not existing_sighting,
            "is_new_report": not existing_report
        })
            
    except Exception as e:
        print(f"❌ Error in report-sighting: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ================= ADMIN REPORT ROUTES =================
@app.route('/api/user-reports', methods=['GET'])
def get_all_user_reports():
    try:
        reports = db.session.query(Report, User, Sighting)\
            .join(User, Report.user_id == User.id)\
            .outerjoin(Sighting, Report.sighting_id == Sighting.id)\
            .order_by(Report.created_at.desc())\
            .all()
        
        seen_reports = set()
        formatted_reports = []
        
        for report, user, sighting in reports:
            if sighting:
                time_key = report.created_at.strftime('%Y-%m-%d %H:%M:%S') if report.created_at else 'unknown'
                unique_key = f"{sighting.species}_{user.id}_{sighting.detection_type}_{time_key}"
            else:
                time_key = report.created_at.strftime('%Y-%m-%d %H:%M:%S') if report.created_at else 'unknown'
                unique_key = f"{report.title}_{user.id}_{report.description[:50]}_{time_key}"
            
            if unique_key in seen_reports:
                continue
                
            seen_reports.add(unique_key)
            
            report_data = {
                'id': report.id,
                'user_id': report.user_id,
                'user_name': user.username,
                'user_email': user.email,
                'sighting_id': report.sighting_id,
                'title': report.title,
                'description': report.description,
                'report_type': report.report_type,
                'urgency': report.urgency,
                'status': report.status,
                'location_lat': report.location_lat,
                'location_lng': report.location_lng,
                'evidence_images': report.evidence_images or [],
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
                'is_manual_report': report.sighting_id is None,
                'detailed_sighting_data': report.detailed_sighting_data or {},
                'admin_notes': report.admin_notes,
                # ✅ FIXED: Include admin history
                'admin_history': [history.to_dict() for history in report.admin_histories]
            }
            
            if sighting:
                report_data.update({
                    'species': sighting.species,
                    'confidence': sighting.confidence,
                    'condition': sighting.condition,
                    'condition_confidence': sighting.condition_confidence,
                    'image_path': sighting.image_path,
                    'detection_type': sighting.detection_type,
                    'conservation_status': sighting.conservation_status,
                    'habitat': sighting.habitat,
                    'lifespan': sighting.lifespan,
                    'population': sighting.population,
                    'recommended_care': sighting.recommended_care,
                    'character_traits': sighting.character_traits,  # ADDED: Character traits
                    'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                    'specific_location': sighting.specific_location,
                    'number_of_animals': sighting.number_of_animals,
                    'behavior_observed': sighting.behavior_observed,
                    'observer_notes': sighting.observer_notes,
                    'user_contact': sighting.user_contact,
                    'urgency_level': sighting.urgency_level,
                    'detection_created_at': sighting.created_at.isoformat() if sighting.created_at else None
                })
            else:
                report_data.update({
                    'species': 'Unknown Species',
                    'confidence': 0,
                    'condition': 'Unknown',
                    'condition_confidence': 0,
                    'image_path': None,
                    'detection_type': 'manual_report',
                    'conservation_status': None,
                    'habitat': None,
                    'lifespan': None,
                    'population': None,
                    'recommended_care': None,
                    'character_traits': None,  # ADDED: Character traits
                })
            
            formatted_reports.append(report_data)
        
        print(f"✅ Filtered reports with detailed data: {len(formatted_reports)} unique reports")
        
        return jsonify({
            'reports': formatted_reports,
            'total': len(formatted_reports)
        })
        
    except Exception as e:
        print(f"❌ Error in get_user_reports: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ ADDED: Admin history management endpoint
@app.route('/api/reports/<int:report_id>/admin-history', methods=['POST'])
def add_admin_history(report_id):
    try:
        data = request.get_json()
        admin_name = data.get('admin_name')
        action = data.get('action')
        notes = data.get('notes')
        previous_status = data.get('previous_status')
        new_status = data.get('new_status')
        
        if not all([admin_name, action]):
            return jsonify({'error': 'Admin name and action are required'}), 400
        
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        history = create_admin_history(
            report_id=report_id,
            admin_name=admin_name,
            action=action,
            notes=notes,
            previous_status=previous_status,
            new_status=new_status
        )
        
        if not history:
            return jsonify({'error': 'Failed to create admin history'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Admin history added successfully',
            'history': history.to_dict()
        })
        
    except Exception as e:
        print(f"❌ Error adding admin history: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ ADDED: Get admin history for a report
@app.route('/api/reports/<int:report_id>/admin-history', methods=['GET'])
def get_admin_history(report_id):
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        history = [h.to_dict() for h in report.admin_histories]
        
        return jsonify({
            'report_id': report_id,
            'admin_history': history,
            'total': len(history)
        })
        
    except Exception as e:
        print(f"❌ Error getting admin history: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ FIXED: Update report with admin notes and status
@app.route('/api/reports/<int:report_id>/admin-update', methods=['PATCH'])
def update_report_admin(report_id):
    try:
        data = request.get_json()
        admin_name = data.get('admin_name')
        status = data.get('status')
        admin_notes = data.get('admin_notes')
        action_notes = data.get('action_notes')
        
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        previous_status = report.status

        history = None  # Ensure history is always defined
        
        # Update report fields
        if status:
            report.status = status
        if admin_notes is not None:
            report.admin_notes = admin_notes
        
        report.updated_at = datetime.utcnow()
        
        # Create admin history record
        if admin_name:
            history = create_admin_history(
                report_id=report_id,
                admin_name=admin_name,
                action='status_update' if status else 'notes_update',
                notes=action_notes or admin_notes,
                previous_status=previous_status,
                new_status=status
            )
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Report updated successfully',
            'report': report.to_dict(),
            'history_created': history is not None
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating report: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sightings', methods=['GET'])
def get_all_sightings():
    try:
        sightings = db.session.query(Sighting, User)\
            .join(User, Sighting.user_id == User.id)\
            .order_by(Sighting.created_at.desc())\
            .all()
        
        formatted_sightings = []
        for sighting, user in sightings:
            sighting_data = sighting.to_dict()
            sighting_data['user'] = {
                'username': user.username,
                'email': user.email
            }
            formatted_sightings.append(sighting_data)
        
        return jsonify({
            'sightings': formatted_sightings,
            'total': len(formatted_sightings)
        })
        
    except Exception as e:
        print(f"❌ Error in get_all_sightings: {e}")
        return jsonify({'error': str(e)}), 500

# ================= NOTIFICATION ROUTES =================
@app.route('/api/user/notifications', methods=['GET'])
def get_user_notifications():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        notifications = UserNotification.query.filter_by(
            user_id=user_id
        ).order_by(UserNotification.created_at.desc()).all()
        
        notifications_data = []
        for notification in notifications:
            notification_data = notification.to_dict()
            
            report = Report.query.get(notification.report_id)
            if report and report.sighting:
                sighting = report.sighting
                notification_data.update({
                    'species': sighting.species,
                    'confidence': sighting.confidence,
                    'condition': sighting.condition,
                    'condition_confidence': sighting.condition_confidence,
                    'detection_type': sighting.detection_type,
                    'conservation_status': sighting.conservation_status,
                    'habitat': sighting.habitat,
                    'population': sighting.population,
                    'character_traits': sighting.character_traits,  # ADDED: Character traits
                })
            
            notifications_data.append(notification_data)
        
        unread_count = UserNotification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).count()
        
        return jsonify({
            'notifications': notifications_data,
            'total': len(notifications_data),
            'unread_count': unread_count
        })
        
    except Exception as e:
        print(f"❌ Error in get_user_notifications: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@app.route('/api/user/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        notification = UserNotification.query.filter_by(
            id=notification_id, 
            user_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in mark_notification_read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@app.route('/api/user/<int:user_id>/notifications', methods=['GET'])
def get_user_notifications_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        notifications = UserNotification.query.filter_by(
            user_id=user_id
        ).order_by(UserNotification.created_at.desc()).all()
        
        notifications_data = []
        for notification in notifications:
            notification_data = notification.to_dict()
            
            report = Report.query.get(notification.report_id)
            if report:
                if report.sighting:
                    sighting = report.sighting
                    notification_data.update({
                        'species': sighting.species,
                        'confidence': sighting.confidence,
                        'condition': sighting.condition,
                        'condition_confidence': sighting.condition_confidence,
                        'detection_type': sighting.detection_type,
                        'conservation_status': sighting.conservation_status,
                        'habitat': sighting.habitat,
                        'population': sighting.population,
                        'recommended_care': sighting.recommended_care,
                        'character_traits': sighting.character_traits,  # ADDED: Character traits
                        'image_path': sighting.image_path,
                        'evidence_images': report.evidence_images or []
                    })
                else:
                    notification_data.update({
                        'species': 'Reported Wildlife',
                        'confidence': 0,
                        'condition': 'Unknown',
                        'detection_type': 'manual_report',
                        'image_path': report.evidence_images[0] if report.evidence_images else None,
                        'evidence_images': report.evidence_images or []
                    })
            
            notifications_data.append(notification_data)
        
        unread_count = UserNotification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).count()
        
        return jsonify({
            'notifications': notifications_data,
            'total': len(notifications_data),
            'unread_count': unread_count
        })
        
    except Exception as e:
        print(f"❌ Error in get_user_notifications_by_id: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@app.route('/api/user/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({'error': 'Invalid user ID'}), 400
        
        UserNotification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'All notifications marked as read'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in mark_all_notifications_read: {e}")
        return jsonify({'error': 'Failed to mark all notifications as read'}), 500
    
# ✅ ADD THIS SIMPLE STATUS UPDATE ENDPOINT
@app.route('/api/reports/<int:report_id>/update-status', methods=['PATCH'])
def update_report_status_only(report_id):
    """Simple endpoint to update report status only - for frontend compatibility"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        admin_name = data.get('admin_name', 'Admin')  # Default to 'Admin' if not provided
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
            
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Save previous status for history
        previous_status = report.status
        
        # Update the report
        report.status = new_status
        report.updated_at = datetime.utcnow()
        
        # Create admin history record
        history = create_admin_history(
            report_id=report_id,
            admin_name=admin_name,
            action='status_update',
            notes=f"Status changed from {previous_status} to {new_status}",
            previous_status=previous_status,
            new_status=new_status
        )
        
        # Send auto-notification if status changed
        if previous_status != new_status:
            create_auto_notification(report_id, status_change=True)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Report status updated from {previous_status} to {new_status}',
            'report': report.to_dict(),
            'history_created': history is not None
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in update_report_status_only: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ FIXED: User Reports API with Admin History
@app.route('/api/user/<int:user_id>/reports', methods=['GET'])
def get_user_reports_api(user_id):
    """Fixed endpoint for frontend - matches the expected URL structure"""
    try:
        print(f"🔍 API: Fetching reports for user {user_id}")
        
        # Get user to verify existence
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get reports for this user with admin history
        user_reports = Report.query.filter_by(user_id=user_id).all()
        
        formatted_reports = []
        
        for report in user_reports:
            # ✅ FIXED: Get admin history for each report
            admin_history = [history.to_dict() for history in report.admin_histories]
            
            report_data = {
                'id': report.id,
                'user_id': report.user_id,
                'user_name': user.username,
                'user_email': user.email,
                'sighting_id': report.sighting_id,
                'species': 'Unknown Species',  # Default value
                'confidence': 0,  # Default value
                'condition': 'Unknown',  # Default value
                'condition_confidence': 0,  # Default value
                'detection_type': 'manual_report',  # Default value
                'image_path': None,
                'video_path': None,
                'location_lat': report.location_lat,
                'location_lng': report.location_lng,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
                'conservation_status': '',
                'habitat': '',
                'population': '',
                'recommended_care': '',
                'character_traits': '',  # ADDED: Character traits
                'admin_notes': report.admin_notes or '',
                'status': report.status or 'pending',
                'is_manual_report': report.sighting_id is None,
                'title': report.title,
                'description': report.description,
                'report_type': report.report_type,
                # ✅ ADDED: Detailed sighting data fields
                'detailed_sighting_data': report.detailed_sighting_data or {},
                # ✅ FIXED: Include admin history for frontend
                'admin_history': admin_history
            }
            
            # If there's a sighting, add sighting data
            if report.sighting:
                sighting = report.sighting
                report_data.update({
                    'species': sighting.species,
                    'confidence': sighting.confidence,
                    'condition': sighting.condition,
                    'condition_confidence': sighting.condition_confidence or 0,
                    'detection_type': sighting.detection_type,
                    'image_path': sighting.image_path,
                    'conservation_status': sighting.conservation_status or '',
                    'habitat': sighting.habitat or '',
                    'population': sighting.population or '',
                    'recommended_care': sighting.recommended_care or '',
                    'character_traits': sighting.character_traits or '',  # ADDED: Character traits
                    # ✅ ADDED: Detailed sighting information from sighting table
                    'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                    'specific_location': sighting.specific_location,
                    'number_of_animals': sighting.number_of_animals,
                    'behavior_observed': sighting.behavior_observed,
                    'observer_notes': sighting.observer_notes,
                    'urgency_level': sighting.urgency_level
                })
            
            formatted_reports.append(report_data)
        
        print(f"✅ API: Returning {len(formatted_reports)} reports for user {user_id}")
        print(f"✅ API: First report admin history count: {formatted_reports[0]['admin_history'] if formatted_reports else 0}")
        
        return jsonify({
            'reports': formatted_reports,
            'total': len(formatted_reports),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        print(f"❌ API Error in get_user_reports_api: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ================= FIXED NOTIFICATION ENDPOINT =================
@app.route('/api/reports/<int:report_id>/notify', methods=['POST'])
def notify_user(report_id):
    try:
        data = request.get_json()
        print(f"📨 Received notification request for report {report_id}: {data}")
        
        if not data.get('message'):
            return jsonify({'error': 'Message is required'}), 400
        
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        user_id = report.user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user email and name
        user_email = user.email
        user_name = user.username
        
        # Get report details for email
        report_species = report.sighting.species if report.sighting else 'Reported Wildlife'
        report_status = data.get('status')
        
        # Get report details for email
        report_details = ""
        if report.sighting:
            sighting = report.sighting
            details = []
            if sighting.condition and sighting.condition != 'Unknown':
                details.append(f"Condition: {sighting.condition}")
            if sighting.detection_type:
                details.append(f"Detection Type: {sighting.detection_type}")
            if sighting.specific_location:
                details.append(f"Location: {sighting.specific_location}")
            if sighting.urgency_level:
                details.append(f"Urgency: {sighting.urgency_level.title()}")
            if sighting.character_traits:
                details.append(f"Character Traits: {sighting.character_traits}")
            
            if details:
                report_details = "<br>".join(details)
        
        # ✅ FIXED: Send email notification FIRST
        email_sent = False
        try:
            email_sent = send_admin_update_email(
                user_email=user_email,
                user_name=user_name,
                report_species=report_species,
                admin_message=data.get('message', ''),
                report_status=report_status,
                report_details=report_details
            )
            print(f"✅ Email sending attempt completed: {'Success' if email_sent else 'Failed'}")
        except Exception as email_error:
            print(f"⚠️ Email sending error (will continue with app notification): {email_error}")
        
        # ✅ FIXED: Get COMPLETE sighting data including detailed information
        sighting_data = {}
        if report.sighting:
            sighting = report.sighting
            sighting_data = {
                'species': sighting.species,
                'confidence': sighting.confidence,
                'condition': sighting.condition,
                'condition_confidence': sighting.condition_confidence,
                'detection_type': sighting.detection_type,
                'conservation_status': sighting.conservation_status,
                'habitat': sighting.habitat,
                'population': sighting.population,
                'recommended_care': sighting.recommended_care,
                'character_traits': sighting.character_traits,
                'image_path': sighting.image_path,
                'evidence_images': report.evidence_images or [],
                'detailed_sighting_data': {
                    'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                    'specific_location': sighting.specific_location,
                    'number_of_animals': sighting.number_of_animals,
                    'behavior_observed': sighting.behavior_observed,
                    'observer_notes': sighting.observer_notes,
                    'user_contact': sighting.user_contact,
                    'urgency_level': sighting.urgency_level
                }
            }
        else:
            detailed_data = report.detailed_sighting_data or {}
            sighting_data = {
                'species': 'Reported Wildlife',
                'confidence': 0,
                'condition': 'Unknown',
                'detection_type': 'manual_report',
                'image_path': report.evidence_images[0] if report.evidence_images else None,
                'evidence_images': report.evidence_images or [],
                'detailed_sighting_data': detailed_data
            }
        
        # ✅ FIXED: Create notification with email status
        notification = UserNotification(
            user_id=user_id,
            report_id=report_id,
            message=data.get('message', ''),
            status=data.get('status'),
            admin_notes=data.get('admin_notes') or data.get('message'),
            report_data=sighting_data
        )
        
        # Add email tracking fields if they exist
        if hasattr(notification, 'email_sent'):
            notification.email_sent = email_sent
        if hasattr(notification, 'email_error') and not email_sent:
            notification.email_error = "Email sending failed"
        
        # ✅ FIXED: Also update the report with admin notes
        if data.get('admin_notes'):
            report.admin_notes = data.get('admin_notes')
        
        if data.get('status'):
            report.status = data.get('status')
        
        report.updated_at = datetime.utcnow()
        
        db.session.add(notification)
        db.session.commit()
        
        print(f"✅ Notification processed for user {user_name} (ID: {user_id})")
        print(f"✅ Email sent: {email_sent}")
        print(f"✅ App notification created: {notification.id}")
        
        return jsonify({
            'success': True, 
            'message': 'Notification sent to user',
            'notification_id': notification.id,
            'species': sighting_data['species'],
            'email_sent': email_sent,
            'user_notified': user_name,
            'user_email': user_email
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in notify_user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to send notification: {str(e)}'}), 500

@app.route('/api/admin/notifications', methods=['GET'])
def get_admin_notifications():
    try:
        report_id = request.args.get('report_id')
        
        if report_id:
            notifications = UserNotification.query.filter_by(
                report_id=report_id
            ).order_by(UserNotification.created_at.desc()).all()
        else:
            notifications = UserNotification.query.order_by(
                UserNotification.created_at.desc()
            ).all()
        
        notifications_data = []
        for notification in notifications:
            notification_dict = notification.to_dict()
            
            user = User.query.get(notification.user_id)
            notification_dict['user_name'] = user.username if user else 'Unknown User'
            notification_dict['user_email'] = user.email if user else 'Unknown Email'
            
            report = Report.query.get(notification.report_id)
            if report:
                if report.sighting:
                    sighting = report.sighting
                    notification_dict.update({
                        'species': sighting.species,
                        'confidence': sighting.confidence,
                        'condition': sighting.condition,
                        'detection_type': sighting.detection_type,
                        'image_path': sighting.image_path,
                        'character_traits': sighting.character_traits,  # ADDED: Character traits
                    })
                else:
                    notification_dict['species'] = 'Manual Report'
                    notification_dict['detection_type'] = 'manual'
            
            notifications_data.append(notification_dict)
        
        return jsonify({
            'notifications': notifications_data,
            'total': len(notifications_data),
            'filtered_by_report': report_id is not None
        })
        
    except Exception as e:
        print(f"❌ Error in get_admin_notifications: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@app.route('/api/admin/notifications/stats', methods=['GET'])
def get_notification_stats():
    try:
        total_notifications = UserNotification.query.count()
        unread_notifications = UserNotification.query.filter_by(is_read=False).count()
        
        notifications_by_status = db.session.query(
            UserNotification.status,
            db.func.count(UserNotification.id)
        ).group_by(UserNotification.status).all()
        
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_notifications = UserNotification.query.filter(
            UserNotification.created_at >= seven_days_ago
        ).count()
        
        return jsonify({
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'recent_notifications': recent_notifications,
            'notifications_by_status': dict(notifications_by_status)
        })
        
    except Exception as e:
        print(f"❌ Error in get_notification_stats: {e}")
        return jsonify({'error': 'Failed to fetch notification stats'}), 500
    
@app.route('/test-condition-detection', methods=['POST'])
def test_condition_detection():
    """Test endpoint for condition detection"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save temporary file
        temp_filename = f"test_condition_{uuid.uuid4()}.jpg"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        file.save(temp_path)
        
        # Analyze condition
        result = analyze_condition(temp_path)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify({
            "status": "success",
            "condition_result": result,
            "model_used": "CNN (78% accuracy)",
            "input_size": "150x150 pixels"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= ADMIN USER MANAGEMENT ROUTES =================
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    try:
        print("🔍 Admin: Fetching all users...")
        users = User.query.all()
        print(f"🔍 Admin: Found {len(users)} users in database")
        
        users_data = []
        for user in users:
            user_dict = user.to_dict()
            print(f"🔍 Admin: User {user.id} - {user.username}, is_active: {user.is_active}")
            users_data.append(user_dict)
        
        print(f"✅ Admin: Returning {len(users_data)} users")
        
        return jsonify({
            'users': users_data,
            'total': len(users_data)
        })
        
    except Exception as e:
        print(f"❌ Error in get_all_users: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/count', methods=['GET'])
def get_users_count():
    try:
        count = User.query.count()
        return jsonify({'count': count})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        print(f"🔍 Admin: Creating user with data: {data}")
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
            
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User()
        user.username = username
        user.email = email
        user.role = role
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        print(f"✅ Admin: User created successfully: {username}")
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating user: {e}")
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/check-email', methods=['POST'])
def check_email():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'exists': False, 'error': 'No email provided'}), 400
        
        # FIXED: Use SQLAlchemy properly
        user = User.query.filter_by(email=email).first()
        exists = bool(user)  # True if user exists, False otherwise
        
        print(f"🔍 Checked email {email}: exists = {exists}")
        
        return jsonify({'exists': exists})
        
    except Exception as e:
        print(f"❌ Error checking email: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'exists': False, 'error': str(e)}), 500

# ================= ADMIN USER MANAGEMENT ROUTES - ADD MISSING PATCH ENDPOINT =================
@app.route('/api/admin/users/<int:user_id>', methods=['PATCH', 'PUT'])
def update_user(user_id):
    # Handle PATCH/PUT requests
    try:
        data = request.get_json()
        print(f"🔍 Admin: Updating user {user_id} with data: {data}")
        print(f"🔍 Admin: Method used: {request.method}")
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        print(f"🔍 Found user: {user.username}, email: {user.email}")
        
        # Update fields if provided
        if 'username' in data:
            # Check if username is already taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
            print(f"🔍 Updated username to: {data['username']}")
        
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already taken'}), 400
            user.email = data['email']
            print(f"🔍 Updated email to: {data['email']}")
        
        if 'role' in data:
            user.role = data['role']
            print(f"🔍 Updated role to: {data['role']}")
        
        # Only update password if provided and not empty
        if 'password' in data and data['password'] and data['password'].strip():
            user.set_password(data['password'])
            print(f"🔍 Password updated for user {user_id}")
        
        # Handle is_active field
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
            print(f"🔍 Setting user {user_id} is_active to {user.is_active}")
        
        db.session.commit()
        
        print(f"✅ Admin: User {user_id} updated successfully")
        print(f"✅ Final user data: {user.to_dict()}")
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/status', methods=['PATCH'])
def toggle_user_status(user_id):
    try:
        data = request.get_json()
        print(f"🔍 Admin: Toggling status for user {user_id} with data: {data}")
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'is_active' in data:
            user.is_active = data['is_active']
            print(f"🔍 Admin: Setting user {user_id} is_active to {user.is_active}")
        
        db.session.commit()
        
        status_text = "activated" if user.is_active else "deactivated"
        print(f"✅ Admin: User {user_id} {status_text} successfully")
        
        return jsonify({
            'message': f'User {status_text} successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error toggling user status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        print(f"🔍 Admin: Deleting user {user_id}")
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        current_user_id = request.args.get('current_user_id')
        if current_user_id and int(current_user_id) == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # ✅ FIXED: Handle related records properly
        # First, delete or reassign related sightings
        sightings = Sighting.query.filter_by(user_id=user_id).all()
        for sighting in sightings:
            # Option 1: Delete the sightings (recommended for data integrity)
            db.session.delete(sighting)
            print(f"🗑️  Deleting sighting {sighting.id} for user {user_id}")
        
        # Delete related reports
        reports = Report.query.filter_by(user_id=user_id).all()
        for report in reports:
            db.session.delete(report)
            print(f"🗑️  Deleting report {report.id} for user {user_id}")
        
        # Delete related notifications
        notifications = UserNotification.query.filter_by(user_id=user_id).all()
        for notification in notifications:
            db.session.delete(notification)
            print(f"🗑️  Deleting notification {notification.id} for user {user_id}")
        
        # Finally delete the user
        db.session.delete(user)
        db.session.commit()
        
        print(f"✅ Admin: User {user_id} deleted successfully")
        
        return jsonify({
            'message': 'User deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting user: {e}")
        return jsonify({'error': str(e)}), 500

# ================= REPORT MANAGEMENT ROUTES =================
@app.route('/api/reports/<int:report_id>', methods=['PATCH'])
def update_report_status(report_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        admin_name = data.get('admin_name')
        notes = data.get('notes')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
            
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        old_status = report.status
        report.status = new_status
        report.updated_at = datetime.utcnow()
        
        # ✅ ADDED: Create admin history for status change
        if admin_name and old_status != new_status:
            create_admin_history(
                report_id=report_id,
                admin_name=admin_name,
                action='status_change',
                notes=notes or f"Status changed from {old_status} to {new_status}",
                previous_status=old_status,
                new_status=new_status
            )
        
        if old_status != new_status:
            create_auto_notification(report_id, status_change=True)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Report status updated successfully',
            'report': report.to_dict(),
            'notification_sent': old_status != new_status
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/submit', methods=['POST'])
def submit_report():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        report = Report()
        report.user_id = user_id
        report.sighting_id = data.get('sighting_id')
        report.title = data.get('title', 'Wildlife Report')
        report.description = data.get('description', '')
        report.report_type = data.get('report_type', 'sighting')
        report.urgency = data.get('urgency', 'medium')
        report.location_lat = data.get('location', {}).get('lat')
        report.location_lng = data.get('location', {}).get('lng')
        report.evidence_images = data.get('evidence_images', [])
        
        db.session.add(report)
        db.session.commit()
        
        create_auto_notification(report.id, status_change=False)
        
        print(f"📝 New report submitted by {user.username}: {report.title}")
        
        return jsonify({
            'message': 'Report submitted successfully',
            'report_id': report.id,
            'report': report.to_dict(),
            'notification_sent': True
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/debug-condition-model', methods=['GET'])
def debug_condition_model():
    """Debug endpoint to check condition model status"""
    try:
        return jsonify({
            "condition_model_loaded": condition_model is not None,
            "condition_model_path": CONDITION_MODEL_PATH,
            "file_exists": os.path.exists(CONDITION_MODEL_PATH),
            "tensorflow_version": tf.__version__,
            "model_input_shape": str(condition_model.input_shape) if condition_model else "None",
            "model_output_shape": str(condition_model.output_shape) if condition_model else "None"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/stats', methods=['GET'])
def get_report_stats():
    try:
        total_reports = Report.query.count()
        pending_reports = Report.query.filter_by(status='pending').count()
        critical_reports = Report.query.filter_by(urgency='critical').count()
        
        reports_by_type = db.session.query(
            Report.report_type, 
            db.func.count(Report.id)
        ).group_by(Report.report_type).all()
        
        reports_by_status = db.session.query(
            Report.status, 
            db.func.count(Report.id)
        ).group_by(Report.status).all()
        
        return jsonify({
            'total_reports': total_reports,
            'pending_reports': pending_reports,
            'critical_reports': critical_reports,
            'reports_by_type': dict(reports_by_type),
            'reports_by_status': dict(reports_by_status)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# ================= DELETE ENDPOINTS =================
@app.route('/api/sightings/<int:sighting_id>', methods=['DELETE'])
def delete_sighting(sighting_id):
    try:
        print(f"🗑️ Deleting sighting: {sighting_id}")
        
        sighting = Sighting.query.get(sighting_id)
        if not sighting:
            return jsonify({'error': 'Sighting not found'}), 404
        
        # Also delete associated report if it exists
        report = Report.query.filter_by(sighting_id=sighting_id).first()
        if report:
            # Delete notifications for this report first
            UserNotification.query.filter_by(report_id=report.id).delete()
            db.session.delete(report)
        
        db.session.delete(sighting)
        db.session.commit()
        
        print(f"✅ Sighting {sighting_id} deleted successfully")
        
        return jsonify({
            'message': 'Sighting deleted successfully',
            'deleted_sighting_id': sighting_id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting sighting: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    try:
        print(f"🗑️ Deleting report: {report_id}")
        
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        # Delete notifications for this report first
        UserNotification.query.filter_by(report_id=report_id).delete()
        
        db.session.delete(report)
        db.session.commit()
        
        print(f"✅ Report {report_id} deleted successfully")
        
        return jsonify({
            'message': 'Report deleted successfully',
            'deleted_report_id': report_id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting report: {e}")
        return jsonify({'error': str(e)}), 500
    
# ================= TEST ENDPOINT =================
@app.route('/api/test-user-update', methods=['PATCH'])
def test_user_update():
    """Test endpoint to verify PATCH requests work"""
    try:
        data = request.get_json()
        return jsonify({
            'message': 'PATCH request received successfully',
            'received_data': data,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================= ANIMAL INFO ROUTES =================
@app.route('/animal-info/<species_name>', methods=['GET'])
def get_animal_info_endpoint(species_name):
    try:
        info = get_animal_info(species_name)
        if info:
            return jsonify({"species": species_name, "info": info})
        else:
            return jsonify({"error": f"No information found for {species_name}"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= DEBUG ENDPOINTS =================
@app.route('/api/debug-report/<int:report_id>', methods=['GET'])
def debug_report(report_id):
    """Debug endpoint to check specific report data"""
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        sighting = Sighting.query.get(report.sighting_id) if report.sighting_id else None
        
        debug_info = {
            'report_id': report.id,
            'report_data': {
                'title': report.title,
                'description': report.description,
                'detailed_sighting_data': report.detailed_sighting_data,
                'evidence_images': report.evidence_images,
                'admin_notes': report.admin_notes,
                'admin_history': [h.to_dict() for h in report.admin_histories]
            },
            'sighting_data': None,
            'animal_info_in_detection': None
        }
        
        if sighting:
            debug_info['sighting_data'] = {
                'species': sighting.species,
                'confidence': sighting.confidence,
                'condition': sighting.condition,
                'condition_confidence': sighting.condition_confidence,
                'conservation_status': sighting.conservation_status,
                'habitat': sighting.habitat,
                'lifespan': sighting.lifespan,
                'population': sighting.population,
                'recommended_care': sighting.recommended_care,
                'character_traits': sighting.character_traits,  # ADDED: Character traits
                'image_path': sighting.image_path,
                'detection_type': sighting.detection_type,
                'sighting_date': sighting.sighting_date.isoformat() if sighting.sighting_date else None,
                'specific_location': sighting.specific_location,
                'number_of_animals': sighting.number_of_animals,
                'behavior_observed': sighting.behavior_observed,
                'observer_notes': sighting.observer_notes,
                'user_contact': sighting.user_contact,
                'urgency_level': sighting.urgency_level
            }
            
            # Check what animal info would be returned for this species
            animal_info = get_animal_info(sighting.species)
            debug_info['animal_info_in_detection'] = animal_info
        
        return jsonify(debug_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug-animal-info/<species_name>', methods=['GET'])
def debug_animal_info(species_name):
    """Debug endpoint to check animal data lookup"""
    try:
        info = get_animal_info(species_name)
        return jsonify({
            'species': species_name,
            'animal_info': info,
            'animal_data_columns': animal_data_df.columns.tolist() if animal_data_df is not None else 'No animal data'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    models_loaded = len(models) > 0 and condition_model is not None
    animal_data_loaded = animal_data_df is not None
    
    return jsonify({
        "status": "healthy" if models_loaded else "degraded",
        "message": "All systems ready!" if models_loaded else "Some models failed to load",
        "models_loaded": models_loaded,
        "animal_data_loaded": animal_data_loaded,
        "animal_entries": len(animal_data_df) if animal_data_df is not None else 0,
        "endpoints_available": [
            "POST /detect (image detection)",
            "POST /detect-video (video detection)", 
            "POST /detect-frame (real-time camera)",
            "POST /create-report (manual report creation)",  # ✅ ADDED
            "POST /report-sighting",
            "GET /animal-info/<species>",
            "GET /api/admin/users (admin user management)",
            "GET/POST /api/reports/<id>/admin-history (admin history tracking)"
        ]
    })

# ================= DEBUG DATABASE SCHEMA =================
@app.route('/api/debug-db-schema', methods=['GET'])
def debug_db_schema():
    try:
        result = db.session.execute(text("DESCRIBE report"))
        columns = []
        for row in result:
            columns.append({
                'field': row[0],
                'type': row[1],
                'null': row[2],
                'key': row[3],
                'default': row[4],
                'extra': row[5]
            })
        return jsonify({'report_table_columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Animal Detection Backend Starting...")
    print("📍 Project Location:", os.path.dirname(os.path.abspath(__file__)))
    print("🌐 Server URL: http://10.82.64.38:3001")  
    print("🔍 Health Check: http://10.82.64.38:3001")  
    print("📱 Mobile Access: http://10.82.64.38:3001")  
    print("👥 Admin Users: http://10.82.64.38:3001/api/admin/users")  
    
 
    print("📷 Available Detection Modes:")
    print("   - POST /detect (Image Detection) - NO AUTO SAVING")
    print("   - POST /detect-video (Video Detection) - NO AUTO SAVING") 
    print("   - POST /detect-frame (Real-Time Camera) - NO AUTO SAVING")
    print("📝 Manual Report Creation:")
    print("   - POST /create-report (Create report from detection results)")
    print("   - POST /report-sighting (Legacy report endpoint)")
    print("👑 Admin Features:")
    print("   - GET /api/admin/users (User Management)")
    print("   - POST /api/admin/users (Create User)")
    print("   - PATCH /api/admin/users/:id (Update User)")
    print("   - DELETE /api/admin/users/:id (Delete User)")
    print("✅ Backend running on port 3001 to avoid network issues!")  
    print("="*50)
    
    
    app.run(debug=True, host='0.0.0.0', port=3001)