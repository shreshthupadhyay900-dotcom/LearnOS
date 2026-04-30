/* eslint-disable */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Plus, Bot, Sparkles, BookOpen, Zap, MessageSquare, Volume2, VolumeX, Target, ChevronRight, Loader, Terminal, ArrowRight, Clock } from 'lucide-react';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { LessonView, QuizView, AnalysisView } from '../components/TutorPhases';
import api from '../services/api';
import useVoice from '../hooks/useVoice';

// PHASE CONSTANTS
const PHASE = { TOPIC: 'topic', LOADING: 'loading', LESSON: 'lesson', QUIZ: 'quiz', ANALYSIS: 'analysis', CHAT: 'chat' };

const WELCOME_MSG = {
  role: 'ai',
  content: `Greetings. I am **LEARN OS**, your Distinguished Learning Mentor and Technical Architect.\n\nI am here to guide you through a mastery-level educational journey — from foundational theory to professional implementation.\n\n**Our Protocol:**\n1. 🎯 **Deep Objective**: Define the topic you wish to master.\n2. 📖 **Neural Brief**: I will architect a comprehensive, mastery-level lesson.\n3. ⚡ **Knowledge Stress-Test**: We will validate your understanding with a targeted quiz.\n4. 🧠 **Intelligence Report**: I will analyze your performance and engineer a study plan.\n\nWhat complex topic shall we master today?`,
  timestamp: Date.now()
};

const difficultyLevels = [
  { id: 'beginner', label: 'Beginner', desc: 'Fundamentals only' },
  { id: 'intermediate', label: 'Pro', desc: 'In-depth analysis' },
  { id: 'advanced', label: 'Expert', desc: 'Mastery-level depth' },
];

