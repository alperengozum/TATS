import os
from ultralytics import YOLO
import cv2

model_path = os.path.join('.', 'runs', 'detect', 'train', 'weights', 'last.pt')

model = YOLO(model_path)

image_path = "data/datasets/images/train/9.jpeg"


img = cv2.imread(image_path)


threshold = 0.5
results = model(img)[0]

# Process results
i = 0
for result in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = result
    if score > threshold:
        cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 4)
        cv2.putText(img, model.names[int(class_id)].upper(), (int(x1), int(y1 - 10)),
        cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 3, cv2.LINE_AA)
        i += 1
cv2.imwrite(f"results/res.jpg", img)
