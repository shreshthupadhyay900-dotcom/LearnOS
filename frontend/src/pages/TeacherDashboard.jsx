import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, ClipboardList, MessageSquare, TrendingUp, 
  Zap, ShieldCheck, CheckCircle, Clock, AlertCircle,
  BarChart3, BookOpen, Loader, ChevronRight, Award, Target
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotesSection from '../components/NotesSection';

const statusStyle = {
  graded:    { cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Graded' },
  pending:   { cls: 'text-amber-500  bg-amber-500/10  border-amber-500/20',  label: 'Pending' },
  submitted: { cls: 'text-blue-500   bg-blue-500/10   border-blue-500/20',   label: 'Submitted' },
  completed: { cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Completed' },
};

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/teacher/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Teacher dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Loader size={32} className="text-indigo-500 animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Faculty Intel...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const activity = data?.activity || [];

  const statCards = [
    { label: 'Enrolled Students', value: stats.totalStudents ?? 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20', delta: '+2 this week' },
    { label: 'Student Growth', value: stats.missionsDeployed ?? 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', delta: 'Total active sessions' },
    { label: 'Avg Performance', value: stats.avgClassPerformance ? `${stats.avgClassPerformance}%` : 'N/A', icon: Target, color: 'text-primary-500', bg: 'bg-primary-500/10 border-primary-500/20', delta: 'Class average' },
    { label: 'Unread Doubts', value: stats.pendingDoubts ?? 0, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', delta: 'Needs response', alert: stats.pendingDoubts > 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-500/10">
            <ShieldCheck size={10} fill="currentColor" /> Faculty Session Active
          </div>
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter italic uppercase leading-none">
            Teacher <span className="text-indigo-500">Command</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Welcome back, <span className="text-indigo-500 font-bold">{user?.name}</span>. Here's your class intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/students')} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-glow-sm transition-all active:scale-95">
            <Users size={16} /> Manage Students
          </button>
          <button onClick={() => navigate('/app/messages')} className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:border-indigo-500/30 transition-all">
            <MessageSquare size={16} /> Uplink
            {stats.pendingDoubts > 0 && <span className="w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] flex items-center justify-center">{stats.pendingDoubts}</span>}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card p-6 border-white/5 hover:border-indigo-500/20 transition-all group relative">
            {s.alert && <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center border mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
              <s.icon size={22} />
            </div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tighter italic">{s.value}</p>
            <p className={`text-[10px] font-bold mt-1 ${s.alert ? 'text-rose-500' : 'text-gray-400'}`}>{s.delta}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 card p-0 overflow-hidden border-white/5">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
            <h3 className="font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" /> Recent Neural Activity
            </h3>
            <button onClick={() => navigate('/app/students')} className="text-[10px] font-black uppercase text-indigo-500 tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {activity.length === 0 ? (
              <div className="p-12 text-center opacity-40">
                <BarChart3 size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-bold text-gray-500">No activity yet. Deploy a mission to get started.</p>
              </div>
            ) : activity.map((item, i) => {
              const st = statusStyle[item.status] || statusStyle.pending;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-8 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => navigate('/app/students')}>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-black text-gray-400 text-sm group-hover:text-indigo-500 transition-colors shrink-0">
                    {item.student?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      <span className="text-indigo-500">{item.student}</span>
                      <span className="text-gray-400 font-medium"> {item.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.type === 'assignment' ? <ClipboardList size={10} className="text-gray-400" /> : <BookOpen size={10} className="text-gray-400" />}
                      <p className="text-[10px] font-bold text-gray-400 truncate">{item.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(item.score !== null && item.score !== undefined) && (
                      <span className="text-sm font-display font-black text-emerald-500">{item.score}%</span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${st.cls}`}>{st.label}</span>
                    <span className="text-[9px] text-gray-400 font-bold">{timeAgo(item.time)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Student Roster Preview */}
          <div className="card p-6 border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student Roster</h3>
              <button onClick={() => navigate('/app/students')} className="text-[10px] font-black text-indigo-500 uppercase tracking-wider hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {(data?.students || []).slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/app/students')}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-black group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {s.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{s.name}</p>
                    <p className="text-[9px] font-bold text-gray-400">{s.assignmentsCount ?? 0} missions</p>
                  </div>
                  {s.avgScore !== null && s.avgScore !== undefined
                    ? <span className="text-xs font-black text-emerald-500">{s.avgScore}%</span>
                    : <span className="text-[9px] text-gray-300 font-bold">No data</span>
                  }
                </div>
              ))}
              {(data?.students || []).length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">No students registered yet.</p>
              )}
            </div>
          </div>

          {/* Student Performance Pulse */}
          <div className="card p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[28px] relative overflow-hidden group border-0">
            <div className="absolute top-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Zap size={120} fill="currentColor" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 relative z-10">Neural Overview</p>
            <h3 className="text-xl font-display font-black uppercase italic tracking-tighter mb-3 relative z-10">Faculty Command</h3>
            <p className="text-sm text-indigo-100 font-medium mb-5 relative z-10 leading-relaxed">Access full student intelligence and manage deployment protocols from the students panel.</p>
            <button onClick={() => navigate('/app/students')} className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all relative z-10 flex items-center justify-center gap-2">
              <Users size={14} /> Open Students Panel
            </button>
          </div>

          {/* Performance Distribution */}
          {data?.students?.length > 0 && (
            <div className="card p-6 border-white/5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Performance Distribution</h3>
              {[
                { label: 'High (≥80%)', count: data.students.filter(s => s.avgScore >= 80).length, color: 'bg-emerald-500' },
                { label: 'Mid (60-79%)', count: data.students.filter(s => s.avgScore >= 60 && s.avgScore < 80).length, color: 'bg-amber-500' },
                { label: 'Low (<60%)', count: data.students.filter(s => s.avgScore !== null && s.avgScore < 60).length, color: 'bg-rose-500' },
                { label: 'No data', count: data.students.filter(s => s.avgScore === null || s.avgScore === undefined).length, color: 'bg-gray-300 dark:bg-slate-600' },
              ].map((tier, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-gray-400">
                    <span>{tier.label}</span>
                    <span>{tier.count} students</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: data.students.length ? `${(tier.count / data.students.length) * 100}%` : '0%' }}
                      transition={{ delay: 0.3 + i * 0.1 }} className={`h-full ${tier.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes Repository */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <BookOpen size={20} className="text-indigo-500" />
           <h2 className="text-xl font-display font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Academic Repository</h2>
        </div>
        <div className="card p-8 border-white/5">
           <NotesSection mode="teacher" />
        </div>
      </div>
    </div>
  );
}
