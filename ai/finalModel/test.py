import os
from ultralytics import YOLO
import cv2
import math

model_path = os.path.join('.', 'runs', 'detect', 'train2', 'weights', 'last.pt')

model = YOLO(model_path)

#image_path = "old_data/old_datasets2/train/images/4_jpeg.rf.eaa1ad931717afbb6681fc92729f7106.jpg"
image_path = "data/datasets/test/images/IMG-20241212-WA0017_jpg.rf.3e73796ecfe3a41af0901f2937a0298d.jpg"

img = cv2.imread(image_path)
h,w=img.shape[:2]

threshold = 0.5
results = model(img)[0]
# Define colors for each class
class_colors = {
    0: (0, 255, 0),    # Green for class 0
    1: (255, 0, 0),    # Blue for class 1
    2: (0, 0, 255),    # Red for class 2
    3: (255, 255, 0)   # Cyan for class 3
}
i=0
# Process results
for result in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = result
    if score > threshold:
        # Text settings
        text = model.names[int(class_id)]
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = w / 1200  # 1.1
        font_thickness = math.floor(w / 700)  # 2
        text_size, _ = cv2.getTextSize(text, font, font_scale, font_thickness)
        text_w, text_h = text_size

        color = class_colors.get(int(class_id), (0, 255, 0))  # Default to green if class_id not found
        cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 0), font_thickness*5)
        cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), color, font_thickness*2)

        # Text with outline
        outline_color = (0, 0, 0)  # Black outline
        cv2.putText(img, text, (int(x1), int(y1 - 10)), font, font_scale, outline_color, 3*font_thickness ,
                    cv2.LINE_AA)
        cv2.putText(img, text, (int(x1), int(y1 - 10)), font, font_scale, color, font_thickness, cv2.LINE_AA)
        i += 1
cv2.imshow("result", img)
cv2.waitKey(0)