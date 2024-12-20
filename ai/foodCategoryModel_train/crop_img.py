import os
import cv2

# Define paths
image_dir = 'data/datasets/train/images'
label_dir = 'data/datasets/train/labels'
output_dir = 'cropped'

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)
i = 0
# Iterate through each image file
for image_filename in os.listdir(image_dir):
    if image_filename.endswith('.jpg') or image_filename.endswith('.jpeg'):
        image_path = os.path.join(image_dir, image_filename)
        label_path = os.path.join(label_dir, os.path.splitext(image_filename)[0] + '.txt')
        #print(image_path)
        # Read the image
        image = cv2.imread(image_path)
        height, width = image.shape[:2]

        # Read the label file
        with open(label_path, 'r') as file:
            for line in file:
                # YOLO format: class x_center y_center width height (normalized)
                parts = line.strip().split()
                foodClass, x_center, y_center, w, h = map(float, parts[:])

                # Convert from normalized coordinates to pixel values
                x_center *= width
                y_center *= height
                w *= width
                h *= height

                # Calculate the top-left corner of the bounding box
                x = int(x_center - w / 2)
                y = int(y_center - h / 2)

                # Crop the image
                cropped_image = image[y:y + int(h), x:x + int(w)]

                if os.path.exists(os.path.join(output_dir, str(foodClass))) == False:
                    os.makedirs(os.path.join(output_dir, str(foodClass)), exist_ok=True)
                    # Save the cropped image
                    output_path = output_dir + "/" + str(foodClass) + f"/{i}.jpg"
                else:
                    # Save the cropped image
                    output_path = output_dir + "/" + str(foodClass) + f"/{i}.jpg"
                i += 1
                print(output_path)
                cv2.imwrite(output_path, cropped_image)