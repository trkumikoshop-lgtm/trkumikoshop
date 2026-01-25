
import React, { useState, useEffect } from 'react';
import { cmsStore } from '../services/cmsStore';

const About: React.FC = () => {
  const [config, setConfig] = useState(cmsStore.get());

  useEffect(() => {
    const handleUpdate = () => setConfig(cmsStore.get());
    window.addEventListener('cms-update', handleUpdate);
    return () => window.removeEventListener('cms-update', handleUpdate);
  }, []);

  return (
    <div className="py-20 fade-in">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative group">
          <img src={config.about.image} alt="Artesano" className="w-full shadow-xl filter sepia-[0.1] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-white/20 -z-10 border border-wood-pale backdrop-blur-sm"></div>
        </div>
        
        <div className="space-y-8">
          <h2 className="text-4xl font-serif-jp font-bold text-wood-dark">{config.about.title}</h2>
          <div className="space-y-6 text-wood-dark/70 leading-relaxed font-light whitespace-pre-wrap">
            {config.about.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
