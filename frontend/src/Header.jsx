import React, { useState } from "react";

const Header = ({ language, setLanguage, t }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", icon: "🌐" },
    { code: "hi", label: "हिंदी", isImage: true },
    { code: "te", label: "తెలుగు", isImage: true },
  ];

  const flagUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/500px-Flag_of_India.svg.png";

  return (
    <header className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white shadow-xl border-b border-green-700 relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4 group cursor-default">
          <div className="group-hover:scale-110 transition-transform duration-300">
            <span className="text-3xl leading-none">🍃</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-green-100">
              {t.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] md:text-xs font-bold text-green-300 uppercase tracking-[0.2em]">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 bg-black/30 hover:bg-black/40 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-lg transition-all"
          >
            {language === "en" ? (
              <span>🌐</span>
            ) : (
              <img src={flagUrl} alt="IN" className="h-3.5 w-5 object-cover" />
            )}
            <span className="font-bold text-sm uppercase">{language}</span>
            <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-green-900 border border-green-700 rounded-xl shadow-2xl overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-800 transition-colors text-sm font-semibold border-b border-green-800/50 last:border-none"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  {lang.isImage ? (
                    <img src={flagUrl} alt="IN" className="h-3 w-4.5 object-cover" />
                  ) : (
                    <span>{lang.icon}</span>
                  )}
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;