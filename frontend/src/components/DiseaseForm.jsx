import React, { useState, useRef } from "react";

const DiseaseForm = ({ t }) => {
  const [imgPreview, setImgPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // =====================================
  // CAMERA LOGIC
  // =====================================
  const startCamera = async () => {
    setIsCameraOpen(true);
    setImgPreview(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setImgPreview(URL.createObjectURL(blob));
        stopCamera();
      }, "image/jpeg");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  // =====================================
  // FILE SELECTION
  // =====================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setImgPreview(URL.createObjectURL(file));
    setResult(null);
    if (isCameraOpen) stopCamera();
  };

  // =====================================
  // FORM SUBMIT
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // THEME HELPERS
  // =====================================
  const getTheme = (severity) => {
    const s = severity?.toLowerCase() || "";
    if (s.includes("severe") || s.includes("high") || s.includes("rot")) {
      return { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", subtext: "text-red-700", accent: "bg-red-600", lightAccent: "bg-red-200", badge: "bg-red-100 text-red-800 ring-1 ring-red-400" };
    }
    if (s.includes("moderate") || s.includes("medium")) {
      return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900", subtext: "text-orange-700", accent: "bg-orange-500", lightAccent: "bg-orange-200", badge: "bg-orange-100 text-orange-800 ring-1 ring-orange-400" };
    }
    if (severity) {
      return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", subtext: "text-emerald-700", accent: "bg-emerald-600", lightAccent: "bg-emerald-200", badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400" };
    }
    return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", subtext: "text-gray-600", accent: "bg-gray-600", lightAccent: "bg-gray-300", badge: "bg-gray-200 text-gray-700" };
  };

  const theme = getTheme(result?.severity);

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl shadow-lg text-white text-xl">🌿</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{t.detect_title}</h2>
          <p className="text-sm text-gray-500">AI-Powered Plant Diagnosis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className={`relative w-full max-h-[170px] rounded-xl border-2 border-dashed overflow-hidden transition-all duration-300 bg-white ${imgPreview || isCameraOpen ? 'border-green-500' : 'border-gray-300'}`}>

          {/* CAMERA VIEW */}
          {isCameraOpen ? (
            <div className="relative h-40 bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button type="button" onClick={capturePhoto} className="bg-white text-green-600 p-3 rounded-full shadow-lg active:scale-90 transition">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                </button>
                <button type="button" onClick={stopCamera} className="bg-red-500 text-white p-3 rounded-full shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          ) : imgPreview ? (
            /* IMAGE PREVIEW */
            <div className="relative h-64 group">
              <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => setImgPreview(null)} className="bg-white/90 p-2 rounded-lg text-sm font-bold text-gray-700">Remove</button>
              </div>
            </div>
          ) : (
            /* UPLOAD PLACEHOLDER */
            <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
              <div className="flex gap-4 mb-4">
                <button type="button" onClick={startCamera} className="flex flex-col items-center justify-center w-24 h-24 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-xs font-bold">Camera</span>
                </button>
                <div className="relative flex flex-col items-center justify-center w-24 h-24 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <span className="text-xs font-bold">Upload</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Capture or upload leaf photo</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <button
          disabled={!selectedFile || loading}
          className={`
    relative w-full py-2 rounded-xl font-black text-xl tracking-wide uppercase
    overflow-hidden transition-all duration-300 group
    ${!selectedFile || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-[0.98]"
            }
  `}
        >
          {/* Shine Effect */}
          {!loading && selectedFile && (
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-[30deg] -translate-x-full group-hover:animate-shine" />
          )}

          <span className="relative flex items-center justify-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🔍</span>
                {t.analyze_btn}
              </>
            )}
          </span>
        </button>
      </form>

      {result && (
        <div className={`mt-8 p-3 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme.bg} ${theme.border}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-70 ${theme.text}`}>Diagnosis</p>
              <h3 className={`text-2xl font-black ${theme.text}`}>{result.top_predictions[0]?.label || "Unknown"}</h3>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${theme.badge}`}>{result.severity}</span>
          </div>

          <div className="space-y-4 mb-6">
            {result.top_predictions.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className={index === 0 ? theme.text : "text-gray-600"}>{item.label}</span>
                  <span className={theme.text}>{item.confidence}%</span>
                </div>
                <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden ring-1 ring-black/5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? theme.accent : theme.lightAccent}`} style={{ width: `${item.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-black/5">
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${theme.accent} text-white text-xs`}>💡</div>
            <div className={`text-sm ${theme.subtext}`}>
              <span className="font-bold block mb-1">Recommendation</span>
              {result.advice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseForm;