
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrls: string[]; // Soporte para múltiples fotos
  videoUrl?: string;   // Soporte para video
  category: string;
  family: string;
  isCustomizable: boolean; // Atributo de personalización
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface SiteConfig {
  logoUrl: string;
  siteName: string;
  home: {
    title: string;
    subtitle: string;
    heroImage: string;
  };
  about: {
    title: string;
    content: string;
    image: string;
  };
  contact: {
    title: string;
    description: string;
    email: string;
    phone: string;
    instagram: string;
  };
  products: Product[];
  categories: string[];
  categoryFamilies: Record<string, string[]>;
  blog: BlogPost[];
}
