import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { Plan } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Settings, Plus, Edit2, Trash2, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    initialCredits: 0,
    active: true,
    order: 0,
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const q = query(collection(db, 'plans'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), formData);
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...formData } : p));
      } else {
        const newDoc = await addDoc(collection(db, 'plans'), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
        setPlans([...plans, { id: newDoc.id, ...formData, createdAt: new Date().toISOString() } as Plan].sort((a, b) => a.order - b.order));
      }
      setIsModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Excluir este plano? Usuários vinculados podem ter problemas.')) return;
    try {
      await deleteDoc(doc(db, 'plans', id));
      setPlans(plans.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando planos...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Planos</h1>
          <p className="text-gray-400">Configure os pacotes de créditos e preços da plataforma.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlan(null);
            setFormData({ name: '', description: '', price: 0, initialCredits: 0, active: true, order: plans.length });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Novo Plano
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            layoutId={plan.id}
            className="card relative flex flex-col justify-between"
          >
            {!plan.active && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20">
                Inativo
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{plan.description}</p>
              </div>

              <div className="py-4 border-y border-border-dark space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase font-bold">Preço</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(plan.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase font-bold">Créditos</span>
                  <span className="text-lg font-bold text-primary">{plan.initialCredits}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-2">
              <button 
                onClick={() => {
                  setEditingPlan(plan);
                  setFormData({ name: plan.name, description: plan.description, price: plan.price, initialCredits: plan.initialCredits, active: plan.active, order: plan.order });
                  setIsModalOpen(true);
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button 
                onClick={() => handleDeletePlan(plan.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full card text-center py-20">
            <Settings className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum plano cadastrado</h3>
            <p className="text-gray-500">Comece criando os planos Free, Starter e Pro.</p>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card-dark border border-border-dark rounded-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-border-dark flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Plano</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="Ex: Pro Plan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 h-24 resize-none"
                    placeholder="O que este plano oferece?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Preço (R$)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Créditos Iniciais</label>
                    <input 
                      type="number" 
                      required
                      value={formData.initialCredits}
                      onChange={(e) => setFormData({ ...formData, initialCredits: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ordem</label>
                    <input 
                      type="number" 
                      required
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox" 
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 rounded bg-black/50 border-border-dark text-red-600 focus:ring-red-600/50"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-300">Plano Ativo</label>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-400 hover:text-white transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Plano'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
