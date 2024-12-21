from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train/weights/last.pt")
results = model('data/test/Yanci/373_jpg.rf.b9147f3b7af6ba3173fbf99fd146e262.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])