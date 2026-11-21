import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  HardDrive,
  Minimize2,
} from 'lucide-react';

const MAX_DOC_BYTES = 950_000;
const MAX_DB_BYTES = 1024 * 1024 * 1024; // 1 GiB plan Spark gratuito
const MAX_MONTHLY_EGRESS_BYTES = 10 * 1024 * 1024 * 1024; // 10 GiB/mes plan Spark gratuito

const textEncoder = new TextEncoder();
const measureJsonBytes = (value: unknown): number =>
  textEncoder.encode(JSON.stringify(value)).length;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

type CompressionProfile = 'product' | 'hero' | 'logo' | 'blog';

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
  const [lastCompressionNote, setLastCompressionNote] = useState<string | null>(null);
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [newCatName, setNewCatName] = useState('');
  const [newFamilyInputs, setNewFamilyInputs] = useState<Record<string, string>>({});

  const latestConfigRef = useRef<SiteConfig>(config);

  const memoryStats = useMemo(() => {
    const settingsPayload = {
      siteName: config.siteName || '',
      logoUrl: config.logoUrl || '',
      home: config.home,
      about: config.about,
      contact: config.contact,
      categories: config.categories,
      categoryFamilies: config.categoryFamilies,
    };
    const settingsBytes = measureJsonBytes(settingsPayload) + 200;

    const productBytesMap: Record<string, number> = {};
    let totalProductsBytes = 0;
    for (const p of config.products) {
      const b = measureJsonBytes(p) + 200;
      productBytesMap[p.id] = b;
      totalProductsBytes += b;
    }

    const blogBytesMap: Record<string, number> = {};
    let totalBlogBytes = 0;
    for (const post of config.blog) {
      const b = measureJsonBytes(post) + 200;
      blogBytesMap[post.id] = b;
      totalBlogBytes += b;
    }

    const totalDbBytes = settingsBytes + totalProductsBytes + totalBlogBytes;
    const dbPct = Math.min(100, (totalDbBytes / MAX_DB_BYTES) * 100);
    const settingsPct = Math.min(100, (settingsBytes / MAX_DOC_BYTES) * 100);

    const itemCount = config.products.length + config.blog.length;
    const avgItemBytes =
      itemCount > 0 ? Math.max(40_000, (totalProductsBytes + totalBlogBytes) / itemCount) : 115_000;
    const remainingEstimatedItems = Math.max(
      0,
      Math.floor((MAX_DB_BYTES - totalDbBytes) / avgItemBytes)
    );
    const estimatedMonthlyVisits =
      totalDbBytes > 0 ? Math.floor(MAX_MONTHLY_EGRESS_BYTES / totalDbBytes) : 99999;

    let heavyImagesCount = 0;
    if (config.logoUrl?.startsWith('data:image/') && config.logoUrl.length > 85_000) heavyImagesCount++;
    if (config.home?.heroImage?.startsWith('data:image/') && config.home.heroImage.length > 175_000) heavyImagesCount++;
    if (config.about?.image?.startsWith('data:image/') && config.about.image.length > 135_000) heavyImagesCount++;
    for (const p of config.products) {
      for (const u of p.imageUrls) {
        if (u.startsWith('data:image/') && u.length > 135_000) heavyImagesCount++;
      }
    }
    for (const post of config.blog) {
      if (post.imageUrl?.startsWith('data:image/') && post.imageUrl.length > 135_000) heavyImagesCount++;
    }

    return {
      settingsBytes,
      settingsPct,
      productBytesMap,
      blogBytesMap,
      totalDbBytes,
      dbPct,
      remainingEstimatedItems,
      estimatedMonthlyVisits,
      heavyImagesCount,
      totalDocsCount: 1 + config.products.length + config.blog.length,
    };
  }, [config]);

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

  const compressImageSource = (
    src: string,
    profile: CompressionProfile = 'product'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        const tryEncode = (maxSide: number, quality: number): string => {
          const longestSide = Math.max(img.width, img.height);
          const scale = longestSide > maxSide ? maxSide / longestSide : 1;
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));

          // Reducción progresiva en dos pasos cuando la imagen original es >2x más grande
          // para conservar nitidez en vetas de madera y entramados Kumiko sin dientes de sierra
          let sourceCanvas: HTMLImageElement | HTMLCanvasElement = img;
          if (longestSide > maxSide * 2) {
            const midW = Math.max(targetW * 2, Math.round(img.width * 0.5));
            const midH = Math.max(targetH * 2, Math.round(img.height * 0.5));
            const midCanvas = document.createElement('canvas');
            midCanvas.width = midW;
            midCanvas.height = midH;
            const midCtx = midCanvas.getContext('2d');
            if (midCtx) {
              midCtx.fillStyle = '#FFFFFF';
              midCtx.fillRect(0, 0, midW, midH);
              midCtx.imageSmoothingEnabled = true;
              midCtx.imageSmoothingQuality = 'high';
              midCtx.drawImage(img, 0, 0, midW, midH);
              sourceCanvas = midCanvas;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Error de contexto');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

          // JPEG es universal en iOS, Android y escritorio
          return canvas.toDataURL('image/jpeg', quality);
        };

        try {
          const profileConfig: Record<
            CompressionProfile,
            { targetLen: number; attempts: [number, number][] }
          > = {
            logo: {
              targetLen: 75_000,
              attempts: [
                [480, 0.82],
                [480, 0.74],
                [400, 0.7],
                [320, 0.65],
              ],
            },
            hero: {
              targetLen: 160_000,
              attempts: [
                [1280, 0.8],
                [1150, 0.75],
                [1024, 0.72],
                [900, 0.68],
                [800, 0.62],
              ],
            },
            product: {
              targetLen: 115_000,
              attempts: [
                [960, 0.78],
                [900, 0.74],
                [840, 0.7],
                [760, 0.68],
                [680, 0.64],
                [600, 0.58],
              ],
            },
            blog: {
              targetLen: 115_000,
              attempts: [
                [960, 0.78],
                [900, 0.74],
                [840, 0.7],
                [760, 0.68],
                [680, 0.64],
                [600, 0.58],
              ],
            },
          };

          const { targetLen, attempts } = profileConfig[profile];
          let result = tryEncode(attempts[0][0], attempts[0][1]);
          for (const [side, q] of attempts) {
            result = tryEncode(side, q);
            if (result.length <= targetLen) break;
          }

          if (src.startsWith('data:image/jpeg') && result.length >= src.length) {
            resolve(src);
            return;
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Error de carga'));
    });
  };

  const compressImage = (file: File, profile: CompressionProfile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        try {
          const optimized = await compressImageSource(event.target?.result as string, profile);
          resolve(optimized);
        } catch (err) {
          reject(err);
        }
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
    const profile: CompressionProfile =
      type === 'logo-img'
        ? 'logo'
        : type === 'hero-img'
          ? 'hero'
          : type === 'blog-img'
            ? 'blog'
            : 'product';
    try {
      const optimizedBase64 = await compressImage(file, profile);
      const savedPct =
        file.size > 0
          ? Math.max(0, Math.round((1 - optimizedBase64.length / Math.max(file.size, 1)) * 100))
          : 0;
      setLastCompressionNote(
        `Imagen optimizada: ${formatBytes(file.size)} → ${formatBytes(optimizedBase64.length)}${savedPct > 5 ? ` (-${savedPct}%)` : ''}`
      );
      applyImageUpdate(optimizedBase64, targetId, type);
    } catch {
      setErrorBanner('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleOptimizeExistingImages = async () => {
    if (isOptimizingAll) return;
    setIsOptimizingAll(true);
    setErrorBanner(null);
    try {
      const current = latestConfigRef.current;
      let optimizedCount = 0;
      let bytesSaved = 0;

      const tryShrink = async (
        val: string,
        threshold: number,
        profile: CompressionProfile
      ): Promise<string> => {
        if (!val || !val.startsWith('data:image/') || val.length <= threshold) return val;
        try {
          const shrunk = await compressImageSource(val, profile);
          if (shrunk.length < val.length * 0.92) {
            optimizedCount++;
            bytesSaved += val.length - shrunk.length;
            return shrunk;
          }
        } catch {
          // Mantener original si falla la decodificación
        }
        return val;
      };

      const nextLogo = await tryShrink(current.logoUrl, 85_000, 'logo');
      const nextHero = await tryShrink(current.home.heroImage, 175_000, 'hero');
      const nextAboutImg = await tryShrink(current.about.image, 135_000, 'product');

      const nextProducts = await Promise.all(
        current.products.map(async (p) => ({
          ...p,
          imageUrls: await Promise.all(
            p.imageUrls.map((u) => tryShrink(u, 135_000, 'product'))
          ),
        }))
      );

      const nextBlog = await Promise.all(
        current.blog.map(async (b) => ({
          ...b,
          imageUrl: await tryShrink(b.imageUrl, 135_000, 'blog'),
        }))
      );

      if (optimizedCount > 0) {
        updateConfig((prev) => ({
          ...prev,
          logoUrl: nextLogo,
          home: { ...prev.home, heroImage: nextHero },
          about: { ...prev.about, image: nextAboutImg },
          products: nextProducts,
          blog: nextBlog,
        }));
        setLastCompressionNote(
          `Optimizadas ${optimizedCount} imágenes: has liberado ${formatBytes(bytesSaved)}. Pulsa "GUARDAR Y PUBLICAR" para aplicarlo en la nube.`
        );
      } else {
        setLastCompressionNote('Todas tus imágenes ya están optimizadas al máximo.');
      }
    } finally {
      setIsOptimizingAll(false);
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-tilo/30 border border-[#EBDCC5] rounded-sm text-[10px] font-bold uppercase tracking-wider text-[#4A3728]">
            <Cloud size={14} className={isSyncedWithCloud ? 'text-green-700' : 'text-orange-600'} />
            <span>
              {cloudInitialized
                ? `${config.products.length} piezas en la nube`
                : 'Pendiente de publicación inicial'}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 border rounded-sm text-[10px] font-bold uppercase tracking-wider ${
              memoryStats.dbPct >= 85
                ? 'bg-red-50 border-red-300 text-red-700'
                : memoryStats.dbPct >= 65
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
            }`}
          >
            <HardDrive size={14} />
            <span>
              {formatBytes(memoryStats.totalDbBytes)} / 1.024 MB ({memoryStats.dbPct.toFixed(1)}%)
            </span>
          </div>
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
        {/* Panel de Contador de Memoria y Capacidad en Firebase */}
        <div className="bg-white border-2 border-[#EBDCC5] p-5 md:p-6 rounded-sm shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-tilo/50 border border-[#EBDCC5] rounded-sm text-[#4A3728]">
                <HardDrive size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#4A3728]">
                  Contador de Memoria en Firebase (Plan Gratuito)
                </h2>
                <p className="text-[11px] text-gray-500">
                  {memoryStats.totalDocsCount} documentos ({config.products.length} piezas ·{' '}
                  {config.blog.length} artículos) · Capacidad libre aprox. para{' '}
                  <strong className="text-[#4A3728]">
                    ~{memoryStats.remainingEstimatedItems.toLocaleString('es-ES')} artículos similares más
                  </strong>{' '}
                  · ~{memoryStats.estimatedMonthlyVisits.toLocaleString('es-ES')} visitas/mes (límite 10 GB/mes)
                </p>
              </div>
            </div>

            {memoryStats.heavyImagesCount > 0 && (
              <button
                onClick={handleOptimizeExistingImages}
                disabled={isOptimizingAll || isProcessingImage}
                className="bg-orange-600 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-700 flex items-center gap-2 shrink-0 shadow-sm disabled:opacity-60"
              >
                {isOptimizingAll ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Minimize2 size={14} />
                )}
                Comprimir {memoryStats.heavyImagesCount}{' '}
                {memoryStats.heavyImagesCount === 1 ? 'imagen pesada' : 'imágenes pesadas'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#4A3728]">
                <span>Base de datos total</span>
                <span>
                  {formatBytes(memoryStats.totalDbBytes)} / 1.024 MB ({memoryStats.dbPct.toFixed(2)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-sm overflow-hidden border border-[#EBDCC5]">
                <div
                  className={`h-full transition-all duration-300 ${
                    memoryStats.dbPct >= 85
                      ? 'bg-red-600'
                      : memoryStats.dbPct >= 65
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.max(1.5, memoryStats.dbPct)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#4A3728]">
                <span>Portada + Logo + Sobre Mí (máx. 1 MB juntos)</span>
                <span
                  className={
                    memoryStats.settingsPct >= 85
                      ? 'text-red-700'
                      : memoryStats.settingsPct >= 70
                        ? 'text-amber-700'
                        : 'text-[#4A3728]'
                  }
                >
                  {formatBytes(memoryStats.settingsBytes)} / 950 KB (
                  {memoryStats.settingsPct.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-sm overflow-hidden border border-[#EBDCC5]">
                <div
                  className={`h-full transition-all duration-300 ${
                    memoryStats.settingsPct >= 85
                      ? 'bg-red-600'
                      : memoryStats.settingsPct >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.max(1.5, memoryStats.settingsPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {lastCompressionNote && (
          <div className="bg-emerald-50 border border-emerald-300 px-4 py-3 rounded-sm flex items-center justify-between gap-4 text-emerald-900 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-700 shrink-0" />
              <span>{lastCompressionNote}</span>
            </div>
            <button
              onClick={() => setLastCompressionNote(null)}
              className="p-1 hover:bg-emerald-100 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
                        {(() => {
                          const prodBytes = memoryStats.productBytesMap[p.id] || 0;
                          const prodPct = Math.min(100, (prodBytes / MAX_DOC_BYTES) * 100);
                          return (
                            <div className="p-3 bg-gray-50 border border-[#EBDCC5] rounded-sm space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-[#4A3728]">
                                <span>Memoria pieza</span>
                                <span
                                  className={
                                    prodPct >= 88
                                      ? 'text-red-700'
                                      : prodPct >= 70
                                        ? 'text-amber-700'
                                        : 'text-emerald-800'
                                  }
                                >
                                  {formatBytes(prodBytes)} / 950 KB · {p.imageUrls.length}/10 fotos
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    prodPct >= 88
                                      ? 'bg-red-600'
                                      : prodPct >= 70
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${Math.max(2, prodPct)}%` }}
                                />
                              </div>
                              {(prodPct >= 88 || p.imageUrls.length > 10) && (
                                <p className="text-[9px] text-red-700 font-bold">
                                  Cerca o por encima del límite de 1 MB por producto. Reduce fotos o usa URLs.
                                </p>
                              )}
                            </div>
                          );
                        })()}
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
                    {(() => {
                      const postBytes = memoryStats.blogBytesMap[post.id] || 0;
                      const postPct = Math.min(100, (postBytes / MAX_DOC_BYTES) * 100);
                      return (
                        <div className="p-3 bg-gray-50 border border-[#EBDCC5] rounded-sm space-y-1.5 max-w-md">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-[#4A3728]">
                            <span>Memoria de este artículo</span>
                            <span
                              className={
                                postPct >= 88
                                  ? 'text-red-700'
                                  : postPct >= 70
                                    ? 'text-amber-700'
                                    : 'text-emerald-800'
                              }
                            >
                              {formatBytes(postBytes)} / 950 KB ({postPct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                postPct >= 88
                                  ? 'bg-red-600'
                                  : postPct >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.max(2, postPct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
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
