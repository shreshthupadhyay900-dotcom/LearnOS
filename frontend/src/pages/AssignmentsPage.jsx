import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, ClipboardList, CheckCircle, Clock, XCircle, 
  Send, Loader, Sparkles, FileText, ChevronRight, 
  Award, Target, AlertCircle, Zap, Shield, 
  Terminal, ArrowRight, Timer, BarChart3, RotateCcw,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const statusConfig = {
  pending: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', icon: Clock, label: 'Active Assignment' },
  submitted: { color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600', icon: Send, label: 'Neural Parsing...' },
  graded: { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', icon: CheckCircle, label: 'Validated' },
  assigned: { color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600', icon: Shield, label: 'Faculty Assignment' },
};

const difficultyConfig = {
  novice: { color: 'text-emerald-500', label: 'Novice' },
  professional: { color: 'text-primary-500', label: 'Professional' },
  expert: { color: 'text-rose-500', label: 'Expert' },
};

// Component for the countdown timer
function AssignmentTimer({ durationMinutes, startedAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    const totalSeconds = durationMinutes * 60;
    const start = new Date(startedAt).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = totalSeconds - elapsed;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [durationMinutes, startedAt, onExpire]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft < 300; // 5 minutes

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
      isLow ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 'bg-gray-100 dark:bg-slate-800 border-white/5 text-gray-600 dark:text-gray-400'
    }`}>
      <Timer size={16} className={isLow ? 'animate-spin' : ''} />
      <span className="font-mono font-black text-lg tracking-widest">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [submitContent, setSubmitContent] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(null);

  useEffect(() => {
    if (user?.role === 'teacher') {
      navigate('/app/dashboard');
      return;
    }
    fetchAssignments();
  }, [user, navigate]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const generateAssignment = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/assignments/generate', { topic, difficulty });
      setAssignments(prev => [res.data.assignment, ...prev]);
      setShowNew(false);
      setTopic('');
    } catch (err) {
      alert('Neural link failed. Could not generate assignment.');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (id) => {
    if (!submitContent.trim()) return;
    setSubmitLoading(true);
    try {
      const res = await api.post(`/assignments/${id}/submit`, { content: submitContent });
      setAssignments(prev => prev.map(a => a._id === id ? res.data.assignment : a));
      setShowSubmitModal(null);
      setSubmitContent('');
    } catch (err) {
      alert('Assignment submission failed. Retry connection.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'completed') return a.status === 'graded';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 px-4 sm:px-6">
      {/* Header section with Stats/Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
        <div>
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[11px] font-black uppercase tracking-widest mb-4 border border-primary-500/20 shadow-glow-sm">
             <Zap size={12} fill="currentColor" /> Assignment Arena
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-gray-900 dark:text-white tracking-tighter italic uppercase leading-none">
            Assignment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium max-w-xl">
            Engage in AI-synthesized assignments tailored to your expertise. Real-time telemetry, 
            high-stakes timers, and deep neural feedback.
          </p>
        </div>

          <div className="flex items-center gap-4">
            <button onClick={fetchAssignments} className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm" title="Neural Sync">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="hidden sm:flex items-center gap-3 px-6 py-4 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 backdrop-blur-xl">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Assignments</p>
                <p className="text-xl font-display font-black text-gray-900 dark:text-white">{assignments.length}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Avg. Score</p>
                <p className="text-xl font-display font-black text-emerald-500">
                  {assignments.length ? Math.round(assignments.reduce((acc, a) => acc + (a.score || 0), 0) / assignments.length) : 0}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowNew(!showNew)} 
              className={`btn-primary flex items-center gap-3 !rounded-[24px] shadow-glow h-[64px] px-8 transition-all duration-500 ${showNew ? 'bg-rose-500 rotate-180' : ''}`}
            >
              {showNew ? <XCircle size={24} /> : <Plus size={24} />}
              <span className="font-black text-sm uppercase tracking-widest">{showNew ? '' : 'New Assignment'}</span>
            </button>
          </div>
        </div>

      {/* New Assignment Initializer */}
      <AnimatePresence>
        {showNew && (
          <motion.div 
            initial={{ opacity:0, height: 0, scale: 0.95 }} 
            animate={{ opacity:1, height: 'auto', scale: 1 }} 
            exit={{ opacity:0, height: 0, scale: 0.95 }} 
            className="overflow-hidden"
          >
            <div className="card border-primary-500/30 p-1 sm:p-2 bg-primary-500/5 backdrop-blur-3xl relative rounded-[40px]">
              <div className="p-8 sm:p-12 space-y-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-glow">
                    <Sparkles size={40} className="text-primary-500 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-display font-black uppercase italic italic tracking-tight text-gray-900 dark:text-white">Initialize Assignment Brief</h2>
                  <p className="text-gray-500 text-sm font-medium">Input a topic and our AI will engineer a high-stakes technical challenge.</p>
                </div>

                <form onSubmit={generateAssignment} className="max-w-2xl mx-auto space-y-8">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                      <Terminal size={24} />
                    </div>
                    <input 
                      autoFocus
                      placeholder="e.g. Advanced React Architecture or Docker Security" 
                      value={topic} 
                      onChange={e => setTopic(e.target.value)} 
                      required 
                      className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-white/5 focus:border-primary-500 rounded-[30px] py-8 pl-16 pr-8 text-xl font-display font-bold shadow-xl transition-all focus:ring-4 focus:ring-primary-500/10 outline-none" 
                    />
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {['novice', 'professional', 'expert'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all ${
                          difficulty === lvl 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-glow scale-110' 
                          : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 text-gray-400 hover:border-primary-500/50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !topic.trim()} 
                    className="w-full btn-primary h-20 !rounded-[30px] flex items-center justify-center gap-4 text-lg shadow-glow-primary transition-all active:scale-95 disabled:opacity-50 group"
                  >
                    {loading ? (
                      <Loader size={28} className="animate-spin" />
                    ) : (
                      <>
                        <Zap size={24} /> 
                        <span className="font-black uppercase tracking-widest italic">Engage Neural Link</span>
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        {['all', 'pending', 'completed'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === t ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 gap-8">
        {filteredAssignments.length === 0 && !loading && (
           <div className="card p-32 text-center flex flex-col items-center justify-center border-dashed border-2 opacity-60">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                <ClipboardList size={48} className="text-gray-300" />
              </div>
              <p className="font-display font-black text-2xl uppercase tracking-widest italic text-gray-400">Assignment Zero</p>
              <p className="text-sm mt-3 font-medium text-gray-500">No active assignments detected. Initialize one above.</p>
           </div>
        )}

        {filteredAssignments.map((a, i) => {
          const isGraded = a.status === 'graded';
          const isPending = a.status === 'pending';
          const st = a.assignedBy && isPending ? statusConfig.assigned : (statusConfig[a.status] || statusConfig.pending);
          const diff = difficultyConfig[a.difficulty] || difficultyConfig.professional;
          const StatusIcon = st.icon;
          const teacherName = a.assignedBy?.name || 'Faculty';

          return (
            <motion.div 
              key={a._id} 
              initial={{ opacity:0, y: 30 }} 
              animate={{ opacity:1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              className={`card p-0 overflow-hidden group border-2 ${isGraded ? 'border-emerald-500/10' : 'border-white/5'} hover:border-primary-500/20 transition-all rounded-[32px]`}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left Side: Header & Info */}
                <div className="flex-1 p-8 sm:p-10 space-y-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex gap-5">
                      <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110 duration-500 ${
                        isGraded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-primary-500/10 border-primary-500/20 text-primary-500'
                      }`}>
                        {isGraded ? <Award size={32} /> : <Zap size={32} />}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${diff.color}`}>{diff.label}</span>
                           <div className="w-1 h-1 rounded-full bg-gray-300" />
                           <span className="text-[10px] font-bold text-gray-400 italic">{a.subject}</span>
                         </div>
                         <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-primary-500 transition-colors">{a.title}</h3>
                         <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-1">{a.description}</p>
                         {a.assignedBy && (
                           <p className="text-[10px] font-black uppercase text-indigo-500 mt-2 flex items-center gap-1">
                             <Award size={10} /> Assigned by {teacherName}
                           </p>
                         )}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-glow-sm ${st.color}`}>
                         <StatusIcon size={12} fill="currentColor" /> {st.label}
                      </span>
                      {isGraded && (
                        <div className="text-4xl font-display font-black text-emerald-500 drop-shadow-sm">{a.grade}</div>
                      )}
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-4 bg-gray-50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-gray-100 dark:border-white/5 relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-white/10 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Assignment Objectives</p>
                    </div>
                     <div className="space-y-3 pt-2">
                        {(!a.tasks || a.tasks.length === 0) ? (
                          <p className="text-xs font-bold text-gray-400 italic animate-pulse">Neural synthesis in progress...</p>
                        ) : a.tasks.map((task, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                             <div className="w-5 h-5 rounded-md border-2 border-primary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <div className={`w-2 h-2 rounded-full ${isGraded ? 'bg-emerald-500' : 'bg-primary-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                             </div>
                             <span className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-tight">{task}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Pending Action: Start/Resume */}
                  {isPending && (
                    <div className="flex flex-wrap items-center gap-4">
                       <button 
                         onClick={() => setShowSubmitModal(a._id)}
                         className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-glow-primary transition-all active:scale-95"
                       >
                          <ArrowRight size={18} /> Deploy Solution
                       </button>
                       <div className="flex items-center gap-2 text-gray-400">
                          <Clock size={16} />
                          <span className="text-xs font-medium italic">{a.duration} mins allocation</span>
                       </div>
                    </div>
                  )}

                  {/* Result Summary (if graded) */}
                  {isGraded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Award size={10} /> Precision</p>
                           <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${a.analysis?.technicalAccuracy || 0}%` }} className="h-full bg-emerald-500" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1"><Target size={10} /> Completeness</p>
                          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${a.analysis?.completeness || 0}%` }} className="h-full bg-primary-500" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1"><BarChart3 size={10} /> Clarity</p>
                          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${a.analysis?.clarity || 0}%` }} className="h-full bg-amber-500" />
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Detailed Feedback (if graded) */}
                {isGraded && (
                  <div className="w-full lg:w-[400px] bg-gray-50 dark:bg-slate-800/40 p-10 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-white/5 space-y-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">AI Intelligence Report</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">"{a.feedback}"</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Neural Strengths</p>
                           {a.strengths?.slice(0, 3).map((s, idx) => (
                             <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/5 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/10">
                                <CheckCircle size={12} /> {s}
                             </div>
                           ))}
                        </div>
                        
                        {(a.wrongAnswers && a.wrongAnswers.length > 0) && (
                          <div className="space-y-3">
                             <p className="text-[9px] font-black uppercase text-rose-600 tracking-wider">Corrective Analysis (Wrong Answers)</p>
                             {a.wrongAnswers.map((w, idx) => (
                               <div key={idx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                                  <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase">Q: {w.task}</p>
                                  <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium italic">"{w.mistake}"</p>
                                  <div className="pt-2 border-t border-rose-500/10">
                                     <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Correct Solution:</p>
                                     <p className="text-[11px] text-gray-700 dark:text-gray-200 font-bold">{w.correctSolution}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase text-primary-600 tracking-wider">Vector Improvements</p>
                           {a.improvements?.slice(0, 3).map((im, idx) => (
                             <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary-500/5 text-[11px] text-primary-700 dark:text-primary-400 font-bold border border-primary-500/10">
                                <RotateCcw size={12} /> {im}
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submission Overlay (The "Arena" View) */}
      <AnimatePresence>
        {showSubmitModal && (() => {
          const activeAssignment = assignments.find(a => a._id === showSubmitModal);
          if (!activeAssignment) return null;

          return (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col"
            >
              {/* Header */}
              <div className="h-20 border-b border-gray-100 dark:border-white/10 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-lg uppercase italic tracking-tighter text-gray-900 dark:text-white">{activeAssignment.title}</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{activeAssignment.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <AssignmentTimer 
                    durationMinutes={activeAssignment.duration} 
                    startedAt={activeAssignment.createdAt} 
                    onExpire={() => console.log('Assignment Time Expired')}
                  />
                  <button 
                    onClick={() => setShowSubmitModal(null)}
                    className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              {/* Workspace */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Mission Brief */}
                <div className="w-full lg:w-[380px] border-r border-gray-100 dark:border-white/10 p-10 overflow-y-auto bg-gray-50 dark:bg-slate-900/50">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Assignment Briefing</p>
                      <h3 className="text-xl font-display font-black italic uppercase leading-tight text-gray-900 dark:text-white">Strategic Objectives</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{activeAssignment.description}</p>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Checklist</p>
                       <div className="space-y-4">
                          {activeAssignment.tasks?.map((t, idx) => (
                            <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-white/5 shadow-sm group">
                              <div className="w-6 h-6 rounded-lg border-2 border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary-500 transition-colors">
                                 <div className="w-2 h-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal">{t}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                       <div className="flex items-center gap-2 text-amber-500">
                         <AlertCircle size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Protocol Warning</span>
                       </div>
                       <p className="text-[11px] text-amber-700 dark:text-amber-500 font-medium leading-relaxed italic">
                         "Our neural net evaluates precision over quantity. Focus on addressing all tasks with maximum clarity."
                       </p>
                    </div>
                  </div>
                </div>

                {/* Right: Code/Text Editor */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 p-6 sm:p-10">
                  <div className="flex-1 relative">
                    <div className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 z-10 border border-white/5">
                       Submission_buffer_01
                    </div>
                    <textarea
                      placeholder="Engineer your solution here... Use structured markdown or pseudocode if required."
                      value={submitContent}
                      onChange={e => setSubmitContent(e.target.value)}
                      className="w-full h-full bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary-500/20 rounded-[32px] p-12 pt-16 font-mono text-sm leading-relaxed outline-none transition-all resize-none shadow-inner"
                    />
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Uplink Stable</span>
                       </div>
                       <p className="text-xs text-gray-500 font-medium">Characters: {submitContent.length}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                       <button 
                         onClick={() => setShowSubmitModal(null)}
                         className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
                       >
                         Abort
                       </button>
                       <button 
                         onClick={() => submitAssignment(activeAssignment._id)}
                         disabled={submitLoading || !submitContent.trim()}
                         className="flex-[2] sm:flex-none px-12 py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 shadow-glow-primary transition-all active:scale-95 disabled:opacity-50"
                       >
                         {submitLoading ? (
                           <Loader size={20} className="animate-spin" />
                         ) : (
                           <>
                             <Send size={18} /> Initiate Neural Review
                           </>
                         )}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

