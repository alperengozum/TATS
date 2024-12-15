from ultralytics import YOLO

# Load a model
model = YOLO("yolov8n.pt")

# Use the model
results = model.train(data="config.yaml", epochs=50)  # train the model
