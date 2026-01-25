
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Mail, MessageCircle, Settings } from 'lucide-react';
import KumikoPattern from './KumikoPattern';
import { cmsStore } from '../services/cmsStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState(cmsStore.get());
  const location = useLocation();

  useEffect(() => {
    const handleUpdate = () => setConfig(cmsStore.get());
    window.addEventListener('cms-update', handleUpdate);
    return () => window.removeEventListener('cms-update', handleUpdate);
  }, []);

  // SEO: Generar JSON-LD para Google
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": config.siteName,
      "image": config.home.heroImage,
      "description": config.home.subtitle,
      "email": config.contact.email,
      "telephone": config.contact.phone,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ES"
      },
      "url": window.location.origin
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Artesanía', path: '/productos' },
    { name: 'Blog', path: '/blog' },
    { name: 'Sobre Mí', path: '/sobre-mi' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const instagramUrl = config.contact.instagram.startsWith('http') 
    ? config.contact.instagram 
    : `https://instagram.com/${config.contact.instagram}`;

  const whatsappNumber = config.contact.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen flex flex-col relative bg-paper transition-colors duration-1000">
      <KumikoPattern className="absolute inset-0 z-0" opacity={0.03} />
      
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-wood-pale shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-4 group">
              {config.logoUrl && (
                <img 
                  src={config.logoUrl} 
                  alt={`${config.siteName} Logo`} 
                  className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                />
              )}
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-serif-jp tracking-[0.15em] font-bold text-wood-dark leading-none">
                  {config.siteName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mt-1">Artesanía Kumiko</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-orange-800 ${
                    isActive(link.path) ? 'text-wood-dark border-b-2 border-wood-dark' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-wood-dark" aria-label="Abrir menú">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-lg border-b border-wood-pale py-4 px-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-serif-jp text-wood-dark"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-grow z-10 relative bg-tilo/50">
        {children}
      </main>

      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group border-2 border-white/20"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-0 group-hover:px-2">
          ¿Hablamos?
        </span>
      </a>

      <footer className="bg-paper border-t border-wood-pale py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-10 mb-10">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1" aria-label="Seguir en Instagram">
              <Instagram className="text-wood-dark/30 group-hover:text-orange-800 transition-all duration-300" size={24} />
              <span className="text-[8px] uppercase tracking-widest text-gray-300 font-bold group-hover:text-orange-800 transition-colors">Instagram</span>
            </a>
            
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1" aria-label="Enviar WhatsApp">
              <MessageCircle className="text-wood-dark/30 group-hover:text-[#25D366] transition-all duration-300" size={24} />
              <span className="text-[8px] uppercase tracking-widest text-gray-300 font-bold group-hover:text-[#25D366] transition-colors">WhatsApp</span>
            </a>

            <a href={`mailto:${config.contact.email}`} className="group flex flex-col items-center gap-1" aria-label="Enviar Correo">
              <Mail className="text-wood-dark/30 group-hover:text-orange-800 transition-all duration-300" size={24} />
              <span className="text-[8px] uppercase tracking-widest text-gray-300 font-bold group-hover:text-orange-800 transition-colors">Email</span>
            </a>
          </div>
          
          <div className="mb-6">
            <p className="font-serif-jp text-wood-dark text-lg tracking-widest mb-2 uppercase font-bold">
              {config.siteName}
            </p>
            <p className="text-[10px] text-gray-400 tracking-[0.5em] uppercase font-bold">
              Arte en Madera & Corte láser
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <p className="text-[10px] text-gray-300 font-light tracking-wide select-none">
              © {new Date().getFullYear()} {config.siteName}. Todos los derechos reservados.
            </p>
            <Link to="/admin" className="text-[8px] uppercase tracking-[0.2em] text-gray-300 hover:text-wood-dark flex items-center gap-1">
              <Settings size={8} /> ACCESO TALLER
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
