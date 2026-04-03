import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Generation } from '../types';
import { formatDate } from '../lib/utils';
import { Images, Download, Maximize2, X, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function MyImages() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchGenerations = async () => {
      try {
        const q = query(
          collection(db, 'generations'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const genSnap = await getDocs(q);
        setGenerations(genSnap.docs.map(d => ({ id: d.id, ...d.data() } as Generation)));
      } catch (error) {
        console.error("Erro ao buscar imagens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [user]);

  const filteredGenerations = generations.filter(gen => 
    gen.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando sua galeria...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minhas Imagens</h1>
          <p className="text-gray-400">Todo o seu histórico de criações em um só lugar.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card-dark border border-border-dark rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </header>

      {filteredGenerations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGenerations.map((gen) => (
            <motion.div
              key={gen.id}
              layoutId={gen.id}
              whileHover={{ y: -5 }}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-card-dark border border-border-dark"
            >
              <img 
                src={gen.imageUrl} 
                alt={gen.prompt} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-xs text-white line-clamp-2 mb-2">{gen.prompt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(gen.createdAt).split(',')[0]}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedImage(gen)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-all"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                    <a 
                      href={gen.imageUrl} 
                      download={`visionai-${gen.id}.png`}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-all"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-20">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Images className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchTerm ? 'Nenhuma imagem encontrada' : 'Sua galeria está vazia'}
          </h3>
          <p className="text-gray-500 mb-8">
            {searchTerm ? 'Tente buscar por outros termos.' : 'Crie sua primeira imagem agora mesmo!'}
          </p>
          {!searchTerm && (
            <Link to="/app/gerar" className="btn-primary inline-flex items-center gap-2">
              Começar a criar
            </Link>
          )}
        </div>
      )}

      {/* Image Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              layoutId={selectedImage.id}
              className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
            >
              <div className="md:w-2/3 aspect-square">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:w-1/3 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Detalhes</h3>
                    <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Prompt</label>
                      <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-border-dark">
                        {selectedImage.prompt}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Estilo</label>
                        <p className="text-sm text-white capitalize">{selectedImage.style || 'Nenhum'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Proporção</label>
                        <p className="text-sm text-white">{selectedImage.aspectRatio || '1:1'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Data de Geração</label>
                      <p className="text-sm text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(selectedImage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-3">
                  <a 
                    href={selectedImage.imageUrl} 
                    download={`visionai-${selectedImage.id}.png`}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Baixar Imagem
                  </a>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="w-full py-3 text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
