from ultralytics import YOLO
import os

# Load a model
model_path = os.path.join('.', 'runs', 'detect', 'train', 'weights', 'epoch30.pt')
model = YOLO(model_path)

# Use the model
results = model.train(data="config.yaml", epochs=20, imgsz=640, batch=16, save_period=10, device="mps")

print(results)