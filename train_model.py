import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm

# =========================
# CONFIGURATION
# =========================
DATASET_DIR = "dataset"
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "val")

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 1e-4

MODEL_PATH = "betel_leaf_model.pth"
CLASS_INDEX_PATH = "class_indices.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {DEVICE}")

# =========================
# DATA TRANSFORMS
# =========================
train_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =========================
# DATASETS & DATALOADERS
# (num_workers=0 for Windows)
# =========================
train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transforms
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transforms
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)

NUM_CLASSES = len(train_dataset.classes)
print("✅ Classes detected:", train_dataset.classes)

# =========================
# SAVE CLASS INDICES
# =========================
class_indices = {cls: idx for idx, cls in enumerate(train_dataset.classes)}
with open(CLASS_INDEX_PATH, "w") as f:
    json.dump(class_indices, f, indent=4)

print("✅ Class indices saved")

# =========================
# MODEL: EfficientNet-B0
# =========================
model = models.efficientnet_b0(
    weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
)

# Freeze backbone
for param in model.features.parameters():
    param.requires_grad = False

# Replace classifier
model.classifier = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(model.classifier[1].in_features, NUM_CLASSES)
)

model = model.to(DEVICE)

# =========================
# LOSS & OPTIMIZER
# =========================
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(
    model.classifier.parameters(),
    lr=LEARNING_RATE
)

# =========================
# TRAINING LOOP
# =========================
best_val_accuracy = 0.0

for epoch in range(EPOCHS):
    print(f"\n🔁 Epoch {epoch + 1}/{EPOCHS}")

    # -------- TRAIN --------
    model.train()
    train_loss = 0.0
    correct, total = 0, 0

    for images, labels in tqdm(train_loader, desc="Training"):
        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (preds == labels).sum().item()

    train_acc = 100 * correct / total

    # -------- VALIDATION --------
    model.eval()
    val_loss = 0.0
    correct, total = 0, 0

    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc="Validation"):
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()

    val_acc = 100 * correct / total

    print(f"📊 Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
    print(f"📊 Val   Loss: {val_loss:.4f} | Val   Acc: {val_acc:.2f}%")

    # -------- SAVE BEST MODEL --------
    if val_acc > best_val_accuracy:
        best_val_accuracy = val_acc
        torch.save(model.state_dict(), MODEL_PATH)
        print("✅ Best model saved")

# =========================
# DONE
# =========================
print("\n🎉 Training completed successfully!")
print(f"🏆 Best Validation Accuracy: {best_val_accuracy:.2f}%")
