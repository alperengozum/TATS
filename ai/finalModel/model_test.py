from ultralytics import YOLO
import os

# Load a pretrained YOLOv8 model
model_path = os.path.join('.', 'runs', 'detect', 'train2', 'weights', 'last.pt')

model = YOLO(model_path)

# Run validation on a set specified as 'val' argument
results = model.val(data='config.yaml')

#print(results)