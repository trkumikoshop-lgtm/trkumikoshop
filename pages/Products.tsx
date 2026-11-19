import React, { useState, useEffect } from 'react';
import { useCms } from '../services/cmsContext';
import { Product } from '../types';
import { 
  X, MessageCircle, Mail, ChevronLeft, ChevronRight,
  Play, Film, Camera, Star
} from 'lucide-react';

const Products: React.FC = () => {
  const { config } = useCms();
  const [catFilter, setCatFilter] = useState<string>(() => config.categories[0] || '');
  const [familyFilter, setFamilyFilter] = useState<string>(() => {
    const firstCat = config.categories[0] || '';
    return config.categoryFamilies[firstCat]?.[0] || '';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'video'>('gallery');

  const categories = config.categories;
  const availableFamilies = catFilter ? (config.categoryFamilies[catFilter] || []) : [];

  // Sincronizar filtro si cambian las categorías/familias desde la nube
  useEffect(() => {
    if (categories.length > 0 && (!catFilter || !categories.includes(catFilter))) {
      const nextCat = categories[0];
      setCatFilter(nextCat);
      setFamilyFilter(config.categoryFamilies[nextCat]?.[0] || '');
    }
  }, [categories, catFilter, config.categoryFamilies]);

  useEffect(() => {
    if (availableFamilies.length > 0 && (!familyFilter || !availableFamilies.includes(familyFilter))) {
      setFamilyFilter(availableFamilies[0]);
    } else if (availableFamilies.length === 0 && familyFilter !== '') {
      setFamilyFilter('');
    }
  }, [availableFamilies, familyFilter]);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  const filteredProducts = config.products
    .filter(p => {
      const matchCat = !catFilter || p.category.trim().toUpperCase() === catFilter.trim().toUpperCase();
      const matchFam =
        availableFamilies.length === 0 ||
        !familyFilter ||
        p.family.trim().toUpperCase() === familyFilter.trim().toUpperCase();
      return matchCat && matchFam;
    })
    .sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), 'es', { sensitivity: 'base', numeric: true })
    );

  const handleCategoryChange = (cat: string) => {
    setCatFilter(cat);
    setFamilyFilter(config.categoryFamilies[cat]?.[0] || '');
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

          {availableFamilies.length > 0 && (
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

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-wood-dark/50 font-playfair italic text-lg">
            No hay piezas disponibles en esta categoría todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group cursor-pointer"
                onClick={() => handleOpenProduct(product)}
              >
                <div className="relative overflow-hidden aspect-[3/4] w-full bg-gray-50 border border-wood-pale mb-6 shadow-sm">
                  <img 
                    src={product.imageUrls[0] || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%23FDFBF7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%234A3728' font-family='sans-serif' font-size='22'%3ESin imagen%3C/text%3E%3C/svg%3E"} 
                    alt={product.name} 
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1';
                        img.src = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%23FDFBF7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%234A3728' font-family='sans-serif' font-size='22'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
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
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 fade-in">
          <div className="fixed inset-0 bg-wood-dark/90 backdrop-blur-xl" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative w-full max-w-6xl bg-paper flex flex-col md:flex-row shadow-2xl rounded-sm border border-wood-pale overflow-hidden max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-[130] bg-white/90 p-3 rounded-full hover:bg-orange-800 hover:text-white transition-all shadow-xl active:scale-90"
            >
              <X size={24} />
            </button>

            {/* ÁREA VISUAL (IZQUIERDA) - Altura explícita en móvil/tablet para evitar colapso en Safari */}
            <div className="w-full md:w-3/5 h-[360px] sm:h-[460px] md:h-[580px] shrink-0 bg-black relative flex items-center justify-center group/viewer overflow-hidden">
              {viewMode === 'gallery' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                   <img 
                    key={selectedProduct.imageUrls[currentImgIdx] || 'empty'}
                    src={selectedProduct.imageUrls[currentImgIdx] || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%23111111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23EBDCC5' font-family='sans-serif' font-size='26'%3ESin imagen%3C/text%3E%3C/svg%3E"} 
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1';
                        img.src = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%23111111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23EBDCC5' font-family='sans-serif' font-size='26'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                      }
                    }}
                    className="max-w-full max-h-full w-auto h-auto object-contain select-none p-4" 
                    alt={selectedProduct.name}
                  />
                  
                  {selectedProduct.imageUrls.length > 1 && (
                    <>
                      <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-3 rounded-full backdrop-blur-md transition-all text-white hover:text-black">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-3 rounded-full backdrop-blur-md transition-all text-white hover:text-black">
                        <ChevronRight size={24} />
                      </button>

                      <div className="absolute bottom-4 flex gap-2 z-20 overflow-x-auto max-w-[90%] p-2 no-scrollbar">
                        {selectedProduct.imageUrls.map((url, idx) => (
                          <button 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImgIdx(idx); }}
                            className={`w-14 h-14 border-2 transition-all flex-shrink-0 rounded-sm ${currentImgIdx === idx ? 'border-white scale-110 shadow-lg' : 'border-white/20 opacity-60'}`}
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

              {selectedProduct.videoUrl && (
                <div className="absolute top-4 left-4 flex gap-2 z-[120]">
                  <button 
                    onClick={() => setViewMode('gallery')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'gallery' ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    <Camera size={14}/> FOTOS
                  </button>
                  <button 
                    onClick={() => setViewMode('video')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'video' ? 'bg-orange-600 text-white shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'}`}
                  >
                    <Play size={14}/> VÍDEO
                  </button>
                </div>
              )}
            </div>

            {/* ÁREA INFORMACIÓN (DERECHA) */}
            <div className="w-full md:w-2/5 p-6 md:p-12 bg-paper flex flex-col justify-between border-l border-wood-pale">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] uppercase tracking-widest font-black text-white bg-wood-dark px-3 py-1">{selectedProduct.category}</span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-orange-800 border border-orange-800 px-3 py-1">FAMILIA: {selectedProduct.family}</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-serif-jp font-bold text-wood-dark mb-4 tracking-tight">{selectedProduct.name}</h2>
                <div className="text-2xl md:text-3xl font-serif-jp text-wood-dark/70 mb-8 italic">{selectedProduct.price}€</div>
                
                <p className="text-gray-600 font-playfair italic text-md md:text-lg leading-relaxed whitespace-pre-wrap mb-8">
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

              <div className="space-y-3 pt-6 border-t border-wood-pale">
                <button 
                  onClick={() => handleWhatsApp(selectedProduct)}
                  className="w-full bg-[#25D366] text-white py-4 md:py-5 px-8 flex items-center justify-center gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all border-b-4 border-[#075E54] shadow-lg"
                >
                  <MessageCircle size={18} /> CONSULTAR WHATSAPP
                </button>
                <button 
                  onClick={() => handleEmail(selectedProduct)}
                  className="w-full bg-wood-dark text-white py-4 md:py-5 px-8 flex items-center justify-center gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all border-b-4 border-black shadow-lg"
                >
                  <Mail size={18} /> CONSULTAR EMAIL
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