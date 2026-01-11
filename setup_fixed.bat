@echo off
echo Setting up compatible environment...

REM Clean existing
pip uninstall tensorflow tensorboard onnx onnxruntime protobuf -y

REM Install in correct order
pip install protobuf==3.20.3
pip install numpy==1.24.3
pip install typing-extensions==4.5.0
pip install tensorflow==2.10.0
pip install tensorboard==2.10.1
pip install tensorflow-estimator==2.10.0
pip install keras==2.10.0
pip install onnx==1.13.0
pip install onnxruntime==1.13.1
pip install ultralytics==8.0.196
pip install torch==2.0.1

echo.
echo ✅ Setup complete! Run: python app.py
pause