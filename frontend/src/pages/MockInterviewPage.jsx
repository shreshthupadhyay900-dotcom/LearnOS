/* eslint-disable */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Brain, Loader, RefreshCcw, Award, Sparkles, Bot, Volume2, VolumeX, CheckCircle2, XCircle, TrendingUp, Shield, ChevronRight, BarChart3, Zap, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import useVoice from '../hooks/useVoice';

const PHASES = ['intro','technical','behavioral','system_design','closing'];
const PHASE_LABELS = { intro:'Intro', technical:'Technical', behavioral:'Behavioral', system_design:'System Design', closing:'Closing' };
const COMPANIES = [
  { name:'Google', icon:'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
  { name:'Amazon', icon:'https://cdn-icons-png.flaticon.com/512/732/732177.png' },
  { name:'Meta', icon:'https://cdn-icons-png.flaticon.com/512/6033/6033716.png' },
  { name:'Microsoft', icon:'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
  { name:'Netflix', icon:'https://cdn-icons-png.flaticon.com/512/732/732228.png' },
];
const DOMAINS = ['Web Development','AI/ML','Data Science','DSA','System Design','General Technical'];
const DIFFICULTIES = [
  { id:'junior', label:'Junior', sub:'0-2 yrs', color:'text-emerald-500' },
  { id:'mid',    label:'Mid-Level', sub:'3-5 yrs', color:'text-amber-500' },
  { id:'senior', label:'Senior', sub:'6+ yrs', color:'text-rose-500' },
];

const ScoreRing = ({ value=0, color='#6366f1', size=80 }) => {
  const r=30, circ=2*Math.PI*r, fill=circ-circ*(value/100);
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-slate-700"/>
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={fill} transform="rotate(-90 35 35)" style={{transition:'stroke-dashoffset 1s ease'}}/>
      <text x="35" y="40" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{value}</text>
    </svg>
  );
};

export default function MockInterviewPage() {
  const [domain, setDomain] = useState('Web Development');
  const [company, setCompany] = useState('Google');
  const [difficulty, setDifficulty] = useState('mid');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [phase, setPhase] = useState('intro');
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [liveScores, setLiveScores] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [fetchingFeedback, setFetchingFeedback] = useState(false);
  const chatEnd = useRef(null);
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking } = useVoice();

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  const avgLiveScore = liveScores.length ? Math.round(liveScores.reduce((a,s)=>a+s.score,0)/liveScores.length) : null;

  const getFeedback = useCallback(async (id) => {
    setFetchingFeedback(true);
    try {
      const res = await api.post(`/interviews/${id}/feedback`);
      setFeedback(res.data.feedback);
    } catch(e) { console.error(e); }
    finally { setFetchingFeedback(false); }
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews/chat', { domain, company, difficulty });
      const d = res.data;
      setMessages([{ role:'interviewer', content:d.reply }]);
      setInterviewId(d.interviewId);
      setPhase(d.phase);
      setQuestionCount(d.questionCount);
      setTotalQuestions(d.totalQuestions);
      setStarted(true);
      if (voiceMode) speak(d.reply);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSend = useCallback(async (e) => {
    e?.preventDefault();
    const msg = (input.trim() || transcript.trim());
    if (!msg || loading) return;
    setInput(''); setLoading(true);
    if (voiceMode) stopSpeaking();
    setMessages(prev => [...prev, { role:'candidate', content:msg }]);
    try {
      const res = await api.post('/interviews/chat', { message:msg, interviewId, domain, company, difficulty });
      const d = res.data;
      setMessages(prev => [...prev, { role:'interviewer', content:d.reply }]);
      if (d.phase) setPhase(d.phase);
      if (d.questionCount) setQuestionCount(d.questionCount);
      if (d.answerScore) setLiveScores(prev => [...prev, d.answerScore]);
      if (voiceMode) speak(d.reply);
      if (d.status === 'completed') getFeedback(d.interviewId);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [input, transcript, loading, interviewId, domain, company, difficulty, voiceMode, speak, stopSpeaking, getFeedback]);

  useEffect(() => {
    if (!isListening && transcript.trim() && voiceMode) handleSend();
  }, [isListening, transcript, voiceMode, handleSend]);

  // ── Feedback Screen ────────────────────────────────────────────────────────
  if (fetchingFeedback) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center">
        <Brain size={40} className="text-primary-500 animate-pulse" />
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-gray-400">Generating Intelligence Report...</p>
    </div>
  );

  if (feedback) return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="card !p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4"><Award size={36}/></div>
          <h2 className="text-3xl font-display font-black uppercase italic text-gray-900 dark:text-white">Interview Report</h2>
          <p className="text-xs font-black uppercase text-gray-400 mt-1">{domain} · {company} · {difficulty}</p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase ${
            feedback.hiringRecommendation?.includes('Strong') ? 'bg-emerald-500/10 text-emerald-600' :
            feedback.hiringRecommendation?.includes('Hire') ? 'bg-primary-500/10 text-primary-600' :
            feedback.hiringRecommendation?.includes('Borderline') ? 'bg-amber-500/10 text-amber-600' :
            'bg-rose-500/10 text-rose-600'}`}>
            <Shield size={12}/> {feedback.hiringRecommendation || 'Hire'}
          </div>
        </div>

        {/* Score rings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Overall', val:feedback.overallScore||0, color:'#6366f1' },
            { label:'Technical', val:feedback.technicalScore||0, color:'#f59e0b' },
            { label:'Communication', val:feedback.communicationScore||0, color:'#10b981' },
            { label:'Problem Solving', val:feedback.problemSolvingScore||0, color:'#ec4899' },
          ].map(s=>(
            <div key={s.label} className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5">
              <ScoreRing value={s.val} color={s.color}/>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overall Feedback */}
        <div className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10 mb-8">
          <h4 className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 mb-2 flex items-center gap-2"><Brain size={14}/> Evaluator Summary</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{feedback.overallFeedback}"</p>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <h4 className="text-xs font-black uppercase text-emerald-600 mb-4 flex items-center gap-2"><CheckCircle2 size={14}/> Strengths</h4>
            <ul className="space-y-2">
              {(feedback.pros||[]).map((p,i)=>(
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"/>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/15">
            <h4 className="text-xs font-black uppercase text-rose-600 mb-4 flex items-center gap-2"><XCircle size={14}/> Areas to Improve</h4>
            <ul className="space-y-2">
              {(feedback.cons||[]).map((c,i)=>(
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"/>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Knowledge Gaps & Mistakes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {(feedback.knowledgeGaps||[]).length > 0 && (
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2"><Brain size={12}/> Knowledge Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {feedback.knowledgeGaps.map((g,i)=>(
                  <span key={i} className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">{g}</span>
                ))}
              </div>
            </div>
          )}

          {(feedback.mistakesRecap||[]).length > 0 && (
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2"><Zap size={12}/> Mistakes Log</h4>
              <div className="space-y-3">
                {feedback.mistakesRecap.map((m,i)=>(
                  <div key={i} className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate">Q: {m.question}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{m.mistake}</p>
                      {m.isResolved ? 
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">Resolved</span> :
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[8px] font-black uppercase">Unresolved</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={()=>window.location.reload()} className="btn-primary w-full py-4 !rounded-2xl flex items-center justify-center gap-2">
          <RefreshCcw size={16}/> Start New Interview
        </button>
      </motion.div>
    </div>
  );

  // ── Setup Screen ───────────────────────────────────────────────────────────
  if (!started) return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-2">
          <Brain className="w-3 h-3"/> Career Simulator
        </div>
        <h1 className="text-4xl font-display font-black uppercase italic text-gray-900 dark:text-white">AI Mock Interview</h1>
        <p className="text-sm text-gray-500 mt-1">Professional-grade structured interviews with real analysis.</p>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="card !p-8 space-y-8">
        {/* Domain */}
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Domain</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DOMAINS.map(d=>(
              <button key={d} onClick={()=>setDomain(d)} className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${domain===d?'bg-primary-500 text-white shadow-glow':'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Target Company</p>
          <div className="grid grid-cols-5 gap-3">
            {COMPANIES.map(c=>(
              <button key={c.name} onClick={()=>setCompany(c.name)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${company===c.name?'bg-primary-500/10 border-primary-500':'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-gray-300'}`}>
                <img src={c.icon} alt={c.name} className="w-7 h-7 object-contain" style={{filter: company===c.name?'none':'grayscale(100%) opacity(0.4)'}}/>
                <span className={`text-[8px] font-black uppercase ${company===c.name?'text-primary-600':'text-gray-400'}`}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Experience Level</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d=>(
              <button key={d.id} onClick={()=>setDifficulty(d.id)} className={`p-4 rounded-2xl border text-left transition-all ${difficulty===d.id?'bg-primary-500/10 border-primary-500':'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-gray-300'}`}>
                <p className={`text-xs font-black ${difficulty===d.id?'text-primary-600':d.color}`}>{d.label}</p>
                <p className="text-[9px] text-gray-400 font-medium mt-0.5">{d.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voice toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/5">
          <div>
            <p className="text-xs font-black text-gray-700 dark:text-gray-200">Voice Mode</p>
            <p className="text-[10px] text-gray-400">AI speaks questions aloud</p>
          </div>
          <button onClick={()=>setVoiceMode(v=>!v)} className={`p-3 rounded-xl transition-all ${voiceMode?'bg-primary-500 text-white shadow-glow':'bg-white dark:bg-slate-700 text-gray-400 shadow-sm'}`}>
            {voiceMode?<Volume2 size={18}/>:<VolumeX size={18}/>}
          </button>
        </div>

        <button onClick={startInterview} disabled={loading} className="btn-primary w-full py-4 !rounded-2xl flex items-center justify-center gap-3 shadow-glow">
          {loading?<><Loader className="animate-spin" size={18}/> Initializing...</>:<><Sparkles size={18}/> Start Interview</>}
        </button>
      </motion.div>
    </div>
  );

  // ── Interview Screen ───────────────────────────────────────────────────────
  const phaseIdx = PHASES.indexOf(phase);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 space-y-4">
      {/* Header + Phase bar */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white">Live Interview</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase">{domain} · {company} · {difficulty}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Zap size={12} className="text-emerald-500 animate-pulse"/>
          <span className="text-[10px] font-black uppercase text-emerald-600">Q {questionCount}/{totalQuestions}</span>
        </div>
      </div>

      {/* Phase progress */}
      <div className="card !p-4">
        <div className="flex items-center gap-2">
          {PHASES.map((p,i)=>(
            <div key={p} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 flex flex-col items-center gap-1 ${i<=phaseIdx?'opacity-100':'opacity-30'}`}>
                <div className={`h-1.5 w-full rounded-full transition-all ${i<phaseIdx?'bg-emerald-500':i===phaseIdx?'bg-primary-500 animate-pulse':'bg-gray-200 dark:bg-slate-700'}`}/>
                <span className={`text-[8px] font-black uppercase hidden md:block ${i===phaseIdx?'text-primary-500':'text-gray-400'}`}>{PHASE_LABELS[p]}</span>
              </div>
              {i<PHASES.length-1 && <ChevronRight size={10} className={`text-gray-300 dark:text-slate-600 shrink-0 ${i<phaseIdx?'text-emerald-400':''}`}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{height:'60vh'}}>
        {/* Chat */}
        <div className="lg:col-span-8 flex flex-col card !p-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${isSpeaking?'bg-primary-500 animate-pulse':'bg-emerald-500'} flex items-center justify-center text-white`}>
              <Bot size={14}/>
            </div>
            <span className={`text-[10px] font-black uppercase italic ${isSpeaking?'text-primary-600':'text-emerald-600'}`}>
              {isSpeaking?'Speaking...':'Interviewer Active'}
            </span>
            <button onClick={()=>{setVoiceMode(v=>!v);if(voiceMode)stopSpeaking();}} className={`ml-auto p-1.5 rounded-lg ${voiceMode?'bg-primary-500 text-white':'bg-gray-200 dark:bg-slate-800 text-gray-500'}`}>
              {voiceMode?<Volume2 size={14}/>:<VolumeX size={14}/>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
            <AnimatePresence>
              {messages.map((m,i)=>(
                <motion.div key={i} initial={{opacity:0,x:m.role==='interviewer'?-20:20}} animate={{opacity:1,x:0}} className={`flex ${m.role==='interviewer'?'justify-start':'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${m.role==='interviewer'?'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-none':'bg-primary-500 text-white rounded-tr-none shadow-glow-soft'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5">
                  {[0,75,150].map(d=><div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
                </div>
              </div>
            )}
            <div ref={chatEnd}/>
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900">
            <div className="flex gap-2">
              <button type="button" onClick={()=>isListening?(stopListening()):(stopSpeaking(),startListening())} className={`p-3 rounded-xl transition-all ${isListening?'bg-rose-500 text-white animate-pulse':'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                {isListening?<MicOff size={18}/>:<Mic size={18}/>}
              </button>
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type or speak your answer..." className="flex-1 bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"/>
              <button type="submit" disabled={loading} className="p-3 bg-primary-500 text-white rounded-xl shadow-glow hover:scale-105 transition-transform disabled:opacity-50">
                <Send size={18}/>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto">
          {/* Live Telemetry */}
          <div className="card">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center justify-between">Live Telemetry <BarChart3 size={12}/></h4>
            <div className="space-y-4">
              {avgLiveScore !== null ? (
                <>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1.5">
                      <span>Avg Answer Quality</span>
                      <span className={avgLiveScore>=75?'text-emerald-500':avgLiveScore>=50?'text-amber-500':'text-rose-500'}>{avgLiveScore}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${avgLiveScore>=75?'bg-emerald-500':avgLiveScore>=50?'bg-amber-500':'bg-rose-500'}`} style={{width:`${avgLiveScore}%`}} animate={{width:`${avgLiveScore}%`}}/>
                    </div>
                  </div>
                  {liveScores.length > 0 && (() => {
                    const last = liveScores[liveScores.length-1];
                    return (
                      <>
                        {[['Technical Accuracy', last.technicalAccuracy,'bg-primary-500'],['Clarity', last.clarity,'bg-amber-500'],['Depth', last.depth,'bg-emerald-500']].map(([label,val,cls])=>(
                          <div key={label}>
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1.5">
                              <span>{label}</span><span>{val}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div className={`h-full rounded-full ${cls}`} style={{width:`${val}%`}} animate={{width:`${val}%`}}/>
                            </div>
                          </div>
                        ))}
                        {last.mistakeFound && (
                          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 mt-2">
                            <p className="text-[9px] font-black uppercase text-rose-500 mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Evaluator Note</p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug">{last.mistakeFound}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-4">
                  <TrendingUp size={24} className="text-gray-300 dark:text-slate-600 mx-auto mb-2"/>
                  <p className="text-[10px] text-gray-400 font-medium">Scores appear after your first answer</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-slate-900 text-white border-none">
            <h4 className="text-xs font-black uppercase italic text-amber-500 mb-2">Pro Tip</h4>
            <p className="text-xs opacity-80 font-medium leading-relaxed">
              {phase==='behavioral'
                ? 'Use the STAR method: Situation → Task → Action → Result. Be specific with measurable outcomes.'
                : phase==='system_design'
                ? 'Start with requirements, then scale estimates, then high-level design before deep-diving.'
                : 'Think aloud! Interviewers value your problem-solving process over just the final answer.'}
            </p>
          </div>

          {/* End early */}
          <button onClick={()=>getFeedback(interviewId)} className="w-full p-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all border border-rose-500/20 flex items-center justify-between">
            End & Get Report <Award size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

