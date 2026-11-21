import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { cmsStore, DEFAULT_CONFIG } from './cmsStore';
import { BlogPost, Product, SiteConfig } from '../types';

const ADMIN_EMAILS = ['trkumikoshop@gmail.com', 'trkumikoweb@gmail.com'];

interface CmsContextValue {
  config: SiteConfig;
  isLoadingCloud: boolean;
  cloudInitialized: boolean;
  isSyncedWithCloud: boolean;
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  saveToCloud: (nextConfig: SiteConfig) => Promise<{ success: boolean; error?: string }>;
  resetToDefaultsInCloud: () => Promise<{ success: boolean; error?: string }>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

const sanitizeId = (rawId: string, fallbackPrefix: string, index: number): string => {
  const cleaned = (rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}-${index}`;
};

const clampStr = (val: unknown, maxLen: number): string => {
  const s = typeof val === 'string' ? val : String(val ?? '');
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

interface StoredProduct extends Product {
  sortOrder?: number;
}

interface StoredBlogPost extends BlogPost {
  sortOrder?: number;
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => cmsStore.get());
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isLoadingCloud, setIsLoadingCloud] = useState(true);
  const [cloudInitialized, setCloudInitialized] = useState(false);
  const [isSyncedWithCloud, setIsSyncedWithCloud] = useState(false);

  // Track remote slices independently so real-time updates merge cleanly
  const remoteSettingsRef = useRef<Omit<SiteConfig, 'products' | 'blog'> | null>(null);
  const remoteProductsRef = useRef<StoredProduct[] | null>(null);
  const remoteBlogRef = useRef<StoredBlogPost[] | null>(null);
  const cloudProductIdsRef = useRef<string[]>([]);
  const cloudBlogIdsRef = useRef<string[]>([]);
  const settingsLoadedRef = useRef(false);
  const productsLoadedRef = useRef(false);
  const blogLoadedRef = useRef(false);

  const rebuildMergedConfig = useCallback(() => {
    const hasSettings = remoteSettingsRef.current !== null;
    const hasProducts = (remoteProductsRef.current?.length ?? 0) > 0;
    const hasBlog = (remoteBlogRef.current?.length ?? 0) > 0;
    const anyCloudData = hasSettings || hasProducts || hasBlog;

    setCloudInitialized(hasSettings);

    if (
      settingsLoadedRef.current &&
      productsLoadedRef.current &&
      blogLoadedRef.current
    ) {
      setIsLoadingCloud(false);
      setIsSyncedWithCloud(true);
    }

    if (!anyCloudData) {
      // Cloud DB has not been seeded yet; keep DEFAULT_CONFIG / local cache
      return;
    }

    const baseSettings = remoteSettingsRef.current ?? {
      logoUrl: DEFAULT_CONFIG.logoUrl,
      siteName: DEFAULT_CONFIG.siteName,
      home: DEFAULT_CONFIG.home,
      about: DEFAULT_CONFIG.about,
      contact: DEFAULT_CONFIG.contact,
      categories: DEFAULT_CONFIG.categories,
      categoryFamilies: DEFAULT_CONFIG.categoryFamilies,
    };

    const sortedProducts: Product[] =
      productsLoadedRef.current && (hasSettings || hasProducts)
        ? [...(remoteProductsRef.current || [])]
            .map(({ sortOrder: _s, ...rest }) => rest)
            .sort((a, b) =>
              a.name.trim().localeCompare(b.name.trim(), 'es', { sensitivity: 'base', numeric: true })
            )
        : DEFAULT_CONFIG.products;

    const sortedBlog: BlogPost[] =
      blogLoadedRef.current && (hasSettings || hasBlog)
        ? [...(remoteBlogRef.current || [])]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map(({ sortOrder: _s, ...rest }) => rest)
        : DEFAULT_CONFIG.blog;

    const merged: SiteConfig = {
      ...baseSettings,
      products: sortedProducts,
      blog: sortedBlog,
    };

    setConfig(merged);
    try {
      localStorage.setItem('tr_kumiko_config', JSON.stringify(merged));
    } catch {
      // Ignore localStorage quota limits when cloud has more data than 5MB
    }
  }, []);

  // Auth listener & admin verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser || !currentUser.emailVerified) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      if (ADMIN_EMAILS.includes((currentUser.email || '').toLowerCase())) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `admins/${currentUser.uid}`);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore listeners for public storefront + admin sync
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'main'),
      (snap) => {
        settingsLoadedRef.current = true;
        if (snap.exists()) {
          const data = snap.data();
          remoteSettingsRef.current = {
            logoUrl: data.logoUrl ?? DEFAULT_CONFIG.logoUrl,
            siteName: data.siteName ?? DEFAULT_CONFIG.siteName,
            home: data.home ?? DEFAULT_CONFIG.home,
            about: data.about ?? DEFAULT_CONFIG.about,
            contact: data.contact ?? DEFAULT_CONFIG.contact,
            categories: Array.isArray(data.categories) ? data.categories : DEFAULT_CONFIG.categories,
            categoryFamilies:
              data.categoryFamilies && typeof data.categoryFamilies === 'object'
                ? data.categoryFamilies
                : DEFAULT_CONFIG.categoryFamilies,
          };
        } else {
          remoteSettingsRef.current = null;
        }
        rebuildMergedConfig();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_settings/main');
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        productsLoadedRef.current = true;
        const list: StoredProduct[] = [];
        const ids: string[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          ids.push(docSnap.id);
          list.push({
            id: data.id || docSnap.id,
            name: data.name || '',
            price: typeof data.price === 'number' ? data.price : 0,
            description: data.description || '',
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            videoUrl: data.videoUrl || '',
            category: data.category || 'General',
            family: data.family || 'General',
            isCustomizable: Boolean(data.isCustomizable),
            sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          });
        });
        cloudProductIdsRef.current = ids;
        remoteProductsRef.current = list;
        rebuildMergedConfig();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    const unsubBlog = onSnapshot(
      collection(db, 'blog_posts'),
      (snap) => {
        blogLoadedRef.current = true;
        const list: StoredBlogPost[] = [];
        const ids: string[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          ids.push(docSnap.id);
          list.push({
            id: data.id || docSnap.id,
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            date: data.date || '',
            imageUrl: data.imageUrl || '',
            sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
          });
        });
        cloudBlogIdsRef.current = ids;
        remoteBlogRef.current = list;
        rebuildMergedConfig();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'blog_posts');
      }
    );

    return () => {
      unsubSettings();
      unsubProducts();
      unsubBlog();
    };
  }, [rebuildMergedConfig]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutAdmin = useCallback(async () => {
    await signOut(auth);
  }, []);

  const saveToCloud = useCallback(
    async (nextConfig: SiteConfig): Promise<{ success: boolean; error?: string }> => {
      if (!auth.currentUser || !isAdmin) {
        return {
          success: false,
          error: 'Debes iniciar sesión con la cuenta de Google autorizada del taller.',
        };
      }

      const uid = auth.currentUser.uid;

      // Defensive payload validation & bounding matching firebase-blueprint.json
      const sanitizedCategories = (nextConfig.categories || [])
        .map((c) => clampStr(c, 100).trim())
        .filter(Boolean)
        .slice(0, 50);

      const sanitizedFamilies: Record<string, string[]> = {};
      Object.entries(nextConfig.categoryFamilies || {})
        .slice(0, 50)
        .forEach(([cat, fams]) => {
          sanitizedFamilies[clampStr(cat, 100)] = Array.isArray(fams)
            ? fams.map((f) => clampStr(f, 100).trim()).filter(Boolean).slice(0, 50)
            : ['General'];
        });

      const logoStr = typeof nextConfig.logoUrl === 'string' ? nextConfig.logoUrl : '';
      const heroStr = typeof nextConfig.home?.heroImage === 'string' ? nextConfig.home.heroImage : '';
      const aboutStr = typeof nextConfig.about?.image === 'string' ? nextConfig.about.image : '';
      if (logoStr.length > 450000 || heroStr.length > 450000 || aboutStr.length > 450000) {
        return {
          success: false,
          error:
            'Una de las imágenes de Logo, Portada o Sobre Mí supera 450 KB. Sube una versión más ligera desde "Subir Archivo".',
        };
      }

      const settingsPayload = {
        siteName: clampStr(nextConfig.siteName || 'TR-KUMIKO', 200) || 'TR-KUMIKO',
        logoUrl: logoStr,
        home: {
          title: clampStr(nextConfig.home?.title || '', 200),
          subtitle: clampStr(nextConfig.home?.subtitle || '', 1000),
          heroImage: heroStr,
        },
        about: {
          title: clampStr(nextConfig.about?.title || '', 200),
          content: clampStr(nextConfig.about?.content || '', 10000),
          image: aboutStr,
        },
        contact: {
          title: clampStr(nextConfig.contact?.title || '', 200),
          description: clampStr(nextConfig.contact?.description || '', 2000),
          email: clampStr(nextConfig.contact?.email || '', 200),
          phone: clampStr(nextConfig.contact?.phone || '', 50),
          instagram: clampStr(nextConfig.contact?.instagram || '', 200),
        },
        categories: sanitizedCategories,
        categoryFamilies: sanitizedFamilies,
        updatedAt: serverTimestamp(),
        updatedBy: uid,
      };

      const settingsBytes = new TextEncoder().encode(JSON.stringify(settingsPayload)).length;
      if (settingsBytes > 950000) {
        return {
          success: false,
          error:
            'Las imágenes de Portada, Logo y Sobre Mí juntas superan el límite de 1 MB por documento. Usa imágenes más ligeras o URLs externas.',
        };
      }

      const seenProductIds = new Set<string>();
      const sortedInputProducts = [...(nextConfig.products || [])].sort((a, b) =>
        (a.name || '').trim().localeCompare((b.name || '').trim(), 'es', {
          sensitivity: 'base',
          numeric: true,
        })
      );
      const preparedProducts = sortedInputProducts.map((p, index) => {
        const cleanId = sanitizeId(p.id, 'prod', index);
        seenProductIds.add(cleanId);
        const rawImages = (p.imageUrls || []).filter((url) => typeof url === 'string' && url.length > 0);
        const oversizedImg = rawImages.find((url) => url.length > 500000);
        if (oversizedImg) {
          throw new Error(
            `Una fotografía del producto "${p.name}" supera el límite de 500 KB. Vuelve a subirla con el botón "Subir Archivo" para comprimirla.`
          );
        }
        const safeImages = rawImages.slice(0, 10);

        const payload = {
          id: cleanId,
          name: clampStr(p.name || 'Pieza sin nombre', 200) || 'Pieza sin nombre',
          price: Math.max(0, Math.min(1000000, Number(p.price) || 0)),
          description: clampStr(p.description || '', 5000),
          imageUrls: safeImages,
          videoUrl: clampStr(p.videoUrl || '', 500),
          category: clampStr(p.category || sanitizedCategories[0] || 'General', 100) || 'General',
          family: clampStr(p.family || 'General', 100) || 'General',
          isCustomizable: Boolean(p.isCustomizable),
          sortOrder: index,
          updatedAt: serverTimestamp(),
          updatedBy: uid,
        };

        const docBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
        if (docBytes > 950000) {
          throw new Error(
            `El producto "${payload.name}" supera el límite de 1 MB (demasiadas fotos incrustadas). Reduce la cantidad de fotos o usa URLs.`
          );
        }
        return payload;
      });

      const seenBlogIds = new Set<string>();
      const preparedBlog = (nextConfig.blog || []).map((b, index) => {
        const cleanId = sanitizeId(b.id, 'post', index);
        seenBlogIds.add(cleanId);
        const blogImg = typeof b.imageUrl === 'string' ? b.imageUrl : '';
        if (blogImg.length > 450000) {
          throw new Error(
            `La imagen del artículo "${b.title}" supera 450 KB. Vuelve a subirla con el botón "Subir Archivo".`
          );
        }
        const payload = {
          id: cleanId,
          title: clampStr(b.title || 'Artículo sin título', 300) || 'Artículo sin título',
          excerpt: clampStr(b.excerpt || '', 1000),
          content: clampStr(b.content || '', 20000),
          date: clampStr(b.date || '', 100),
          imageUrl: blogImg,
          sortOrder: index,
          updatedAt: serverTimestamp(),
          updatedBy: uid,
        };
        const docBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
        if (docBytes > 950000) {
          throw new Error(
            `El artículo "${payload.title}" supera el límite de 1 MB. Reduce el tamaño de su imagen.`
          );
        }
        return payload;
      });

      try {
        type BatchOp = (b: ReturnType<typeof writeBatch>) => void;
        const ops: BatchOp[] = [];
        ops.push((b) => b.set(doc(db, 'site_settings', 'main'), settingsPayload));

        for (const prod of preparedProducts) {
          ops.push((b) => b.set(doc(db, 'products', prod.id), prod));
        }
        for (const oldProdId of cloudProductIdsRef.current) {
          if (!seenProductIds.has(oldProdId)) {
            ops.push((b) => b.delete(doc(db, 'products', oldProdId)));
          }
        }

        for (const post of preparedBlog) {
          ops.push((b) => b.set(doc(db, 'blog_posts', post.id), post));
        }
        for (const oldBlogId of cloudBlogIdsRef.current) {
          if (!seenBlogIds.has(oldBlogId)) {
            ops.push((b) => b.delete(doc(db, 'blog_posts', oldBlogId)));
          }
        }

        for (let i = 0; i < ops.length; i += 400) {
          const batch = writeBatch(db);
          ops.slice(i, i + 400).forEach((applyOp) => applyOp(batch));
          await batch.commit();
        }
        const orderedNextConfig: SiteConfig = {
          ...nextConfig,
          products: sortedInputProducts,
        };
        setConfig(orderedNextConfig);

        // Update local cache optimistically
        try {
          localStorage.setItem('tr_kumiko_config', JSON.stringify(orderedNextConfig));
        } catch {
          // Ignore localStorage cap
        }

        return { success: true };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (
          msg.includes('Missing or insufficient permissions') ||
          msg.includes('permission-denied')
        ) {
          handleFirestoreError(error, OperationType.WRITE, 'batch:site_settings,products,blog_posts');
        }
        return { success: false, error: msg };
      }
    },
    [isAdmin]
  );

  const resetToDefaultsInCloud = useCallback(async () => {
    try {
      localStorage.removeItem('tr_kumiko_config');
    } catch {
      // Ignore
    }
    return saveToCloud(DEFAULT_CONFIG);
  }, [saveToCloud]);

  return (
    <CmsContext.Provider
      value={{
        config,
        isLoadingCloud,
        cloudInitialized,
        isSyncedWithCloud,
        user,
        authReady,
        isAdmin,
        signInWithGoogle,
        signOutAdmin,
        saveToCloud,
        resetToDefaultsInCloud,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextValue => {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms debe utilizarse dentro de CmsProvider');
  }
  return ctx;
};
