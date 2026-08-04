import { motion } from 'framer-motion';
import { X, Flag, CheckCircle } from 'lucide-react';

interface QuestionMapProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, string>;
  flags: Record<number, boolean>;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function QuestionMap({
  totalQuestions, currentIndex, answers, flags, onSelect, onClose
}: QuestionMapProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border-2 border-primary/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-accent">
          <div>
            <h3 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              📍 Question Navigator
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Jump to any question instantly</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition flex items-center justify-center shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-muted/30 max-h-[65vh] overflow-y-auto">
          <div className="flex gap-6 justify-center mb-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card px-3 py-2 rounded-lg shadow-sm">
              <span className="w-4 h-4 bg-emerald-500 rounded-full" /> Answered
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card px-3 py-2 rounded-lg shadow-sm">
              <span className="w-4 h-4 bg-yellow-400 rounded-full" /> Flagged
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card px-3 py-2 rounded-lg shadow-sm">
              <span className="w-4 h-4 bg-card border-2 border-border rounded-full" /> Not Answered
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === currentIndex;
              const isFlagged = !!flags[i];

              let classes = 'w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all shadow-sm relative ';

              if (isCurrent) classes += 'border-2 border-primary text-primary bg-card shadow-md scale-105';
              else if (isFlagged) classes += 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500';
              else if (isAnswered) classes += 'bg-emerald-500 text-primary-foreground hover:bg-emerald-600';
              else classes += 'bg-muted text-muted-foreground hover:bg-border';

              return (
                <button
                  key={i}
                  className={classes}
                  onClick={() => onSelect(i)}
                >
                  {i + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 w-3 h-3 text-destructive bg-card rounded-full p-0.5 border border-destructive" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
