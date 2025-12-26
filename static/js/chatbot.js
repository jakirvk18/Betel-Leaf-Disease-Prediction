// ===== CHATBOT TYPING ANIMATION =====
function addMessage(message, sender) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = sender === "user" ? "flex justify-end" : "flex justify-start";

    if (sender === "bot") {
        const msgDiv = document.createElement("div");
        msgDiv.className = "max-w-[75%] px-4 py-2 rounded-2xl shadow bg-gray-200 text-gray-800";
        div.appendChild(msgDiv);
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;

        let i = 0;
        function type() {
            if (i < message.length) {
                msgDiv.innerHTML += message.charAt(i);
                i++;
                box.scrollTop = box.scrollHeight;
                setTimeout(type, 25); // typing speed in ms
            }
        }
        type();
    } else {
        div.innerHTML = `<div class="max-w-[75%] px-4 py-2 rounded-2xl shadow bg-green-600 text-white">${message}</div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }
}

function sendMessage() {
    const input = document.getElementById("chat-input");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    // Show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "flex justify-start";
    typingDiv.innerHTML = `<div id="typing-indicator" class="max-w-[75%] px-4 py-2 rounded-2xl shadow bg-gray-200 text-gray-800">🤖 typing...</div>`;
    const chatBox = document.getElementById("chat-box");
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    })
    .then(r => r.json())
    .then(d => {
        typingDiv.remove();
        addMessage(d.reply, "bot");
    });
}

// Attach event listener
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

// ===== MULTI-LANGUAGE SUPPORT =====
const translations = {
    en: {
        title: "Betel Leaf Disease Prediction AI",
        subtitle: "A Unified AI Portal for Indian Farmers",
        detect_title: "Leaf Disease Detection",
        upload_label: "Upload Betel Leaf Image",
        analyze_btn: "Analyze Leaf",
        disease: "Disease",
        confidence: "Confidence",
        assistant_title: "Farmer AI Assistant",
        chat_placeholder: "Ask about disease, prevention, farming tips..."
    },
    hi: {
        title: "पान पत्ती रोग पहचान एआई",
        subtitle: "भारतीय किसानों के लिए एकीकृत एआई पोर्टल",
        detect_title: "पत्ती रोग पहचान",
        upload_label: "पान की पत्ती की तस्वीर अपलोड करें",
        analyze_btn: "विश्लेषण करें",
        disease: "रोग",
        confidence: "विश्वास",
        assistant_title: "किसान एआई सहायक",
        chat_placeholder: "रोग, रोकथाम, खेती के बारे में पूछें..."
    },
    te: {
        title: "🍃 తమలపాకు వ్యాధి గుర్తింపు AI",
        subtitle: "భారతీయ రైతుల కోసం ఏకీకృత AI పోర్టల్",
        detect_title: "ఆకు వ్యాధి గుర్తింపు",
        upload_label: "వక్క ఆకుల చిత్రాన్ని అప్లోడ్ చేయండి",
        analyze_btn: "విశ్లేషించండి",
        disease: "వ్యాధి",
        confidence: "నమ్మకం",
        assistant_title: "రైతు AI సహాయకుడు",
        chat_placeholder: "వ్యాధులు, నివారణ, సాగు గురించి అడగండి..."
    }
};

function changeLanguage(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.innerText = translations[lang][el.dataset.i18n];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = translations[lang][el.dataset.i18nPlaceholder];
    });
}
