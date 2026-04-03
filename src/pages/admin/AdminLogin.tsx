import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (firebaseUser && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [firebaseUser, user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O useEffect cuidará do redirecionamento
    } catch (err: any) {
      console.error(err);
      setError('E-mail ou senha incorretos ou você não tem permissão de administrador.');
      setLocalLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 rounded-2xl border border-red-600/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Login</h1>
          <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">Acesso Restrito</p>
        </div>

        <div className="bg-card-dark border border-border-dark rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {firebaseUser && !isAdmin ? (
            <div className="space-y-6 text-center">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-4 rounded-xl flex flex-col items-center gap-3 text-sm">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Acesso Negado</p>
                <p className="text-gray-400">Você está logado como {firebaseUser.email}, mas esta conta não possui privilégios de administrador.</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair e Tentar Outra Conta
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">E-mail Admin</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition-all"
                    placeholder="admin@visionai.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-border-dark rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={localLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {localLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acessar Painel'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
