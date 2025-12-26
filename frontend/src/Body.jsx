import React from "react";
import ChatBot from "./components/ChatBot";
import DiseaseForm from "./components/DiseaseForm";

const Body = ({ t }) => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* DISEASE DETECTION */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <DiseaseForm t={t} />
          </section>

          {/* CHATBOT */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <ChatBot t={t} />
          </section>

        </div>
      </div>
    </main>
  );
};

export default Body;