function Waveform() {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div key={i} className="w-1 bg-primary-500 rounded-full"
          animate={{ height: [8, 24, 12, 28, 8] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

export default function AITutorPage() {
  const [phase, setPhase] = useState(PHASE.CHAT);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [typing, setTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Learning pipeline state
  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const bottomRef = useRef(null);
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking } = useVoice();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => { api.get('/ai/chats').then(r => setChatList(r.data.chats || [])).catch(() => {}); }, []);
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);
  useEffect(() => { if (!isListening && transcript.trim() && voiceMode) sendChat(transcript); }, [isListening]);

  // ─── Chat mode ───────────────────────────────────────────────────────────────
  const sendChat = useCallback(async (msg = input) => {
    if (!msg.trim()) return;
    
    // Intent Detection: If user says "teach me about X", trigger the pipeline
    const teachMatch = msg.toLowerCase().match(/teach me (?:about )?(.+)/i);
    if (teachMatch && teachMatch[1]) {
      const topic = teachMatch[1].replace(/[.!?]$/, '').trim();
      if (topic.length > 2) {
        setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
        setInput('');
        startLearning(topic);
        return;
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
    setInput('');
    setTyping(true);
    if (voiceMode) stopSpeaking();
    try {
      const res = await api.post('/ai/chat', { message: msg, chatId });
      setChatId(res.data.chatId);
      const aiMsg = { role: 'ai', content: res.data.answer, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      if (voiceMode) speak(res.data.answer);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Neural Uplink Interrupted. Please re-establish connection.', timestamp: Date.now() }]);
    } finally {
      setTyping(false);
    }
  }, [input, chatId, voiceMode, speak, stopSpeaking]);

  // ─── Teaching pipeline ────────────────────────────────────────────────────────
  const startLearning = async (topic) => {
    const t = topic || topicInput;
    if (!t.trim()) return;
    
    // Clear previous session data
    setLesson(null);
    setQuiz(null);
    setAnalysis(null);
    
    setTopicInput(t);
    setPhase(PHASE.LOADING);
    setPipelineLoading(true);
    
    try {
      const res = await api.post('/ai/teach', { topic: t, level: difficulty });
      if (res.data.lesson) {
        setLesson(res.data.lesson);
        setPhase(PHASE.LESSON);
        if (voiceMode) speak(`Understood. Architecting a professional brief on ${t}. Let's begin.`);
      } else {
        throw new Error('Invalid lesson data');
      }
    } catch (err) {
      alert(err.message || 'Failed to synthesize lesson. The Neural Network might be overloaded.');
      setPhase(PHASE.CHAT);
    } finally {
      setPipelineLoading(false);
    }
  };

  const startQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await api.post('/ai/lesson-quiz', { topic: topicInput, lessonContent: lesson });
      setQuiz(res.data.quiz);
      setPhase(PHASE.QUIZ);
    } catch {
      alert('Failed to generate quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async (answers) => {
    setAnalysisLoading(true);
    try {
      const res = await api.post('/ai/analyze', { topic: topicInput, questions: quiz.questions, userAnswers: answers });
      setAnalysis(res.data.analysis);
      setPhase(PHASE.ANALYSIS);
    } catch {
      alert('Failed to analyze results.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const resetPipeline = (newTopic = '') => {
    setLesson(null); setQuiz(null); setAnalysis(null);
    if (newTopic) { setTopicInput(newTopic); startLearning(newTopic); }
    else { setTopicInput(''); setPhase(PHASE.CHAT); }
  };

  const toggleMic = () => { if (isListening) stopListening(); else { stopSpeaking(); startListening(); } };
  const newChat = () => { setMessages([WELCOME_MSG]); setChatId(null); resetPipeline(); };

  return (
    <div className="flex h-[calc(100vh-4.5rem-2rem)] gap-4 max-w-7xl mx-auto px-4 lg:px-0">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-64 glass rounded-[32px] overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50">
          <button onClick={newChat} className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 rounded-2xl">
            <Plus size={16} /> New Session
          </button>
        </div>

        {/* Phase Nav (if in pipeline) */}
        {phase !== PHASE.CHAT && phase !== PHASE.TOPIC && (
          <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 mb-3">Learning Pipeline</p>
            {[
              { id: PHASE.LESSON, label: 'Lesson', icon: BookOpen },
              { id: PHASE.QUIZ, label: 'Quiz', icon: Target },
              { id: PHASE.ANALYSIS, label: 'Analysis', icon: Zap },
            ].map(({ id, label, icon: Icon }) => (
              <div key={id} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${phase === id ? 'bg-primary-500 text-white' : lesson && (id === PHASE.QUIZ || id === PHASE.ANALYSIS) && quiz ? 'text-emerald-500' : 'text-gray-400'}`}>
                <Icon size={14} /> {label}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chatList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs px-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3"><MessageSquare size={20} className="opacity-30" /></div>
              <p className="font-medium">No previous sessions.</p>
            </div>
          ) : chatList.map(chat => (
            <button key={chat._id} onClick={() => setChatId(chat._id)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all ${chatId === chat._id ? 'bg-primary-500 text-white shadow-glow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
              <p className="truncate font-bold">{chat.title || 'New Chat'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col glass rounded-[32px] overflow-hidden shadow-glow-lg border border-white/50 dark:border-white/5">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shrink-0">
          <div className="relative">
            <div className={`w-12 h-12 rounded-[20px] ${isSpeaking ? 'bg-primary-500 animate-pulse' : 'bg-gradient-primary'} flex items-center justify-center shadow-glow`}>
              <Bot size={24} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              LEARN OS <Sparkles size={14} className="text-amber-500 fill-current" />
              {phase !== PHASE.CHAT && <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-lg">{topicInput}</span>}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${pipelineLoading || analysisLoading || quizLoading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {phase === PHASE.LOADING ? 'Generating Lesson...' : phase === PHASE.LESSON ? 'Teaching Mode' : phase === PHASE.QUIZ ? 'Quiz Mode' : phase === PHASE.ANALYSIS ? 'Analysis Mode' : isSpeaking ? 'Speaking...' : 'AI Mentor Active'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase !== PHASE.CHAT && (
              <button onClick={() => resetPipeline()} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase">Exit</button>
            )}
            <button onClick={() => { setVoiceMode(v => !v); if (voiceMode) stopSpeaking(); }}
              className={`p-2.5 rounded-xl transition-all ${voiceMode ? 'bg-primary-500 text-white shadow-glow' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'}`}>
              {voiceMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* LOADING */}
            {phase === PHASE.LOADING && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-8 text-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-[40px] bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <Loader size={48} className="text-primary-500 animate-spin" />
                  </div>
                  <div className="absolute inset-0 border-2 border-primary-500/20 rounded-[40px] animate-ping" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black uppercase italic text-gray-900 dark:text-white">Synthesizing Neural Brief</h3>
                  <p className="text-sm text-gray-500 font-medium">AI is engineering your personalized lesson on <span className="text-primary-500 font-bold">"{topicInput}"</span></p>
                </div>
                <div className="flex gap-6">
                  {['Researching', 'Structuring', 'Optimizing'].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <motion.div className="w-2 h-2 rounded-full bg-primary-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* LESSON */}
            {phase === PHASE.LESSON && lesson && (
              <motion.div key="lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                {/* Key Takeaways Banner */}
                <div className="mb-6 p-5 bg-primary-500/5 border border-primary-500/10 rounded-[24px]">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles size={16} className="text-primary-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Overview</span>
                    <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-gray-400"><Clock size={12} /> {lesson.estimatedReadTime} min read</div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{lesson.overview}</p>
                </div>
                <LessonView 
                  lesson={lesson} 
                  onStartQuiz={startQuiz} 
                  quizLoading={quizLoading} 
                  speak={speak} 
                  stopSpeaking={stopSpeaking} 
                  voiceMode={voiceMode} 
                />
              </motion.div>
            )}

            {/* QUIZ */}
            {phase === PHASE.QUIZ && quiz && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QuizView quiz={quiz} onSubmit={submitQuiz} submitting={analysisLoading} />
              </motion.div>
            )}

            {/* ANALYSIS */}
            {phase === PHASE.ANALYSIS && analysis && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalysisView 
                  analysis={analysis} 
                  topic={topicInput} 
                  onRetake={() => setPhase(PHASE.QUIZ)} 
                  onNewTopic={resetPipeline} 
                  speak={speak} 
                  voiceMode={voiceMode} 
                />
              </motion.div>
            )}

            {/* CHAT */}
            {phase === PHASE.CHAT && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} isUser={msg.role === 'user'} onSpeak={() => speak(msg.content)} />
                ))}
                {typing && <TypingIndicator />}
                <div ref={bottomRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Footer */}
        {(phase === PHASE.CHAT) && (
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0 space-y-4">
            {/* Topic Launch Bar */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-100 dark:bg-slate-900/50 rounded-[32px] items-center border border-gray-200 dark:border-white/5 shadow-inner">
              <div className="flex-1 flex items-center gap-3 px-4 w-full">
                <Terminal size={18} className="text-primary-500 shrink-0" />
                <input
                  value={topicInput}
                  onChange={e => setTopicInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && topicInput.trim()) startLearning(topicInput); }}
                  placeholder="Master any topic (e.g. 'Kubernetes Architecture')"
                  className="flex-1 bg-transparent text-sm font-bold outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-white/10 shrink-0">
                {difficultyLevels.map(d => (
                  <button key={d.id} onClick={() => setDifficulty(d.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === d.id ? 'bg-primary-500 text-white shadow-glow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>{d.label}</button>
                ))}
              </div>
              <button onClick={() => startLearning(topicInput)} disabled={!topicInput.trim() || pipelineLoading}
                className="w-full sm:w-auto btn-primary px-8 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 shrink-0">
                {pipelineLoading ? <Loader size={16} className="animate-spin" /> : <><Zap size={16} /> Teach Me</>}
              </button>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder={isListening ? "Listening..." : "Or just ask me anything..."}
                  rows={1} className={`input-field resize-none py-4 px-5 max-h-32 shadow-sm ${isListening ? 'border-primary-500 ring-4 ring-primary-500/10' : ''}`}
                  style={{ minHeight: '56px' }} />
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic}
                className={`p-4 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                <Mic size={22} className={isListening ? 'animate-pulse' : ''} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => sendChat()} disabled={!input.trim() || typing}
                className="btn-primary w-14 h-14 rounded-2xl p-0 shadow-lg disabled:opacity-50">
                <Send size={22} className="ml-1" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

