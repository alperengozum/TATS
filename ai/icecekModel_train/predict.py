from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train2/weights/last.pt")
results = model('data/val/Diger/12_jpg.rf.277ec929fb78d3030ec2ca071961f292.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])