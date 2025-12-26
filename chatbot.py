from datetime import datetime
from typing import Optional, Dict, List, Union
import random

class BetelLeafChatbot:
    """
    Powerful, context-aware AI Assistant for Betel Leaf (Piper betle) farming.
    Includes general knowledge, image diagnosis context, and organic farming protocols.
    """

    def __init__(self, classes: Dict[int, str]):
        self.classes = classes
        self.last_prediction: Optional[str] = None
        self.last_confidence: Optional[float] = None
        
        # Comprehensive Knowledge Base
        self.knowledge_base = {
            "Healthy": {
                "cause": "Optimal soil nutrition and balanced environment.",
                "advice": "Maintain current care. Use organic mulch to retain soil moisture.",
                "severity": "Low",
                "organic": "Apply Vermicompost every 90 days."
            },
            "Leaf_Spot": {
                "cause": "Cercospora fungal pathogen, usually from high humidity.",
                "advice": "Remove infected leaves. Improve spacing for better airflow.",
                "severity": "Moderate",
                "organic": "Spray 5% Neem Seed Kernel Extract (NSKE)."
            },
            "Leaf_Rot": {
                "cause": "Phytophthora parasitica; thrives in waterlogged soil.",
                "advice": "Drench soil with 1% Bordeaux mixture. Stop irrigation immediately.",
                "severity": "High",
                "organic": "Apply Trichoderma viride mixed with well-rotted manure."
            },
            "Bacterial_Disease": {
                "cause": "Xanthomonas campestris bacteria.",
                "advice": "Spray Streptocycline (0.5g/L) mixed with Copper Oxychloride.",
                "severity": "Critical",
                "organic": "Remove and burn infected vines; avoid harvesting in rain."
            },
            "Bacterial_Blight": {
                "cause": "Bacterial infection spreading via water droplets.",
                "advice": "Prune affected parts. Avoid high-nitrogen fertilizers.",
                "severity": "Critical",
                "organic": "Spray Garlic-Chilli extract as a preventive measure."
            }
        }

        # Intent Mapping
        self.intents = {
            "greeting": ["hi", "hello", "hey", "namaste", "salam", "morning", "evening", "start"],
            "bot_info": ["who are you", "what is your name", "identify yourself", "tell me about you"],
            "capabilities": ["what can you do", "features", "how to use", "help", "guide"],
            "farming_general": ["how to grow", "soil type", "climate", "temperature", "sunlight"],
            "irrigation": ["water", "watering", "irrigation", "how much water"],
            "harvest": ["harvest", "picking", "collecting", "ready to pick"],
            "treatment": ["treat", "medicine", "cure", "fix", "remedy", "solution", "what to do"],
            "prevention": ["prevent", "avoid", "protect", "stop disease"],
            "fertilizer": ["fertilizer", "manure", "feeding", "nutrition", "npk", "growth boost"],
            "thanks": ["thank", "helpful", "great", "appreciate", "good job"],
            "time": ["time", "date", "today"]
        }

    def update_prediction(self, label: str, confidence: float):
        """Syncs the chatbot with the latest vision model results."""
        self.last_prediction = label
        self.last_confidence = round(confidence, 2)

    def get_response(self, user_message: str) -> str:
        """Processes input and routes to the correct handler."""
        msg = user_message.lower().strip()

        if self._match("greeting", msg): return self._handle_greeting()
        if self._match("bot_info", msg): return self._handle_bot_info()
        if self._match("capabilities", msg): return self._handle_capabilities()
        if self._match("farming_general", msg): return self._handle_farming_general()
        if self._match("irrigation", msg): return self._handle_irrigation()
        if self._match("fertilizer", msg): return self._handle_fertilizer()
        if self._match("harvest", msg): return self._handle_harvest()
        if self._match("treatment", msg): return self._handle_treatment()
        if self._match("prevention", msg): return self._handle_prevention()
        if self._match("time", msg): return self._handle_time()
        if self._match("thanks", msg): return "You're very welcome! I'm here whenever your vines need me. Happy farming! 🌿"

        return self._handle_fallback()

    def _match(self, intent: str, msg: str) -> bool:
        return any(keyword in msg for keyword in self.intents.get(intent, []))

    def _handle_greeting(self) -> str:
        options = [
            "Hello! I am your Betel Leaf AI Assistant. How is your garden today? 🌿",
            "Namaste! Ready to optimize your betel vine health? Ask me anything.",
            "Hey there! I'm specialized in Piper betle care. How can I help you thrive today?"
        ]
        return random.choice(options)

    def _handle_bot_info(self) -> str:
        return (
            "I am **BetelBot**, an advanced AI specifically trained for Betel Leaf cultivation. "
            "I combine computer vision data with agronomic expertise to help you achieve the best yields."
        )

    def _handle_capabilities(self) -> str:
        return (
            "🚀 **I can assist you with:**\n"
            "1. **Disease Detection:** Upload a photo for an instant diagnosis.\n"
            "2. **Treatment Plans:** Chemical and Organic remedies for detected issues.\n"
            "3. **Cultivation Advice:** Soil, water, and fertilizer requirements.\n"
            "4. **Prevention:** Strategies to stop outbreaks before they start."
        )

    def _handle_farming_general(self) -> str:
        return (
            "🌱 **General Growth Standards:**\n"
            "• **Climate:** Tropical and humid (25°C to 35°C is ideal).\n"
            "• **Soil:** Well-drained fertile clay or loamy soil with pH 7.0–7.5.\n"
            "• **Sunlight:** Filtered sunlight (Shade nets or 'Bareja' structure required)."
        )

    def _handle_irrigation(self) -> str:
        return (
            "💧 **Watering Protocol:**\n"
            "• Betel vines need frequent but light watering.\n"
            "• **Summer:** Daily misting/irrigation.\n"
            "• **Winter:** Every 3-4 days.\n"
            "• **Caution:** Never allow water to stand (stagnate) around the roots."
        )

    def _handle_fertilizer(self) -> str:
        return (
            "🧪 **Nutrition Guide:**\n"
            "• **Organic:** Apply Neem Cake or Mustard Cake slurry every month.\n"
            "• **Micronutrients:** Zinc and Magnesium sprays help maintain leaf gloss.\n"
            "• **Avoid:** Excessive Nitrogen (Urea) in the rainy season; it causes rot."
        )

    def _handle_harvest(self) -> str:
        return (
            "✂️ **Harvesting Tips:**\n"
            "• Leaves are ready when they reach full size and feel leathery.\n"
            "• Harvest early morning or late evening to maintain freshness.\n"
            "• Use a sterilized knife or 'Nakh' (thumb-cutter) to avoid pulling the vine."
        )

    def _handle_treatment(self) -> str:
        if not self.last_prediction:
            return "📸 **Context Required:** Please upload a photo of the leaf first so I can see what we are treating."

        info = self.knowledge_base.get(self.last_prediction)
        if not info:
            return f"I see {self.last_prediction.replace('_', ' ')}, but I'm still learning the treatment for it. Try checking airflow."

        severity_icon = {"Low": "🟢", "Moderate": "🟡", "High": "🟠", "Critical": "🔴"}.get(info['severity'], "⚪")
        return (
            f"📋 **Diagnosis Summary**\n"
            f"━━━━━━━━━━━━━━━\n"
            f"🔍 **Issue:** {self.last_prediction.replace('_', ' ')}\n"
            f"⚠️ **Severity:** {severity_icon} {info['severity']}\n"
            f"🎯 **Confidence:** {self.last_confidence}%\n\n"
            f"🧬 **Cause:** {info['cause']}\n"
            f"🛠️ **Action:** {info['advice']}\n"
            f"🌿 **Organic Fix:** {info['organic']}\n"
            f"━━━━━━━━━━━━━━━"
        )

    def _handle_prevention(self) -> str:
        return (
            "🛡️ **Prevention Checklist:**\n"
            "1. Use only disease-free 'cuttings' for planting.\n"
            "2. Sterilize all pruning tools with alcohol/bleach.\n"
            "3. Maintain wide spacing for air circulation.\n"
            "4. Apply Trichoderma to the soil before the monsoon starts."
        )

    def _handle_time(self) -> str:
        return f"📅 {datetime.now().strftime('%A, %d %B %Y | %I:%M %p')}"

    def _handle_fallback(self) -> str:
        return (
            "I'm not sure I understand that. 🌿\n\n"
            "Try asking about:\n"
            "• 'How much water do vines need?'\n"
            "• 'What are the signs of Leaf Rot?'\n"
            "• 'Organic fertilizers'\n"
            "...or **upload a photo** for diagnosis."
        )