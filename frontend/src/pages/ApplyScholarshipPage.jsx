import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Upload, AlertCircle, FileText, 
  ChevronRight, Sparkles, ShieldCheck, Zap, Info, Clock
} from 'lucide-react';
import api from '../services/api';

const steps = [
  { id: 'eligibility', title: 'Eligibility Check', icon: ShieldCheck },
  { id: 'details', title: 'Personal Details', icon: Info },
  { id: 'documents', title: 'Document Upload', icon: Upload },
  { id: 'review', title: 'Final Review', icon: FileText }
];

export default function ApplyScholarshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaar: '',
    bankAccount: '',
    notes: ''
  });
  const [files, setFiles] = useState({});

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const res = await api.get(`/scholarships/${id}`);
        setScholarship(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [id]);

  const handleCheckEligibility = async () => {
    setCheckingEligibility(true);
    try {
      // Simulation of user profile from state/context
      const profile = {
        familyIncome: 200000,
        category: 'OBC',
        educationLevel: 'Undergraduate',
        state: 'Maharashtra',
        gender: 'Male'
      };
      const res = await api.post('/scholarships/check-eligibility', { scholarshipId: id, profile });
      setEligibilityResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/app/scholarships');
    }
  };

  const handleSubmit = async () => {
    try {
      // In a real app, upload files to S3/Cloudinary first
      const payload = {
        scholarshipId: id,
        documents: Object.keys(files).filter(k => files[k]).map(k => ({
          name: k,
          type: files[k].type,
          url: 'https://example.com/mock-url' // Mock URL
        })),
        notes: formData.notes
      };
      await api.post('/scholarships/apply', payload);
      alert('Application submitted successfully!');
      navigate('/app/scholarships/tracker');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center skeleton h-[600px] rounded-3xl" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 px-2">
        <button 
          onClick={handleBack}
          className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl hover:text-primary-500 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white leading-tight">
            Apply: {scholarship?.name}
          </h1>
          <p className="text-sm text-gray-500 font-medium">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between px-2 gap-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex-1 flex flex-col gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary-500 shadow-glow' : 'bg-gray-200 dark:bg-slate-800'}`} />
            <div className="hidden md:flex items-center gap-2">
              <step.icon size={14} className={i <= currentStep ? 'text-primary-500' : 'text-gray-400'} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${i <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="card !p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-eligibility"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-900/20">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary-500 shadow-sm flex-shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">AI Eligibility Predictor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Our AI will analyze your profile against {scholarship?.name} requirements to estimate your success probability.
                  </p>
                </div>
              </div>

              {eligibilityResult ? (
                <div className={`p-8 rounded-3xl border-2 transition-all ${eligibilityResult.eligible ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-500/30'}`}>
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                         {eligibilityResult.eligible ? <Check className="text-emerald-500" size={32} /> : <AlertCircle className="text-rose-500" size={32} />}
                         <h2 className={`text-2xl font-black ${eligibilityResult.eligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {eligibilityResult.eligible ? 'High Eligibility!' : 'Low Eligibility'}
                         </h2>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Success Probability</p>
                         <p className={`text-3xl font-black ${eligibilityResult.eligible ? 'text-emerald-600' : 'text-rose-600'}`}>{eligibilityResult.probability}%</p>
                      </div>
                   </div>
                   <p className="text-gray-700 dark:text-gray-300 font-medium mb-6 leading-relaxed bg-white dark:bg-slate-900/50 p-4 rounded-2xl">
                      "{eligibilityResult.reason}"
                   </p>
                   {eligibilityResult.eligible && (
                     <button onClick={handleNext} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                        Continue to Application
                     </button>
                   )}
                </div>
              ) : (
                <button 
                  onClick={handleCheckEligibility}
                  disabled={checkingEligibility}
                  className="w-full py-6 bg-primary-600 text-white rounded-3xl font-bold text-lg shadow-glow-primary flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {checkingEligibility ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Check My Eligibility with AI <Zap size={20} className="fill-current group-hover:scale-125 transition-transform" /></>
                  )}
                </button>
              )}
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Full Name (as per documents)</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-primary-500 transition-all font-medium"
                  placeholder="Enter your legal name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Aadhaar Number</label>
                <input 
                  type="text" 
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-primary-500 transition-all font-medium"
                  placeholder="12-digit number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Bank Account Number</label>
                <input 
                  type="text" 
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-primary-500 transition-all font-medium"
                  placeholder="For scholarship credit"
                />
              </div>
              <div className="col-span-2 flex justify-end pt-6">
                <button onClick={handleNext} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                  Next Step <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-documents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck size={18} className="text-emerald-500" />
                 <p className="text-sm font-bold text-gray-900 dark:text-white">AI-Powered Document Verification Active</p>
              </div>

              {scholarship?.requiredDocuments?.map((docName, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-white/5 rounded-[2rem] gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-gray-400 shadow-sm border border-gray-50 dark:border-white/5">
                         {files[docName] ? <Check className="text-emerald-500" /> : <FileText />}
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 dark:text-white">{docName}</h4>
                         <p className="text-[11px] text-gray-500">Official verification required</p>
                      </div>
                   </div>
                   <div className="relative">
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, docName)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${files[docName] ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-600 text-white shadow-glow-primary'}`}>
                        {files[docName] ? 'Re-upload' : 'Choose File'}
                      </button>
                   </div>
                </div>
              ))}

              <div className="flex justify-end pt-6">
                <button onClick={handleNext} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                  Next Step <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Personal Profile</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1">Aadhaar: {formData.aadhaar}</p>
                    <p className="text-xs text-gray-500 mt-1">Bank: {formData.bankAccount}</p>
                 </div>
                 <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Uploaded Files</p>
                    <div className="space-y-2">
                       {Object.keys(files).map(k => files[k] && (
                         <div key={k} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <Check size={12} className="text-emerald-500" /> {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-900/30">
                 <div className="flex gap-4">
                    <AlertCircle className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                       Double-check your bank account details. Scholarship funds will be directly credited to this account upon approval.
                    </p>
                 </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSubmit}
                  className="w-full py-5 bg-gradient-primary text-white rounded-2xl font-black text-lg shadow-glow-primary hover:scale-[1.01] transition-all"
                >
                  Confirm & Submit Application
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Success Predictor Sidebar (Sticky) */}
      {currentStep > 0 && eligibilityResult && (
        <div className="fixed top-32 right-8 w-64 hidden xl:block">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="card !p-6 border-emerald-500/20 bg-emerald-50/10 backdrop-blur-md"
           >
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                 </div>
                 <h4 className="font-bold text-sm text-gray-900 dark:text-white">AI Insights</h4>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Success probability</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full">
                          <div className="h-full bg-emerald-500" style={{ width: `${eligibilityResult.probability}%` }} />
                       </div>
                       <span className="text-xs font-black text-emerald-600">{eligibilityResult.probability}%</span>
                    </div>
                 </div>
                 <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    "Based on your profile, you are in the top 15% of candidates for this scheme."
                 </p>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

