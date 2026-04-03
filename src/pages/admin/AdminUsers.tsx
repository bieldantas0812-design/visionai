import React, { useEffect, useState } from 'react';
import { db, createSecondaryApp } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, orderBy, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, signOut, deleteUser } from 'firebase/auth';
import { User, Plan } from '../../types';
import { formatDate } from '../../lib/utils';
import { Users, Search, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert, ShieldOff, MoreVertical, X, Loader2, CreditCard, Lock, Mail, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // New field
    role: 'user' as const,
    planId: '',
    credits: 0,
    status: 'active' as const,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const plansSnap = await getDocs(query(collection(db, 'plans'), orderBy('order', 'asc')));
        
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
        setPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let secondaryApp = null;
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await updateDoc(doc(db, 'users', editingUser.id), updateData);
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
        toast.success("Usuário atualizado com sucesso!");
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres.");
          setIsSaving(false);
          return;
        }

        // Criar usuário no Firebase Auth sem deslogar o admin
        secondaryApp = createSecondaryApp();
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const uid = userCredential.user.uid;

        // Criar documento no Firestore com o mesmo UID
        const { password, ...userData } = formData;
        await setDoc(doc(db, 'users', uid), {
          ...userData,
          createdAt: new Date().toISOString(),
        });

        // Deslogar do app secundário para limpar a sessão
        await signOut(secondaryAuth);

        setUsers([{ id: uid, ...userData, createdAt: new Date().toISOString() } as User, ...users]);
        toast.success("Usuário criado com sucesso!");
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast.error(error.message || "Erro ao salvar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const handleQuickAction = async (id: string, action: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', id), action);
      setUsers(users.map(u => u.id === id ? { ...u, ...action } : u));
    } catch (error) {
      console.error("Erro na ação rápida:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando lista de usuários...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Usuários</h1>
          <p className="text-gray-400">Controle total sobre os membros da plataforma.</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'user', planId: plans[0]?.id || '', credits: 0, status: 'active' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card-dark border border-border-dark rounded-xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-border-dark">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plano / Créditos</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Ações Rápidas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-bold border border-border-dark">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-white">{plans.find(p => p.id === u.planId)?.name || 'Nenhum'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CreditCard className="w-3 h-3" />
                        {u.credits} créditos
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase border",
                      u.status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      u.status === 'suspended' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuickAction(u.id, { credits: u.credits + 10 })}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
                        title="+10 Créditos"
                      >
                        +10
                      </button>
                      <button 
                        onClick={() => handleQuickAction(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
                        title={u.status === 'active' ? 'Suspender' : 'Ativar'}
                      >
                        {u.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingUser(u);
                          setFormData({ name: u.name, email: u.email, role: u.role, planId: u.planId, credits: u.credits, status: u.status });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
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
                <h3 className="text-xl font-bold text-white">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  {!editingUser && (
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Senha Inicial</label>
                      <input 
                        type="password" 
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plano</label>
                    <select 
                      value={formData.planId}
                      onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Créditos</label>
                    <input 
                      type="number" 
                      required
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      <option value="active">Ativo</option>
                      <option value="suspended">Suspenso</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full bg-black/50 border border-border-dark rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Admin</option>
                    </select>
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
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Usuário'}
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
