from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train7/weights/last.pt")
results = model('test_images/Ekran Resmi 2024-12-21 00.23.49.png')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])