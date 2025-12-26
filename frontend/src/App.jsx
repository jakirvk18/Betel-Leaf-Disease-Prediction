import React, { useState } from 'react'; // Added useState import
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import { translations } from "./translations";

const App = () => {
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  return (
    <div className="flex flex-col min-h-screen  bg-gray-300">
      <Header language={language} setLanguage={setLanguage} t={t} />
      <Body t={t} />
      <Footer />
    </div>
  );
};

export default App;