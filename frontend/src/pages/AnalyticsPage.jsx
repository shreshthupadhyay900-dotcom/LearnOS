import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Brain, AlertTriangle, CheckCircle, Lightbulb, 
  Info, Download, Sparkles, Target, Zap, FileText, Share2,
  ShieldCheck, RefreshCcw, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import api from '../services/api';

const demoLineData = [
  { date: '2026-04-15', accuracy: 65, goal: 70 }, { date: '2026-04-16', accuracy: 72, goal: 70 },
  { date: '2026-04-17', accuracy: 68, goal: 70 }, { date: '2026-04-18', accuracy: 75, goal: 70 },
  { date: '2026-04-19', accuracy: 80, goal: 70 }, { date: '2026-04-20', accuracy: 78, goal: 70 },
  { date: '2026-04-21', accuracy: 85, goal: 70 },
];
const demoBarData = [
  { topic: 'Arrays', accuracy: 88 }, { topic: 'Recursion', accuracy: 42 },
  { topic: 'Sorting', accuracy: 75 }, { topic: 'Graphs', accuracy: 55 },
  { topic: 'Trees', accuracy: 70 }, { topic: 'DP', accuracy: 38 },
];

const demoInsights = [
  { type: 'warning', text: 'Critical Gap detected in "Dynamic Programming". Recursion fundamentals look weak.' },
  { type: 'success', text: 'Elite Accuracy in "Arrays". You are ready for Advanced Interview Prep.' },
  { type: 'tip', text: 'Switch to Morning Study blocks. Your focus time peaks at 9:00 AM.' },
  { type: 'info', text: 'Study Goal for next week: Improve Recursion score to 60%+.' },
];

