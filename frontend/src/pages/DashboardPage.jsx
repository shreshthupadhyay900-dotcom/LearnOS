import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, CheckCircle, Target, Clock, Flame, TrendingUp, 
  AlertTriangle, ChevronRight, Zap, Trophy, Star, Map,
  CheckCircle2, Circle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotesSection from '../components/NotesSection';

// Demo data enhancements
const demoStats = { 
  streak: 12, 
  xp: 4850, 
  coursesInProgress: 5, 
  completedTopics: 32, 
  accuracy: 82, 
  studyTime: 1450, 
  quizzesCompleted: 45, 
  level: 8,
  rank: 'Visionary'
};

const dailyQuests = [
  { id: 1, title: 'Morning Mastery', desc: 'Ask the AI Tutor 2 doubts', xp: 50, completed: true },
  { id: 2, title: 'Quiz Crusader', desc: 'Complete a DSA Quiz with >80%', xp: 100, completed: false },
  { id: 3, title: 'Night Owl', desc: 'Study for 30 mins after 8 PM', xp: 50, completed: false },
];

const learningPathNodes = [
  { id: 1, label: 'Arrays', status: 'completed', x: 20, y: 80 },
  { id: 2, label: 'Linked Lists', status: 'completed', x: 40, y: 30 },
  { id: 3, label: 'Trees', status: 'in-progress', x: 60, y: 70 },
  { id: 4, label: 'Graphs', status: 'locked', x: 80, y: 20 },
  { id: 5, label: 'DP Mastery', status: 'locked', x: 95, y: 60 },
];

