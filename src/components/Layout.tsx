import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ImagePlus, Images, CreditCard, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ImagePlus, label: 'Gerar Imagem', path: '/gerar' },
    { icon: Images, label: 'Minhas Imagens', path: '/minhas-imagens' },
    { icon: CreditCard, label: 'Meu Plano', path: '/meu-plano' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-card-dark border-r border-border-dark z-50 lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out",
          !isOpen && "lg:block"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ImagePlus className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">VisionAI</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-primary" : "group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border-dark">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.credits} créditos</p>
              </div>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const Topbar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border-dark bg-bg-dark/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <button onClick={onOpenSidebar} className="lg:hidden p-2 text-gray-400 hover:text-white">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{user?.credits} CRÉDITOS</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-border-dark flex items-center justify-center text-xs font-bold text-gray-300">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-bg-dark">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
