import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { User, Generation, ManualPayment, Plan } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Users, ImagePlus, CreditCard, DollarSign, TrendingUp, ShieldCheck, AlertCircle, Clock, Loader2, Sparkles, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalGenerations: 0,
    totalCreditsConsumed: 0,
    totalRevenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const gensSnap = await getDocs(collection(db, 'generations'));
        const paymentsSnap = await getDocs(collection(db, 'manual_payments'));

        const users = usersSnap.docs.map(d => d.data() as User);
        const gens = gensSnap.docs.map(d => d.data() as Generation);
        const payments = paymentsSnap.docs.map(d => d.data() as ManualPayment);

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          blockedUsers: users.filter(u => u.status === 'blocked').length,
          totalGenerations: gens.length,
          totalCreditsConsumed: gens.reduce((acc, g) => acc + (g.creditsConsumed || 0), 0),
          totalRevenue: payments.reduce((acc, p) => acc + (p.amount || 0), 0),
        });

        // Recent payments
        const q = query(collection(db, 'manual_payments'), orderBy('createdAt', 'desc'), limit(5));
        const recentPaySnap = await getDocs(q);
        setRecentPayments(recentPaySnap.docs.map(d => ({ id: d.id, ...d.data() } as ManualPayment)));

      } catch (error) {
        console.error("Erro ao buscar estatísticas admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('Deseja inicializar os planos padrão do sistema?')) return;
    setIsSeeding(true);
    try {
      const { seedInitialData } = await import('../../lib/seed');
      await seedInitialData('bieldantas0812@gmail.com');
      alert('Dados inicializados com sucesso! Recarregue a página.');
      window.location.reload();
    } catch (err) {
      alert('Erro ao inicializar dados.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando métricas administrativas...</div>;

  const statCards = [
    { label: 'Total de Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Usuários Ativos', value: stats.activeUsers, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Imagens Geradas', value: stats.totalGenerations, icon: ImagePlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
          <p className="text-gray-400">Visão geral do desempenho e saúde da plataforma.</p>
        </div>
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-border-dark rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2"
        >
          {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Inicializar Planos
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Últimos Pagamentos</h2>
            <Link to="/admin/pagamentos" className="text-sm text-red-500 hover:underline font-medium">Ver todos</Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border-dark">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Método</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {recentPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">{formatDate(pay.createdAt).split(',')[0]}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">{formatCurrency(pay.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{pay.method}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Nenhum pagamento registrado recentemente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link to="/admin/usuarios" className="card p-4 flex items-center gap-4 hover:bg-white/5 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Gerenciar Usuários</p>
                <p className="text-xs text-gray-500">Criar, editar e bloquear</p>
              </div>
            </Link>
            <Link to="/admin/pagamentos" className="card p-4 flex items-center gap-4 hover:bg-white/5 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Registrar Pagamento</p>
                <p className="text-xs text-gray-500">Liberar créditos manualmente</p>
              </div>
            </Link>
            <Link to="/admin/planos" className="card p-4 flex items-center gap-4 hover:bg-white/5 transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                <Settings className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Configurar Planos</p>
                <p className="text-xs text-gray-500">Editar preços e limites</p>
              </div>
            </Link>
          </div>

          <div className="card bg-red-500/5 border-red-500/20">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Atenção</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Existem <span className="text-white font-bold">{stats.blockedUsers}</span> usuários bloqueados na plataforma. Revise o status periodicamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
