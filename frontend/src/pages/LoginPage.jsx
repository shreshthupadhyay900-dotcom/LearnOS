import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Sparkles, Brain, Trophy, Zap, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const features = [
  { icon: Brain, text: 'AI-powered personalized learning' },
  { icon: Trophy, text: 'Gamified progress tracking' },
  { icon: Zap, text: 'Real-time quiz generation' },
  { icon: Sparkles, text: 'Smart weak-area detection' },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password, form.role);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setError('');
    setLoading(true);
    try {
      await socialLogin(provider);
      navigate('/app/dashboard');
    } catch (err) {
      setError(`Failed to connect with ${provider}. Please try conventional login.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-12 relative overflow-hidden"
      >
        {/* Background orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10 mb-8">
          <Logo size={48} />
           <div className="flex items-center gap-1">
             <span className="font-display font-black text-2xl text-white italic uppercase">LEARN <span className="text-white/80">OS</span></span>
             <span className="bg-white text-primary-600 text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">AI</span>
           </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="mb-8"
          >
            <div className="w-48 h-48 mx-auto bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <div className="text-center">
                <Brain size={64} className="text-white mx-auto mb-2 opacity-90" />
                <div className="flex gap-1 justify-center">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2 h-2 bg-white/70 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4 uppercase italic tracking-tighter">
            Elite AI <br />Learning Mentor
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Experience the future of education with adaptive roadmaps and voice-first intelligence.
          </p>

          <div className="space-y-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{feature.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 glass rounded-2xl p-4 bg-white/10 border-white/20">
          <p className="text-white/90 text-sm italic">"EduAI helped me improve my DSA skills from 40% to 92% accuracy in just 3 weeks!"</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-white text-xs font-semibold">Arjun K.</p>
              <p className="text-white/60 text-xs">CS Student, IIT Delhi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <Logo size={40} />
            <div className="flex items-center gap-1">
               <span className="font-display font-black text-xl gradient-text italic uppercase">LEARN OS</span>
               <span className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">AI</span>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-8 shadow-xl">
            {/* Toggle */}
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 mb-6">
              {['Login', 'Sign Up'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isLogin === (i === 0)
                      ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
                  {isLogin ? 'Welcome back 👋' : 'Create account 🚀'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {isLogin ? 'Login to continue your learning journey' : 'Start your AI-powered learning today'}
                </p>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-4">
                      <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 mb-2">
                        {['student', 'teacher'].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setForm({ ...form, role: r })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              form.role === r
                                ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-gray-500'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input id="name" name="name" type="text" placeholder="Full Name" value={form.name} onChange={handle} required className="input-field pl-10" />
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="email" name="email" type="email" placeholder="Email address" value={form.email} onChange={handle} required className="input-field pl-10" />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Password" value={form.password} onChange={handle}
                      required minLength={6} className="input-field pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {isLogin && (
                    <div className="text-right">
                      <button type="button" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    id="submit-auth"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isLogin ? 'Logging in...' : 'Creating account...'}
                      </span>
                    ) : (
                      isLogin ? '🚀 Login to LEARN OS' : '✨ Create Account'
                    )}
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                    <span className="text-xs text-gray-400">or continue with</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'google-btn', label: 'Google', icon: '🌐' },
                      { id: 'github-btn', label: 'GitHub', icon: '🐙' },
                    ].map(({ id, label, icon }) => (
                      <button
                        key={id}
                        id={id}
                        type="button"
                        onClick={() => handleSocial(label)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all hover:scale-[1.02] disabled:opacity-50"
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

