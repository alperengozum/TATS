from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train6/weights/last.pt")
results = model('data/val/etsiz/Screenshot-2024-12-17-at-09-37-28_png.rf.23379995ae2c5b278e3314dd89a679b3.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])