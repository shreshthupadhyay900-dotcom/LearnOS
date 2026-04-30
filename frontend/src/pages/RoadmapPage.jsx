import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Calendar, CheckCircle2, Circle, 
  ChevronRight, Sparkles, Plus, Trophy,
  Rocket, BookOpen, Brain, Loader, MoreHorizontal
} from 'lucide-react';
import api from '../services/api';

export default function RoadmapPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', type: 'skill', targetDate: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals(); 
  }, [fetchGoals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await api.post('/goals/generate', newGoal);
      fetchGoals();
      setShowAdd(false);
      setNewGoal({ title: '', type: 'skill', targetDate: '' });
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const toggleTask = async (goalId, taskId, currentStatus) => {
    try {
      await api.put(`/goals/${goalId}/tasks/${taskId}`, { isCompleted: !currentStatus });
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-primary animate-pulse shadow-glow" />
      <p className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-[10px]">Scanning Neural Paths...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-1">
            <Target className="w-3 h-3" /> Mission Control
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tight">Learning Roadmaps</h1>
          <p className="text-sm text-gray-500 font-medium">AI-orchestrated pathways to mastery.</p>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="btn-primary px-6 py-3 flex items-center gap-2 shadow-glow group !rounded-2xl"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-black uppercase italic tracking-tighter text-sm">Initiate New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Roadmaps View */}
        <div className="lg:col-span-8 space-y-6">
          {goals.length === 0 ? (
            <div className="card text-center py-20 bg-gray-50/50 dark:bg-slate-900/50 border-dashed border-2">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Brain size={40} />
              </div>
              <h3 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white">No active trajectories</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Start a new goal to let the AI architect your learning path.</p>
            </div>
          ) : (
            goals.map((goal, idx) => (
              <motion.div 
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card group hover:shadow-glow-soft transition-all overflow-hidden !p-0"
              >
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 to-transparent dark:from-slate-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                          {goal.type === 'placement' ? <Rocket size={24} /> : goal.type === 'exam' ? <Trophy size={24} /> : <BookOpen size={24} />}
                       </div>
                       <div>
                          <h3 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white">{goal.title}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Calendar size={12} className="text-primary-500" /> Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-display font-black text-primary-500 italic leading-none">{goal.progress}%</p>
                       <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Efficiency</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute h-full bg-gradient-primary shadow-glow"
                      animate={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-mesh-glow">
                  {/* Milestones */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={14} className="text-amber-500" /> Neural Milestones
                    </p>
                    <div className="space-y-4">
                      {goal.milestones.map((m, i) => (
                        <div key={i} className="flex gap-4 group/m">
                           <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${m.status === 'completed' ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'border-gray-200 dark:border-white/10 text-transparent'}`}>
                                 <CheckCircle2 size={14} />
                              </div>
                              {i < goal.milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-white/5 my-2" />}
                           </div>
                           <div className="pb-4 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-black uppercase italic ${m.status === 'completed' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{m.title}</p>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${m.complexity === 'hard' ? 'bg-rose-500/10 text-rose-500' : m.complexity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                   {m.complexity}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">{m.description}</p>
                              
                              {/* Resources */}
                              {m.resources && m.resources.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {m.resources.map((res, ri) => (
                                    <a 
                                      href={res.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      key={ri}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-[9px] font-bold text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm"
                                    >
                                      {res.type === 'video' ? <Rocket size={10} /> : <BookOpen size={10} />}
                                      {res.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Tasks */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar size={14} className="text-primary-500" /> Neural Recalibration
                    </p>
                    <div className="space-y-2">
                      {goal.dailyTasks.map((t) => (
                        <button 
                          key={t._id} 
                          onClick={() => toggleTask(goal._id, t._id, t.isCompleted)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group/t ${
                            t.isCompleted 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-primary-500/50'
                          }`}
                        >
                           {t.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-gray-300 group-hover/t:text-primary-500" />}
                           <span className="text-xs font-bold flex-1">{t.text}</span>
                           <span className="text-[9px] font-black uppercase italic opacity-40">+{t.xpValue} XP</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card bg-gradient-primary text-white !border-none shadow-glow">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={20} /></div>
                <h4 className="font-display font-black uppercase italic text-lg tracking-tight">Adaptive Learning</h4>
             </div>
             <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                "Our neural engine dynamically recalibrates your milestones based on real-time performance data."
             </p>
             <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60">Avg. Progress</p>
                   <p className="text-2xl font-display font-black italic">42%</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin-slow" />
             </div>
          </div>

          <div className="card">
             <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Career Projections</h4>
             <div className="space-y-4">
                {[
                  { label: 'Cloud Architect', prob: '85%' },
                  { label: 'AI Engineer', prob: '72%' },
                  { label: 'Product Lead', prob: '64%' }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <span className="text-xs font-black uppercase italic text-gray-700 dark:text-gray-300">{p.label}</span>
                     <span className="text-xs font-display font-black text-primary-500 italic">{p.prob}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setShowAdd(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-6 mx-auto">
                   <Target size={32} />
                </div>
                <h3 className="text-2xl font-display font-black text-center uppercase italic text-gray-900 dark:text-white mb-2">Architect Trajectory</h3>
                <p className="text-sm text-gray-500 text-center mb-8">Define your objective and let the AI generate a high-fidelity path.</p>
                
                <form onSubmit={handleCreate} className="space-y-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Learning Objective</label>
                      <input 
                        required placeholder="e.g. Master Full-Stack Dev"
                        className="input-field"
                        value={newGoal.title}
                        onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Goal Vector</label>
                        <select 
                          className="input-field appearance-none"
                          value={newGoal.type}
                          onChange={e => setNewGoal({...newGoal, type: e.target.value})}
                        >
                          <option value="skill">Skill Domain</option>
                          <option value="placement">Placement</option>
                          <option value="exam">Academic Exam</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Horizon Date</label>
                        <input 
                          type="date" required className="input-field"
                          value={newGoal.targetDate}
                          onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                        />
                      </div>
                   </div>

                   <button 
                    disabled={isGenerating}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-3 !rounded-2xl shadow-glow"
                   >
                     {isGenerating ? (
                       <><Loader size={20} className="animate-spin" /> Neural Architecting...</>
                     ) : (
                       <><Sparkles size={20} /> Generate AI Roadmap</>
                     )}
                   </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

