
import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, Instagram } from 'lucide-react';
import { cmsStore } from '../services/cmsStore';

const Contact: React.FC = () => {
  const [config, setConfig] = useState(cmsStore.get());
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setConfig(cmsStore.get());
    const handlePreview = (e: any) => setConfig(e.detail);
    window.addEventListener('cms-update', handleUpdate);
    window.addEventListener('cms-preview', handlePreview);
    return () => {
      window.removeEventListener('cms-update', handleUpdate);
      window.removeEventListener('cms-preview', handlePreview);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  const instagramUrl = config.contact.instagram.startsWith('http') 
    ? config.contact.instagram 
    : `https://instagram.com/${config.contact.instagram}`;

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 fade-in">
      <div className="grid md:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <h2 className="text-4xl font-serif-jp font-bold text-wood-dark mb-6">{config.contact.title}</h2>
            <p className="text-wood-dark/60 font-light max-w-md">
              {config.contact.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-wood-dark/80">
              <Mail size={20} className="text-wood-dark" />
              <span className="text-sm tracking-wide">{config.contact.email}</span>
            </div>
            <div className="flex items-center gap-4 text-wood-dark/80">
              <Phone size={20} className="text-wood-dark" />
              <span className="text-sm tracking-wide">{config.contact.phone}</span>
            </div>
            {config.contact.instagram && (
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-wood-dark/80 hover:text-orange-800 transition-colors"
              >
                <Instagram size={20} className="text-wood-dark" />
                <span className="text-sm tracking-wide">@{config.contact.instagram.replace('https://instagram.com/', '').replace('/', '')}</span>
              </a>
            )}
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-sm p-10 border border-wood-pale shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input placeholder="Nombre" required className="w-full bg-white/50 border border-wood-pale p-4 outline-none focus:bg-white transition-all text-sm" />
            <input type="email" placeholder="Email" required className="w-full bg-white/50 border border-wood-pale p-4 outline-none focus:bg-white transition-all text-sm" />
            <textarea placeholder="Mensaje" rows={5} required className="w-full bg-white/50 border border-wood-pale p-4 outline-none resize-none focus:bg-white transition-all text-sm" />
            <button type="submit" className="w-full bg-wood-dark text-white py-4 tracking-widest hover:bg-black transition-all shadow-md active:scale-95">
              {sent ? '¡ENVIADO CON ÉXITO!' : 'ENVIAR MENSAJE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
