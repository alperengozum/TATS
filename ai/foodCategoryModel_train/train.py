from ultralytics import YOLO

# Load a model
model = YOLO("yolov8s.pt")

# Use the model
results = model.train(data="config.yaml", epochs=60, imgsz=640, batch=16, device="mps")  # train the model
