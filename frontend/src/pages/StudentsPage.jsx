import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Target, Zap, MessageSquare, PlusCircle,
  BookOpen, ClipboardList, Loader, XCircle, CheckCircle,
  Clock, AlertTriangle, BarChart3, ChevronRight, Award, ShieldCheck, RefreshCcw,
  FileText, Star, TrendingUp, RotateCcw, Brain, CheckSquare
} from 'lucide-react';
import api from '../services/api';

const statusStyle = {
  graded:    { cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Graded' },
  pending:   { cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20',  label: 'Pending' },
  submitted: { cls: 'text-blue-500 bg-blue-500/10 border-blue-500/20',    label: 'Submitted' },
  completed: { cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Done' },
};

const gradeColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 90) return 'text-emerald-500';
  if (score >= 75) return 'text-blue-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
};

function MissionDetailModal({ mission, type, onClose }) {
  if (!mission) return null;
  const isAssignment = type === 'assignment';
  const isGraded = mission.status === 'graded' || mission.status === 'completed';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-indigo-500/20 overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4 text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isGraded ? 'bg-emerald-500 shadow-glow-accent' : 'bg-indigo-500'}`}>
              {isAssignment ? <ClipboardList size={24} /> : <BookOpen size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white leading-none">{mission.title || mission.topic}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isAssignment ? 'Assignment' : 'Quiz'} Intel Report</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"><XCircle size={24} className="text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Summary Stats */}
          {isGraded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform"><Award size={40} /></div>
                <p className="text-[9px] font-black uppercase text-emerald-600 mb-1 tracking-widest relative z-10">Final Score</p>
                <p className="text-4xl font-display font-black text-emerald-500 relative z-10">{mission.score}%</p>
              </div>
              {isAssignment ? (
                <>
                  <div className="p-5 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform"><Zap size={40} /></div>
                    <p className="text-[9px] font-black uppercase text-indigo-600 mb-1 tracking-widest relative z-10">Technical</p>
                    <p className="text-4xl font-display font-black text-indigo-500 relative z-10">{mission.analysis?.technicalAccuracy || 0}%</p>
                  </div>
                  <div className="p-5 bg-amber-500/5 rounded-[32px] border border-amber-500/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform"><BarChart3 size={40} /></div>
                    <p className="text-[9px] font-black uppercase text-amber-600 mb-1 tracking-widest relative z-10">Clarity</p>
                    <p className="text-4xl font-display font-black text-indigo-500 relative z-10">{mission.analysis?.clarity || 0}%</p>
                  </div>
                </>
              ) : (
                <>
                   <div className="p-5 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform"><Clock size={40} /></div>
                    <p className="text-[9px] font-black uppercase text-indigo-600 mb-1 tracking-widest relative z-10">Duration</p>
                    <p className="text-2xl font-display font-black text-indigo-500 mt-1 relative z-10">{Math.floor(mission.timeTaken/60)}m {mission.timeTaken%60}s</p>
                  </div>
                  <div className="p-5 bg-amber-500/5 rounded-[32px] border border-amber-500/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform"><CheckSquare size={40} /></div>
                    <p className="text-[9px] font-black uppercase text-amber-600 mb-1 tracking-widest relative z-10">Sectors</p>
                    <p className="text-4xl font-display font-black text-indigo-500 relative z-10">{mission.totalQuestions}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {isAssignment ? (
            <div className="space-y-8">
              {/* Solution Content */}
              <div className="space-y-3 text-left">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><FileText size={14} /> Student Solution</h4>
                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[28px] border border-gray-100 dark:border-white/5 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {mission.content || "No submission content available."}
                </div>
              </div>

              {/* AI Feedback */}
              {isGraded && (
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2"><Zap size={14} /> Neural Feedback</h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">"{mission.feedback}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Strengths</h4>
                      <div className="space-y-2">
                        {mission.strengths?.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                            <CheckCircle size={12} /> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Weak Points</h4>
                      <div className="space-y-2">
                        {mission.improvements?.map((im, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                            <RotateCcw size={12} /> {im}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz View */
            <div className="space-y-6 text-left">
               <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><CheckSquare size={14} /> Sector Performance</h4>
               <div className="space-y-4">
                 {mission.questions?.map((q, i) => (
                   <div key={i} className={`p-5 rounded-[24px] border-2 ${q.isCorrect ? 'border-emerald-500/10 bg-emerald-500/5' : q.userAnswer ? 'border-rose-500/10 bg-rose-500/5' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${q.isCorrect ? 'bg-emerald-500' : q.userAnswer ? 'bg-rose-500' : 'bg-gray-300'}`}>
                          {i+1}
                        </div>
                        <div className="flex-1 space-y-3">
                           <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{q.text}</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black/5">
                                 <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Student Answer</p>
                                 <p className={`text-[11px] font-bold ${q.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{q.userAnswer || 'SKIPPED/TIMED OUT'}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black/5">
                                 <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Verified Correct</p>
                                 <p className="text-[11px] font-bold text-gray-900 dark:text-white">{q.correctAnswer}</p>
                              </div>
                           </div>
                           {q.explanation && (
                             <p className="text-[10px] text-gray-500 italic font-medium leading-relaxed pt-2 border-t border-black/5">“{q.explanation}”</p>
                           )}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex justify-center">
           <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">LEARN OS Intelligence Protocol</p>
        </div>
      </motion.div>
    </div>
  );
}

function DeployModal({ student, onClose, onSuccess }) {
  const [assignType, setAssignType] = useState('assignment');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const endpoint = assignType === 'assignment' ? '/assignments/generate' : '/quiz/create';
      await api.post(endpoint, { topic, studentId: student._id, difficulty });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Deployment failed. Try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-indigo-500/20 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

        {done ? (
          <div className="relative z-10 text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-display font-black uppercase italic text-gray-900 dark:text-white">Mission Deployed!</h3>
            <p className="text-sm text-gray-500">{assignType === 'assignment' ? 'Assignment' : 'Quiz'} on <span className="text-indigo-500 font-bold">"{topic}"</span> sent to <span className="font-bold">{student.name}</span></p>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center text-xl font-black">
                  {student.name?.charAt(0)}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white">Deploy Mission</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target: {student.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                <XCircle size={22} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl gap-2">
              {[
                { id: 'assignment', label: 'Assignment', icon: ClipboardList },
                { id: 'quiz', label: 'Quiz', icon: BookOpen },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setAssignType(t.id)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${assignType === t.id ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleDeploy} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-[0.2em]">Topic</label>
                <input autoFocus placeholder="e.g. Binary Search Trees, React Hooks..."
                  value={topic} onChange={e => setTopic(e.target.value)} required
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-5 font-bold text-base outline-none focus:border-indigo-500 transition-all" />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-[0.2em]">Difficulty</label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'professional', 'expert'].map(d => (
                    <button key={d} type="button" onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${difficulty === d ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <Clock size={14} className="text-indigo-500 shrink-0" />
                <p className="text-[11px] text-gray-500 font-medium text-left">AI will generate and assign directly to {student.name}'s portal.</p>
              </div>

              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-glow transition-all active:scale-95 disabled:opacity-50">
                {loading ? <Loader size={20} className="animate-spin" /> : <><Target size={16} /> Deploy Mission</>}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StudentDetail({ student, onDeploy, onMessage, onViewMission }) {
  const overallScore = student.avgAssignmentScore ?? student.avgQuizScore ?? null;

  return (
    <div className="card border-indigo-500/20 bg-indigo-500/5 p-6 space-y-6 sticky top-24 max-h-[calc(100vh-10rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-slate-900 border border-indigo-500/10 shadow-glow flex items-center justify-center text-3xl font-display font-black text-indigo-500">
            {student.name?.charAt(0)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-sm" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">{student.name}</h2>
          <p className="text-xs text-gray-400 font-medium">{student.email}</p>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-white/10 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Missions</p>
          <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{student.assignmentsTotal ?? 0}</p>
          <p className="text-[9px] text-gray-400">{student.assignmentsPending ?? 0} pending</p>
        </div>
        <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-white/10 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg Score</p>
          <p className={`text-2xl font-display font-black ${gradeColor(overallScore)}`}>{overallScore !== null ? `${overallScore}%` : '—'}</p>
          <p className="text-[9px] text-gray-400">{student.quizzesCompleted ?? 0} quizzes done</p>
        </div>
      </div>

      {/* Recent Assignments */}
      {student.recentAssignments?.length > 0 && (
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Assignments</p>
          {student.recentAssignments.map((a, i) => {
            const st = statusStyle[a.status] || statusStyle.pending;
            return (
              <div key={i} onClick={() => onViewMission(a, 'assignment')} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:border-indigo-500/30 transition-all group">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{a.title || a.topic}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase border mt-0.5 ${st.cls}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {a.score !== null && a.score !== undefined && (
                    <span className={`text-sm font-display font-black shrink-0 ${gradeColor(a.score)}`}>{a.score}%</span>
                  )}
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Quizzes */}
      {student.recentQuizzes?.length > 0 && (
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Quizzes</p>
          {student.recentQuizzes.map((q, i) => {
            const st = statusStyle[q.status] || statusStyle.pending;
            return (
              <div key={i} onClick={() => onViewMission(q, 'quiz')} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer hover:border-indigo-500/30 transition-all group">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{q.topic}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase border mt-0.5 ${st.cls}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {q.score !== null && q.score !== undefined && (
                    <span className={`text-sm font-display font-black shrink-0 ${gradeColor(q.score)}`}>{q.score}%</span>
                  )}
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Goals */}
      {student.activeGoals?.length > 0 && (
        <div className="space-y-2 text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Active Roadmaps</p>
          {student.activeGoals.map((g, i) => (
            <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{g.title}</p>
                <span className="text-[10px] font-display font-black text-indigo-500 italic">{g.progress}%</span>
              </div>
              <div className="h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-indigo-500/10">
        <button onClick={onDeploy}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-glow-sm">
          <PlusCircle size={16} /> Deploy Mission
        </button>
        <button onClick={onMessage}
          className="w-full py-3 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-gray-100 dark:border-white/10 hover:border-indigo-500/30 transition-all active:scale-95">
          <MessageSquare size={16} /> Send Uplink Message
        </button>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMission, setViewMission] = useState(null);
  const [viewType, setViewType] = useState('assignment');
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/students');
      setStudents(res.data.students || []);
      if (res.data.students?.length > 0 && !selected) setSelected(res.data.students[0]);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMission = async (mission, type) => {
    setFetchingDetail(true);
    try {
      const endpoint = type === 'assignment' ? `/teacher/assignments/${mission._id}` : `/teacher/quizzes/${mission._id}`;
      const res = await api.get(endpoint);
      setViewMission(res.data[type]);
      setViewType(type);
    } catch (err) {
      alert('Could not fetch mission details.');
    } finally {
      setFetchingDetail(false);
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    if (filter === 'high') return matchSearch && (s.avgAssignmentScore ?? s.avgQuizScore ?? 0) >= 80;
    if (filter === 'low') return matchSearch && s.avgAssignmentScore !== null && (s.avgAssignmentScore ?? 100) < 60;
    if (filter === 'pending') return matchSearch && s.assignmentsPending > 0;
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Loader size={32} className="text-indigo-500 animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Student Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4">
       {fetchingDetail && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
             <Loader className="animate-spin text-indigo-500" size={32} />
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Retrieving Mission Intel...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-500/10">
            <ShieldCheck size={10} fill="currentColor" /> Faculty Command
          </div>
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">
            Student <span className="text-indigo-500">Intelligence</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">{students.length} enrolled students · Select to view detailed intel</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStudents} className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-xl text-gray-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all">
            <RefreshCcw size={16} />
          </button>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl py-3 pl-11 pr-5 text-sm font-bold outline-none focus:border-indigo-500 transition-all shadow-sm w-72" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All Students', count: students.length },
          { id: 'high', label: 'High Performers', count: students.filter(s => (s.avgAssignmentScore ?? s.avgQuizScore ?? 0) >= 80).length },
          { id: 'low', label: 'Needs Help', count: students.filter(s => s.avgAssignmentScore !== null && (s.avgAssignmentScore ?? 100) < 60).length },
          { id: 'pending', label: 'Has Pending', count: students.filter(s => s.assignmentsPending > 0).length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === f.id ? 'bg-indigo-500 text-white shadow-glow-sm' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 text-gray-500 hover:border-indigo-500/30'}`}>
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2 space-y-3 text-left">
          {filtered.length === 0 ? (
            <div className="card p-16 text-center border-dashed border-2 opacity-40">
              <Users size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-bold text-gray-500">No students match this filter.</p>
            </div>
          ) : filtered.map((student, i) => {
            const score = student.avgAssignmentScore ?? student.avgQuizScore;
            const isSelected = selected?._id === student._id;
            return (
              <motion.div key={student._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(student)}
                className={`card p-5 cursor-pointer border-2 transition-all group ${isSelected ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/20'}`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-black transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-glow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:text-indigo-500'}`}>
                      {student.name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base uppercase italic tracking-tighter text-gray-900 dark:text-white truncate">{student.name}</h3>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{student.email}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gray-400">
                        <ClipboardList size={10} /> {student.assignmentsTotal ?? 0} missions
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-gray-400">
                        <BookOpen size={10} /> {student.quizzesTotal ?? 0} quizzes
                      </div>
                    </div>
                  </div>

                  {/* Score + Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className={`text-2xl font-display font-black italic ${gradeColor(score)}`}>
                        {score !== null && score !== undefined ? `${score}%` : '—'}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">avg score</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={e => { e.stopPropagation(); setSelected(student); setShowModal(true); }}
                        className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all" title="Deploy Mission">
                        <PlusCircle size={14} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); navigate('/app/messages', { state: { targetContactId: student._id } }); }}
                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all" title="Send Message">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 transition-all ${isSelected ? 'text-indigo-500 translate-x-1' : 'group-hover:translate-x-1 group-hover:text-indigo-400'}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Student Detail Panel */}
        <div className="text-left">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <StudentDetail
                  student={selected}
                  onDeploy={() => setShowModal(true)}
                  onMessage={() => navigate('/app/messages', { state: { targetContactId: selected._id } })}
                  onViewMission={handleViewMission}
                />
              </motion.div>
            ) : (
              <div className="card p-12 text-center border-dashed border-2 opacity-40 flex flex-col items-center justify-center gap-4 h-80">
                <BarChart3 size={40} className="text-gray-400" />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Select a student<br />to view intelligence</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Deploy Modal */}
      <AnimatePresence>
        {showModal && selected && (
          <DeployModal student={selected} onClose={() => setShowModal(false)} onSuccess={fetchStudents} />
        )}
      </AnimatePresence>

      {/* Mission View Modal */}
      <AnimatePresence>
        {viewMission && (
          <MissionDetailModal mission={viewMission} type={viewType} onClose={() => setViewMission(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
