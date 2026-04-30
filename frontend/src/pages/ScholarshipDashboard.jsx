import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, IndianRupee, Calendar, GraduationCap, 
  Award, CheckCircle, AlertCircle, ChevronRight, Info,
  Sparkles, Zap, MapPin, Users, Heart, Star, Mic, Clock, X, ArrowUpRight, FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ScholarshipCard = ({ scholarship, onDetails }) => {
  const isDeadlineSoon = new Date(scholarship.deadline) - new Date() < 30 * 24 * 60 * 60 * 1000;
  const isBestMatch = scholarship.matchScore > 85;

  const typeColors = {
    'State': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Central': 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    'International': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group h-full"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
      <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typeColors[scholarship.scholarshipType] || typeColors.Central}`}>
             {scholarship.scholarshipType || 'Central'}
          </span>
          {isBestMatch && (
            <span className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              <Sparkles size={12} /> Best Match
            </span>
          )}
          {isDeadlineSoon && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              <Clock size={12} className="text-rose-500" /> Deadline Soon
            </span>
          )}
        </div>

        <h3 className="text-lg font-display font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-primary-500 transition-colors">
          {scholarship.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
          {scholarship.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <IndianRupee size={16} />
            </div>
            <span>{scholarship.amount}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <Calendar size={16} />
            </div>
            <span>{new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <button 
          onClick={() => onDetails(scholarship)}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
        >
          View Documentation <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default function ScholarshipDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  
  // Local profile state for preferences
  const [profile, setProfile] = useState(user?.profile || {
    familyIncome: 250000,
    category: 'General',
    educationLevel: 'Undergraduate',
    state: 'Maharashtra',
    gender: 'Male',
    age: 20,
    courseInterest: 'Computer Science'
  });

  const fetchScholarships = useCallback(async () => {
    try {
      if (activeTab === 'recommended') {
        const res = await api.post('/scholarships/recommend', { profile });
        setScholarships(res.data);
      } else {
        const res = await api.get('/scholarships');
        setScholarships(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, profile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScholarships();
  }, [fetchScholarships]);

  const filteredScholarships = scholarships.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <p className="text-primary-500 font-black uppercase tracking-widest text-xs">Financial Success</p>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-gray-900 dark:text-white">
            Scholarship <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">Portal</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">
            Personalized matches powered by AI to fund your education journey.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search scholarships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm focus:ring-2 ring-primary-500 outline-none transition-all font-medium"
            />
          </div>
          <button className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl text-gray-500 hover:text-primary-500 transition-colors shadow-sm">
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[2.5rem] text-white shadow-glow-primary">
          <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Award size={24} />
             </div>
             <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-tighter">AI Match</span>
          </div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Recommended for You</p>
          <h3 className="text-3xl font-black">{scholarships.length} Schemes</h3>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <IndianRupee size={24} />
             </div>
             <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Potential Funding</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Savings</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹1.2L+</h3>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <Calendar size={24} />
             </div>
             <span className="text-xs font-black bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-3 py-1 rounded-full uppercase tracking-tighter">Urgent</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Deadlines This Month</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">02</h3>
        </div>
      </div>

      {/* Tabs & Preference Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => { setLoading(true); setActiveTab('recommended'); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'recommended' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            AI Recommendations
          </button>
          <button 
            onClick={() => { setLoading(true); setActiveTab('all'); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Scholarships
          </button>
        </div>

        <button 
          onClick={() => setShowPreferences(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500/10 text-primary-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-500/20 transition-all border border-primary-500/20"
        >
          <Filter size={14} /> Refine My Profile
        </button>
      </div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center text-white"><Users size={20} /></div>
                      <div>
                         <h3 className="text-xl font-display font-black uppercase italic text-gray-900 dark:text-white leading-none">Scholarship Profile</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personalize your AI matches</p>
                      </div>
                   </div>
                   <button onClick={() => setShowPreferences(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto scrollbar-none">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Family Income (Annual)</label>
                      <div className="relative">
                         <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                         <input 
                           type="number" 
                           value={profile.familyIncome} 
                           onChange={e => setProfile({...profile, familyIncome: parseInt(e.target.value)})}
                           className="input-field pl-10" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Current Age</label>
                      <input 
                        type="number" 
                        value={profile.age} 
                        onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                        className="input-field" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Course Interest</label>
                      <select 
                        value={profile.courseInterest} 
                        onChange={e => setProfile({...profile, courseInterest: e.target.value})}
                        className="input-field"
                      >
                         <option>Computer Science</option>
                         <option>Engineering</option>
                         <option>Medicine</option>
                         <option>Arts & Design</option>
                         <option>Commerce</option>
                         <option>Any</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Education Level</label>
                      <select 
                        value={profile.educationLevel} 
                        onChange={e => setProfile({...profile, educationLevel: e.target.value})}
                        className="input-field"
                      >
                         <option>School</option>
                         <option>Class 12</option>
                         <option>Undergraduate</option>
                         <option>Postgraduate</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category</label>
                      <select 
                        value={profile.category} 
                        onChange={e => setProfile({...profile, category: e.target.value})}
                        className="input-field"
                      >
                         <option>General</option>
                         <option>OBC</option>
                         <option>SC</option>
                         <option>ST</option>
                         <option>Minority</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Gender</label>
                      <select 
                        value={profile.gender} 
                        onChange={e => setProfile({...profile, gender: e.target.value})}
                        className="input-field"
                      >
                         <option>Male</option>
                         <option>Female</option>
                         <option>All</option>
                      </select>
                   </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-white/5 flex gap-4">
                   <button 
                    onClick={() => setShowPreferences(false)}
                    className="flex-1 py-4 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-300 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={() => { setLoading(true); fetchScholarships(); setShowPreferences(false); }}
                    className="flex-2 py-4 bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 px-12"
                   >
                     Update My Preferences <Sparkles size={16} />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scholarship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-[400px] rounded-[2.5rem]" />
            ))
          ) : filteredScholarships.length > 0 ? (
            filteredScholarships.map((s) => (
              <ScholarshipCard 
                key={s._id} 
                scholarship={s} 
                onDetails={(sch) => setSelectedScholarship(sch)} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">No scholarships found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Scholarship Detail Modal */}
      <AnimatePresence>
        {selectedScholarship && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden"
             >
                <div className="p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-start">
                   <div className="flex gap-6">
                      <div className="w-16 h-16 rounded-[2rem] bg-primary-500 flex items-center justify-center text-white shadow-glow-primary">
                         <GraduationCap size={32} />
                      </div>
                      <div className="space-y-1">
                         <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {selectedScholarship.scholarshipType} Scheme
                         </span>
                         <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white leading-tight mt-2">
                            {selectedScholarship.name}
                         </h3>
                      </div>
                   </div>
                   <button onClick={() => setSelectedScholarship(null)} className="p-3 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                         <Info size={14} className="text-primary-500" /> Objective & Details
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                         {selectedScholarship.description}
                      </p>
                      
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                            <span className="text-xs font-black uppercase text-gray-500">Benefit Amount</span>
                            <span className="text-sm font-black text-emerald-600">{selectedScholarship.amount}</span>
                         </div>
                         <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                            <span className="text-xs font-black uppercase text-gray-500">Eligibility Bar</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-white">{selectedScholarship.eligibilitySummary}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
                         <FileText size={14} /> Mandatory Documents
                      </h4>
                      <div className="space-y-3">
                         {selectedScholarship.requiredDocuments?.map((doc, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900">
                              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                 <CheckCircle size={12} />
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{doc}</span>
                           </div>
                         ))}
                      </div>

                      <div className="pt-6">
                         <h4 className="text-[10px] font-black uppercase text-primary-500 tracking-widest mb-4">Official Application Portal</h4>
                         <div className="p-5 rounded-2xl bg-primary-500 text-white shadow-glow-primary">
                            <p className="text-[10px] font-black uppercase opacity-60 mb-2">Apply through:</p>
                            <p className="font-display font-black text-lg italic mb-4">{selectedScholarship.applicationPortal}</p>
                            <a 
                              href={selectedScholarship.applyLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-white text-primary-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                            >
                               Launch Official Site <ArrowUpRight size={14} />
                             </a>
                             <button 
                               onClick={() => navigate(`/app/scholarships/apply/${selectedScholarship._id}`)}
                               className="w-full py-3 mt-3 bg-gray-900/20 text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900/40 transition-all"
                             >
                                Apply via LEARN OS Protocol <Zap size={14} fill="currentColor" />
                             </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-center">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Neural Verification Active</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Assistant Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary-500 text-white rounded-full shadow-glow-primary flex items-center justify-center z-50 group"
      >
        <Zap size={24} className="group-hover:animate-pulse" />
        <div className="absolute right-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
          Talk to Scholarship Assistant
        </div>
      </motion.button>
    </div>
  );
}