function LearningPath({ goal }) {
  const nodes = goal ? goal.milestones.map((m, i) => ({
    id: i,
    label: m.title,
    status: m.status,
    x: 10 + (i * (90 / (goal.milestones.length || 1))),
    y: 30 + (i % 2 === 0 ? 40 : 0)
  })) : learningPathNodes;

  return (
    <div className="relative h-64 w-full bg-primary-500/5 dark:bg-primary-500/10 rounded-[32px] border border-primary-500/20 overflow-hidden p-6 group">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#4f69f8_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#9333ea_0%,transparent_50%)]" />
      </div>

      <div className="relative h-full w-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {nodes.map((node, i) => {
            if (i === nodes.length - 1) return null;
            const nextNode = nodes[i + 1];
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2={`${nextNode.x}%`} y2={`${nextNode.y}%`}
                stroke={node.status === 'completed' ? 'url(#grad-path)' : '#cbd5e1'}
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
              />
            );
          })}
          <defs>
            <linearGradient id="grad-path" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f69f8" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 group/node cursor-pointer`}
          >
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-lg ${
              node.status === 'completed' ? 'bg-primary-500 border-white text-white rotate-3 shadow-glow' :
              node.status === 'in-progress' ? 'bg-white dark:bg-slate-800 border-primary-500 text-primary-500 animate-pulse' :
              'bg-gray-200 dark:bg-slate-700 border-gray-100 dark:border-white/5 text-gray-400'
            }`}>
              {node.status === 'completed' ? <CheckCircle2 size={18} /> : 
               node.status === 'in-progress' ? <Star size={18} /> : 
               <Circle size={18} />}
              
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/node:opacity-100 transition-opacity">
                {node.label} ({node.status})
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="absolute top-4 left-6 flex items-center gap-2">
         <Map size={16} className="text-primary-500" />
         <p className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
           {goal ? `Path: ${goal.title}` : 'Personal Roadmap'}
         </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCourseClick = (course) => {
    navigate(`/app/ai-tutor?topic=${encodeURIComponent(course.title)}`);
  };

  const [currentGoal, setCurrentGoal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, w, g] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recommendations'),
          api.get('/dashboard/weak-areas'),
          api.get('/goals'),
        ]);
        setStats(s.data.stats);
        setCourses(r.data.courses);
        setWeakAreas(w.data.weakAreas);
        if (g.data.goals?.length) setCurrentGoal(g.data.goals[0]);
      } catch {
        setStats(demoStats);
        setCourses(courses.length > 0 ? courses : []);
        setWeakAreas(weakAreas.length > 0 ? weakAreas : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Rise & Shine' : hour < 17 ? 'Keep Grinding' : 'Stay Curious';

  const statCards = [
    { icon: BookOpen, label: 'Learning Goals', value: stats?.coursesInProgress ?? '—', color: 'primary', sub: '+2 this week' },
    { icon: CheckCircle, label: 'Topics Mastered', value: stats?.completedTopics ?? '—', color: 'emerald', sub: '+5 this week' },
    { icon: Target, label: 'Accuracy Score', value: stats ? `${stats.accuracy}%` : '—', color: 'purple', sub: 'Top 10%' },
    { icon: Clock, label: 'Focus Time', value: stats ? `${stats.studyTime}m` : '—', color: 'amber', sub: 'Total 📈' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 flex flex-col gap-6"
        >
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-primary p-8 text-white shadow-glow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-white/70 text-sm font-black uppercase tracking-widest mb-2">{greeting}</p>
                <h1 className="text-4xl font-display font-extrabold mb-2 tracking-tight">{user?.name} ✨</h1>
                <p className="text-white/80 text-sm font-medium">You are in the <span className="text-white font-black italic">Scholars Rank</span>. Only 240XP to the next level!</p>
              </div>

              {/* Rank visual */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20">
                 <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center rotate-6 shadow-2xl">
                    <Trophy size={32} className="text-amber-300" />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-white/60 tracking-wider">Current Rank</p>
                    <p className="text-xl font-display font-black tracking-tight">{stats?.rank || 'Scholar'}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <Zap size={10} className="fill-current text-white" />
                       <span className="text-xs font-bold">{stats?.xp || 0} Total XP</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Exp progress */}
            <div className="relative z-10 mt-8">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-white/80 tracking-widest uppercase">Rank Progression</span>
                <span className="text-white">LEVEL {stats?.level || 1} → { (stats?.level || 1) + 1 }</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full border border-white/10 p-0.5">
                <motion.div
                  className="h-full bg-white rounded-full shadow-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats?.xp || 0) % 500) / 5}%` }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Map size={20} className="text-primary-500" /> Mastery Roadmap
              </h2>
              <button className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-lg">Expand View</button>
            </div>
            <LearningPath goal={currentGoal} />
          </div>
        </motion.div>

        {/* Sidebar Quests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          {/* Daily Quests */}
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2 italic">
                <Flame size={18} className="text-rose-500 fill-current" /> Daily Quests
              </h3>
              <span className="text-[10px] font-black bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded tracking-tighter">RESET IN 4H</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {dailyQuests.map(quest => (
                <div key={quest.id} className={`p-4 rounded-2xl border transition-all ${
                  quest.completed 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 opacity-60' 
                  : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-primary-500/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${quest.completed ? 'line-through text-emerald-700 dark:text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                        {quest.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{quest.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {quest.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-slate-600" />}
                      <span className="text-[10px] font-black text-primary-600 dark:text-primary-400">+{quest.xp}XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] font-bold text-gray-500 uppercase">Weekly Milestone</p>
                 <p className="text-[10px] font-bold text-gray-900 dark:text-white">6/10</p>
               </div>
               <div className="progress-bar w-full">
                  <div className="progress-fill h-2" style={{ width: '60%' }} />
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
          : statCards.map((card) => (
              <motion.div key={card.label} variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }}>
                <StatCard {...card} delay={0} />
              </motion.div>
            ))
        }
      </motion.div>

      {/* Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Recommended For You
            </h2>
            <button className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {loading
              ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 w-62 rounded-2xl flex-shrink-0" />)
              : courses.length > 0 ? courses.map((c, i) => <CourseCard key={c._id} course={c} delay={i * 0.1} onContinue={handleCourseClick} />)
              : <p className="text-sm text-gray-500 italic p-4">No recommendations found yet...</p>
            }
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="flex items-center gap-2 mb-4 px-2">
              <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white italic">Weak Topics</h2>
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{weakAreas.length || 0} ALERT</span>
            </div>
            <div className="space-y-3">
               {weakAreas.length > 0 ? weakAreas.slice(0, 3).map((area, i) => (
                 <motion.div
                   key={area.topic}
                   initial={{ opacity: 0, y: 16 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="card p-4 !bg-amber-50/30 dark:!bg-amber-900/5 group border-amber-100 dark:border-amber-900/20"
                 >
                   <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate italic">{area.topic}</p>
                      <span className="text-xs font-black text-amber-600">{area.accuracy}%</span>
                   </div>
                   <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-amber-500" style={{ width: `${area.accuracy}%` }} />
                   </div>
                   <button className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-amber-500 text-white shadow-glow-accent group-hover:scale-[1.02] transition-transform">
                      Immediate Revision
                   </button>
                 </motion.div>
               )) : (
                 <div className="card p-8 text-center text-gray-500 italic text-sm">
                    No weak areas detected. You are a genius! 🎓
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Notes Repository */}
        <div className="lg:col-span-12 space-y-4">
           <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary-500" />
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white italic">Academic Repository</h2>
           </div>
           <div className="card p-8 border-white/5">
              <NotesSection mode="student" />
           </div>
      </div>
    </div>
  );
}

