/* eslint-disable */
import { ArrowRight, BookOpen, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const levelColors = { 
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
};

export default function CourseCard({ course, delay = 0, onContinue }) {
  const progress = Math.floor(Math.random() * 70) + 10;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="card min-w-[280px] max-w-[280px] p-5 flex-shrink-0 group cursor-pointer border-transparent hover:border-primary-500/30"
    >
      {/* Thumbnail */}
      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 overflow-hidden relative mb-4">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={40} className="text-white opacity-80 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute top-2 right-2 glass p-1.5 rounded-lg">
           <Star size={12} className="text-amber-300 fill-current" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${levelColors[course.level] || levelColors.beginner}`}>
          {course.level}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
           <Clock size={10} /> 4h 20m
        </div>
      </div>

      <h4 className="font-display font-bold text-base text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
        {course.title}
      </h4>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">{course.subject || 'Elite Program'}</p>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1.5">
          <span className="text-gray-400">Mastery</span>
          <span className="text-primary-600 dark:text-primary-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full shadow-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.5, duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <button
        onClick={() => onContinue?.(course)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm"
      >
        Enter Course <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}


