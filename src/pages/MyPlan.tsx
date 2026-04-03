import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Plan } from '../types';
import { formatCurrency } from '../lib/utils';
import { CreditCard, MessageCircle, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function MyPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPlan = async () => {
      try {
        const planSnap = await getDoc(doc(db, 'plans', user.planId));
        if (planSnap.exists()) {
          setPlan({ id: planSnap.id, ...planSnap.data() } as Plan);
        }
      } catch (error) {
        console.error("Erro ao buscar plano:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando detalhes do plano...</div>;

  const statusInfo = {
    active: { label: 'Ativa', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    suspended: { label: 'Suspensa', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    blocked: { label: 'Bloqueada', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const currentStatus = statusInfo[user?.status || 'active'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Meu Plano</h1>
        <p className="text-gray-400">Gerencie sua assinatura e créditos da plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plan Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <Zap className="w-12 h-12 text-primary/10" />
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1 block">Plano Atual</span>
                <h2 className="text-4xl font-black text-white">{plan?.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-border-dark">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Créditos Restantes</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {user?.credits}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status da Assinatura</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.color.replace('text', 'bg')}`} />
                    {currentStatus.label.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white">O que seu plano inclui:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {plan?.initialCredits} créditos por renovação
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Geração de imagens em alta definição
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Histórico ilimitado de criações
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Suporte prioritário via WhatsApp
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Informação Importante</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nossa plataforma utiliza um sistema de gestão manual. Isso significa que renovações, upgrades e recargas de créditos são processados por nossa equipe após a confirmação do pagamento via Pix.
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="space-y-6">
          <div className="card bg-primary/10 border-primary/20 flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quer evoluir?</h3>
            <p className="text-sm text-gray-400 mb-8">
              Aumente seu limite de créditos e desbloqueie novas possibilidades criativas.
            </p>
            <a 
              href="https://wa.me/seu-numero" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Consultor
            </a>
            <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest">
              Resposta em até 15 minutos
            </p>
          </div>

          <div className="card p-6">
            <h4 className="text-sm font-bold text-white mb-4">Métodos de Pagamento</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-12 bg-black/40 rounded-lg border border-border-dark flex items-center justify-center grayscale opacity-50">
                <span className="text-xs font-bold">PIX</span>
              </div>
              <div className="flex-1 h-12 bg-black/40 rounded-lg border border-border-dark flex items-center justify-center grayscale opacity-50">
                <span className="text-xs font-bold">CARTÃO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
