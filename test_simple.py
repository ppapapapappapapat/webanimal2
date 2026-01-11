# test_model_loading.py
import tensorflow as tf
import os

print("🧪 TESTING MODEL LOADING IN WEBANIMAL")

MODEL_PATH = r"C:\Users\patca\Downloads\webanimal\webanimal\public\models\conditions_models\best_model.h5"
print(f"Model path: {MODEL_PATH}")
print(f"File exists: {os.path.exists(MODEL_PATH)}")

if os.path.exists(MODEL_PATH):
    try:
        print("\n🔄 Trying to load model...")
        
        # Method 1: Try normal load
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Method 1: Normal load worked!")
        except Exception as e1:
            print(f"❌ Method 1 failed: {e1}")
            
            # Method 2: Try with compile=False
            try:
                model = tf.keras.models.load_model(MODEL_PATH, compile=False)
                print("✅ Method 2: Load with compile=False worked!")
            except Exception as e2:
                print(f"❌ Method 2 failed: {e2}")
                
                # Method 3: Try custom objects
                from tensorflow.keras.layers import InputLayer
                
                class FixedInputLayer(InputLayer):
                    def __init__(self, *args, **kwargs):
                        if 'batch_shape' in kwargs:
                            kwargs.pop('batch_shape')
                        super().__init__(*args, **kwargs)
                
                try:
                    model = tf.keras.models.load_model(
                        MODEL_PATH,
                        custom_objects={'InputLayer': FixedInputLayer},
                        compile=False
                    )
                    print("✅ Method 3: Load with custom objects worked!")
                except Exception as e3:
                    print(f"❌ Method 3 failed: {e3}")
                    print("❌ All methods failed!")
                    model = None
        
        if model:
            print(f"\n✅ Model loaded successfully!")
            print(f"Input shape: {model.input_shape}")
            print(f"Output shape: {model.output_shape}")
            
            # Test prediction
            import numpy as np
            test_input = np.random.random((1, 150, 150, 3)).astype(np.float32)
            prediction = model.predict(test_input, verbose=0)
            print(f"✅ Prediction works! Shape: {prediction.shape}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ Model file not found!")