import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Palette, Globe, Bell, Shield, Save, 
  Sun, Moon, Check, Zap, Sparkles, Award, 
  TrendingUp, CreditCard, LogOut, ChevronRight,
  Settings, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese'];
const tabs = [
  { id: 'profile', icon: User, label: 'Profile Hub' },
  { id: 'appearance', icon: Palette, label: 'Visuals' },
  { id: 'intelligence', icon: Sparkles, label: 'AI Core' },
  { id: 'security', icon: Shield, label: 'Privacy' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'billing', icon: CreditCard, label: 'Credits' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    dailyGoal: user?.dailyGoal || 30, 
    language: user?.language || 'en',
    tutorPersonality: user?.tutorPersonality || 'mentor'
  });
  const [notifications, setNotifications] = useState(user?.notifications || { email: true, push: true, reminders: true });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { ...form, notifications });
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
         <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-1">
               <Shield className="w-3 h-3" /> Secure Nucleus
            </div>
            <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tight">Profile Hub</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your conceptual identity and system preferences.</p>
         </div>

         <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Global Rank</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white">TOP 5%</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                   <Award size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Status</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white">SCHOLAR II</p>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Elite Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-tighter transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} /> {tab.label}
                </div>
                <ChevronRight size={14} className={`transition-transform ${activeTab === tab.id ? 'rotate-90' : 'opacity-0'}`} />
              </button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
             <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-black text-[11px] uppercase tracking-widest">
                <LogOut size={18} /> Terminate
             </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card !p-8 h-full min-h-[500px] relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="relative group">
                       <div className="w-24 h-24 rounded-[32px] bg-gradient-primary flex items-center justify-center text-white text-3xl font-black shadow-glow group-hover:scale-105 transition-transform">
                          {user?.name?.charAt(0).toUpperCase()}
                       </div>
                       <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 text-primary-500">
                          <Sparkles size={16} />
                       </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase italic">{user?.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase italic tracking-widest">{user?.role || 'STUDENT'}</span>
                         <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase italic tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Identity</label>
                       <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field" placeholder="Student Name" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Preferred Language</label>
                       <select 
                          value={form.language} 
                          onChange={e => setForm({...form, language: e.target.value})}
                          className="input-field appearance-none"
                       >
                          {LANGUAGES.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
                       </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-4 px-1">
                      <span>Daily Mastery Goal</span>
                      <span className="text-primary-600 font-display italic">{form.dailyGoal} Minutes</span>
                    </label>
                    <div className="relative h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                          className="absolute h-full bg-gradient-primary"
                          animate={{ width: `${(form.dailyGoal / 120) * 100}%` }}
                       />
                       <input
                        type="range" min={10} max={120} step={5}
                        value={form.dailyGoal}
                        onChange={e => setForm({...form, dailyGoal: +e.target.value})}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-gray-400 mt-2 uppercase tracking-widest">
                       <span>Warmup</span>
                       <span>Deep Work</span>
                       <span>Immersion</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <div className="pb-4 border-b border-gray-100 dark:border-white/5">
                     <h3 className="text-xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Interface Aesthetics</h3>
                     <p className="text-xs text-gray-500 mt-1">Customize the visual identity of your terminal.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { val:'light', icon:Sun, label:'Nova Light', desc:'High clarity, high contrast.' },
                      { val:'dark', icon:Moon, label:'Void Dark', desc:'Deep tones, eye comfort.' }
                    ].map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.val}
                          onClick={() => theme !== mode.val && toggleTheme()}
                          className={`p-6 rounded-[24px] border-2 text-left transition-all relative group overflow-hidden ${
                            theme === mode.val ? 'border-primary-500 bg-primary-500/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-200'
                          }`}
                        >
                           {theme === mode.val && <div className="absolute top-0 right-0 p-3 text-primary-500"><Check size={20} /></div>}
                           <div className={`p-3 rounded-xl inline-flex mb-4 ${theme === mode.val ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                              <Icon size={24} />
                           </div>
                           <p className={`font-display font-black uppercase text-lg leading-none ${theme === mode.val ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{mode.label}</p>
                           <p className="text-xs text-gray-500 mt-1">{mode.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-8">
                  <div className="pb-4 border-b border-gray-100 dark:border-white/5">
                     <h3 className="text-xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">AI Learning Personality</h3>
                     <p className="text-xs text-gray-500 mt-1">Select the teaching style that best fits your learning rhythm.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { val:'mentor', icon:Sparkles, label:'Friendly Mentor', desc:'Empathetic, encouraging, and analogy-focused. Perfect for deep understanding.' },
                      { val:'strict', icon:Shield, label:'Strict Teacher', desc:'Rigorous, precise, and high-standards. Focused on technical accuracy and depth.' },
                      { val:'coach', icon:Zap, label:'Exam Success Coach', desc:'Strategic, high-energy, and shortcut-focused. Best for competitive prep.' }
                    ].map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.val}
                          onClick={() => setForm({...form, tutorPersonality: p.val})}
                          className={`p-6 rounded-[24px] border-2 text-left transition-all relative flex items-center gap-6 ${
                            form.tutorPersonality === p.val ? 'border-primary-500 bg-primary-500/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-200'
                          }`}
                        >
                           <div className={`p-4 rounded-2xl flex-shrink-0 ${form.tutorPersonality === p.val ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                              <Icon size={28} />
                           </div>
                           <div className="flex-1">
                              <p className={`font-display font-black uppercase text-lg leading-none ${form.tutorPersonality === p.val ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{p.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                           </div>
                           {form.tutorPersonality === p.val && <div className="p-3 text-primary-500"><Check size={24} /></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-100 dark:border-white/5">
                     <h3 className="text-xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Signal Routing</h3>
                     <p className="text-xs text-gray-500 mt-1">Control how you receive intelligence updates.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key:'email', label:'Encrypted Email', desc:'Weekly performance digests.' },
                      { key:'push', label:'Neural Push', desc:'Real-time browser notifications.' },
                      { key:'reminders', label:'Focus Alerts', desc:'Streaks and goal reminders.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-all">
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({...notifications, [key]: !notifications[key]})}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${notifications[key] ? 'bg-primary-500 shadow-glow' : 'bg-gray-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${notifications[key] ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-10 opacity-60">
                   <Shield size={48} className="text-gray-400 mb-4" />
                   <h4 className="text-lg font-display font-black uppercase tracking-widest italic">Security Vault</h4>
                   <p className="text-sm max-w-xs mt-2">Enhanced biometric and 2FA settings are currently being deployed to your region.</p>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-10 opacity-60">
                   <CreditCard size={48} className="text-gray-400 mb-4" />
                   <h4 className="text-lg font-display font-black uppercase tracking-widest italic">Credits Protocol</h4>
                   <p className="text-sm max-w-xs mt-2">Manage your subscription tiers and AI token allocation here.</p>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
                <button
                  onClick={save}
                  disabled={loading}
                  className={`btn-primary flex-1 py-4 flex items-center justify-center gap-2 transition-all !rounded-2xl ${saved ? 'bg-emerald-500 shadow-emerald-500/30' : 'shadow-glow'}`}
                >
                  {saved ? <><Check size={20} /> Identity Confirmed</> : loading ? <><Loader size={20} className="animate-spin" />Syncing...</> : <><Save size={20} /> Commit Changes</>}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

