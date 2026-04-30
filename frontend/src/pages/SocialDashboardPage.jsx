/* eslint-disable */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Hash, Plus, 
  Search, Shield, Crown, Zap, 
  ChevronRight, MoreHorizontal, Sparkles, Loader,
  X, Info, Globe, Lock, Star, TrendingUp, BookOpen
} from 'lucide-react';
import api from '../services/api';

const BenefitTag = ({ text, tooltip }) => (
  <div className="group relative">
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest cursor-help">
       <Info size={10} /> {text}
    </div>
    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
      {tooltip}
    </div>
  </div>
);

export default function SocialDashboardPage() {
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState('javascript-mastery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: false });
  
  const chatEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [msgRes, groupRes, lbRes] = await Promise.all([
        api.get(`/social/${activeChannel}`),
        api.get('/social/groups/all'),
        api.get('/social/data/leaderboard')
      ]);
      setMessages(msgRes.data);
      setGroups(groupRes.data);
      setLeaderboard(lbRes.data);
    } catch (err) { console.error('Social Fetch Error:', err); }
  }, [activeChannel]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const content = input;
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/social', { content, channel: activeChannel });
      setMessages(prev => [...prev, res.data]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/social/groups/create', newGroup);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const getAiSummary = async () => {
    if (messages.length < 3) return;
    setLoading(true);
    try {
      const res = await api.post('/social/ai/summarize', { messages: messages.slice(-10) });
      setAiInsight(res.data);
      setShowInsight(true);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-1">
            <Users className="w-3 h-3" /> Collective Intelligence Hub
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tight">Social Nexus</h1>
          <p className="text-sm text-gray-500 font-medium">Where scholars unite to accelerate learning through collaboration.</p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btn-primary px-6 py-3 flex items-center gap-2 shadow-glow !rounded-2xl"
           >
             <Plus size={20} /> <span className="font-black uppercase italic tracking-tighter text-sm">New Node</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
        {/* Sidebar: Active Nodes */}
        <div className="lg:col-span-3 flex flex-col card !p-6 gap-6 overflow-hidden">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input placeholder="Search Nodes..." className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary-500" />
           </div>

           <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Live Nodes</p>
                <BenefitTag text="Peer Learning" tooltip="Learning from peers increases retention by 70% compared to solo study." />
              </div>
              
              {groups.length === 0 ? (
                ['javascript-mastery', 'dsa-marathon', 'system-design'].map(name => (
                  <button 
                    key={name} 
                    onClick={() => setActiveChannel(name)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeChannel === name ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  >
                     <div className="flex items-center gap-3">
                        <Hash size={16} className={activeChannel === name ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'} />
                        <span className={`text-xs font-bold ${activeChannel === name ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>{name}</span>
                     </div>
                  </button>
                ))
              ) : groups.map(group => (
                <button 
                  key={group._id} 
                  onClick={() => setActiveChannel(group.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeChannel === group.name ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                >
                   <div className="flex items-center gap-3">
                      <Hash size={16} className={activeChannel === group.name ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'} />
                      <span className={`text-xs font-bold ${activeChannel === group.name ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>{group.name}</span>
                   </div>
                   {group.isPrivate && <Lock size={12} className="text-amber-500" />}
                </button>
              ))}
           </div>
        </div>

        {/* Discussion Area */}
        <div className="lg:col-span-6 flex flex-col card !p-0 overflow-hidden relative">
           <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <Hash size={24} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase italic text-gray-900 dark:text-white">{activeChannel}</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Transmission</p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={getAiSummary}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
              >
                <Sparkles size={14} /> AI Insight
              </button>
           </div>

           {/* AI Insight Panel overlay */}
           <AnimatePresence>
             {showInsight && aiInsight && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/50 overflow-hidden"
               >
                 <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase">
                          <Zap size={14} /> Discussion Summary
                       </div>
                       <button onClick={() => setShowInsight(false)}><X size={14} className="text-amber-500" /></button>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">{aiInsight.summary}</p>
                    <div className="flex flex-wrap gap-2">
                       {aiInsight.topResources?.map((r, i) => (
                         <span key={i} className="px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg text-[9px] font-bold text-amber-600 border border-amber-200 dark:border-amber-900/30">
                           #{r}
                         </span>
                       ))}
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                   <div className="w-16 h-16 rounded-[24px] bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-gray-300">
                      <MessageSquare size={32} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Initialize Discussion</p>
                   <p className="text-xs text-gray-500 mt-2">Be the first to share knowledge in this node.</p>
                </div>
              ) : messages.map(m => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m._id} 
                  className="flex gap-4 group"
                >
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-xs shadow-glow-soft flex-shrink-0">
                      {m.userName[0]}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-black uppercase italic text-gray-900 dark:text-white">{m.userName}</span>
                         <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase italic ${m.rank === 'Visionary' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>{m.rank}</span>
                         <span className="text-[8px] text-gray-400 font-medium ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">{m.content}</p>
                   </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
           </div>

           <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="bg-white dark:bg-slate-800 rounded-2xl flex items-center px-4 py-2 gap-3 border border-gray-200 dark:border-white/10 shadow-sm focus-within:ring-2 ring-primary-500/20 transition-all">
                 <input 
                    value={input} onChange={e => setInput(e.target.value)}
                    placeholder={`Broadcast to #${activeChannel}...`} 
                    className="flex-1 bg-transparent border-none text-sm font-medium outline-none h-12" 
                 />
                 <button type="submit" disabled={loading} className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 shadow-glow">
                    {loading ? <Loader className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                 </button>
              </form>
           </div>
        </div>

        {/* Member Sidebar: Leaderboard & Social Proof */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
           <div className="card !p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   Global Rank <Crown size={14} className="text-amber-500" />
                </h4>
                <BenefitTag text="Motivation" tooltip="Social competition (Gamification) triggers dopamine, keeping you 4x more consistent." />
              </div>
              <div className="space-y-4">
                 {leaderboard.length === 0 ? (
                   <p className="text-[10px] text-gray-400 italic">Recalculating ranks...</p>
                 ) : leaderboard.map((u, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-amber-500 text-white shadow-glow' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'} flex items-center justify-center font-black text-[10px]`}>#{i+1}</div>
                      <div className="flex-1">
                         <p className="text-xs font-black uppercase italic text-gray-900 dark:text-white">{u.name}</p>
                         <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest">{u.xp} XP • {u.streak}🔥</p>
                      </div>
                      {i === 0 && <Star size={12} className="text-amber-500 fill-current" />}
                   </div>
                 ))}
              </div>
           </div>

           <div className="card !p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white !border-none shadow-glow">
              <TrendingUp size={24} className="mb-4 opacity-50" />
              <h4 className="font-display font-black uppercase italic text-lg leading-tight mb-2">Social Proof</h4>
              <p className="text-[10px] leading-relaxed opacity-80 mb-6 font-bold uppercase tracking-widest">
                Nodes are currently solving <span className="text-white font-black">2,450 doubts</span> every hour. Join the movement.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                  <BookOpen size={14} />
                  <span className="text-[9px] font-black uppercase">154 Notes Shared Today</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                  <Users size={14} />
                  <span className="text-[9px] font-black uppercase">12 Active Squads</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md card !p-8 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-display font-black uppercase italic">Create Study Node</h2>
                   <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleCreateGroup} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Node Name</label>
                      <input 
                        required
                        value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                        placeholder="e.g. quantum-physics-discussion" 
                        className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-primary-500/20" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label>
                      <textarea 
                        rows={3}
                        value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                        placeholder="What is this node about?" 
                        className="w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-primary-500/20 resize-none" 
                      />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${newGroup.isPrivate ? 'bg-amber-500 text-white' : 'bg-primary-500 text-white'}`}>
                            {newGroup.isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                         </div>
                         <div>
                            <p className="text-xs font-black uppercase italic">{newGroup.isPrivate ? 'Private Node' : 'Public Node'}</p>
                            <p className="text-[8px] font-medium text-gray-400 uppercase tracking-widest">Visibility status</p>
                         </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewGroup({...newGroup, isPrivate: !newGroup.isPrivate})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${newGroup.isPrivate ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newGroup.isPrivate ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                   <button type="submit" className="w-full btn-primary py-4 shadow-glow !rounded-2xl font-black uppercase italic tracking-widest">
                      Initialize Node
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

