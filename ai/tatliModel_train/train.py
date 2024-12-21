from ultralytics import YOLO

model = YOLO("yolov8s-cls.pt")

model.train(data="./data", epochs=20, imgsz=640, batch=16, device="mps")