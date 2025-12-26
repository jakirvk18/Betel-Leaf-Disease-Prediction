# import os
# import shutil

# # Define the source (where your current folders are) and the destination
# source_dir = "raw_dataset"  # Update this to your current folder path
# base_dir = "dataset"

# # Define the folder mapping based on your screenshots
# mapping = {
#     "Healthy": [
#         "Cut_Green_Yellow_50", 
#         "Deformed_Shrinked_Green_100", 
#         "Deformed_Shrinked_Green_200",
#         "Light_Yellow_Green_100"
#     ],
#     "Leaf_Spot": [
#         "Brown_Spot_Fungus_Light_Colored_100",
#         "Brown_Spot_Large_Number_Small_Size_100",
#         "Dark_Brown_Spot_Edge_Yellow_Green_156",
#         "Dark_Brown_Spot_Light_Colored_100",
#         "Green_Leaf_White_Powder_Spot_100",
#         "Green_Yellow_Black_Spotted_201",
#         "GreenYellow_Black_Spotted_200",
#         "Light_Coloured_Spotted_200",
#         "Distorted_Colours_Brown_Spots_100",
#         "Yellow_Black_Spotted_200",
#         "Yellow_Black_Spottted_Leaf_200",
#         "Yellow_Brown_Big_Spot_200"
#     ],
#     "Leaf_Rot": [
#         "Brown_Fungus_200",
#         "Green_Fungus_200",
#         "Yellow_Black_Spotted_Fungus_Back_100"
#     ],
#     "Bacterial_Blight": [
#         "Complete_Yellow_Dark_Black_Spot_200",
#         "Cut_Brown_Edge_Yellow_100",
#         "Cut_Brown_Spot_Yellow_100",
#         "Deformed_Partially_Yellow_100",
#         "Deformed_Yellow_Leaf_Blackspots_Edge_200",
#         "Light_Yellow_Green_Dark_Spot_100",
#         "Light_Yellow_Green_Less_Brown_Spot_100",
#         "Partial_Yellow_Black_Spotted_Border_200",
#         "White_Patch_Light_Green_Yellow_Spotted_200",
#         "Yellow_Brown_Deformed_200",
#         "Yellow_Green_Brown_Spotted_Cut_200"
#     ]
# }

# def organize():
#     for main_class, subfolders in mapping.items():
#         # Create the 4 main class directories
#         target_path = os.path.join(base_dir, main_class)
#         os.makedirs(target_path, exist_ok=True)
        
#         for folder in subfolders:
#             folder_path = os.path.join(source_dir, folder)
#             if os.path.exists(folder_path):
#                 print(f"Moving content from {folder} to {main_class}...")
#                 for file_name in os.listdir(folder_path):
#                     src_file = os.path.join(folder_path, file_name)
#                     dst_file = os.path.join(target_path, f"{folder}_{file_name}")
#                     # Use copy2 to keep metadata, or move to save space
#                     shutil.copy2(src_file, dst_file)
#             else:
#                 print(f"Warning: Folder {folder} not found.")

# if __name__ == "__main__":
#     organize()
#     print("\nDataset organization complete!")
import os
import shutil
import random

DATASET_DIR = "dataset"
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")
SPLIT_RATIO = 0.8

classes = ["Bacterial_Blight", "Healthy", "Leaf_Rot", "Leaf_Spot"]

os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(VAL_DIR, exist_ok=True)

for cls in classes:
    src = os.path.join(DATASET_DIR, cls)
    images = os.listdir(src)
    random.shuffle(images)

    split = int(len(images) * SPLIT_RATIO)

    train_imgs = images[:split]
    val_imgs = images[split:]

    os.makedirs(os.path.join(TRAIN_DIR, cls), exist_ok=True)
    os.makedirs(os.path.join(VAL_DIR, cls), exist_ok=True)

    for img in train_imgs:
        shutil.copy(os.path.join(src, img), os.path.join(TRAIN_DIR, cls, img))

    for img in val_imgs:
        shutil.copy(os.path.join(src, img), os.path.join(VAL_DIR, cls, img))

print("✅ Dataset split completed")
