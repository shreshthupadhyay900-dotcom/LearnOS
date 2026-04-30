/* eslint-disable */
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = 'primary', delay = 0 }) {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    purple: 'from-accent-500 to-accent-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="stat-card group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
        {sub && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            sub.startsWith('+') ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-slate-500 dark:text-gray-400'
          }`}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white font-display">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}


