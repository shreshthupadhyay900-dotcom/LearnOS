import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Sparkles, Brain, Trophy, Zap, 
  ArrowRight, CheckCircle2, ShieldCheck, Globe, 
  Play, Star, MousePointer2, Cpu, Rocket, ChevronRight, Target
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { 
    title: 'Cognitive Neural Net', 
    desc: 'Map your mastery across thousands of concepts with our real-time dynamic knowledge topology.', 
    icon: Brain, 
    color: 'text-primary-600', 
    bg: 'bg-primary-500/10' 
  },
  { 
    title: 'Voice-Activated Mentor', 
    desc: 'Interact naturally. Our AI mentor speaks and listens with human-like emotional intelligence.', 
    icon: Sparkles, 
    color: 'text-purple-600', 
    bg: 'bg-purple-500/10' 
  },
  { 
    title: 'Elite Career Engine', 
    desc: 'FAANG-level mock interviews, ATS resume auditing, and global scholarship discovery.', 
    icon: Target, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    title: 'Adaptive Mastery', 
    desc: 'Curriculums that evolve with you. Master complex subjects 10x faster with AI roadmaps.', 
    icon: Zap, 
    color: 'text-amber-600', 
    bg: 'bg-amber-500/10' 
  }
];

// Reusable Nav Link
const NavLink = ({ href, children }) => (
  <a href={href} className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors tracking-wide uppercase text-[10px]">
    {children}
  </a>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary-500 selection:text-white overflow-x-hidden">
      {/* Background Intelligence */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-100/50 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-100/50 blur-[120px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-100" />
      </div>

      {/* Floating Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-4"
      >
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl rounded-[24px] px-6 py-3 border border-slate-200/50 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>
            <div className="group-hover:scale-110 transition-transform duration-500">
               <Logo size={44} />
            </div>
              <div className="flex flex-col -gap-1">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-xl tracking-tight leading-none italic uppercase text-slate-900">LEARN <span className="text-primary-600">OS</span></span>
                <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">AI</span>
              </div>
              <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 uppercase">Neural Intelligence</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Intelligence</NavLink>
            <NavLink href="#topology">Topology</NavLink>
            <NavLink href="#results">Results</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-colors">Portal</button>
            <button onClick={() => navigate('/login')} className="btn-primary py-2.5 px-6 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
               Access Now
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero: The Intelligence Core */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div style={{ opacity, scale }} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
            V 2.0 Engine Active • Google Gemini 1.5 Pro
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter italic uppercase mb-8 text-slate-900">
            Ascend Beyond <br />
            <span className="gradient-text">Human Limitations</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            LEARN OS is not a tutor. It is an elite cognitive partner that architecturally restructures your learning process through neural roadmaps and voice-first intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-10 py-5 bg-slate-950 text-white font-black rounded-[20px] text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              Initialize Engine <ArrowRight size={18} />
            </button>
            <button className="px-10 py-5 bg-slate-50 border border-slate-200 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center gap-3 text-slate-600">
               <Play size={16} fill="currentColor" /> Watch 60s Intel
            </button>
          </div>
        </motion.div>

        {/* Hero Visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, type: 'spring' }}
          className="mt-32 relative w-full max-w-6xl"
        >
          <div className="absolute inset-0 bg-primary-500/5 blur-[100px] -z-10" />
          <div className="bg-white/50 backdrop-blur-3xl rounded-[48px] border border-slate-200/50 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="rounded-[36px] overflow-hidden bg-slate-50 border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                  alt="LEARN OS Intelligence" 
                  className="w-full h-auto mix-blend-multiply hover:mix-blend-normal transition-all duration-700 opacity-60 hover:opacity-100 scale-105 group-hover:scale-100"
                />
             </div>
             
             {/* Dynamic Hud Elements */}
             <div className="absolute top-12 left-12 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-primary-500/10 shadow-lg flex items-center gap-4 animate-float">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Mastery Stream</p>
                   <p className="text-sm font-black italic text-slate-900">RECURSION: 98%</p>
                </div>
             </div>

             <div className="absolute bottom-12 right-12 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-accent-500/10 shadow-lg flex items-center gap-4 animate-float-delayed">
                <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-600">
                   <Target size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Global Rank</p>
                   <p className="text-sm font-black italic text-slate-900">#42 WORLDWIDE</p>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid: Neural Core */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-xl">
             <div className="text-primary-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Functional Pillars</div>
             <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-900">Architected for <span className="text-slate-300">Elite Performance</span></h2>
          </div>
          <p className="text-slate-400 font-medium max-w-xs text-sm">Every module is engineered to maximize neural retention and cognitive output.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] relative group overflow-hidden hover:bg-white hover:shadow-2xl hover:border-primary-500/20 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-8 border border-white group-hover:border-primary-500/50 transition-colors shadow-sm`}>
                <f.icon size={28} className={f.color} />
              </div>
              <h3 className="text-xl font-display font-black italic uppercase mb-4 tracking-tight text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Intelligence Topology */}
      <section id="topology" className="py-32 px-6 bg-slate-50 relative">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
               <div className="text-accent-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Neural Roadmaps</div>
               <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter mb-10 text-slate-900">Guided by <br /> <span className="gradient-text">Pure Logic</span></h2>
               
               <div className="space-y-12">
                  {[
                    { title: 'Neural Baseline', desc: 'The engine evaluates your conceptual foundation and identifies critical IQ gaps.' },
                    { title: 'Dynamic Expansion', desc: 'A real-time roadmap is synthesized, adapting to every quiz answer and doubt.' },
                    { title: 'Global Benchmarking', desc: 'Compare your cognitive mastery against the world\'s top 1% of learners.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                       <span className="text-4xl font-display font-black text-slate-200 group-hover:text-primary-500/20 transition-colors">0{i+1}</span>
                       <div>
                          <h4 className="text-xl font-display font-black italic uppercase mb-2 tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">{item.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed max-w-sm">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="lg:w-1/2 relative">
               <div className="aspect-square bg-white rounded-[48px] border border-slate-200 p-8 flex flex-col justify-center items-center shadow-2xl shadow-primary-500/10 overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,105,248,0.05),transparent)] animate-pulse" />
                  <Cpu size={120} className="text-primary-500 mb-10 relative z-10 animate-spin-slow opacity-80" />
                  <div className="text-center relative z-10">
                     <p className="text-3xl font-display font-black italic uppercase tracking-tighter mb-2 text-slate-900">Synthesizing Path</p>
                     <p className="text-sm font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">Cognitive Sync In Progress</p>
                  </div>
                  
                  {/* Orbs */}
                  <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(79,105,248,0.5)]" />
                  <div className="absolute bottom-20 left-20 w-3 h-3 rounded-full bg-accent-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
                  <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-glow" />
               </div>
            </div>
         </div>
      </section>

      {/* CTA: Final Ascent */}
      <section className="py-40 px-6 max-w-5xl mx-auto text-center">
         <motion.div 
           whileHover={{ scale: 1.02 }}
           className="relative bg-white rounded-[60px] p-16 border border-slate-200 shadow-2xl overflow-hidden group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
               <Rocket size={60} className="mx-auto text-primary-600 mb-8 group-hover:translate-y-[-10px] transition-transform" />
               <h2 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter mb-8 leading-none text-slate-900">
                  Begin Your <br /> <span className="gradient-text">Neural Ascent</span>
               </h2>
               <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto font-medium">
                  Join the elite circle of 4,200+ students leveraging LEARN OS to redefine the boundaries of human potential.
               </p>
               <button 
                  onClick={() => navigate('/login')}
                  className="bg-slate-900 text-white px-16 py-6 rounded-[24px] font-black text-xl uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl hover:shadow-primary-500/20"
               >
                  Connect Neural Link
               </button>
               <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Zero Friction • Immediate Intelligence • 10x ROI</p>
            </div>
         </motion.div>

         <footer className="mt-32 border-t border-slate-100 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 pb-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Cpu size={16} className="text-white" />
               </div>
               <span className="font-display font-black text-lg tracking-tight italic uppercase text-slate-900">LEARN OS <span className="text-primary-600">AI</span></span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">© 2026 LEARN OS Intelligence. Built for the top 1%.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-primary-600 transition-colors">Axioms</a>
               <a href="#" className="hover:text-primary-600 transition-colors">Protocols</a>
               <a href="#" className="hover:text-primary-600 transition-colors">Neural Sync</a>
            </div>
         </footer>
      </section>
    </div>
  );
}

