import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { generateImage } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ImagePlus, Loader2, Sparkles, AlertCircle, Download, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Generate() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGenerating || !prompt.trim()) return;

    // Business Rules Check
    if (user.status !== 'active') {
      setError('Sua conta não está ativa. Entre em contato com o suporte.');
      return;
    }

    if (user.credits <= 0) {
      setError('Você não possui créditos suficientes. Chame no WhatsApp para recarregar.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const imageUrl = await generateImage(prompt);
      
      // Save to database
      await addDoc(collection(db, 'generations'), {
        userId: user.id,
        prompt: prompt,
        imageUrl: imageUrl,
        creditsConsumed: 1,
        createdAt: new Date().toISOString(),
      });

      // Deduct credit
      await updateDoc(doc(db, 'users', user.id), {
        credits: increment(-1)
      });

      setResultImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao gerar sua imagem. Tente novamente mais tarde.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Gerador de Imagens</h1>
        <p className="text-gray-400">Descreva o que você imagina e nossa IA transformará em realidade.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Seu Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Um astronauta andando em um cavalo neon em Marte, estilo cyberpunk, 4k, altamente detalhado..."
                  className="w-full h-40 bg-black/50 border border-border-dark rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                  disabled={isGenerating}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || user?.credits === 0}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Gerando Arte...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    Gerar Imagem
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                <Sparkles className="w-3 h-3" />
                Custo: 1 Crédito por geração
              </div>
            </form>
          </div>

          <div className="card bg-primary/5 border-primary/20">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Dicas para melhores resultados
            </h4>
            <ul className="text-xs text-gray-400 space-y-2 list-disc ml-4">
              <li>Seja específico sobre o estilo (ex: realista, anime, pintura a óleo).</li>
              <li>Adicione detalhes sobre iluminação (ex: luz cinematográfica, pôr do sol).</li>
              <li>Mencione a qualidade (ex: 8k, ultra detalhado, masterwork).</li>
              <li>Evite prompts muito curtos ou genéricos.</li>
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-7">
          <div className="card h-full flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 text-center p-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Criando sua obra-prima</h3>
                    <p className="text-gray-500 text-sm">Isso pode levar alguns segundos...</p>
                  </div>
                </motion.div>
              ) : resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex flex-col items-center gap-4"
                >
                  <div className="relative group w-full aspect-square rounded-xl overflow-hidden border border-border-dark">
                    <img 
                      src={resultImage} 
                      alt="Resultado" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => setIsPreviewOpen(true)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
                      >
                        <Maximize2 className="w-6 h-6 text-white" />
                      </button>
                      <a 
                        href={resultImage} 
                        download="visionai-geracao.png"
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full">
                    <button 
                      onClick={() => setResultImage(null)}
                      className="flex-1 py-3 border border-border-dark rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                      Limpar
                    </button>
                    <a 
                      href={resultImage} 
                      download="visionai-geracao.png"
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Baixar Imagem
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 text-center p-8"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-2 border border-white/5">
                    <ImagePlus className="w-10 h-10 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Pronto para criar?</h3>
                    <p className="text-gray-500 text-sm">Digite um prompt ao lado e clique em gerar.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && resultImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={resultImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
