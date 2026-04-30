/* eslint-disable */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, BookOpen, ClipboardList,
  BarChart3, Settings, LogOut, Zap, X, GraduationCap,
  Sparkles, ShieldCheck, FileText, RefreshCcw, Users, 
  MessageSquare, PlusCircle, Presentation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const studentNav = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Control Hub' },
  { to: '/app/ai-tutor', icon: Bot, label: 'AI Mentor' },
  { to: '/app/social', icon: Users, label: 'Social Hub' },
  { to: '/app/messages', icon: MessageSquare, label: 'Uplink' },
  { to: '/app/roadmaps', icon: Sparkles, label: 'Roadmaps' },
  { to: '/app/interviews', icon: Bot, label: 'Mock Arena' },
  { to: '/app/resume', icon: FileText, label: 'Skill Matrix' },
  { to: '/app/quiz', icon: BookOpen, label: 'Quiz Arena' },
  { to: '/app/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/app/analytics', icon: BarChart3, label: 'Performance Engine' },
  { to: '/app/scholarships', icon: GraduationCap, label: 'Scholarships' },
  { to: '/app/settings', icon: Settings, label: 'System' },
];

const teacherNav = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Teacher Hub' },
  { to: '/app/students', icon: Users, label: 'Students' },
  { to: '/app/messages', icon: MessageSquare, label: 'Uplink' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/settings', icon: Settings, label: 'System' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher';
  const navItems = isTeacher ? teacherNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const content = (
    <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto scrollbar-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-2 relative group cursor-pointer" onClick={() => navigate('/app/dashboard')}>
        <div className="group-hover:scale-110 transition-transform duration-500">
          <Logo size={48} />
        </div>
         <div className="flex flex-col -gap-1">
           <div className="flex items-center gap-1">
              <span className="font-display font-black text-2xl tracking-tighter italic uppercase text-gray-900 dark:text-white">LEARN <span className="text-primary-500">OS</span></span>
              <span className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">AI</span>
           </div>
           <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] ml-0.5">Neural Intelligence</p>
         </div>
        <button onClick={onClose} className="ml-auto lg:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
          <X size={20} />
        </button>
      </div>

      {/* User Status Card */}
      <div className="p-1 rounded-[28px] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 shadow-sm border border-white/10 relative group">
         <div className="bg-white dark:bg-slate-900 rounded-[26px] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-glow border border-white/20 ${isTeacher ? 'bg-indigo-500' : 'bg-primary-500'}`}>
                  {user?.name?.charAt(0).toUpperCase()}
               </div>
               <div className="min-w-0">
                  <p className="font-display font-black text-sm text-gray-900 dark:text-white truncate italic uppercase tracking-tight">{user?.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <ShieldCheck size={10} className={isTeacher ? 'text-indigo-500' : 'text-primary-500'} />
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user?.role}</span>
                  </div>
               </div>
            </div>
            
            {!isTeacher && (
              <div className="flex items-center justify-between px-2">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">XP Power</span>
                    <div className="flex items-center gap-1 text-primary-500 font-display font-black text-lg">
                       <Zap size={14} fill="currentColor" /> {user?.xp || 0}
                    </div>
                 </div>
                 <div className="w-px h-8 bg-gray-100 dark:bg-white/5" />
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Rank</span>
                    <span className="text-amber-500 font-display font-black text-lg italic">S1</span>
                 </div>
              </div>
            )}

            {isTeacher && (
              <div className="flex items-center justify-between px-2">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Students</span>
                    <div className="flex items-center gap-1 text-indigo-500 font-display font-black text-lg">
                       <Users size={14} fill="currentColor" /> 24
                    </div>
                 </div>
                 <div className="w-px h-8 bg-gray-100 dark:bg-white/5" />
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Cert</span>
                    <span className="text-indigo-500 font-display font-black text-lg italic text-right">MASTER</span>
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-2 italic">
          {isTeacher ? 'Faculty Operations' : 'Main Operations'}
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                isActive 
                  ? `${isTeacher ? 'bg-indigo-600' : 'bg-primary-500'} text-white shadow-glow translate-x-2` 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                   whileHover={{ scale: 1.2, rotate: 5 }}
                   transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                   <Icon size={20} />
                </motion.div>
                <span className="tracking-tight">{label}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!isTeacher && (
        <div className="p-5 rounded-[24px] bg-primary-500/5 border border-primary-500/10 mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-gray-400">Daily Streak</span>
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-xl font-display font-black italic text-primary-500">
                {user?.streak || 0}
             </div>
             <div className="flex-1">
                <div className="flex justify-between text-[8px] font-black text-primary-600 uppercase mb-1">
                   <span>Level Progress</span>
                   <span>72%</span>
                </div>
                <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "72%" }}
                      className="h-full bg-primary-500"
                   />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Final Actions */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all mt-auto"
      >
        <LogOut size={16} /> Logout Terminal
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-white/5 h-full relative z-40 transition-all duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,105,248,0.03),transparent)] pointer-events-none" />
        {content}
      </aside>

      <AnimatePresence>
        {open && (
           <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-950 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {content}
            </motion.aside>
           </>
        )}
      </AnimatePresence>
    </>
  );
}

