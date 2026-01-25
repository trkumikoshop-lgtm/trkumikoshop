
import React, { useState, useEffect } from 'react';
import { cmsStore } from '../services/cmsStore';
import { BlogPost } from '../types';
import { X, Calendar, ArrowLeft } from 'lucide-react';

const Blog: React.FC = () => {
  const [config, setConfig] = useState(cmsStore.get());
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

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

  return (
    <div className="py-20 max-w-5xl mx-auto px-4 fade-in">
      <div className="text-center mb-20">
        <span className="text-orange-800 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Bitácora</span>
        <h2 className="text-5xl font-serif-jp font-bold text-wood-dark mb-4">Diario del Taller</h2>
        <div className="w-16 h-1 bg-wood-dark mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {config.blog.map(post => (
          <article key={post.id} className="group cursor-pointer" onClick={() => setSelectedPost(post)}>
            <div className="relative overflow-hidden aspect-video mb-8 bg-tilo border border-wood-pale shadow-sm">
              <img 
                src={post.imageUrl || 'https://images.unsplash.com/photo-1510797215324-95aa89f297a6?auto=format&fit=crop&q=80&w=800'} 
                alt={post.title} 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-wood-dark/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-orange-800" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{post.date}</span>
              </div>
              <h3 className="text-3xl font-serif-jp text-wood-dark group-hover:text-orange-900 transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-light line-clamp-3 font-playfair italic">
                {post.excerpt}
              </p>
              <button className="text-[10px] font-bold tracking-[0.3em] text-wood-dark border-b-2 border-wood-pale group-hover:border-orange-800 pb-1 transition-all uppercase">
                LEER MÁS
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Blog Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-wood-dark/60 backdrop-blur-md" onClick={() => setSelectedPost(null)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-paper overflow-y-auto shadow-2xl rounded-sm border border-wood-pale">
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-wood-pale p-4 flex justify-between items-center">
              <button 
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-wood-dark hover:text-orange-800 transition-colors"
              >
                <ArrowLeft size={16} /> Volver a la bitácora
              </button>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 md:p-16">
              <div className="max-w-2xl mx-auto space-y-12">
                <header className="text-center space-y-6">
                  <div className="flex justify-center items-center gap-3">
                    <span className="h-px w-8 bg-wood-pale"></span>
                    <span className="text-[10px] text-orange-800 uppercase tracking-[0.4em] font-bold">{selectedPost.date}</span>
                    <span className="h-px w-8 bg-wood-pale"></span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-serif-jp font-bold text-wood-dark leading-tight">
                    {selectedPost.title}
                  </h1>
                  <p className="text-xl text-gray-500 italic font-playfair font-light leading-relaxed border-l-4 border-wood-pale pl-6">
                    {selectedPost.excerpt}
                  </p>
                </header>

                <div className="aspect-video overflow-hidden border border-wood-pale">
                  <img 
                    src={selectedPost.imageUrl} 
                    className="w-full h-full object-cover" 
                    alt={selectedPost.title} 
                  />
                </div>

                <div className="prose prose-stone max-w-none">
                  <div className="text-gray-700 leading-relaxed text-lg font-light space-y-6 whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>

                <footer className="pt-16 border-t border-wood-pale text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8">Gracias por leer sobre nuestro proceso</p>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="bg-wood-dark text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all"
                  >
                    CERRAR ARTÍCULO
                  </button>
                </footer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
