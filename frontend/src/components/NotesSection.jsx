import { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, 
  Search, Loader, AlertCircle, CheckCircle,
  BookOpen, Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function NotesSection({ mode = 'student' }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const endpoint = mode === 'teacher' ? '/teacher/notes' : '/notes';
      const res = await api.get(endpoint);
      setNotes(res.data.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a PDF file');
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('note', file);
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('description', description);

    try {
      await api.post('/teacher/notes/upload', formData);
      setSuccess('Note uploaded successfully!');
      setShowUploadModal(false);
      resetForm();
      fetchNotes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/teacher/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSubject('');
    setDescription('');
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search notes by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        
        {mode === 'teacher' && (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary px-6 py-3 flex items-center gap-2 !rounded-2xl"
          >
            <Plus size={18} />
            <span className="font-black uppercase tracking-widest text-[10px]">Upload Note</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Loader className="animate-spin text-primary-500 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest">Accessing Repository...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 card border-dashed border-2 border-gray-100 dark:border-white/5">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-500">No notes found in the repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div 
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 hover:border-primary-500/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <FileText size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${note.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Download/View"
                    >
                      <Download size={16} />
                    </a>
                    {mode === 'teacher' && (
                      <button 
                        onClick={() => handleDelete(note._id)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary-500 px-2 py-0.5 bg-primary-500/5 rounded-md border border-primary-500/10">
                    {note.subject || 'General'}
                  </span>
                  <h3 className="text-base font-display font-black text-gray-900 dark:text-white truncate mt-2">{note.title}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2">{note.description || 'No description provided.'}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                      {note.uploadedBy?.name?.charAt(0) || 'T'}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{note.uploadedBy?.name || 'Faculty'}</span>
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !uploading && setShowUploadModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-gray-900 dark:text-white">Upload New Note</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Note Title</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Data Structures Mastery"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Subject</label>
                    <input 
                      type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">File (PDF Only)</label>
                    <input 
                      type="file" required accept=".pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden" id="note-file"
                    />
                    <label 
                      htmlFor="note-file"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-xs font-bold text-gray-500 flex items-center justify-center gap-2 cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <Upload size={14} /> {file ? file.name : 'Select PDF'}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Description (Optional)</label>
                  <textarea 
                    rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this note covers..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={uploading}
                  className="flex-2 btn-primary flex-1 py-4 flex items-center justify-center gap-2 !rounded-2xl shadow-glow"
                >
                  {uploading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                  <span className="font-black uppercase tracking-widest text-[10px]">Initialize Upload</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
