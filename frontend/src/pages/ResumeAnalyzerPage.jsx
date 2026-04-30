import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Sparkles, CheckCircle2, 
  AlertCircle, ChevronRight, Brain, Target,
  Rocket, Search, Loader
} from 'lucide-react';
import api from '../services/api';

export default function ResumeAnalyzerPage() {
  const [targetCompany, setTargetCompany] = useState('Google');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const companies = [
    { name: 'Google', icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
    { name: 'Amazon', icon: 'https://cdn-icons-png.flaticon.com/512/732/732177.png' },
    { name: 'Meta', icon: 'https://cdn-icons-png.flaticon.com/512/6033/6033716.png' },
    { name: 'Microsoft', icon: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
    { name: 'Netflix', icon: 'https://cdn-icons-png.flaticon.com/512/732/732228.png' }
  ];

  const handleUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Only PDF documents are supported.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetCompany', targetCompany);

    try {
      const res = await api.post('/resume/analyze', formData);
      setAnalysis(res.data.analysis);
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.message;
      setError(`Analysis Failed: ${backendMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-1">
          <FileText className="w-3 h-3" /> Career Optimizer
        </div>
        <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white italic uppercase tracking-tight">Resume Intelligence</h1>
        <p className="text-sm text-gray-500 font-medium">Company-specific optimization & ATS pressure testing.</p>
      </div>

      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-12 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card !p-10 text-center max-w-4xl mx-auto">
                 <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">1. Target Company Selection</h3>
                 <div className="grid grid-cols-5 gap-4 mb-10">
                    {companies.map(c => (
                      <button 
                        key={c.name}
                        onClick={() => setTargetCompany(c.name)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${targetCompany === c.name ? 'bg-primary-500/10 border-primary-500 shadow-glow-soft' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-gray-200'}`}
                      >
                         <img src={c.icon} alt={c.name} className="w-8 h-8 object-contain grayscale brightness-0 dark:brightness-200" style={{ filter: targetCompany === c.name ? 'none' : 'grayscale(100%) opacity(0.5)' }} />
                         <span className={`text-[8px] font-black uppercase ${targetCompany === c.name ? 'text-primary-600' : 'text-gray-400'}`}>{c.name}</span>
                      </button>
                    ))}
                 </div>

                 <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">2. Upload Payload (PDF)</h3>
                 <div className="flex flex-col items-center gap-4">
                   <input 
                    type="file" id="resume-upload" className="hidden" 
                    accept=".pdf" onChange={handleUpload} 
                   />
                   <label 
                    htmlFor="resume-upload"
                    className="btn-primary px-10 py-5 !rounded-2xl shadow-glow cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                   >
                     <Upload size={20} /> 
                     <span className="font-black uppercase italic tracking-tighter">
                       {file ? file.name : 'Initialize Data Upload'}
                     </span>
                   </label>
                   
                   {file && (
                     <button 
                      onClick={analyze} disabled={loading}
                      className="mt-6 btn-primary w-full max-w-xs py-4 flex items-center justify-center gap-3 !rounded-2xl"
                     >
                       {loading ? <><Loader size={18} className="animate-spin" /> Analyzing for {targetCompany}...</> : <><Sparkles size={18} /> Run ATS Simulation</>}
                     </button>
                   )}
                   
                   {error && (
                     <p className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase mt-4">
                       <AlertCircle size={14} /> {error}
                     </p>
                   )}
                 </div>
              </motion.div>
           </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
           {/* Top Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center !p-8 bg-slate-900 text-white">
                 <p className="text-[10px] font-black uppercase text-gray-500 mb-2">ATS Score</p>
                 <div className="text-5xl font-display font-black text-primary-500 italic mb-2">{analysis.atsScore}%</div>
                 <p className="text-[9px] font-bold opacity-60 uppercase italic">Target: {targetCompany}</p>
              </div>
              <div className="md:col-span-3 card !p-8 flex items-center gap-8">
                 <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0">
                    <Target size={32} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Company Alignment Analysis</h4>
                    <p className="text-sm font-medium leading-relaxed italic text-gray-700 dark:text-gray-300">"{analysis.companyAnalysis}"</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  {/* Pros List */}
                  <div className="card !p-8 border-emerald-500/20 bg-emerald-500/5">
                     <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-6 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Professional Strengths (Pros)
                     </h4>
                     <div className="space-y-4">
                        {(analysis.pros||[]).map((pro, i) => (
                          <div key={i} className="flex gap-4">
                             <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-glow-soft">
                               <CheckCircle2 size={12} />
                             </div>
                             <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{pro}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Cons List */}
                  <div className="card !p-8 border-rose-500/20 bg-rose-500/5">
                     <h4 className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-6 flex items-center gap-2">
                        <AlertCircle size={16} /> Critical Weaknesses (Cons)
                     </h4>
                     <div className="space-y-4">
                        {(analysis.cons||analysis.problems||[]).map((con, i) => (
                          <div key={i} className="flex gap-4 items-center">
                             <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                             <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{con}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Betterment List */}
                  <div className="card !p-8 border-primary-500/20 bg-primary-500/5">
                     <h4 className="text-[10px] font-black uppercase text-primary-600 tracking-widest mb-6 flex items-center gap-2">
                        <Rocket size={16} /> Actionable Improvements
                     </h4>
                     <div className="space-y-4">
                        {analysis.improvements.map((imp, i) => (
                          <div key={i} className="flex gap-4">
                             <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-glow-soft">{i+1}</div>
                             <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{imp}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="card !p-8">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 flex items-center gap-2">
                       <Brain size={16} className="text-primary-500" /> Skill Matrix
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {analysis.skills.map((skill, i) => (
                         <span key={i} className="px-3 py-1.5 rounded-lg bg-primary-500/5 text-primary-600 dark:text-primary-400 font-black text-[9px] uppercase border border-primary-500/10">
                            {skill}
                         </span>
                       ))}
                    </div>
                 </div>

                 <div className="card !p-8 bg-gradient-primary text-white border-none shadow-glow">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">Neural Recommendation</p>
                    <h4 className="text-xl font-display font-black italic uppercase leading-tight mb-8">{analysis.suggestedRoadmap}</h4>
                    <button className="w-full py-4 bg-white text-primary-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg">
                       Initialize Roadmap
                    </button>
                 </div>

                 <button onClick={() => setAnalysis(null)} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Reset Simulator
                 </button>
              </div>
           </div>
        </motion.div>
      )}
    </div>
  );
}

