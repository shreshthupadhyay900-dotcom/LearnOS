import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Target, ChevronRight, HelpCircle, 
  CheckCircle2, XCircle, Trophy, Star, ArrowRight,
  Flame, TrendingUp, RefreshCw, Sparkles, Brain, Loader,
  Shield, BookOpen, RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TOPICS = ['Data Structures', 'Algorithms', 'Web Development', 'System Design', 'Core Java', 'Database Management'];

export default function QuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('list'); // list, setup, quiz, result
  const [history, setHistory] = useState([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [streak, setStreak] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'teacher') {
      navigate('/app/dashboard');
      return;
    }
    if (phase === 'list') fetchHistory();
  }, [phase, user, navigate]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/quiz/history');
      setHistory(res.data.quizzes || []);
    } catch (err) {
      console.error('History fetch failed:', err);
    }
  };

  const submitQuiz = useCallback(async (finalAnswers = answers) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await api.post('/quiz/submit', {
        quizId: quiz?._id,
        answers: Object.values(finalAnswers),
        timeTaken: Math.round((Date.now() - startTime) / 1000)
      });
      setResult(res.data);
      setPhase('result');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [answers, quiz, startTime]);

  const handleAutoSkip = useCallback(() => {
    setAnswers(prev => ({ ...prev, [currentIdx]: "" }));
    if (currentIdx < quiz?.questions?.length - 1) {
      setCurrentIdx(p => p + 1);
    } else {
      submitQuiz({});
    }
  }, [currentIdx, quiz, submitQuiz]);

  useEffect(() => {
    if (phase === 'quiz' && quiz && !result && !loading) {
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            handleAutoSkip();
            return 30;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quiz, currentIdx, phase, result, loading, handleAutoSkip]);

  const startNewQuiz = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/quiz/create', { topic, difficulty });
      launchQuiz(res.data.quiz);
    } catch (err) {
      alert('Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const launchQuiz = (quizData) => {
    setQuiz(quizData);
    setAnswers({});
    setCurrentIdx(0);
    setStartTime(Date.now());
    setStreak(0);
    setPhase('quiz');
  };

  const startAssignedQuiz = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/quiz/${id}`);
      launchQuiz(res.data.quiz);
    } catch (err) {
      alert('Could not load assigned quiz.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: answer }));
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────────
  if (phase === 'list') return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-primary-500/10 shadow-glow-sm">
            <Target size={12} fill="currentColor" /> Neural Assessments
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tighter leading-none">
            Quiz <span className="text-primary-500">Arena</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Validated knowledge tracking for elite learners.</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={fetchHistory} className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-500 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm" title="Neural Sync">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button onClick={() => setPhase('setup')} 
            className="btn-primary h-16 px-8 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-glow transition-all active:scale-95">
            <Sparkles size={18} /> Generate New Mission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Pending / Assigned Section */}
        {history.some(q => q.status === 'pending') && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 px-2">
              <Clock size={12} /> Active Deployments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.filter(q => q.status === 'pending').map((q, i) => (
                <motion.div key={q._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card !p-6 border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40 transition-all group relative overflow-hidden cursor-pointer"
                  onClick={() => startAssignedQuiz(q._id)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-glow-sm">
                      <Zap size={20} />
                    </div>
                    {q.assignedBy && (
                      <span className="text-[9px] font-black uppercase text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-100">Faculty Mission</span>
                    )}
                  </div>
                  <h4 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{q.topic}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{q.difficulty}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{q.totalQuestions} Sectors</span>
                  </div>
                  {q.assignedBy && (
                    <p className="text-[9px] font-black text-indigo-500 uppercase mt-4 flex items-center gap-1.5 italic">
                      <Shield size={10} /> Authorized by Prof. {q.assignedBy.name}
                    </p>
                  )}
                  <div className="mt-6 flex items-center justify-between text-indigo-500 font-black uppercase text-[10px] tracking-widest">
                    Engage Neural Link
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 px-2">
            <RotateCcw size={12} /> Neural Logs
          </h3>
          <div className="card !p-0 overflow-hidden divide-y divide-gray-50 dark:divide-white/5 border-white/5">
            {history.filter(q => q.status === 'completed').length === 0 ? (
              <div className="p-16 text-center opacity-40">
                <Brain size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-bold text-gray-500">No logs found. Complete a mission to begin tracking performance.</p>
              </div>
            ) : history.filter(q => q.status === 'completed').map((q, i) => (
              <div key={q._id} className="flex items-center gap-4 px-8 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-xl italic ${q.score >= 80 ? 'bg-emerald-500 text-white' : q.score >= 60 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {q.score}%
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase italic tracking-tight">{q.topic}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{q.difficulty}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{q.totalQuestions} Questions</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                  <p className="text-[9px] font-black text-indigo-500 uppercase mt-0.5">{Math.floor(q.timeTaken/60)}m {q.timeTaken%60}s</p>
                </div>
                <button onClick={() => startAssignedQuiz(q._id)} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100">
                  <RotateCcw size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── SETUP VIEW ────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex items-center justify-between pt-6">
        <button onClick={() => setPhase('list')} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all">
          <ArrowLeft size={16} /> Back to Logs
        </button>
      </div>
      <div className="text-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-3">
             <Trophy size={12} /> Competitive Arena
          </div>
        <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tight leading-none mb-2">Initialize Mission</h1>
        <p className="text-sm text-gray-500 font-medium italic">Construct a customized technical assessment in seconds.</p>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card !p-8 space-y-8 shadow-glow-sm">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-[0.2em]">Target Discipline</label>
          <div className="relative group">
             <Brain className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
             <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Asynchronous Javascript" 
               className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-white/5 focus:border-primary-500 rounded-[24px] py-5 pl-14 pr-6 font-bold text-base outline-none transition-all" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 transition-all ${
                  topic === t ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:border-primary-300'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Intensity Level</label>
          </div>
          <div className="flex gap-3">
            {['easy','medium','hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  difficulty === d
                    ? 'border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400 shadow-glow-sm'
                    : 'border-gray-100 dark:border-white/5 text-gray-400 hover:border-gray-200'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startNewQuiz} disabled={!topic.trim() || loading} className="btn-primary w-full h-16 text-sm uppercase tracking-[0.2em] italic font-black shadow-glow-lg disabled:opacity-50 !rounded-[24px]">
          {loading ? <span className="flex items-center justify-center gap-3"><Loader size={20} className="animate-spin" /> Synchronizing...</span>
            : <><Sparkles size={20} /> Engage Neural Link</>}
        </button>
      </motion.div>
    </div>
  );

  // ─── QUIZ VIEW ────────────────────────────────────────────────────────────────
  if (phase === 'quiz' && quiz) {
    const q = quiz.questions[currentIdx];
    const progress = ((currentIdx + 1) / quiz.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 pt-6 px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
           <div className="flex-1 w-full">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                 <span>Sector {currentIdx + 1} of {quiz.questions.length}</span>
                 <span>{Object.keys(answers).length} Resolved</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                 <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} />
              </div>
           </div>
           <div className="flex items-center gap-3">
              {streak > 1 && (
                 <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className="flex items-center gap-1 bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic shadow-glow shadow-rose-500/30">
                    <Flame size={14} fill="currentColor" /> {streak} Streak
                 </motion.div>
              )}
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-white/20 p-2.5 px-4 rounded-2xl shadow-sm">
                <Clock size={16} className={`${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-primary-500'}`} />
                {String(Math.floor(timeLeft/60)).padStart(2,'0')}:{String(timeLeft%60).padStart(2,'0')}
              </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            className="card !p-8 sm:!p-12 space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <HelpCircle size={120} />
            </div>
            
            <div className="flex items-start gap-6 relative">
              <span className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl font-black italic shadow-glow flex-shrink-0 border border-white/20">
                {currentIdx+1}
              </span>
              <p className="text-2xl font-display font-medium text-gray-900 dark:text-white leading-relaxed tracking-tight">
                {q.text}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(opt)}
                  className={`group relative text-left p-6 rounded-[24px] border-2 transition-all duration-300 hover:translate-y-[-2px] ${
                    answers[currentIdx] === opt
                      ? 'border-primary-500 bg-primary-500/5 shadow-glow-sm'
                      : 'border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                        answers[currentIdx] === opt ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600'
                     }`}>
                        {String.fromCharCode(65+i)}
                     </span>
                     <span className="font-medium text-sm">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4">
          <button onClick={() => { if(window.confirm('Abort mission? Progress will be lost.')) setPhase('list'); }} 
            className="px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-all">
            Abort
          </button>
          <div className="flex-1 flex gap-4">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} disabled={currentIdx === 0} 
              className="btn-secondary flex-1 !py-4 font-black uppercase text-[10px] tracking-widest disabled:opacity-40">
              Previous
            </button>
            {currentIdx < quiz.questions.length - 1
              ? <button onClick={() => setCurrentIdx(p => p + 1)} className="btn-primary flex-1 !py-4 font-black uppercase text-[10px] tracking-widest shadow-glow">
                  Next <ChevronRight size={16} />
                </button>
              : <button onClick={() => submitQuiz()} disabled={submitting} className="btn-primary flex-1 !py-4 font-black uppercase text-[10px] tracking-widest bg-emerald-500 shadow-glow-accent border-none">
                  {submitting ? <Loader size={16} className="animate-spin" /> : 'Final Submission'}
                </button>
            }
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT VIEW ───────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const { score, correct, total, xpEarned, questions } = result;
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-32 pt-6 px-4">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="card !p-12 text-center relative overflow-hidden group shadow-glow-lg border-indigo-500/10">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-primary-500/5" />
           <div className="relative z-10">
              <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl shadow-glow-lg ${score >= 70 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {score >= 70 ? <Trophy size={40} /> : <Brain size={40} />}
              </div>
              <h2 className="text-7xl font-display font-black text-gray-900 dark:text-white mb-2 tracking-tighter italic leading-none">{score}%</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">{correct} / {total} Targets Destroyed</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                 <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                    <Zap size={20} fill="currentColor" className="animate-pulse" />
                    <span className="font-display font-black italic tracking-tight uppercase">+{xpEarned} XP Neural Surplus</span>
                 </div>
                 {score >= 80 && (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                       <Trophy size={20} fill="currentColor" />
                       <span className="font-display font-black italic tracking-tight uppercase">Concept Mastery Achieved</span>
                    </div>
                 )}
              </div>
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic border-t border-gray-100 dark:border-white/5 pt-8 max-w-md mx-auto">
                {score >= 80 ? '"Flawless execution. Your conceptual architecture in this domain is structurally sound."' : score >= 60 ? '"Operation successful. Minor neural inefficiencies detected. Recommend iterative calibration."' : '"Mission failure. Critical knowledge gaps identified. Initiate immediate remediation protocols."'}
              </p>
           </div>
        </motion.div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Intelligence Debrief</h3>
           <div className="grid grid-cols-1 gap-4">
             {questions.map((q2, i) => (
               <div key={i} className={`card !p-6 border-2 ${q2.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                 <div className="flex items-start gap-4">
                   <div className={`mt-1 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${q2.isCorrect ? 'bg-emerald-500 text-white shadow-glow-sm' : 'bg-rose-500 text-white shadow-glow-sm'}`}>
                     {q2.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                   </div>
                   <div className="flex-1">
                     <p className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-4">{q2.text}</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {!q2.isCorrect && (
                           <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/10">
                              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Your Input</p>
                              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{q2.userAnswer || 'Timed Out'}</p>
                           </div>
                        )}
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                           <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Verified Truth</p>
                           <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{q2.correctAnswer}</p>
                        </div>
                     </div>
                     {q2.explanation && (
                       <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                         <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">{q2.explanation}</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className="flex gap-4">
           <button onClick={() => setPhase('list')} className="flex-1 py-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
             Back to Logs
           </button>
           <button onClick={() => setPhase('setup')} className="flex-[2] btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] italic shadow-glow-lg !rounded-2xl">
             Next Mission <ArrowRight size={18} />
           </button>
        </div>
      </div>
    );
  }

  return null;
}
function ArrowLeft({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>; }