const insightIcons = { warning: AlertTriangle, success: CheckCircle, tip: Lightbulb, info: Info };
const insightColors = {
  warning: 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20 text-rose-700 dark:text-rose-400',
  success: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  tip: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400',
  info: 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/20 text-primary-700 dark:text-primary-400',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-2xl px-4 py-3 shadow-2xl border-white/20 text-xs">
        <p className="text-gray-500 mb-1 font-bold">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-black text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [lineData, setLineData] = useState(demoLineData);
  const [barData, setBarData] = useState(demoBarData);
  const [insights, setInsights] = useState(demoInsights);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user?.role === 'teacher') {
          const res = await api.get('/teacher/analytics');
          setTeacherData(res.data);
        } else {
          const [prog, perf] = await Promise.all([api.get('/analytics/progress'), api.get('/analytics/performance')]);
          if (prog.data.lineData?.length) setLineData(prog.data.lineData);
          if (perf.data.barData?.length) setBarData(perf.data.barData);
          if (perf.data.insights?.length) setInsights(perf.data.insights);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const downloadReport = () => {
    const content = user?.role === 'teacher' 
      ? `LEARN OS Faculty Report\n==============================\n\nClass Performance: ${teacherData?.avgAccuracy || '82'}%\nTop Performing Topic: ${teacherData?.topTopic || 'React Hooks'}\nStudents Needing Review: ${teacherData?.atRisk?.length || 0}`
      : `LEARN OS Performance Engine Report\n==============================\n\nRank: Scholar\nAvg Accuracy: 85%\nStrengths: Arrays, Sorting\nWeak Areas: Recursion, DP\n\nAI RECOMMENDATION:\nFocus on tree traversal base cases to bridge the recursion gap.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = user?.role === 'teacher' ? 'Faculty-Intel-Report.txt' : 'My-Performance-Report.txt';
    a.click();
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
          <Loader size={32} className="text-primary-500 animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Intelligence...</p>
      </div>
    </div>
  );

  if (user?.role === 'teacher') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* Faculty Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-500/10 shadow-glow-sm">
               <ShieldCheck size={10} fill="currentColor" /> Faculty Analytics Active
            </div>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Performance <span className="text-indigo-500">Intelligence</span></h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Monitoring class-wide neural growth and AI-learning distribution.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={downloadReport} className="p-3.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all shadow-sm">
                <Download size={20} />
             </button>
             <button className="px-6 py-3.5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow-sm hover:bg-indigo-600 transition-all">
                Export Class Data
             </button>
          </div>
        </div>

        {/* Teacher Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Class Proficiency', value: `${teacherData?.avgAccuracy || 82}%`, icon: Target, color: 'indigo', sub: 'Average Score' },
            { label: 'AI Study Hours', value: `${teacherData?.totalAIHours || 148}h`, icon: Brain, color: 'primary', sub: 'Neural interaction' },
            { label: 'Active Quizzes', value: `${teacherData?.activeQuizzes || 24}`, icon: FileText, color: 'emerald', sub: 'Teacher + AI side' },
            { label: 'At Risk', value: `${teacherData?.atRisk?.length || 3}`, icon: AlertTriangle, color: 'rose', sub: 'Needs attention' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} className="card p-6 border-white/5 group hover:border-indigo-500/30 transition-all relative overflow-hidden">
               <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500 border border-${s.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                 <s.icon size={22} />
               </div>
               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{s.label}</p>
               <p className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">{s.value}</p>
               <p className="text-[10px] font-bold text-gray-500 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparison Chart: Teacher vs AI Quizzes */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
                 <RefreshCcw size={18} className="text-indigo-500" /> Source Intelligence
               </h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Score by Source</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { source: 'Faculty Quizzes', score: 86, color: '#6366f1' },
                  { source: 'AI Quiz Arena', score: 74, color: '#4f69f8' },
                  { source: 'Assignments', score: 81, color: '#10b981' }
                ]}>
                  <XAxis dataKey="source" tick={{ fontSize: 10, fontStyle: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                    if (active && payload?.[0]) return (
                      <div className="p-3 bg-white dark:bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        {payload[0].value}% Accuracy
                      </div>
                    );
                    return null;
                  }} />
                  <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={40}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#4f69f8" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
               <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium italic">
                 "Students perform <span className="font-bold underline">12% better</span> on Faculty-created material compared to the AI Quiz Arena, suggesting AI challenges are currently more rigorous."
               </p>
            </div>
          </div>

          {/* AI Learning Topics Distribution */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
                 <Sparkles size={18} className="text-primary-500" /> AI Lesson Pulse
               </h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase">Top Self-Learnt Topics</p>
            </div>
            <div className="space-y-4">
              {[
                { topic: 'React Performance', students: 18, growth: '+12%', color: 'indigo' },
                { topic: 'Docker Security', students: 12, growth: '+8%', color: 'primary' },
                { topic: 'System Design', students: 15, growth: '+15%', color: 'emerald' },
                { topic: 'GraphQL Basics', students: 8, growth: '+5%', color: 'amber' }
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 group hover:translate-x-1 transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-${t.color}-500/10 flex items-center justify-center text-${t.color}-500 font-black text-xs`}>
                    {t.topic.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{t.topic}</p>
                      <span className="text-[10px] font-black text-emerald-500">{t.growth}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-${t.color}-500 rounded-full`} style={{ width: `${(t.students/24)*100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900 dark:text-white">{t.students}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* At-Risk Student Intel */}
        <div className="card p-0 overflow-hidden border-rose-500/10 bg-rose-500/5 backdrop-blur-xl">
           <div className="px-8 py-6 border-b border-rose-500/10 flex items-center justify-between">
              <h3 className="font-display font-black uppercase italic tracking-tighter text-rose-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Neural Red Flags
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 italic">Critical Intervention Recommended</p>
           </div>
           <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Rahul S.', gap: 'DP Optimizations', score: 42, reason: 'Consecutive failures in AI Arena' },
                { name: 'Jessica M.', gap: 'Asynchronous Logic', score: 38, reason: 'High quiz latency detected' },
                { name: 'Arjun P.', gap: 'Memory Mgmt', score: 45, reason: 'Unfinished AI lessons (3)' }
              ].map((s, i) => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-[28px] border border-rose-500/20 shadow-xl space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-sm">{s.name.charAt(0)}</div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-[9px] font-black uppercase text-rose-500 tracking-tighter">{s.gap}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold text-gray-400 leading-tight italic">"{s.reason}"</p>
                      <div className="text-right">
                        <p className="text-xl font-display font-black text-rose-500">{s.score}%</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Avg Sync</p>
                      </div>
                   </div>
                   <button className="w-full py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-glow-sm">
                      Initiate Uplink
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-3">
             <Zap size={10} fill="currentColor" /> Real-time Performance
          </div>
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight italic">Performance Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-driven analysis of your conceptual mastery and learning trends.</p>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={downloadReport} className="btn-secondary py-2.5 px-5 text-xs shadow-sm bg-white dark:bg-slate-800">
              <Download size={16} /> Export Performance
           </button>
           <button className="btn-primary py-2.5 px-5 text-xs shadow-glow">
              <Share2 size={16} /> Share Milestone
           </button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Neural IQ', value: '142', sub: '+12 this week', icon: Brain, color: 'primary' },
          { label: 'Learning Streak', value: '12 Days', sub: 'Elite Tier', icon: Zap, color: 'amber' },
          { label: 'Conceptual XP', value: '12,450', sub: 'Top 5%', icon: Target, color: 'emerald' },
          { label: 'Global Rank', value: '#452', sub: 'of 25,000', icon: TrendingUp, color: 'purple' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group hover:scale-[1.02] transition-all cursor-default overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color === 'primary' ? 'indigo' : stat.color}-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-${stat.color === 'primary' ? 'indigo' : stat.color}-500/10 transition-colors`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'primary' ? 'indigo' : stat.color}-50 dark:bg-${stat.color === 'primary' ? 'indigo' : stat.color}-900/10 flex items-center justify-center text-${stat.color === 'primary' ? 'indigo' : stat.color}-600 dark:text-${stat.color === 'primary' ? 'indigo' : stat.color}-400 shadow-sm border border-${stat.color === 'primary' ? 'indigo' : stat.color}-100 dark:border-${stat.color === 'primary' ? 'indigo' : stat.color}-900/20`}>
                <stat.icon size={24} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest text-${stat.color === 'primary' ? 'indigo' : stat.color}-600/70`}>{stat.sub}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white leading-none">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Knowledge Topology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <KnowledgeGraph data={barData} />
        </div>
      </div>

      {/* Primary Mastery Graph */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card !p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            <h2 className="font-display font-bold text-gray-900 dark:text-white tracking-tight">Mastery Trajectory</h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500" /> Accuracy</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300" /> Study Goal</div>
          </div>
        </div>
        <div className="p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f69f8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f69f8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-white/5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontStyle: 'bold', fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={d => new Date(d).toLocaleDateString('en', { month:'short', day:'numeric' })} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="#4f69f8" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
              <Line type="step" dataKey="goal" name="Goal" stroke="#9ca3af" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-gray-900 dark:text-white tracking-tight">Conceptual Breakdown</h2>
            <Target size={18} className="text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={252}>
            <BarChart data={barData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-white/5" horizontal={false} />
              <XAxis type="number" domain={[0,100]} hide />
              <YAxis type="category" dataKey="topic" tick={{ fontSize: 10, fontStyle: 'bold', fill: '#9ca3af' }} axisLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.accuracy >= 70 ? '#4f69f8' : entry.accuracy >= 50 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insight Engine */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="flex flex-col gap-6">
          <div className="card flex-1 p-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-2 mb-6">
              <Brain size={20} className="text-accent-500" />
              <h2 className="font-display font-bold text-gray-900 dark:text-white tracking-tight">AI Observation Engine</h2>
            </div>
            
            <div className="space-y-4">
              {insights.map((ins, i) => {
                const Icon = insightIcons[ins.type] || Info;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + (i*0.1) }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 shadow-sm transition-all hover:translate-x-1 ${insightColors[ins.type]}`}
                  >
                    <div className="mt-0.5">
                       <Icon size={16} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed">{ins.text}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 p-4 rounded-[20px] bg-slate-900 text-white flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase text-white/50">Mastery Level</p>
                  <p className="text-lg font-display font-black text-white italic tracking-tight">BEYOND SCHOLAR</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
                  <Sparkles size={20} />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer Insight */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} className="card p-6 border-none bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow-lg overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent)]" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
               <FileText size={32} />
            </div>
            <div>
               <h4 className="text-xl font-display font-black italic mb-1 tracking-tight">Ready for your Weekly Review?</h4>
               <p className="text-sm text-white/80 font-medium">Your Performance Engine Report is ready for download. It includes a custom study plan for the next 7 days.</p>
            </div>
            <button onClick={downloadReport} className="ml-auto bg-white text-primary-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
               Get Report
            </button>
         </div>
      </motion.div>
    </div>
  );
}

