import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ImagePlus, Sparkles, Zap, ShieldCheck, ArrowRight, Github, Twitter, Instagram } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <ImagePlus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">VisionAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Entrar</Link>
            <Link to="/login" className="btn-primary px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-dark rounded-full transition-all shadow-lg shadow-primary/20">
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            A Nova Era da Geração de Imagens
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
          >
            Transforme <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Ideias</span> em Arte Visual
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            A plataforma SaaS mais avançada para criação de imagens com IA. Rápida, intuitiva e com resultados profissionais em segundos.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/30">
              Criar Minha Primeira Imagem
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">
              Ver Recursos
            </a>
          </motion.div>
        </div>

        {/* Hero Image Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-6xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="card p-2 bg-white/5 border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <img 
              src="https://picsum.photos/seed/visionai/1920/1080" 
              alt="VisionAI Interface" 
              className="w-full rounded-[24px] border border-white/5"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Recursos Poderosos</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Tudo o que você precisa para elevar seu processo criativo ao próximo nível.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Geração Instantânea', desc: 'Crie imagens em alta resolução em menos de 10 segundos com nossa tecnologia de ponta.', icon: Zap, color: 'text-yellow-500' },
              { title: 'Qualidade Premium', desc: 'Resultados fotorrealistas e artísticos que superam as expectativas mais exigentes.', icon: Sparkles, color: 'text-purple-500' },
              { title: 'Segurança Total', desc: 'Seus dados e criações estão protegidos com criptografia de nível bancário.', icon: ShieldCheck, color: 'text-emerald-500' },
            ].map((f, i) => (
              <div key={i} className="card p-8 space-y-6 hover:border-primary/30 transition-all group">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-all`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto card p-12 md:p-20 bg-gradient-to-br from-primary/20 to-purple-500/10 border-primary/20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Pronto para começar?</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">Escolha o plano que melhor se adapta às suas necessidades e comece a criar hoje mesmo.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all">
                Ver Planos e Preços
              </Link>
              <a href="https://wa.me/seu-numero" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">
                Falar com Consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <ImagePlus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">VisionAI</span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              A plataforma definitiva para criadores, designers e entusiastas de IA. Transformando o futuro da arte visual um prompt de cada vez.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300">Produto</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300">Suporte</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2026 VisionAI. Todos os direitos reservados.</p>
          <p>Feito com ❤️ para criadores.</p>
        </div>
      </footer>
    </div>
  );
}
