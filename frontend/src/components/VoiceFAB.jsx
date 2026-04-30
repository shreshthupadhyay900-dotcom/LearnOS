import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';

export default function VoiceFAB() {
  const [active, setActive] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="glass rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Listening...</span>
            <div className="flex items-end gap-0.5 h-8">
              {[1,2,3,4,5].map((i) => (
                <div
                  key={i}
                  className="waveform-bar w-1 bg-gradient-primary rounded-full"
                  style={{ height: `${[60,85,50,90,65][i-1]}%`, animationDelay: `${(i-1)*0.1}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="voice-fab"
        onClick={() => setActive(!active)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-lg transition-all duration-300 ${
          active
            ? 'bg-red-500 shadow-red-500/40'
            : 'bg-gradient-primary'
        }`}
      >
        {active && (
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-40"
          />
        )}
        {active ? <MicOff size={22} className="text-white relative z-10" /> : <Mic size={22} className="text-white" />}
      </motion.button>
    </div>
  );
}

