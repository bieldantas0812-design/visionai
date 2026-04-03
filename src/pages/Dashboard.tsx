import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Generation, Plan } from '../types';
import { formatDate } from '../lib/utils';
import { ImagePlus, Sparkles, CreditCard, History, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentGens, setRecentGens] = useState<Generation[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch recent generations
        const q = query(
          collection(db, 'generations'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(4)
        );
        const genSnap = await getDocs(q);
        setRecentGens(genSnap.docs.map(d => ({ id: d.id, ...d.data() } as Generation)));

        // Fetch plan details
        if (user.planId) {
          const planSnap = await getDocs(query(collection(db, 'plans'), where('id', '==', user.planId)));
          if (!planSnap.empty) {
            setPlan(planSnap.docs[0].data() as Plan);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando seu dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta, {user?.name}!</h1>
        <p className="text-gray-400">Aqui está o que está acontecendo com sua conta hoje.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary/20 to-purple-500/10 border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <Link to="/app/meu-plano" className="text-xs font-bold text-primary hover:underline">VER DETALHES</Link>
          </div>
          <h3 className="text-3xl font-bold text-white">{user?.credits}</h3>
          <p className="text-sm text-gray-400">Créditos Disponíveis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{plan?.name || 'Nenhum'}</h3>
          <p className="text-sm text-gray-400">Seu Plano Atual</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{recentGens.length}</h3>
          <p className="text-sm text-gray-400">Criações Recentes</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Atividade Recente
            </h2>
            <Link to="/app/minhas-imagens" className="text-sm text-primary hover:underline">Ver tudo</Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {recentGens.map((gen) => (
              <Link key={gen.id} to="/app/minhas-imagens" className="group relative aspect-square rounded-2xl overflow-hidden border border-border-dark bg-card-dark">
                <img 
                  src={gen.imageUrl} 
                  alt={gen.prompt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </Link>
            ))}
            {recentGens.length === 0 && (
              <div className="col-span-2 card py-12 text-center border-dashed">
                <p className="text-gray-500 italic">Nenhuma imagem gerada ainda.</p>
                <Link to="/app/gerar" className="text-primary font-bold mt-2 inline-block">Começar a criar</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
          <div className="space-y-4">
            <Link to="/app/gerar" className="card p-6 flex items-center gap-6 hover:bg-white/5 transition-all group border-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <ImagePlus className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Gerar Nova Imagem</h3>
                <p className="text-sm text-gray-500">Use sua imaginação para criar algo único.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
            </Link>

            <div className="card p-6 bg-purple-500/5 border-purple-500/10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold text-white">Dica do Dia</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Tente usar palavras como <span className="text-purple-400 font-mono">"cinematic lighting"</span> ou <span className="text-purple-400 font-mono">"unreal engine 5"</span> em seus prompts para obter resultados mais profissionais e detalhados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
