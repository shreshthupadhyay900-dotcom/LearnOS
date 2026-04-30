import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bot, BookOpen, BarChart3, Settings, 
  Plus, Terminal, Zap, Globe, Command, X
} from 'lucide-react';

const actions = [
  { id: 'tutor', icon: Bot, label: 'Ask AI Mentor', shortcut: 'T', link: '/app/ai-tutor' },
  { id: 'quiz', icon: BookOpen, label: 'Start Random Quiz', shortcut: 'Q', link: '/app/quiz' },
  { id: 'stats', icon: BarChart3, label: 'View Performance', shortcut: 'S', link: '/app/analytics' },
  { id: 'assign', icon: Plus, label: 'New Assignment', shortcut: 'N', link: '/app/assignments' },
  { id: 'settings', icon: Settings, label: 'Open Settings', shortcut: ',', link: '/app/settings' },
];

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = (link) => {
    navigate(link);
    setOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <Search size={22} className="text-gray-400" />
              <input
                autoFocus
                placeholder="Type a command or search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-500 font-medium"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-400 uppercase">
                ESC
              </div>
            </div>

            <div className="p-3 max-h-[400px] overflow-y-auto">
              <div className="px-3 py-2">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Actions & Navigation</p>
                 <div className="space-y-1">
                   {filteredActions.map(action => (
                     <button
                       key={action.id}
                       onClick={() => handleAction(action.link)}
                       className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-primary-500 hover:text-white transition-all group"
                     >
                       <div className="flex items-center gap-3">
                         <action.icon size={18} className="text-gray-400 group-hover:text-white" />
                         <span className="font-bold text-sm">{action.label}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 group-hover:bg-white/20 text-[10px] font-black border border-gray-200 dark:border-white/10">⌘ {action.shortcut}</kbd>
                       </div>
                     </button>
                   ))}
                 </div>
              </div>

              <div className="px-3 py-2 mt-2">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Intelligence engine</p>
                 <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-primary-500 fill-current" />
                       <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Syncing with AI Core...</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">LIVE</span>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
               <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Command size={12} /> K to toggle</span>
                  <span className="flex items-center gap-1"><ArrowRight size={12} className="rotate-90" /> to select</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Protocol Active</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

