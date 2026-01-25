
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsStore } from '../services/cmsStore';
import { SiteConfig, Product, BlogPost } from '../types';
import { 
  Save, Plus, Trash2, RefreshCw, ShoppingBag, Globe, 
  Image as ImageIcon, Tags, X, Check, Lock, ShieldCheck, 
  BookOpen, User, Mail, Copy, FileJson, Home as HomeIcon, Star, Video, RotateCcw, Settings, AlertTriangle, Loader2
} from 'lucide-react';

const Admin: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(cmsStore.get());
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('taxonomies'); 
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const latestConfigRef = useRef<SiteConfig>(config);
  
  useEffect(() => {
    latestConfigRef.current = config;
  }, [config]);

  const [newCatName, setNewCatName] = useState('');
  const [newFamilyInputs, setNewFamilyInputs] = useState<Record<string, string>>({});

  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('tr_admin_auth') === 'true');
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = "kumiko2025";

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tr_admin_auth', 'true');
    } else {
      alert("Contraseña incorrecta");
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tr_admin_auth');
  };

  const updateConfig = useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
    setConfig(current => {
      const next = updater({ ...current });
      setHasChanges(true);
      return next;
    });
  }, []);

  /**
   * UTILIDAD DE COMPRESIÓN:
   * Redimensiona a 1200px máx y comprime JPEG al 70%
   */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const maxWidth = 1200;
      const quality = 0.7;
      const reader = new FileReader();
      
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular proporciones
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject("No se pudo obtener el contexto del canvas");
            return;
          }

          // Dibujar y comprimir
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject("Error al cargar la imagen");
      };
      reader.onerror = () => reject("Error al leer el archivo");
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const dataToSave = latestConfigRef.current;
      const result = cmsStore.save(dataToSave);
      
      if (result.success) {
        setSaveSuccess(true);
        setHasChanges(false);
      } else {
        alert(`❌ ERROR DE ALMACENAMIENTO:\n\n${result.error}`);
      }
    } catch (err) {
      console.error("Error en handleSave:", err);
      alert("Error inesperado al intentar guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const restoreDefaults = () => {
    if (window.confirm("¿Seguro que quieres borrar todo y volver a los datos de fábrica?")) {
      localStorage.removeItem('tr_kumiko_config');
      window.location.reload();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetId: string, type: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessingImage(true);
    const file = files[0];
    
    try {
      // PROCESAR Y COMPRIMIR ANTES DE SUBIR
      const optimizedBase64 = await compressImage(file);
      
      updateConfig(prev => {
        const next = { ...prev };
        if (type === 'product-img') {
          next.products = next.products.map(p => p.id === targetId ? { ...p, imageUrls: [...p.imageUrls, optimizedBase64] } : p);
        } else if (type === 'blog-img') {
          next.blog = next.blog.map(b => b.id === targetId ? { ...b, imageUrl: optimizedBase64 } : b);
        } else if (type === 'hero-img') {
          next.home = { ...next.home, heroImage: optimizedBase64 };
        } else if (type === 'about-img') {
          next.about = { ...next.about, image: optimizedBase64 };
        } else if (type === 'logo-img') {
          next.logoUrl = optimizedBase64;
        }
        return next;
      });
    } catch (err) {
      console.error("Error procesando imagen:", err);
      alert("No se pudo procesar la imagen. Intenta con otro archivo.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const inputClass = "w-full bg-white border-2 border-[#EBDCC5] p-4 outline-none focus:border-[#4A3728] text-[#4A3728] text-sm transition-all rounded-sm font-medium";
  const labelClass = "block text-[10px] uppercase tracking-[0.2em] text-[#4A3728] font-black mb-3 border-l-2 border-orange-600 pl-2";
  const sectionTitle = "text-3xl font-serif-jp text-[#4A3728] font-bold border-b-4 border-[#EBDCC5] pb-6 mb-10 flex items-center gap-4";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7]">
        <div className="max-w-md w-full bg-white border-2 border-[#EBDCC5] p-12 shadow-2xl text-center space-y-8">
          <Lock className="mx-auto text-[#4A3728]" size={32} />
          <h2 className="text-2xl font-serif-jp font-bold text-[#4A3728] tracking-widest uppercase">Acceso Taller</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="CONTRASEÑA" className={`${inputClass} text-center tracking-[0.5em] text-xl py-5`} autoFocus />
            <button className="w-full bg-[#4A3728] text-white py-6 font-bold text-[12px] tracking-[0.4em] hover:bg-black transition-all shadow-2xl rounded-sm border-b-8 border-black">ENTRAR</button>
          </form>
          <Link to="/" className="inline-block text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Volver a la web</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/30 pb-24">
      {/* Indicador de procesamiento global */}
      {isProcessingImage && (
        <div className="fixed inset-0 z-[200] bg-wood-dark/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-sm shadow-2xl flex flex-col items-center gap-4 border-2 border-wood-pale">
            <Loader2 size={40} className="text-orange-800 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-wood-dark">Optimizando Imagen...</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[60] bg-white border-b-4 border-[#EBDCC5] py-6 px-6 md:px-12 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <ShieldCheck className="text-[#4A3728]" size={32} />
          <h1 className="text-lg font-serif-jp font-bold text-[#4A3728] uppercase tracking-widest hidden sm:block">Panel de Gestión</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600">Salir</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || isProcessingImage}
            className={`px-10 py-5 flex items-center gap-4 transition-all text-[12px] tracking-[0.4em] font-black rounded-sm shadow-2xl border-b-8 ${saveSuccess ? 'bg-green-600 text-white border-green-800' : hasChanges ? 'bg-orange-600 text-white border-orange-800 animate-pulse' : 'bg-[#4A3728] text-white border-black'} ${(isSaving || isProcessingImage) ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : saveSuccess ? <Check size={20} /> : <Save size={20} />} 
            {isSaving ? 'GUARDANDO...' : saveSuccess ? 'GUARDADO' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row mt-12 px-6">
        <nav className="w-full lg:w-72 p-4 space-y-2 lg:sticky lg:top-36 h-fit mb-10">
          {[
            { id: 'taxonomies', icon: Tags, label: 'Estructura' },
            { id: 'products', icon: ShoppingBag, label: 'Productos' },
            { id: 'home', icon: HomeIcon, label: 'Portada' },
            { id: 'blog', icon: BookOpen, label: 'Bitácora' },
            { id: 'global', icon: Globe, label: 'Identidad' },
            { id: 'about', icon: User, label: 'Sobre Mí' },
            { id: 'contact', icon: Mail, label: 'Contacto' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-5 px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black transition-all rounded-sm w-full shadow-sm border-b-4 ${activeTab === tab.id ? 'bg-[#4A3728] text-white border-black translate-x-2' : 'bg-white text-gray-400 border-[#EBDCC5] hover:bg-orange-50'}`}>
              <tab.icon size={18} /> {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <main className="flex-grow lg:pl-16">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* ESTRUCTURA */}
            {activeTab === 'taxonomies' && (
              <div className="animate-in fade-in duration-500 space-y-12">
                <h3 className={sectionTitle}><Tags size={28}/> Estructura de Catálogo</h3>
                {config.categories.map((cat, catIdx) => (
                  <div key={cat} className="bg-white p-10 border-4 border-[#EBDCC5] shadow-xl rounded-sm space-y-8 border-l-[16px] border-l-orange-800">
                    <div className="flex justify-between items-start">
                      <h4 className="text-4xl font-black uppercase text-black">{cat}</h4>
                      <button onClick={() => updateConfig(prev => ({ ...prev, categories: prev.categories.filter((_, idx) => idx !== catIdx) }))} className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px]">Eliminar Categoría</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(config.categoryFamilies[cat] || []).map((fam, famIdx) => (
                        <div key={fam} className="bg-[#4A3728] p-6 rounded-sm flex justify-between items-center border-b-4 border-black">
                          <span className="text-2xl font-black uppercase text-white">{fam}</span>
                          <button onClick={() => updateConfig(prev => ({ ...prev, categoryFamilies: { ...prev.categoryFamilies, [cat]: (prev.categoryFamilies[cat] || []).filter((_, i) => i !== famIdx) } }))}><Trash2 size={20} className="text-white/40 hover:text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <input value={newFamilyInputs[cat] || ''} onChange={e => setNewFamilyInputs(prev => ({ ...prev, [cat]: e.target.value }))} className="flex-grow p-4 border-2 border-[#4A3728] font-bold text-black uppercase" placeholder="Añadir familia..." />
                      <button onClick={() => {
                        const val = newFamilyInputs[cat];
                        if(val?.trim()) {
                          updateConfig(prev => ({ ...prev, categoryFamilies: { ...prev.categoryFamilies, [cat]: [...(prev.categoryFamilies[cat] || []), val.trim()] } }));
                          setNewFamilyInputs(prev => ({ ...prev, [cat]: '' }));
                        }
                      }} className="bg-orange-600 text-white px-8 font-black uppercase shadow-lg">Añadir</button>
                    </div>
                  </div>
                ))}
                <div className="bg-[#4A3728] p-12 text-white space-y-8 rounded-sm shadow-2xl">
                  <h4 className="text-2xl font-black uppercase">Nueva Categoría Principal</h4>
                  <div className="flex gap-4">
                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-grow p-5 text-black font-black uppercase rounded-sm" placeholder="Ej: Lámparas..." />
                    <button onClick={() => {
                      if(newCatName.trim()) {
                        updateConfig(prev => ({ ...prev, categories: [...prev.categories, newCatName.trim()], categoryFamilies: { ...prev.categoryFamilies, [newCatName.trim()]: ['General'] } }));
                        setNewCatName('');
                      }
                    }} className="bg-white text-[#4A3728] px-12 font-black uppercase rounded-sm">Crear</button>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTOS */}
            {activeTab === 'products' && (
              <div className="space-y-12 animate-in fade-in">
                <div className="flex justify-between items-center border-b-4 border-[#EBDCC5] pb-8">
                  <h3 className={sectionTitle}><ShoppingBag size={28}/> Catálogo de Piezas</h3>
                  <button onClick={() => updateConfig(p => ({
                    ...p, 
                    products: [{ id: Date.now().toString(), name: 'Nueva Pieza', price: 0, description: '', imageUrls: [], category: p.categories[0], family: p.categoryFamilies[p.categories[0]]?.[0] || 'General', isCustomizable: true }, ...p.products]
                  }))} className="bg-orange-600 text-white px-10 py-6 text-[11px] font-black border-b-8 border-orange-900 shadow-xl">NUEVO PRODUCTO</button>
                </div>
                {config.products.map(p => (
                  <div key={p.id} className="bg-white border-2 border-[#EBDCC5] p-10 shadow-md space-y-10 relative border-l-[12px] border-l-[#4A3728]">
                    <button onClick={() => updateConfig(prev => ({ ...prev, products: prev.products.filter(pr => pr.id !== p.id) }))} className="absolute top-8 right-8 text-gray-300 hover:text-red-600"><Trash2 size={24}/></button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-6">
                        <label className={labelClass}>Fotografías (Auto-optimizadas)</label>
                        <div className="grid grid-cols-2 gap-3">
                          {p.imageUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square border-2 border-[#EBDCC5] overflow-hidden group/img">
                              <img src={url} className="w-full h-full object-cover" />
                              <button onClick={() => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, imageUrls: pr.imageUrls.filter(u => u !== url) } : pr) }))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center"><Trash2 size={16}/></button>
                            </div>
                          ))}
                          <div className="aspect-square border-2 border-dashed border-[#EBDCC5] flex items-center justify-center relative hover:bg-gray-50">
                            <Plus size={30} className="text-gray-300" />
                            <input type="file" onChange={e => handleFileUpload(e, p.id, 'product-img')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div><label className={labelClass}>Nombre</label><input value={p.name} onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, name: e.target.value } : pr) }))} className={inputClass} /></div>
                          <div><label className={labelClass}>Precio (€)</label><input type="number" value={p.price} onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, price: Number(e.target.value) } : pr) }))} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Categoría</label>
                            <select value={p.category} onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, category: e.target.value, family: prev.categoryFamilies[e.target.value]?.[0] || 'General' } : pr) }))} className={inputClass}>
                              {config.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Familia</label>
                            <select value={p.family} onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, family: e.target.value } : pr) }))} className={inputClass}>
                              {(config.categoryFamilies[p.category] || ['General']).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Personalización</label>
                          <div className="flex items-center gap-4 bg-orange-50 p-4 border border-orange-200 rounded-sm">
                            <input 
                              type="checkbox" 
                              id={`check-${p.id}`}
                              checked={p.isCustomizable} 
                              onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, isCustomizable: e.target.checked } : pr) }))}
                              className="w-6 h-6 accent-orange-700 cursor-pointer"
                            />
                            <label htmlFor={`check-${p.id}`} className="text-[11px] font-black uppercase tracking-widest text-orange-900 cursor-pointer">Admite personalización (Medidas/Patrón)</label>
                          </div>
                        </div>
                        <textarea value={p.description} onChange={e => updateConfig(prev => ({ ...prev, products: prev.products.map(pr => pr.id === p.id ? { ...pr, description: e.target.value } : pr) }))} className={`${inputClass} h-32`} placeholder="Escribe aquí los detalles..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PORTADA */}
            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}><HomeIcon size={28}/> Configuración Portada</h3>
                <div className="bg-white p-10 border-2 border-[#EBDCC5] shadow-md space-y-8">
                   <div className="space-y-4">
                    <label className={labelClass}>Título Principal (Hero)</label>
                    <input value={config.home.title} onChange={e => updateConfig(prev => ({...prev, home: {...prev.home, title: e.target.value}}))} className={inputClass} />
                  </div>
                   <div className="space-y-4">
                    <label className={labelClass}>Lema o Subtítulo</label>
                    <textarea value={config.home.subtitle} onChange={e => updateConfig(prev => ({...prev, home: {...prev.home, subtitle: e.target.value}}))} className={`${inputClass} h-24`} />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Imagen Hero de Fondo</label>
                    <div className="aspect-video bg-gray-100 border-2 border-[#EBDCC5] overflow-hidden rounded-sm relative group shadow-inner">
                      <img src={config.home.heroImage} className="w-full h-full object-cover" />
                      <input type="file" onChange={e => handleFileUpload(e, '', 'hero-img')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BITÁCORA */}
            {activeTab === 'blog' && (
              <div className="animate-in fade-in duration-500 space-y-12">
                <div className="flex justify-between items-center border-b-4 border-[#EBDCC5] pb-8">
                  <h3 className={sectionTitle}><BookOpen size={28}/> Bitácora</h3>
                  <button onClick={() => updateConfig(p => ({
                    ...p, 
                    blog: [{ id: Date.now().toString(), title: 'Nuevo Artículo', excerpt: '', content: '', date: new Date().toLocaleDateString(), imageUrl: '' }, ...p.blog]
                  }))} className="bg-orange-600 text-white px-10 py-6 text-[11px] font-black border-b-8 border-orange-900 shadow-xl">NUEVA ENTRADA</button>
                </div>
                {config.blog.map(post => (
                  <div key={post.id} className="bg-white border-2 border-[#EBDCC5] p-10 shadow-md space-y-8 relative border-l-[12px] border-l-orange-800">
                    <button onClick={() => updateConfig(prev => ({ ...prev, blog: prev.blog.filter(b => b.id !== post.id) }))} className="absolute top-8 right-8 text-gray-300 hover:text-red-600"><Trash2 size={24}/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className={labelClass}>Título</label>
                        <input value={post.title} onChange={e => updateConfig(prev => ({ ...prev, blog: prev.blog.map(b => b.id === post.id ? { ...b, title: e.target.value } : b) }))} className={inputClass} />
                        <label className={labelClass}>Fecha</label>
                        <input value={post.date} onChange={e => updateConfig(prev => ({ ...prev, blog: prev.blog.map(b => b.id === post.id ? { ...b, date: e.target.value } : b) }))} className={inputClass} />
                      </div>
                      <div className="space-y-4">
                        <label className={labelClass}>Imagen Principal</label>
                        <div className="aspect-video bg-gray-50 border-2 border-dashed overflow-hidden relative group">
                          {post.imageUrl && <img src={post.imageUrl} className="w-full h-full object-cover" />}
                          <input type="file" onChange={e => handleFileUpload(e, post.id, 'blog-img')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                      </div>
                    </div>
                    <textarea value={post.excerpt} onChange={e => updateConfig(prev => ({ ...prev, blog: prev.blog.map(b => b.id === post.id ? { ...b, excerpt: e.target.value } : b) }))} className={`${inputClass} h-20`} placeholder="Resumen corto..." />
                    <textarea value={post.content} onChange={e => updateConfig(prev => ({ ...prev, blog: prev.blog.map(b => b.id === post.id ? { ...b, content: e.target.value } : b) }))} className={`${inputClass} h-64`} placeholder="Escribe el artículo aquí..." />
                  </div>
                ))}
              </div>
            )}

            {/* IDENTIDAD */}
            {activeTab === 'global' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}><Globe size={28}/> Identidad de Marca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-12 border-2 border-[#EBDCC5] shadow-md rounded-sm">
                  <div className="space-y-6">
                    <label className={labelClass}>Nombre Comercial</label>
                    <input value={config.siteName} onChange={e => updateConfig(prev => ({...prev, siteName: e.target.value}))} className={inputClass} />
                  </div>
                  <div className="space-y-6">
                    <label className={labelClass}>Logo Taller</label>
                    <div className="flex items-center gap-6">
                      {config.logoUrl && <img src={config.logoUrl} className="h-24 w-24 object-contain border-2 border-[#EBDCC5] p-2 bg-white" />}
                      <input type="file" onChange={e => handleFileUpload(e, '', 'logo-img')} className="text-[11px] font-black text-[#4A3728]" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SOBRE MÍ */}
            {activeTab === 'about' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}><User size={28}/> Perfil de Artesano</h3>
                <div className="bg-white p-10 border-2 border-[#EBDCC5] shadow-md space-y-8">
                   <div className="space-y-4">
                    <label className={labelClass}>Título de Sección</label>
                    <input value={config.about.title} onChange={e => updateConfig(prev => ({...prev, about: {...prev.about, title: e.target.value}}))} className={inputClass} />
                  </div>
                   <div className="space-y-4">
                    <label className={labelClass}>Historia / Bio</label>
                    <textarea value={config.about.content} onChange={e => updateConfig(prev => ({...prev, about: {...prev.about, content: e.target.value}}))} className={`${inputClass} h-80`} />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Imagen de Perfil</label>
                    <div className="w-64 aspect-square bg-gray-100 border-2 overflow-hidden relative group shadow-lg">
                      <img src={config.about.image} className="w-full h-full object-cover" />
                      <input type="file" onChange={e => handleFileUpload(e, '', 'about-img')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACTO */}
            {activeTab === 'contact' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}><Mail size={28}/> Canales de Contacto</h3>
                <div className="bg-white p-12 border-2 border-[#EBDCC5] shadow-md rounded-sm space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className={labelClass}>Email Profesional</label>
                      <input value={config.contact.email} onChange={e => updateConfig(prev => ({...prev, contact: {...prev.contact, email: e.target.value}}))} className={inputClass} />
                    </div>
                    <div className="space-y-6">
                      <label className={labelClass}>WhatsApp / Teléfono</label>
                      <input value={config.contact.phone} onChange={e => updateConfig(prev => ({...prev, contact: {...prev.contact, phone: e.target.value}}))} className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className={labelClass}>Instagram (Usuario sin @)</label>
                    <input value={config.contact.instagram} onChange={e => updateConfig(prev => ({...prev, contact: {...prev.contact, instagram: e.target.value}}))} className={inputClass} />
                  </div>
                  <div className="space-y-6">
                    <label className={labelClass}>Mensaje de Invitación</label>
                    <textarea value={config.contact.description} onChange={e => updateConfig(prev => ({...prev, contact: {...prev.contact, description: e.target.value}}))} className={`${inputClass} h-24`} />
                  </div>
                </div>
              </div>
            )}

            {/* RESPALDO Y PELIGRO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t-4 border-[#EBDCC5]">
               <div className="bg-orange-100 border-4 border-orange-600 p-8 space-y-6 shadow-xl rounded-sm">
                  <h4 className="text-xl font-black uppercase text-[#4A3728] flex items-center gap-3"><FileJson size={24}/> Respaldo JSON</h4>
                  <p className="text-[9px] text-orange-800 uppercase font-bold">Guarda este código en un archivo de texto como copia de seguridad.</p>
                  <button onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }} className={`w-full p-6 font-black uppercase text-white border-b-8 transition-all ${copySuccess ? 'bg-green-600 border-green-900' : 'bg-orange-600 border-orange-900 hover:bg-orange-700'}`}>
                    {copySuccess ? 'COPIADO AL PORTAPAPELES' : 'COPIAR CONFIGURACIÓN'}
                  </button>
               </div>
               <div className="bg-red-50 border-4 border-red-200 p-8 space-y-6 shadow-xl rounded-sm">
                  <h4 className="text-xl font-black uppercase text-red-800 flex items-center gap-3"><RotateCcw size={24}/> Zona Crítica</h4>
                  <p className="text-[9px] text-red-400 uppercase font-bold">Esto borrará todos los cambios y restablecerá la web original.</p>
                  <button onClick={restoreDefaults} className="w-full bg-red-600 border-b-8 border-red-900 p-6 font-black uppercase text-white hover:bg-red-700">
                    RESTAURAR ORIGINALES
                  </button>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
