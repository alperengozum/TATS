from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train/weights/last.pt")
results = model('data/test/Salata/405_jpg.rf.033d7a3227246d3284ca7aa00a55a7b2.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])