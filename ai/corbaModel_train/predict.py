from ultralytics import YOLO
import numpy as np

model = YOLO("./runs/classify/train/weights/last.pt")
results = model('data/test/SuzmeMercimek/402_jpg.rf.7fc752478c1358444babef74d8cdd479.jpg')

names_dict = results[0].names

probs = results[0].probs.data.tolist()

print(names_dict)
print(probs)

print(names_dict[np.argmax(probs)])