# 🍽️ Tray Analysis and Detection System - AI

This project implements a **multi-level food classification system** using **YOLOv8 models**. It is organized into separate training modules for different food categories:

## 🏷️ Food Classification Models
- **`anaYemekModel_train`** - Main dish classifier  
- **`corbaModel_train`** - Soup classifier  
- **`etliModel_train`** - Meat dish classifier  
- **`etsizModel_train`** - Vegetarian dish classifier  
- **`foodCategoryModel_train`** - General food category classifier  
- **`icecekModel_train`** - Beverage classifier  
- **`tamamlayiciModel_train`** - Complementary food classifier  
- **`tatliModel_train`** - Dessert classifier  
- **`yanciModel_train`** - Side dish classifier  
- **`yardimciYemekModel_train`** - Auxiliary dish classifier  


## 📁 Project Structure
Each model directory contains:
- data/ - Training and validation datasets
- train.py - Training script for the model
- predict.py - Inference script for making predictions
- runs/ - Training artifacts including model weights and logs


## 🛠️ Technology Stack
- **YOLOv8** classification models  
- **Python 3.10**  
- **OpenCV**  
- **PyTorch/Ultralytics**


## 🎯 Training a Model
To train a specific category model:

```bash
cd [category]Model_train
python train.py
```
## 🔎 Making Predictions
To make predictions with the trained model:

```bash
cd [category]Model_train
python predict.py
```
## FinalModel
The finalModel directory contains the combined classification system.
