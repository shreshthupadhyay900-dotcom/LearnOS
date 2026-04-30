import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, BookOpen, Target, Award, Zap, RotateCcw, TrendingUp, AlertTriangle, Loader, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

// ─── Phase 1: Lesson View ─────────────────────────────────────────────────────
export function LessonView({ lesson, onStartQuiz, quizLoading, speak, stopSpeaking, voiceMode }) {
  const [activeSection, setActiveSection] = useState(0);
  const section = lesson.sections[activeSection];

  useEffect(() => {
    if (voiceMode && section) {
      // Intro prefix for the first section
      const prefix = activeSection === 0 ? `Let's begin our session on ${lesson.topic}. ` : `Moving on to ${section.title}. `;
      speak(prefix + section.content);
    }
    return () => stopSpeaking?.();
  }, [activeSection, voiceMode, section, lesson.topic]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Section Nav */}
      <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
        {lesson.sections.map((s, i) => (
          <button key={i} onClick={() => setActiveSection(i)}
            className={`shrink-0 text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeSection === i ? 'bg-primary-500 text-white shadow-glow' : 'bg-white dark:bg-slate-800 text-gray-500 hover:text-primary-500 border border-gray-100 dark:border-white/5'}`}>
            <span className="block text-[9px] uppercase tracking-widest mb-0.5 opacity-60">Step {i + 1}</span>
            {s.title}
          </button>
        ))}
        <button onClick={onStartQuiz} disabled={quizLoading}
          className="shrink-0 mt-auto btn-primary py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-glow disabled:opacity-50">
          {quizLoading ? <Loader size={14} className="animate-spin" /> : <><Zap size={14} /> Take Quiz</>}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="flex-1 bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-gray-100 dark:border-white/5 overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-black">{activeSection + 1}</div>
              <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white flex-1">{section.title}</h2>
              <button onClick={() => speak(section.content)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 transition-all">
                <Volume2 size={18} />
              </button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-primary-600 dark:prose-strong:text-primary-400">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </div>

          {section.code && (
            <div className="bg-slate-950 rounded-2xl p-5 overflow-x-auto border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Code Example</span>
              </div>
              <pre className="text-emerald-400 text-xs leading-relaxed font-mono whitespace-pre-wrap">{section.code}</pre>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-slate-800 text-gray-500 disabled:opacity-30 hover:text-gray-900 dark:hover:text-white transition-all">← Prev</button>
            {activeSection < lesson.sections.length - 1
              ? <button onClick={() => setActiveSection(activeSection + 1)} className="btn-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">Next <ChevronRight size={14} /></button>
              : <button onClick={onStartQuiz} disabled={quizLoading} className="btn-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-glow disabled:opacity-50">
                  {quizLoading ? <Loader size={14} className="animate-spin" /> : <><Zap size={14} /> Start Quiz</>}
                </button>
            }
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 2: Quiz View ───────────────────────────────────────────────────────
export function QuizView({ quiz, onSubmit, submitting }) {
  const [answers, setAnswers] = useState({});
  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
          <BookOpen size={12} /> Knowledge Check — {quiz.questions.length} Questions
        </div>
        <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">{quiz.topic}</h2>
      </div>

      {quiz.questions.map((q, qi) => (
        <motion.div key={qi} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border-2 border-gray-100 dark:border-white/5 space-y-4">
          <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">
            <span className="text-primary-500 font-black">Q{qi + 1}. </span>{q.text}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: opt }))}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all ${answers[qi] === opt ? 'bg-primary-500 border-primary-500 text-white shadow-glow' : 'bg-gray-50 dark:bg-slate-800 border-transparent hover:border-primary-500/30 text-gray-600 dark:text-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      <button onClick={() => onSubmit(Object.values(answers))} disabled={!allAnswered || submitting}
        className="w-full btn-primary h-16 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-glow disabled:opacity-50">
        {submitting ? <Loader size={24} className="animate-spin" /> : <><Target size={20} /> Submit for AI Analysis</>}
      </button>
    </div>
  );
}

// ─── Phase 3: Analysis View ───────────────────────────────────────────────────
export function AnalysisView({ analysis, topic, onRetake, onNewTopic, speak, voiceMode }) {
  const scoreColor = analysis.score >= 80 ? 'text-emerald-500' : analysis.score >= 60 ? 'text-amber-500' : 'text-rose-500';
  const priorityColor = { HIGH: 'text-rose-500 bg-rose-500/5 border-rose-500/10', MEDIUM: 'text-amber-500 bg-amber-500/5 border-amber-500/10', LOW: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' };

  useEffect(() => {
    if (voiceMode && analysis.overallFeedback) {
      speak(`Analysis complete. Your score is ${analysis.score} percent. ${analysis.overallFeedback}`);
    }
  }, [voiceMode, analysis]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Score Hero */}
      <div className="text-center py-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
          <Award size={12} /> Intelligence Report — {topic}
        </div>
        <div className={`text-8xl font-display font-black italic ${scoreColor}`}>{analysis.score}%</div>
        <div className="text-4xl font-display font-black text-gray-900 dark:text-white">{analysis.grade}</div>
        <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed italic">"{analysis.overallFeedback}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-500"><CheckCircle size={18} /><p className="text-[10px] font-black uppercase tracking-widest">Neural Strengths</p></div>
          {analysis.strongAreas?.length ? analysis.strongAreas.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{s}
            </div>
          )) : <p className="text-xs text-gray-400 italic">Keep pushing — strengths develop with practice.</p>}
        </div>

        {/* Weak Areas */}
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-500"><AlertTriangle size={18} /><p className="text-[10px] font-black uppercase tracking-widest">Weak Vectors</p></div>
          {analysis.weakAreas?.length ? analysis.weakAreas.map((w, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-rose-700 dark:text-rose-400">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />{w}
            </div>
          )) : <p className="text-xs text-emerald-500 font-bold">Excellent! No significant weak areas detected.</p>}
        </div>
      </div>

      {/* Study Plan */}
      {analysis.studyPlan?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-gray-100 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-500" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Remediation Protocol</p></div>
          <div className="space-y-3">
            {analysis.studyPlan.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${priorityColor[item.priority] || priorityColor.LOW}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${priorityColor[item.priority] || priorityColor.LOW}`}>{item.priority}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.action}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 shrink-0 ml-4">{item.timeEstimate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Topics */}
      {analysis.nextTopics?.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Recommended Next Missions</p>
          <div className="flex flex-wrap gap-3">
            {analysis.nextTopics.map((t, i) => (
              <button key={i} onClick={() => onNewTopic(t)}
                className="px-5 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-2">
                <Zap size={12} className="text-primary-500" /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={onRetake} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center gap-2">
          <RotateCcw size={16} /> Retake Quiz
        </button>
        <button onClick={() => onNewTopic('')} className="flex-[2] btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow flex items-center justify-center gap-2">
          <Zap size={16} /> New Learning Mission
        </button>
      </div>
    </div>
  );
}

