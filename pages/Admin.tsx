import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../services/cmsContext';
import { SiteConfig } from '../types';
import {
  Save,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Globe,
  Tags,
  X,
  Check,
  Lock,
  ShieldCheck,
  BookOpen,
  User,
  Mail,
  FileJson,
  Home as HomeIcon,
  Video,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Cloud,
  Link as LinkIcon,
  Upload,
  LogOut,
} from 'lucide-react';

const Admin: React.FC = () => {
  const {
    config: cloudConfig,
    cloudInitialized,
    isSyncedWithCloud,
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    signOutAdmin,
    saveToCloud,
    resetToDefaultsInCloud,
  } = useCms();

  const [config, setConfig] = useState<SiteConfig>(cloudConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [newCatName, setNewCatName] = useState('');
  const [newFamilyInputs, setNewFamilyInputs] = useState<Record<string, string>>({});

  const latestConfigRef = useRef<SiteConfig>(config);

  useEffect(() => {
    if (!hasChanges) {
      setConfig(cloudConfig);
      latestConfigRef.current = cloudConfig;
    }
  }, [cloudConfig, hasChanges]);

  useEffect(() => {
    latestConfigRef.current = config;
  }, [config]);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.';
      if (msg.includes('auth/unauthorized-domain')) {
        setAuthError(
          `El dominio actual (${window.location.hostname}) no está autorizado en Firebase. Añade exactamente "${window.location.hostname}" en Firebase Console → Authentication → Configuración → Dominios autorizados.`
        );
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setAuthError(null);
    await signOutAdmin();
  };

  const updateConfig = useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
    setErrorBanner(null);
    setConfig((current) => {
      const next = updater({ ...current });
      setHasChanges(true);
      return next;
    });
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const tryEncode = (maxWidth: number, quality: number): string => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }

            canvas.width = Math.max(1, Math.round(width));
            canvas.height = Math.max(1, Math.round(height));
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Error de contexto');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // JPEG es compatible al 100% con cualquier móvil, tablet (iOS/Android) y ordenador
            return canvas.toDataURL('image/jpeg', quality);
          };

          try {
            const attempts: [number, number][] = [
              [960, 0.78],
              [800, 0.68],
              [640, 0.58],
              [480, 0.48],
              [360, 0.4],
            ];
            let result = tryEncode(960, 0.78);
            for (const [w, q] of attempts) {
              result = tryEncode(w, q);
              if (result.length <= 350000) break;
            }
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Error de carga'));
      };
      reader.onerror = () => reject(new Error('Error de lectura'));
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorBanner(null);
    try {
      const dataToSave = latestConfigRef.current;
      const result = await saveToCloud(dataToSave);
      if (result.success) {
        setSaveSuccess(true);
        setHasChanges(false);
      } else {
        setErrorBanner(result.error || 'No se pudo guardar en la nube.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al intentar publicar.';
      setErrorBanner(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setIsSaving(true);
    setErrorBanner(null);
    setConfirmRestore(false);
    try {
      const result = await resetToDefaultsInCloud();
      if (result.success) {
        setHasChanges(false);
        setSaveSuccess(true);
      } else {
        setErrorBanner(result.error || 'Error al restaurar valores originales.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetId: string,
    type: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    setErrorBanner(null);
    const file = files[0];
    try {
      const optimizedBase64 = await compressImage(file);
      applyImageUpdate(optimizedBase64, targetId, type);
    } catch {
      setErrorBanner('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleUrlUpload = (targetId: string, type: string) => {
    const raw = urlInputs[targetId || type];
    const url = raw?.trim();
    if (!url) return;
    if (url.startsWith('blob:') || url.startsWith('file:')) {
      setErrorBanner(
        'Esa ruta es temporal o local de tu ordenador y no se verá en móviles/tablets. Usa el botón "Subir Archivo" o una URL pública https://.'
      );
      return;
    }
    if (url.startsWith('http://')) {
      setErrorBanner(
        'Las URLs con http:// suelen bloquearse en móviles/tablets por seguridad. Usa https:// o el botón "Subir Archivo".'
      );
      return;
    }
    applyImageUpdate(url, targetId, type);
    setUrlInputs((prev) => ({ ...prev, [targetId || type]: '' }));
  };

  const applyImageUpdate = (imageData: string, targetId: string, type: string) => {
    updateConfig((prev) => {
      const next = { ...prev };
      if (type === 'product-img') {
        next.products = next.products.map((p) =>
          p.id === targetId ? { ...p, imageUrls: [...p.imageUrls, imageData] } : p
        );
      } else if (type === 'blog-img') {
        next.blog = next.blog.map((b) =>
          b.id === targetId ? { ...b, imageUrl: imageData } : b
        );
      } else if (type === 'hero-img') {
        next.home = { ...next.home, heroImage: imageData };
      } else if (type === 'about-img') {
        next.about = { ...next.about, image: imageData };
      } else if (type === 'logo-img') {
        next.logoUrl = imageData;
      }
      return next;
    });
  };

  const inputClass =
    'w-full bg-white border-2 border-[#EBDCC5] p-4 outline-none focus:border-[#4A3728] text-[#4A3728] text-sm transition-all rounded-sm font-medium';
  const labelClass =
    'block text-[10px] uppercase tracking-[0.2em] text-[#4A3728] font-black mb-3 border-l-2 border-orange-600 pl-2';
  const sectionTitle =
    'text-3xl font-serif-jp text-[#4A3728] font-bold border-b-4 border-[#EBDCC5] pb-6 mb-10 flex items-center gap-4';

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#4A3728] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#4A3728]">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7]">
        <div className="max-w-md w-full bg-white border-2 border-[#EBDCC5] p-12 shadow-2xl text-center space-y-8">
          <Lock className="mx-auto text-[#4A3728]" size={32} />
          <div className="space-y-2">
            <h2 className="text-2xl font-serif-jp font-bold text-[#4A3728] tracking-widest uppercase">
              Acceso Taller
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Inicia sesión con tu cuenta autorizada de Google para actualizar productos y publicar cambios al instante en la web.
            </p>
          </div>
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-sm text-left">
              {authError}
            </div>
          )}
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full bg-[#4A3728] text-white py-5 px-6 font-bold text-[12px] tracking-[0.25em] hover:bg-black transition-all shadow-2xl rounded-sm border-b-8 border-black flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isSigningIn ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            {isSigningIn ? 'CONECTANDO...' : 'ENTRAR CON GOOGLE'}
          </button>
          <Link
            to="/"
            className="inline-block text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold hover:text-[#4A3728]"
          >
            Volver a la web
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7]">
        <div className="max-w-md w-full bg-white border-2 border-red-200 p-12 shadow-2xl text-center space-y-6">
          <AlertTriangle className="mx-auto text-orange-600" size={36} />
          <h2 className="text-xl font-serif-jp font-bold text-[#4A3728] uppercase tracking-wider">
            Cuenta sin permisos de taller
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Has iniciado sesión como <strong className="text-[#4A3728]">{user.email}</strong>, pero solo las cuentas autorizadas del taller (<strong className="text-[#4A3728]">trkumikoweb@gmail.com</strong> o <strong className="text-[#4A3728]">trkumikoshop@gmail.com</strong>) pueden publicar cambios.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                await handleLogout();
                await handleGoogleLogin();
              }}
              className="w-full bg-[#4A3728] text-white py-4 font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-black transition-all rounded-sm"
            >
              Cambiar cuenta de Google
            </button>
            <Link
              to="/"
              className="inline-block text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold hover:text-[#4A3728]"
            >
              Volver a la web
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/30 pb-24 font-sans">
      {isProcessingImage && (
        <div className="fixed inset-0 z-[200] bg-wood-dark/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-sm shadow-2xl flex flex-col items-center gap-4 border-2 border-wood-pale">
            <Loader2 size={40} className="text-orange-800 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-wood-dark">
              Optimizando imagen...
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[60] bg-white border-b-4 border-[#EBDCC5] py-4 px-6 md:px-12 flex flex-wrap justify-between items-center shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-[#4A3728]" size={30} />
          <div>
            <h1 className="text-lg font-serif-jp font-bold text-[#4A3728] uppercase tracking-widest hidden sm:block">
              Panel de Gestión
            </h1>
            <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-tilo/30 border border-[#EBDCC5] rounded-sm text-[10px] font-bold uppercase tracking-wider text-[#4A3728]">
          <Cloud size={14} className={isSyncedWithCloud ? 'text-green-700' : 'text-orange-600'} />
          <span>
            {cloudInitialized
              ? `${config.products.length} piezas en la nube`
              : 'Pendiente de publicación inicial'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 flex items-center gap-1"
          >
            <LogOut size={14} /> Salir
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isProcessingImage}
            className={`px-8 md:px-10 py-4 md:py-5 flex items-center gap-3 transition-all text-[11px] md:text-[12px] tracking-[0.3em] font-black rounded-sm shadow-2xl border-b-8 ${
              saveSuccess
                ? 'bg-green-600 text-white border-green-800'
                : hasChanges || !cloudInitialized
                  ? 'bg-orange-600 text-white border-orange-800 hover:bg-orange-700'
                  : 'bg-[#4A3728] text-white border-black hover:bg-black'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : saveSuccess ? (
              <Check size={20} />
            ) : (
              <Save size={20} />
            )}
            {isSaving
              ? 'PUBLICANDO...'
              : saveSuccess
                ? 'PUBLICADO EN LA WEB'
                : !cloudInitialized
                  ? 'PUBLICAR EN LA WEB'
                  : 'GUARDAR Y PUBLICAR'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-4">
        {!cloudInitialized && (
          <div className="bg-orange-50 border-2 border-orange-400 p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cloud className="text-orange-700 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-orange-950 leading-relaxed">
                <strong>Base de datos lista:</strong> aún no se ha publicado el catálogo inicial en Firebase. Pulsa <strong>PUBLICAR EN LA WEB</strong> para subir los productos actuales y activar la actualización automática en Netlify.
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-700 shrink-0"
            >
              Publicar ahora
            </button>
          </div>
        )}

        {errorBanner && (
          <div className="bg-red-50 border-2 border-red-400 p-5 rounded-sm flex items-center justify-between gap-4 text-red-800 text-xs font-medium">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner(null)} className="p-1 hover:bg-red-100 rounded">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row mt-8 px-6">
        <nav className="w-full lg:w-72 p-4 space-y-2 lg:sticky lg:top-36 h-fit mb-10">
          {[
            { id: 'taxonomies', icon: Tags, label: 'Estructura' },
            { id: 'products', icon: ShoppingBag, label: 'Productos' },
            { id: 'home', icon: HomeIcon, label: 'Portada' },
            { id: 'blog', icon: BookOpen, label: 'Bitácora' },
            { id: 'global', icon: Globe, label: 'Identidad' },
            { id: 'about', icon: User, label: 'Sobre Mí' },
            { id: 'contact', icon: Mail, label: 'Contacto' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-5 px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black transition-all rounded-sm w-full shadow-sm border-b-4 ${
                activeTab === tab.id
                  ? 'bg-[#4A3728] text-white border-black translate-x-2'
                  : 'bg-white text-gray-400 border-[#EBDCC5] hover:bg-orange-50'
              }`}
            >
              <tab.icon size={18} /> {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <main className="flex-grow lg:pl-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {activeTab === 'taxonomies' && (
              <div className="animate-in fade-in duration-500 space-y-12">
                <h3 className={sectionTitle}>
                  <Tags size={28} /> Estructura de Catálogo
                </h3>
                {config.categories.map((cat, catIdx) => (
                  <div
                    key={cat}
                    className="bg-white p-10 border-4 border-[#EBDCC5] shadow-xl rounded-sm space-y-8 border-l-[16px] border-l-orange-800"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-4xl font-black uppercase text-black">{cat}</h4>
                      <button
                        onClick={() =>
                          updateConfig((prev) => ({
                            ...prev,
                            categories: prev.categories.filter((_, idx) => idx !== catIdx),
                          }))
                        }
                        className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px]"
                      >
                        Eliminar Categoría
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(config.categoryFamilies[cat] || []).map((fam, famIdx) => (
                        <div
                          key={fam}
                          className="bg-[#4A3728] p-6 rounded-sm flex justify-between items-center border-b-4 border-black"
                        >
                          <span className="text-2xl font-black uppercase text-white">{fam}</span>
                          <button
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                categoryFamilies: {
                                  ...prev.categoryFamilies,
                                  [cat]: (prev.categoryFamilies[cat] || []).filter(
                                    (_, i) => i !== famIdx
                                  ),
                                },
                              }))
                            }
                          >
                            <Trash2 size={20} className="text-white/40 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <input
                        value={newFamilyInputs[cat] || ''}
                        onChange={(e) =>
                          setNewFamilyInputs((prev) => ({ ...prev, [cat]: e.target.value }))
                        }
                        className="flex-grow p-4 border-2 border-[#4A3728] font-bold text-black uppercase"
                        placeholder="Añadir familia..."
                      />
                      <button
                        onClick={() => {
                          const val = newFamilyInputs[cat];
                          if (val?.trim()) {
                            updateConfig((prev) => ({
                              ...prev,
                              categoryFamilies: {
                                ...prev.categoryFamilies,
                                [cat]: [...(prev.categoryFamilies[cat] || []), val.trim()],
                              },
                            }));
                            setNewFamilyInputs((prev) => ({ ...prev, [cat]: '' }));
                          }
                        }}
                        className="bg-orange-600 text-white px-8 font-black uppercase shadow-lg"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-[#4A3728] p-12 text-white space-y-8 rounded-sm shadow-2xl">
                  <h4 className="text-2xl font-black uppercase">Nueva Categoría Principal</h4>
                  <div className="flex gap-4">
                    <input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-grow p-5 text-black font-black uppercase rounded-sm"
                      placeholder="Ej: Lámparas..."
                    />
                    <button
                      onClick={() => {
                        if (newCatName.trim()) {
                          updateConfig((prev) => ({
                            ...prev,
                            categories: [...prev.categories, newCatName.trim()],
                            categoryFamilies: {
                              ...prev.categoryFamilies,
                              [newCatName.trim()]: ['General'],
                            },
                          }));
                          setNewCatName('');
                        }
                      }}
                      className="bg-white text-[#4A3728] px-12 font-black uppercase rounded-sm"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-12 animate-in fade-in">
                <div className="flex justify-between items-center border-b-4 border-[#EBDCC5] pb-8">
                  <h3 className={sectionTitle}>
                    <ShoppingBag size={28} /> Catálogo de Piezas
                  </h3>
                  <button
                    onClick={() =>
                      updateConfig((p) => {
                        const firstCat = p.categories[0] || 'General';
                        return {
                          ...p,
                          products: [
                            {
                              id: Date.now().toString(),
                              name: 'Nueva Pieza',
                              price: 0,
                              description: '',
                              imageUrls: [],
                              videoUrl: '',
                              category: firstCat,
                              family: p.categoryFamilies[firstCat]?.[0] || 'General',
                              isCustomizable: true,
                            },
                            ...p.products,
                          ],
                        };
                      })
                    }
                    className="bg-orange-600 text-white px-10 py-6 text-[11px] font-black border-b-8 border-orange-900 shadow-xl"
                  >
                    NUEVO PRODUCTO
                  </button>
                </div>
                {config.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border-2 border-[#EBDCC5] p-10 shadow-md space-y-10 relative border-l-[12px] border-l-[#4A3728]"
                  >
                    <button
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          products: prev.products.filter((pr) => pr.id !== p.id),
                        }))
                      }
                      className="absolute top-8 right-8 text-gray-300 hover:text-red-600"
                    >
                      <Trash2 size={24} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-6">
                        <label className={labelClass}>Fotografías</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {p.imageUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square border-2 border-[#EBDCC5] overflow-hidden group/img"
                            >
                              <img src={url} className="w-full h-full object-cover" />
                              <button
                                onClick={() =>
                                  updateConfig((prev) => ({
                                    ...prev,
                                    products: prev.products.map((pr) =>
                                      pr.id === p.id
                                        ? {
                                            ...pr,
                                            imageUrls: pr.imageUrls.filter((_, i) => i !== idx),
                                          }
                                        : pr
                                    ),
                                  }))
                                }
                                className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 bg-tilo/20 p-4 border border-wood-pale rounded-sm">
                          <div className="relative">
                            <button className="w-full bg-wood-dark text-white p-3 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                              <Upload size={14} /> Subir Archivo
                            </button>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, p.id, 'product-img')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept="image/*"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={urlInputs[p.id] || ''}
                              onChange={(e) =>
                                setUrlInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                              placeholder="URL de imagen..."
                              className="flex-grow p-2 text-xs border border-wood-pale"
                            />
                            <button
                              onClick={() => handleUrlUpload(p.id, 'product-img')}
                              className="bg-orange-600 text-white p-2"
                            >
                              <LinkIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Nombre</label>
                            <input
                              value={p.name}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  products: prev.products.map((pr) =>
                                    pr.id === p.id ? { ...pr, name: e.target.value } : pr
                                  ),
                                }))
                              }
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Precio (€)</label>
                            <input
                              type="number"
                              min={0}
                              value={p.price}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  products: prev.products.map((pr) =>
                                    pr.id === p.id ? { ...pr, price: Number(e.target.value) } : pr
                                  ),
                                }))
                              }
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Categoría</label>
                            <select
                              value={p.category}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  products: prev.products.map((pr) =>
                                    pr.id === p.id
                                      ? {
                                          ...pr,
                                          category: e.target.value,
                                          family:
                                            prev.categoryFamilies[e.target.value]?.[0] || 'General',
                                        }
                                      : pr
                                  ),
                                }))
                              }
                              className={inputClass}
                            >
                              {config.categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Familia</label>
                            <select
                              value={p.family}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  products: prev.products.map((pr) =>
                                    pr.id === p.id ? { ...pr, family: e.target.value } : pr
                                  ),
                                }))
                              }
                              className={inputClass}
                            >
                              {(config.categoryFamilies[p.category] || ['General']).map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
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
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  products: prev.products.map((pr) =>
                                    pr.id === p.id ? { ...pr, isCustomizable: e.target.checked } : pr
                                  ),
                                }))
                              }
                              className="w-6 h-6 accent-orange-700 cursor-pointer"
                            />
                            <label
                              htmlFor={`check-${p.id}`}
                              className="text-[11px] font-black uppercase tracking-widest text-orange-900 cursor-pointer"
                            >
                              Admite personalización
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className={labelClass}>URL de Video (YouTube o MP4)</label>
                          <div className="flex gap-2">
                            <div className="relative flex-grow">
                              <Video
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-dark/40"
                                size={18}
                              />
                              <input
                                value={p.videoUrl || ''}
                                onChange={(e) =>
                                  updateConfig((prev) => ({
                                    ...prev,
                                    products: prev.products.map((pr) =>
                                      pr.id === p.id ? { ...pr, videoUrl: e.target.value } : pr
                                    ),
                                  }))
                                }
                                className={`${inputClass} pl-12`}
                                placeholder="Ej: https://youtube.com/watch?v=..."
                              />
                            </div>
                            {p.videoUrl && (
                              <button
                                onClick={() =>
                                  updateConfig((prev) => ({
                                    ...prev,
                                    products: prev.products.map((pr) =>
                                      pr.id === p.id ? { ...pr, videoUrl: '' } : pr
                                    ),
                                  }))
                                }
                                className="bg-red-500 text-white p-4 rounded-sm hover:bg-red-700"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 italic">
                            Soporta enlaces de YouTube o rutas directas a archivos .mp4
                          </p>
                        </div>

                        <textarea
                          value={p.description}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              products: prev.products.map((pr) =>
                                pr.id === p.id ? { ...pr, description: e.target.value } : pr
                              ),
                            }))
                          }
                          className={`${inputClass} h-32`}
                          placeholder="Detalles de la pieza..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}>
                  <HomeIcon size={28} /> Configuración Portada
                </h3>
                <div className="bg-white p-10 border-2 border-[#EBDCC5] shadow-md space-y-8">
                  <div className="space-y-4">
                    <label className={labelClass}>Título Principal (Hero)</label>
                    <input
                      value={config.home.title}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          home: { ...prev.home, title: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Lema o Subtítulo</label>
                    <textarea
                      value={config.home.subtitle}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          home: { ...prev.home, subtitle: e.target.value },
                        }))
                      }
                      className={`${inputClass} h-24`}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Imagen Hero</label>
                    <div className="aspect-video bg-gray-100 border-2 border-[#EBDCC5] overflow-hidden rounded-sm relative group mb-4">
                      <img src={config.home.heroImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-grow w-full">
                        <label className="text-[9px] font-bold text-gray-400 mb-1 block">
                          PEGAR URL
                        </label>
                        <input
                          value={urlInputs['hero-img'] || ''}
                          onChange={(e) =>
                            setUrlInputs((prev) => ({ ...prev, 'hero-img': e.target.value }))
                          }
                          className={inputClass}
                          placeholder="https://..."
                        />
                      </div>
                      <button
                        onClick={() => handleUrlUpload('', 'hero-img')}
                        className="bg-orange-600 text-white p-4 rounded-sm"
                      >
                        <LinkIcon />
                      </button>
                      <div className="relative">
                        <button className="bg-wood-dark text-white p-4 rounded-sm flex items-center gap-2 text-[10px] font-bold uppercase">
                          <Upload size={16} /> SUBIR
                        </button>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, '', 'hero-img')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="animate-in fade-in duration-500 space-y-12">
                <div className="flex justify-between items-center border-b-4 border-[#EBDCC5] pb-8">
                  <h3 className={sectionTitle}>
                    <BookOpen size={28} /> Bitácora
                  </h3>
                  <button
                    onClick={() =>
                      updateConfig((p) => ({
                        ...p,
                        blog: [
                          {
                            id: Date.now().toString(),
                            title: 'Nuevo Artículo',
                            excerpt: '',
                            content: '',
                            date: new Date().toLocaleDateString(),
                            imageUrl: '',
                          },
                          ...p.blog,
                        ],
                      }))
                    }
                    className="bg-orange-600 text-white px-10 py-6 text-[11px] font-black border-b-8 border-orange-900 shadow-xl"
                  >
                    NUEVA ENTRADA
                  </button>
                </div>
                {config.blog.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border-2 border-[#EBDCC5] p-10 shadow-md space-y-8 relative border-l-[12px] border-l-orange-800"
                  >
                    <button
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          blog: prev.blog.filter((b) => b.id !== post.id),
                        }))
                      }
                      className="absolute top-8 right-8 text-gray-300 hover:text-red-600"
                    >
                      <Trash2 size={24} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className={labelClass}>Título</label>
                        <input
                          value={post.title}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              blog: prev.blog.map((b) =>
                                b.id === post.id ? { ...b, title: e.target.value } : b
                              ),
                            }))
                          }
                          className={inputClass}
                        />
                        <label className={labelClass}>Fecha</label>
                        <input
                          value={post.date}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              blog: prev.blog.map((b) =>
                                b.id === post.id ? { ...b, date: e.target.value } : b
                              ),
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className={labelClass}>Imagen Principal</label>
                        <div className="aspect-video bg-gray-50 border-2 border-dashed overflow-hidden relative mb-4">
                          {post.imageUrl && (
                            <img src={post.imageUrl} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={urlInputs[post.id] || ''}
                            onChange={(e) =>
                              setUrlInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="URL de imagen..."
                            className="flex-grow p-2 text-xs border border-wood-pale"
                          />
                          <button
                            onClick={() => handleUrlUpload(post.id, 'blog-img')}
                            className="bg-orange-600 text-white p-2"
                          >
                            <LinkIcon size={14} />
                          </button>
                          <div className="relative">
                            <button className="bg-wood-dark text-white p-2 rounded-sm">
                              <Upload size={14} />
                            </button>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(e, post.id, 'blog-img')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={post.excerpt}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          blog: prev.blog.map((b) =>
                            b.id === post.id ? { ...b, excerpt: e.target.value } : b
                          ),
                        }))
                      }
                      className={`${inputClass} h-20`}
                      placeholder="Resumen corto..."
                    />
                    <textarea
                      value={post.content}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          blog: prev.blog.map((b) =>
                            b.id === post.id ? { ...b, content: e.target.value } : b
                          ),
                        }))
                      }
                      className={`${inputClass} h-64`}
                      placeholder="Escribe el artículo..."
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'global' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}>
                  <Globe size={28} /> Identidad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-12 border-2 border-[#EBDCC5] shadow-md rounded-sm">
                  <div className="space-y-6">
                    <label className={labelClass}>Nombre Comercial</label>
                    <input
                      value={config.siteName}
                      onChange={(e) =>
                        updateConfig((prev) => ({ ...prev, siteName: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-6">
                    <label className={labelClass}>Logo Taller</label>
                    <div className="flex items-center gap-6 mb-4">
                      {config.logoUrl && (
                        <img
                          src={config.logoUrl}
                          className="h-24 w-24 object-contain border-2 border-[#EBDCC5] p-2 bg-white"
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          value={urlInputs['logo-img'] || ''}
                          onChange={(e) =>
                            setUrlInputs((prev) => ({ ...prev, 'logo-img': e.target.value }))
                          }
                          placeholder="URL del logo..."
                          className="flex-grow p-2 text-xs border border-wood-pale"
                        />
                        <button
                          onClick={() => handleUrlUpload('', 'logo-img')}
                          className="bg-orange-600 text-white p-2"
                        >
                          <LinkIcon size={14} />
                        </button>
                      </div>
                      <div className="relative">
                        <button className="w-full bg-wood-dark text-white p-2 text-[10px] uppercase font-bold flex items-center justify-center gap-2">
                          <Upload size={14} /> Subir logo local
                        </button>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, '', 'logo-img')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}>
                  <User size={28} /> Perfil
                </h3>
                <div className="bg-white p-10 border-2 border-[#EBDCC5] shadow-md space-y-8">
                  <div className="space-y-4">
                    <label className={labelClass}>Título</label>
                    <input
                      value={config.about.title}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          about: { ...prev.about, title: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Historia</label>
                    <textarea
                      value={config.about.content}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          about: { ...prev.about, content: e.target.value },
                        }))
                      }
                      className={`${inputClass} h-80`}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}>Imagen de Perfil</label>
                    <div className="w-64 aspect-square bg-gray-100 border-2 overflow-hidden relative mb-4">
                      <img src={config.about.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2 max-w-md">
                      <input
                        value={urlInputs['about-img'] || ''}
                        onChange={(e) =>
                          setUrlInputs((prev) => ({ ...prev, 'about-img': e.target.value }))
                        }
                        placeholder="URL de imagen..."
                        className="flex-grow p-2 text-xs border border-wood-pale"
                      />
                      <button
                        onClick={() => handleUrlUpload('', 'about-img')}
                        className="bg-orange-600 text-white p-2"
                      >
                        <LinkIcon size={14} />
                      </button>
                      <div className="relative">
                        <button className="bg-wood-dark text-white p-2 rounded-sm">
                          <Upload size={14} />
                        </button>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, '', 'about-img')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="animate-in fade-in duration-500">
                <h3 className={sectionTitle}>
                  <Mail size={28} /> Contacto
                </h3>
                <div className="bg-white p-12 border-2 border-[#EBDCC5] shadow-md rounded-sm space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className={labelClass}>Email</label>
                      <input
                        value={config.contact.email}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, email: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-6">
                      <label className={labelClass}>WhatsApp</label>
                      <input
                        value={config.contact.phone}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, phone: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className={labelClass}>Instagram (Usuario)</label>
                    <input
                      value={config.contact.instagram}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, instagram: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t-4 border-[#EBDCC5]">
              <div className="bg-orange-100 border-4 border-orange-600 p-8 space-y-6 shadow-xl rounded-sm">
                <h4 className="text-xl font-black uppercase text-[#4A3728] flex items-center gap-3">
                  <FileJson size={24} /> Respaldo JSON
                </h4>
                <p className="text-[9px] text-orange-800 uppercase font-bold">
                  Copia de seguridad descargable de toda tu configuración.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className={`w-full p-6 font-black uppercase text-white border-b-8 transition-all ${
                    copySuccess
                      ? 'bg-green-600 border-green-900'
                      : 'bg-orange-600 border-orange-900 hover:bg-orange-700'
                  }`}
                >
                  {copySuccess ? 'COPIADO' : 'COPIAR CONFIGURACIÓN'}
                </button>
              </div>
              <div className="bg-red-50 border-4 border-red-200 p-8 space-y-6 shadow-xl rounded-sm">
                <h4 className="text-xl font-black uppercase text-red-800 flex items-center gap-3">
                  <RotateCcw size={24} /> Zona Crítica
                </h4>
                <p className="text-[9px] text-red-400 uppercase font-bold">
                  Restablecer los datos originales en la nube.
                </p>
                {confirmRestore ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleRestoreDefaults}
                      disabled={isSaving}
                      className="flex-1 bg-red-600 border-b-8 border-red-900 p-4 font-black uppercase text-white text-xs hover:bg-red-700"
                    >
                      CONFIRMAR RESTAURACIÓN
                    </button>
                    <button
                      onClick={() => setConfirmRestore(false)}
                      className="px-6 bg-gray-200 border-b-8 border-gray-400 font-black uppercase text-gray-700 text-xs"
                    >
                      CANCELAR
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRestore(true)}
                    className="w-full bg-red-600 border-b-8 border-red-900 p-6 font-black uppercase text-white hover:bg-red-700"
                  >
                    RESTAURAR ORIGINALES
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
