
import React, { useState } from 'react';
import { cmsStore } from '../services/cmsStore';
import { Product } from '../types';
import { 
  X, MessageCircle, Mail, ChevronLeft, ChevronRight,
  Play, Film, Camera, Star
} from 'lucide-react';

const Products: React.FC = () => {
  const [config] = useState(cmsStore.get());
  const [catFilter, setCatFilter] = useState<string>('Todos');
  const [familyFilter, setFamilyFilter] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'video'>('gallery');

  const filteredProducts = config.products.filter(p => {
    const matchCat = catFilter === 'Todos' || p.category === catFilter;
    const matchFam = familyFilter === 'Todos' || p.family === familyFilter;
    return matchCat && matchFam;
  });

  const categories = ['Todos', ...config.categories];
  
  // Obtener familias disponibles para la categoría seleccionada
  const availableFamilies = catFilter !== 'Todos' 
    ? ['Todos', ...(config.categoryFamilies[catFilter] || [])] 
    : [];

  const handleCategoryChange = (cat: string) => {
    setCatFilter(cat);
    setFamilyFilter('Todos'); // Resetear familia al cambiar categoría
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImgIdx(0);
    setViewMode('gallery');
  };

  const handleWhatsApp = (product: Product) => {
    const phone = config.contact.phone.replace(/\s+/g, '');
    const message = encodeURIComponent(`Hola TR-KUMIKO, me gustaría consultar sobre la pieza: ${product.name}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleEmail = (product: Product) => {
    const subject = encodeURIComponent(`Consulta: ${product.name}`);
    const body = encodeURIComponent(`Hola,\n\nEstoy interesado en recibir más información sobre "${product.name}".\n\nSaludos.`);
    window.location.href = `mailto:${config.contact.email}?subject=${subject}&body=${body}`;
  };

  const nextImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProduct || selectedProduct.imageUrls.length === 0) return;
    setCurrentImgIdx((prev) => (prev + 1) % selectedProduct.imageUrls.length);
  };

  const prevImg = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProduct || selectedProduct.imageUrls.length === 0) return;
    setCurrentImgIdx((prev) => (prev - 1 + selectedProduct.imageUrls.length) % selectedProduct.imageUrls.length);
  };

  const renderVideoPlayer = (url: string) => {
    if (!url) return <div className="text-white">Video no disponible</div>;
    
    // Soporte para YouTube
    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const youtubeMatch = url.match(youtubeRegex);
    const youtubeId = (youtubeMatch && youtubeMatch[2].length === 11) ? youtubeMatch[2] : null;

    if (youtubeId) {
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} 
          className="w-full h-full" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }

    // Fallback para archivos directos
    return (
      <video src={url} controls autoPlay className="w-full h-full bg-black object-contain">
        Tu navegador no soporta el reproductor de video.
      </video>
    );
  };

  return (
    <>
      <div className="py-20 max-w-7xl mx-auto px-4 fade-in">
        <div className="text-center mb-16">
          <span className="text-orange-800 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Nuestro Trabajo</span>
          <h2 className="text-5xl md:text-6xl font-serif-jp font-bold text-wood-dark mb-6 tracking-tight">Piezas Disponibles</h2>
          <div className="w-16 h-1 bg-wood-dark mx-auto mb-8"></div>
        </div>

        <div className="flex flex-col items-center gap-6 mb-20">
          {/* Filtro de Categorías */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] px-8 py-3 border transition-all font-bold rounded-sm shadow-sm ${
                  catFilter === cat ? 'bg-wood-dark text-white border-wood-dark' : 'bg-white text-gray-400 border-wood-pale hover:text-wood-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro de Familias (solo si hay una categoría seleccionada) */}
          {availableFamilies.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-wood-pale w-full max-w-2xl animate-in slide-in-from-top-2 duration-300">
              <span className="w-full text-center text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Filtrar por familia</span>
              {availableFamilies.map(fam => (
                <button
                  key={fam}
                  onClick={() => setFamilyFilter(fam)}
                  className={`text-[9px] uppercase tracking-[0.2em] px-5 py-2 border transition-all font-bold rounded-full ${
                    familyFilter === fam ? 'bg-orange-800 text-white border-orange-800' : 'bg-white text-gray-400 border-gray-200 hover:border-wood-dark hover:text-wood-dark'
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => handleOpenProduct(product)}
            >
              <div className="relative overflow-hidden aspect-[3/4] bg-white border border-wood-pale mb-6 shadow-sm">
                <img 
                  src={product.imageUrls[0] || 'https://via.placeholder.com/600x800?text=Sin+Imagen'} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-orange-800 text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] border border-orange-900 z-20 shadow-lg">
                  {product.family}
                </div>
                {product.videoUrl && (
                  <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full">
                    <Play size={16} className="text-wood-dark fill-wood-dark" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-serif-jp text-wood-dark tracking-tight">{product.name}</h3>
                  <span className="font-serif-jp text-xl text-wood-dark/60">{product.price}€</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-playfair italic text-xl">No se han encontrado piezas con estos filtros.</p>
            <button 
              onClick={() => handleCategoryChange('Todos')}
              className="mt-6 text-[10px] uppercase tracking-widest font-black text-wood-dark border-b-2 border-wood-dark pb-1"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-wood-dark/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative w-full max-w-6xl bg-paper flex flex-col md:flex-row shadow-2xl rounded-sm border border-wood-pale overflow-hidden max-h-[90vh]">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 z-[130] bg-white p-3 rounded-full hover:bg-orange-800 hover:text-white transition-all shadow-xl active:scale-90"
            >
              <X size={24} />
            </button>

            {/* ÁREA VISUAL (IZQUIERDA) */}
            <div className="w-full md:w-3/5 h-[300px] md:h-auto bg-black relative flex items-center justify-center group/viewer overflow-hidden">
              {viewMode === 'gallery' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                   <img 
                    key={selectedProduct.imageUrls[currentImgIdx]}
                    src={selectedProduct.imageUrls[currentImgIdx] || 'https://via.placeholder.com/800x800?text=Sin+Imagen'} 
                    className="max-w-full max-h-full object-contain animate-in fade-in duration-700 select-none" 
                    alt={selectedProduct.name}
                  />
                  
                  {selectedProduct.imageUrls.length > 1 && (
                    <>
                      <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white p-4 rounded-full backdrop-blur-md transition-all text-white hover:text-black">
                        <ChevronLeft size={30} />
                      </button>
                      <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white p-4 rounded-full backdrop-blur-md transition-all text-white hover:text-black">
                        <ChevronRight size={30} />
                      </button>

                      {/* NAVEGACIÓN MINIATURAS */}
                      <div className="absolute bottom-6 flex gap-2 z-20 overflow-x-auto max-w-[90%] p-2">
                        {selectedProduct.imageUrls.map((url, idx) => (
                          <button 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(idx); }}
                            className={`w-12 h-12 border-2 transition-all flex-shrink-0 ${currentImgIdx === idx ? 'border-white scale-110 shadow-lg' : 'border-white/30 opacity-60'}`}
                          >
                            <img src={url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {renderVideoPlayer(selectedProduct.videoUrl!)}
                </div>
              )}

              {/* SELECTOR MODO VISTA */}
              {selectedProduct.videoUrl && (
                <div className="absolute top-8 left-8 flex gap-2 z-[120]">
                  <button 
                    onClick={() => setViewMode('gallery')} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'gallery' ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    <Camera size={14}/> FOTOS
                  </button>
                  <button 
                    onClick={() => setViewMode('video')} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'video' ? 'bg-orange-600 text-white shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    <Play size={14}/> VÍDEO
                  </button>
                </div>
              )}
            </div>

            {/* ÁREA INFORMACIÓN (DERECHA) */}
            <div className="w-full md:w-2/5 p-8 md:p-14 bg-paper flex flex-col justify-between border-l border-wood-pale overflow-y-auto">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] uppercase tracking-widest font-black text-white bg-wood-dark px-3 py-1">{selectedProduct.category}</span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-orange-800 border border-orange-800 px-3 py-1">FAMILIA: {selectedProduct.family}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-serif-jp font-bold text-wood-dark mb-4 tracking-tight">{selectedProduct.name}</h2>
                <div className="text-3xl font-serif-jp text-wood-dark/70 mb-8 italic">{selectedProduct.price}€</div>
                
                <p className="text-gray-600 font-playfair italic text-lg leading-relaxed whitespace-pre-wrap mb-8">
                  {selectedProduct.description}
                </p>

                {selectedProduct.isCustomizable && (
                  <div className="bg-orange-50 border-2 border-orange-200 p-4 mb-8 flex items-center gap-4">
                    <Star className="text-orange-600 animate-pulse" size={24} />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-900 block">Personalizable</span>
                      <p className="text-[9px] text-orange-800/80 leading-tight">Esta pieza admite cambios en patrón y dimensiones.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-10 border-t border-wood-pale">
                <button 
                  onClick={() => handleWhatsApp(selectedProduct)}
                  className="w-full bg-[#25D366] text-white py-5 px-8 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all border-b-8 border-[#075E54] shadow-lg"
                >
                  <MessageCircle size={20} /> CONSULTAR WHATSAPP
                </button>
                <button 
                  onClick={() => handleEmail(selectedProduct)}
                  className="w-full bg-wood-dark text-white py-5 px-8 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all border-b-8 border-black shadow-lg"
                >
                  <Mail size={20} /> CONSULTAR EMAIL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
