import os
import json
import uuid
import torch
import torch.nn as nn
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from torchvision import transforms, models

# Local Import
from chatbot import BetelLeafChatbot

# ======================================================
# CONFIGURATION & PATHS
# ======================================================
class Config:
    UPLOAD_FOLDER = "uploads"
    MODEL_WEIGHTS = "betel_leaf_model.pth"
    CLASS_INDEX_FILE = "class_indices.json"
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = Flask(__name__)
CORS(app)
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# ======================================================
# RESOURCE LOADING (CLASSES & DISEASE DATA)
# ======================================================
try:
    with open(Config.CLASS_INDEX_FILE, "r") as f:
        class_indices = json.load(f)
    # Ensure indices are integers for mapping
    CLASSES = {int(v): k for k, v in class_indices.items()}
except Exception as e:
    print(f"❌ Error loading class indices: {e}")
    CLASSES = {}

DISEASE_INFO = {
    "Healthy": {
        "cause": "Optimal plant health",
        "advice": "Maintain proper irrigation and balanced nutrition."
    },
    "Leaf_Spot": {
        "cause": "Fungal infection",
        "advice": "Remove infected leaves and apply copper fungicide."
    },
    "Leaf_Rot": {
        "cause": "Phytophthora fungus",
        "advice": "Improve drainage and apply recommended fungicide."
    },
    "Bacterial_Blight": {
        "cause": "Bacterial infection",
        "advice": "Use bactericides and sterilize farming tools."
    }
}

# ======================================================
# MODEL ARCHITECTURE & INITIALIZATION
# ======================================================
def get_model(num_classes):
    """Initializes EfficientNet-B0 with custom classifier head."""
    model = models.efficientnet_b0(weights=None) 
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.5, inplace=True),
        nn.Linear(in_features, num_classes)
    )
    return model

def load_trained_model():
    """Loads weights and prepares model for inference."""
    if not CLASSES:
        return None
    
    model = get_model(len(CLASSES))
    try:
        model.load_state_dict(torch.load(Config.MODEL_WEIGHTS, map_location=Config.DEVICE))
        model.to(Config.DEVICE)
        model.eval()
        print(f"✅ Model loaded on {Config.DEVICE}")
        return model
    except FileNotFoundError:
        print(f"❌ Weights file '{Config.MODEL_WEIGHTS}' not found.")
        return None

# Global Model & Chatbot instances
model = load_trained_model()
chatbot = BetelLeafChatbot(CLASSES)

# ======================================================
# IMAGE PRE-PROCESSING
# ======================================================
inference_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ======================================================
# UTILITIES
# ======================================================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def calculate_severity(confidence):
    if confidence < 50: return "Uncertain"
    if confidence < 70: return "Mild Infection"
    if confidence < 85: return "Moderate Infection"
    return "Severe Infection"

# ======================================================
# CORE INFERENCE LOGIC
# ======================================================
def run_inference(img_path, top_k=3):
    """Processes image and returns top-K predictions and severity."""
    img = Image.open(img_path).convert("RGB")
    img_tensor = inference_transforms(img).unsqueeze(0).to(Config.DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]

    top_probs, top_indices = torch.topk(probabilities, top_k)
    
    results = []
    for prob, idx in zip(top_probs, top_indices):
        results.append({
            "label": CLASSES[int(idx)],
            "confidence": round(float(prob) * 100, 2)
        })

    severity = calculate_severity(results[0]["confidence"])
    return results, severity

# ======================================================
# API ENDPOINTS
# ======================================================

@app.route("/api/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in request"}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Save file with unique ID
    ext = secure_filename(file.filename).rsplit('.', 1)[1]
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
    file.save(save_path)

    try:
        predictions, severity = run_inference(save_path)
        
        main_pred = predictions[0]
        # Sync result with chatbot state
        chatbot.update_prediction(main_pred["label"], main_pred["confidence"])

        # Determine Advice
        if main_pred["confidence"] < 50:
            advice = "Prediction uncertain. Please provide a clearer photo of the leaf."
        else:
            advice = DISEASE_INFO.get(main_pred["label"], {}).get("advice", "No specific advice found.")

        return jsonify({
            "top_predictions": predictions,
            "severity": severity,
            "advice": advice,
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message", "").strip()
    
    if not user_input:
        return jsonify({"reply": "I didn't catch that. Could you repeat?"}), 400

    try:
        response = chatbot.get_response(user_input)
        return jsonify({"reply": response})
    except Exception as e:
        return jsonify({"reply": "My chat system is experiencing issues."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)