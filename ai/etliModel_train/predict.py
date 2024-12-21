from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train/weights/last.pt")
results = model('data/test/Kirmizi/395_jpg.rf.42ce19a846952f7c29e15ea76f252e89.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])