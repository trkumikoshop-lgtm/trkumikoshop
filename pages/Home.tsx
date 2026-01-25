
import React, { useEffect, useState } from 'react';
// Use named imports for react-router-dom to fix property access errors
import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { cmsStore } from '../services/cmsStore';

const Home: React.FC = () => {
  const [config, setConfig] = useState(cmsStore.get());

  useEffect(() => {
    const handleUpdate = () => setConfig(cmsStore.get());
    window.addEventListener('cms-update', handleUpdate);
    return () => window.removeEventListener('cms-update', handleUpdate);
  }, []);

  const buttonClass = "w-full md:w-auto bg-wood-dark text-white px-8 py-5 tracking-[0.2em] hover:bg-black transition-colors duration-300 flex items-center justify-center gap-3 shadow-lg text-[10px] font-bold uppercase border border-wood-dark";

  return (
    <div className="fade-in min-h-screen">
      {/* Hero Section: Imagen a la derecha */}
      <section className="relative min-h-[85vh] flex flex-col md:flex-row items-stretch bg-white border-b border-wood-pale overflow-hidden">
        {/* Lado Izquierdo: Texto */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-8 md:p-24 bg-paper">
          <div className="max-w-xl w-full">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-wood-dark/5 border border-wood-pale rounded-full">
              <span className="w-2 h-2 bg-orange-800 rounded-full animate-pulse"></span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-wood-dark font-bold">Taller Artesanal TR-KUMIKO</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif-jp font-bold text-wood-dark mb-8 tracking-tighter leading-[0.9]">
              {config.home.title}
            </h1>
            
            <p className="text-lg md:text-xl text-wood-dark/70 mb-12 font-light leading-relaxed font-playfair italic max-w-lg">
              "{config.home.subtitle}"
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/productos" className={buttonClass}>
                EXPLORAR COLECCIÓN <ArrowRight size={16} />
              </Link>
              <Link to="/sobre-mi" className={buttonClass}>
                NUESTRA HISTORIA <Info size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Imagen */}
        <div className="w-full md:w-1/2 lg:w-2/5 relative min-h-[400px] md:min-h-0 overflow-hidden bg-tilo border-l border-wood-pale">
          <img 
            src={config.home.heroImage} 
            alt="Kumiko Woodwork" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
          />
          <div className="absolute inset-0 bg-wood-dark/5 pointer-events-none"></div>
          <div className="absolute inset-6 border border-white/20 pointer-events-none hidden md:block"></div>
        </div>
      </section>

      {/* Featured Process Section */}
      <section className="py-24 px-4 bg-tilo/20">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-4xl font-serif-jp text-wood-dark uppercase tracking-widest font-bold">Precisión Milenaria</h2>
          <p className="text-gray-600 font-light leading-relaxed text-lg font-playfair italic">
            "En TR-KUMIKO transformamos el tilo en patrones geométricos que cuentan historias de paciencia y equilibrio."
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            <div className="space-y-2">
              <span className="block text-3xl font-serif-jp text-wood-dark font-bold">100%</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Artesanal</span>
            </div>
            <div className="space-y-2">
              <span className="block text-3xl font-serif-jp text-wood-dark font-bold">0</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Clavos / Tornillos</span>
            </div>
            <div className="space-y-2">
              <span className="block text-3xl font-serif-jp text-wood-dark font-bold">Tilo</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Madera Selecta</span>
            </div>
            <div className="space-y-2">
              <span className="block text-3xl font-serif-jp text-wood-dark font-bold">∞</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Precisión</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
