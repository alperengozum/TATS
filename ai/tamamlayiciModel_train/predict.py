from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train/weights/last.pt")
results = model('data/test/PirincPilavi/66_jpg.rf.3d638c856e05d69cf1d74d23f65e37bd.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])