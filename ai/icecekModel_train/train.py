from ultralytics import YOLO

model = YOLO("yolov8n-cls.pt")

model.train(data="./data", epochs=20, imgsz=640)