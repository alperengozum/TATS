from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train3/weights/last.pt")
results = model('data/test/Su/399_jpg.rf.b48d562cd95e74fa3693ab0557e74249.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])