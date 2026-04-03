import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, addDoc, orderBy, where, increment } from 'firebase/firestore';
import { ManualPayment, User, Plan } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { DollarSign, Plus, Search, X, Loader2, Calendar, User as UserIcon, CreditCard, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPayments() {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    amount: 0,
    creditsReleased: 0,
    method: 'Pix',
    observations: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paySnap = await getDocs(query(collection(db, 'manual_payments'), orderBy('createdAt', 'desc')));
        const usersSnap = await getDocs(collection(db, 'users'));
        const plansSnap = await getDocs(collection(db, 'plans'));
        
        setPayments(paySnap.docs.map(d => ({ id: d.id, ...d.data() } as ManualPayment)));
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
        setPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const paymentData = {
        ...formData,
        status: 'Confirmado',
        confirmedByAdmin: 'Admin', // In real app, get current admin name
        createdAt: new Date().toISOString(),
      };

      // 1. Create payment record
      const newDoc = await addDoc(collection(db, 'manual_payments'), paymentData);
      
      // 2. Update user credits and plan
      await updateDoc(doc(db, 'users', formData.userId), {
        credits: increment(formData.creditsReleased),
        planId: formData.planId,
        status: 'active' // Ensure user is active after payment
      });

      setPayments([{ id: newDoc.id, ...paymentData } as ManualPayment, ...payments]);
      setIsModalOpen(false);
      setFormData({ userId: '', planId: '', amount: 0, creditsReleased: 0, method: 'Pix', observations: '' });
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const plan = plans.find(p => p.id === user.planId);
      setFormData({
        ...formData,
        userId,
        planId: user.planId,
        amount: plan?.price || 0,
        creditsReleased: plan?.initialCredits || 0
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando histórico de pagamentos...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pagamentos Manuais</h1>
          <p className="text-gray-400">Registre e confirme pagamentos recebidos via WhatsApp/Pix.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Registrar Pagamento
        </button>
      </header>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border-dark">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plano / Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Créditos</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Data / Método</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {payments.map((pay) => {
                const user = users.find(u => u.id === pay.userId);
                const plan = plans.find(p => p.id === pay.planId);
                return (
                  <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 font-bold border border-border-dark text-xs">
                          {user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user?.name || 'Usuário Excluído'}</p>
                          <p className="text-[10px] text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-white">{plan?.name || 'Recarga Avulsa'}</p>
                        <p className="text-xs font-bold text-emerald-500">{formatCurrency(pay.amount)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                        <CreditCard className="w-3 h-3 text-primary" />
                        +{pay.creditsReleased}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-300">{formatDate(pay.createdAt).split(',')[0]}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{pay.method}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <DollarSign className="w-12 h-12 mb-2" />
                      <p className="text-lg font-bold">Nenhum pagamento registrado</p>
                      <p className="text-sm">Os pagamentos confirmados aparecerão aqui.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
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
                <h3 className="text-xl font-bold text-white">Registrar Pagamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleRegisterPayment} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selecionar Usuário</label>
                  <select 
                    required
                    value={formData.userId}
                    onChange={(e) => onUserSelect(e.target.value)}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="">Selecione um usuário...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plano Comprado</label>
                    <select 
                      required
                      value={formData.planId}
                      onChange={(e) => {
                        const plan = plans.find(p => p.id === e.target.value);
                        setFormData({ ...formData, planId: e.target.value, amount: plan?.price || 0, creditsReleased: plan?.initialCredits || 0 });
                      }}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      <option value="">Selecione o plano...</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Método</label>
                    <select 
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      <option value="Pix">Pix</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valor Pago (R$)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Créditos Liberados</label>
                    <input 
                      type="number" 
                      required
                      value={formData.creditsReleased}
                      onChange={(e) => setFormData({ ...formData, creditsReleased: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Observações</label>
                  <textarea 
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 h-20 resize-none"
                    placeholder="Ex: Comprovante enviado via WhatsApp..."
                  />
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
                    disabled={isSaving || !formData.userId}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Pagamento'}
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
