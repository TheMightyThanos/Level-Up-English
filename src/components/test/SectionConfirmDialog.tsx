import { motion } from 'framer-motion';
import { AlertTriangle, Flag, HelpCircle, X, ArrowRight } from 'lucide-react';

interface SectionConfirmDialogProps {
  sectionName: string;
  unansweredCount: number;
  flaggedCount: number;
  totalQuestions: number;
  isLastSection: boolean;
  mode?: 'exam' | 'study';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SectionConfirmDialog({
  sectionName, unansweredCount, flaggedCount, totalQuestions,
  isLastSection, mode = 'exam', onConfirm, onCancel
}: SectionConfirmDialogProps) {
  const answeredCount = totalQuestions - unansweredCount;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden"
      >
        <div className="p-6 bg-accent border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-bold text-foreground">
                {isLastSection ? 'Submit Test?' : 'Next Section?'}
              </h3>
            </div>
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted transition">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            {isLastSection
              ? `Anda akan mengakhiri ${sectionName} dan menyelesaikan seluruh tes.`
              : mode === 'study'
                ? `Anda akan meninggalkan ${sectionName} dan melanjutkan ke section berikutnya.`
                : `Anda akan meninggalkan ${sectionName}. Anda tidak dapat kembali ke section ini.`
            }
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{answeredCount}</div>
              <div className="text-xs text-muted-foreground">Terjawab</div>
            </div>
            <div className={`rounded-xl p-3 text-center ${unansweredCount > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <div className={`text-2xl font-bold ${unansweredCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                <HelpCircle className="w-5 h-5 inline mr-1" />{unansweredCount}
              </div>
              <div className="text-xs text-muted-foreground">Belum Dijawab</div>
            </div>
            <div className={`rounded-xl p-3 text-center ${flaggedCount > 0 ? 'bg-yellow-50' : 'bg-muted'}`}>
              <div className={`text-2xl font-bold ${flaggedCount > 0 ? 'text-yellow-600' : 'text-foreground'}`}>
                <Flag className="w-5 h-5 inline mr-1" />{flaggedCount}
              </div>
              <div className="text-xs text-muted-foreground">Ditandai</div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Masih ada <strong>{unansweredCount} soal</strong> yang belum dijawab!</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition"
          >
            Kembali
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 btn-brand text-primary-foreground font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            {isLastSection ? 'Submit Test' : 'Lanjut'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
