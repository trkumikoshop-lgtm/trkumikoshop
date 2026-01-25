
import { SiteConfig } from '../types';

const STORAGE_KEY = 'tr_kumiko_config';

const DEFAULT_CONFIG: SiteConfig = {
  "logoUrl": "https://img.icons8.com/ios-filled/100/4A3728/pagoda.png",
  "siteName": "TR-KUMIKO",
  "home": {
    "title": "TR-KUMIKO: Esencia de Tilo",
    "subtitle": "Geometría japonesa milenaria unida por la precisión del láser y el alma del artesano.",
    "heroImage": "https://images.unsplash.com/photo-1510797215324-95aa89f297a6?auto=format&fit=crop&q=80&w=1200"
  },
  "about": {
    "title": "El Arte del Detalle",
    "content": "TR-KUMIKO nace de la pasión por la perfección geométrica. Utilizamos madera de tilo de la más alta calidad, conocida por su suavidad y color claro, para crear piezas que juegan con la luz y las sombras de forma única.\n\nCada patrón es ensamblado con la paciencia que requiere una técnica milenaria, buscando el equilibrio perfecto entre la tecnología del corte láser y el acabado manual que solo el tacto humano puede proporcionar.",
    "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800"
  },
  "contact": {
    "title": "Contacta con el Taller",
    "description": "¿Tienes un proyecto en mente o buscas una pieza a medida? Hablemos sobre cómo la geometría del Kumiko puede transformar tu espacio.",
    "email": "contacto@tr-kumiko.com",
    "phone": "+34 600 000 000",
    "instagram": "tr_kumiko"
  },
  "categories": ["Lámparas", "Paneles", "Decoración", "Accesorios"],
  "categoryFamilies": {
    "Lámparas": ["Asanoha", "Sakura", "Izutsu-tsunagi"],
    "Paneles": ["Shoji Style", "Wall Art"],
    "Decoración": ["Cajas", "Posavasos"]
  },
  "products": [
    {
      "id": "1",
      "name": "Lámpara Zen Asanoha",
      "price": 185,
      "description": "Lámpara artesanal realizada en madera de tilo seleccionada. El patrón Asanoha proyecta sombras geométricas relajantes que transforman cualquier espacio en un remanso de paz.",
      "imageUrls": ["https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600"],
      "category": "Lámparas",
      "family": "Asanoha",
      "isCustomizable": true
    },
    {
      "id": "2",
      "name": "Posavasos Izutsu",
      "price": 45,
      "description": "Set de 4 posavasos con el patrón tradicional Izutsu-tsunagi. Elegancia y protección para tu mesa con el aroma natural del tilo.",
      "imageUrls": ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600"],
      "category": "Decoración",
      "family": "Izutsu",
      "isCustomizable": false
    }
  ],
  "blog": [
    {
      "id": "1",
      "title": "La nobleza de la madera de Tilo",
      "excerpt": "Descubre por qué esta madera clara y suave es la elección perfecta para la técnica Kumiko.",
      "content": "La madera de tilo posee una fibra extremadamente fina y uniforme, lo que permite cortes precisos que no se astillan. En TR-KUMIKO seleccionamos cada listón buscando la pureza de su color blanco-crema.\n\nTrabajar el tilo es un ejercicio de respeto; su suavidad bajo el papel de lija y su estabilidad dimensional hacen que las uniones geométricas encajen con la exactitud de un reloj suizo.",
      "date": "15 de Marzo, 2025",
      "imageUrl": "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&q=80&w=800"
    }
  ]
};

export const cmsStore = {
  get: (): SiteConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al leer configuración:", e);
    }
    return DEFAULT_CONFIG;
  },
  save: (config: SiteConfig): { success: boolean, error?: string, sizeKB?: number } => {
    try {
      const json = JSON.stringify(config);
      const sizeKB = Math.round(json.length / 1024);
      
      // Intentar guardar en LocalStorage
      localStorage.setItem(STORAGE_KEY, json);
      
      // Emitir evento de actualización
      window.dispatchEvent(new CustomEvent('cms-update'));
      console.log(`✅ Web Guardada. Espacio ocupado: ${sizeKB}KB de ~5000KB.`);
      return { success: true, sizeKB };
    } catch (e: any) {
      console.error("❌ Error al guardar:", e);
      let errorMsg = "Ocurrió un error al intentar escribir en el disco del navegador.";
      
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
        errorMsg = "LÍMITE DE ESPACIO ALCANZADO: Tienes demasiadas fotos en alta resolución. Por favor, elimina algunas fotos o redúcelas de tamaño antes de guardar.";
      }
      
      return { success: false, error: errorMsg };
    }
  }
};
