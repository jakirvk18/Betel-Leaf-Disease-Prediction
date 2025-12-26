import React, { useState, useRef, useEffect } from "react";
import chatbot from "../assets/chatbot.png";

const ChatBot = ({ t }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { sender: "user", text: input.trim(), time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      typeResponse(data.reply);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Connection error. Please try again.", time: new Date() }]);
      setIsTyping(false);
    }
  };

  const typeResponse = (fullText) => {
    let currentText = "";
    let index = 0;
    setMessages((prev) => [...prev, { sender: "bot", text: "", time: new Date() }]);

    const interval = setInterval(() => {
      currentText += fullText[index];
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], text: currentText };
        return updated;
      });
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
  };

  return (
    <div className="w-full flex flex-col h-[700px] max-w-2xl mx-auto bg-white rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 animate-in fade-in duration-700">
      
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl p-1 border border-white/30 overflow-hidden shadow-inner">
              <img src={chatbot} alt="Bot" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-emerald-500 rounded-full animate-pulse shadow-sm"></div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none mb-1">
              {t.assistant_title || "Farmer Assistant"}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-200 rounded-full animate-ping"></span>
              <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-widest opacity-80">System Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHAT AREA ================= */}
      <div 
        ref={chatBoxRef} 
        className="flex-grow overflow-y-auto p-6 space-y-8 bg-[#fdfdfd] scrollbar-thin scrollbar-thumb-gray-100"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
              <span className="text-4xl animate-bounce duration-[3s]">🌿</span>
            </div>
            <h3 className="text-gray-800 font-bold text-lg">How can I help you today?</h3>
            <p className="text-gray-400 text-sm max-w-[240px] mt-1">Ask me about plant health, fertilization, or pest prevention.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-500`}>
            <div className={`
              relative max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm
              ${msg.sender === "user" 
                ? "bg-emerald-600 text-white rounded-br-none shadow-emerald-100 font-medium" 
                : "bg-white border border-gray-100 text-gray-800 rounded-tl-none font-semibold"
              }
            `}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[9px] absolute -bottom-5 font-black uppercase tracking-tighter opacity-40 ${msg.sender === "user" ? "right-1 text-emerald-700" : "left-1 text-gray-500"}`}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && messages[messages.length-1]?.sender === 'user' && (
           <div className="flex justify-start">
             <div className="bg-white border border-gray-100 px-5 py-4 rounded-[1.5rem] rounded-tl-none flex gap-1.5 items-center shadow-sm">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           </div>
        )}
      </div>

      {/* ================= INPUT AREA ================= */}
      <div className="p-6 bg-white border-t border-gray-50/50">
        <div className="relative flex items-end gap-3 bg-gray-50 rounded-[2rem] p-2 pr-3 border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all duration-300 shadow-inner group">
          <textarea
            ref={textAreaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Ask about disease, prevention, farming tips..."
            className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none"
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`
              w-12 h-12 rounded-full transition-all duration-500 flex items-center justify-center flex-shrink-0
              ${!input.trim() || isTyping 
                ? "bg-gray-100 text-gray-300" 
                : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-90"
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;