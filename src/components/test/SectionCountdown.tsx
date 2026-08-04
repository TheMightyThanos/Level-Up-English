import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface SectionCountdownProps {
  sectionName: string;
  onComplete: () => void;
}

export default function SectionCountdown({ sectionName, onComplete }: SectionCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center"
    >
      <div className="text-center text-primary-foreground">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display font-bold mb-2 tracking-tight"
        >
          {sectionName}
        </motion.h2>
        <p className="text-primary-foreground/60 text-sm mb-12">Get ready...</p>

        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-9xl font-black tabular-nums"
            >
              {count}
            </motion.div>
          ) : (
            <motion.div
              key="go"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-7xl font-black tracking-wider"
            >
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
