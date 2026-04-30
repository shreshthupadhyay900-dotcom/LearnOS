import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle, XCircle, Search, Filter, 
  IndianRupee, TrendingUp, AlertCircle, FileText,
  ChevronRight, ArrowUpRight, Zap, GraduationCap
} from 'lucide-react';
import api from '../services/api';

const statusConfig = {
  'Applied': { color: 'primary', icon: Clock, label: 'Application Sent' },
  'Under Review': { color: 'amber', icon: Search, label: 'In Review' },
  'Approved': { color: 'emerald', icon: CheckCircle, label: 'Approved' },
  'Rejected': { color: 'rose', icon: XCircle, label: 'Rejected' },
  'Pending': { color: 'gray', icon: Clock, label: 'Draft' }
};

export default function ScholarshipTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/scholarships/user/applications');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const approvedFunding = applications
    .filter(app => app.status === 'Approved')
    .reduce((acc, app) => acc + (parseInt(app.scholarship?.amount.replace(/[^0-9]/g, '')) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Application Status</p>
          <h1 className="text-4xl font-display font-black tracking-tight text-gray-900 dark:text-white">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Funding</span> Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Monitor your progress and manage your educational finances.
          </p>
        </div>
        
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-6 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-glow-emerald">
              <IndianRupee size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest mb-1">Total Funding Received</p>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{approvedFunding.toLocaleString('en-IN')}</h3>
           </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
         {[
           { label: 'Total Applied', value: applications.length, color: 'primary', icon: FileText },
           { label: 'Under Review', value: applications.filter(a => a.status === 'Under Review').length, color: 'amber', icon: Search },
           { label: 'Approved', value: applications.filter(a => a.status === 'Approved').length, color: 'emerald', icon: CheckCircle },
           { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, color: 'rose', icon: XCircle }
         ].map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className={`card !p-5 border-${stat.color}-500/10 hover:border-${stat.color}-500/30 transition-all`}
           >
              <div className="flex items-center justify-between mb-2">
                 <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center text-${stat.color}-600`}>
                    <stat.icon size={20} />
                 </div>
                 <span className={`text-xl font-black text-${stat.color}-600`}>{stat.value}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
           </motion.div>
         ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4 px-2">
        <h2 className="text-lg font-display font-black text-gray-900 dark:text-white mb-4 italic">Recent Applications</h2>
        
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)
        ) : applications.length > 0 ? (
          applications.map((app, i) => {
            const config = statusConfig[app.status] || statusConfig['Pending'];
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="card !p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all border border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[2rem] bg-${config.color}-100 dark:bg-${config.color}-900/30 flex items-center justify-center text-${config.color}-600 group-hover:rotate-12 transition-transform`}>
                         {app.scholarship?.category?.[0] === 'SC' || app.scholarship?.category?.[0] === 'ST' ? <GraduationCap size={32} /> : <TrendingUp size={32} />}
                      </div>
                      <div>
                         <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                            {app.scholarship?.name}
                         </h3>
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                               <IndianRupee size={12} /> {app.scholarship?.amount}
                            </span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                               <Clock size={12} /> Applied {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-8">
                      <div className="text-right hidden md:block">
                         <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 mb-2`}>
                            <config.icon size={12} /> {config.label}
                         </div>
                         <p className="text-[10px] text-gray-400">ID: #{app._id.slice(-6).toUpperCase()}</p>
                      </div>
                      
                      <button className="p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                         <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                      </button>
                   </div>
                </div>

                {app.aiFeedback && (
                  <div className="mt-2 ml-12 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border-l-4 border-primary-500 flex items-start gap-3">
                     <Zap size={14} className="text-primary-500 mt-0.5 fill-current" />
                     <p className="text-[11px] font-medium text-primary-700 dark:text-primary-400">
                        <span className="font-black uppercase tracking-tighter mr-2">AI Assistant:</span>
                        {app.aiFeedback}
                     </p>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="card !p-20 text-center">
             <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FileText size={32} />
             </div>
             <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">No applications yet</h3>
             <p className="text-gray-500 mb-6">You haven't applied for any scholarships yet.</p>
             <button 
               onClick={() => window.location.href = '/app/scholarships'}
               className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold shadow-glow-primary hover:scale-105 transition-all"
             >
               Find Scholarships
             </button>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="p-8 bg-gray-900 dark:bg-white rounded-[3rem] text-white dark:text-gray-900 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-y-48 translate-x-48" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                     <AlertCircle size={18} />
                  </div>
                  <h3 className="text-xl font-display font-black italic">Success Tip</h3>
               </div>
               <p className="text-gray-400 dark:text-gray-600 max-w-lg leading-relaxed">
                  Students who respond to AI document verification flags within <span className="text-white dark:text-gray-900 font-bold">24 hours</span> have a <span className="text-emerald-500 font-bold">40% higher</span> chance of approval.
               </p>
            </div>
            <button className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm whitespace-nowrap shadow-xl">
               Complete My Profile <ArrowUpRight size={18} className="inline ml-2" />
            </button>
         </div>
      </div>
    </div>
  );
}

