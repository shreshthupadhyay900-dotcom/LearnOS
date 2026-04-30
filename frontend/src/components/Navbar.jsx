/* eslint-disable */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, Sun, Moon, ChevronDown, 
  User, Settings, LogOut, Command, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openSearch = () => {
     // Dispatch a keyboard event to trigger the CommandBar (Ctrl+K)
     window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
  };

  return (
    <header className="h-20 glass-strong sticky top-0 border-b border-white/20 px-6 lg:px-10 flex items-center justify-between gap-6 z-30 transition-all">
      {/* Left section: Hamburger + Search Trigger */}
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all"
        >
          <Menu size={22} />
        </button>

        <button 
          onClick={openSearch}
          className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gray-100/50 dark:bg-slate-800/50 border border-transparent hover:border-primary-500/30 hover:bg-white dark:hover:bg-slate-700 transition-all group w-full max-w-sm"
        >
          <Search size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Neural Search...</span>
          <div className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-slate-600 text-[10px] font-black text-gray-500 dark:text-gray-400">
             <Command size={10} /> K
          </div>
        </button>
      </div>

      {/* Right section: System Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10 mr-2">
           <Zap size={14} className="text-primary-500 fill-current" />
           <span className="text-[10px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest">Protocol Active</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:scale-110 group relative"
        >
          {theme === 'dark'
            ? <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            : <Moon size={20} className="text-gray-600 group-hover:-rotate-12 transition-transform duration-500" />
          }
        </button>

        <button className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:scale-110 relative group">
          <Bell size={20} className="text-gray-600 dark:text-gray-300 group-hover:shake transition-all" />
          <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800" />
        </button>

        <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-2" />

        {/* User Intelligence Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-gradient-primary flex items-center justify-center text-white font-black text-sm shadow-glow-sm border border-white/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight italic">{user?.name}</p>
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Scholar Rank</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-56 glass-strong rounded-3xl shadow-2xl border border-white/20 py-2.5 z-50 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50">
                  <p className="text-sm font-black text-gray-900 dark:text-white italic tracking-tight">{user?.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <div className="p-2 space-y-1">
                  {[
                    { icon: User, label: 'Profile Hub', action: () => { navigate('/app/settings'); setDropdownOpen(false); } },
                    { icon: Settings, label: 'Preferences', action: () => { navigate('/app/settings'); setDropdownOpen(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-primary-500 hover:text-white rounded-2xl transition-all group">
                      <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors" /> {label}
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-slate-800/20">
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}


