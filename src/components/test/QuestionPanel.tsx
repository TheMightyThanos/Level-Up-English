import { Question, TestMode } from '@/types/toefl';
import { Flag, Grid3X3, ChevronLeft, ChevronRight, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  sectionName: string;
  userAnswer?: string;
  isFlagged: boolean;
  mode: TestMode;
  instruction: string;
  onSelectAnswer: (answer: string) => void;
  onChangeQuestion: (delta: number) => void;
  onToggleFlag: () => void;
  onOpenMap: () => void;
  isLastQuestion: boolean;
}

export default function QuestionPanel({
  question, questionNumber, totalQuestions, sectionName,
  userAnswer, isFlagged, mode, instruction,
  onSelectAnswer, onChangeQuestion, onToggleFlag, onOpenMap, isLastQuestion
}: QuestionPanelProps) {
  const isAnswered = userAnswer !== undefined;
  const correctOption = question.shuffledOptions.find(opt => opt.isCorrect);
  const correctText = correctOption?.text || '';
  const isCorrect = userAnswer === correctText;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 sm:p-6 bg-card border-b border-border flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm sm:text-base">
            {questionNumber}
          </div>
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-foreground">{sectionName}</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Question {questionNumber} of {totalQuestions}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Progress</div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/30">
        {/* Instruction */}
        {instruction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-8 p-3 sm:p-6 bg-accent border-l-4 border-primary rounded-r-xl shadow-sm"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: instruction }} />
            </div>
          </motion.div>
        )}

        {/* Question text */}
        <div
          className="text-foreground mb-4 sm:mb-6 text-base sm:text-lg font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />

        {/* Study mode feedback */}
        {mode === 'study' && isAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}
          >
            <div className={`text-sm sm:text-base font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <strong className="text-foreground">Correct Answer:</strong> {correctText}
            </p>
            {question.explanation && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/10">
                <strong className="text-primary text-xs sm:text-sm">💡 Explanation:</strong>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Options */}
        <div className="space-y-2 sm:space-y-3" role="radiogroup">
          {question.shuffledOptions.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = userAnswer === opt.text;
            const isStudyAnswered = mode === 'study' && isAnswered;
            const isCorrectOpt = opt.isCorrect;

            let optClasses = 'option-btn w-full p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 flex items-center gap-3 sm:gap-5 group mb-1 shadow-sm ';

            if (isStudyAnswered) {
              optClasses += 'cursor-default ';
              if (isCorrectOpt) optClasses += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 font-bold ';
              else if (isSelected) optClasses += 'border-destructive bg-destructive/5 dark:bg-destructive/10 text-destructive dark:text-red-400 font-bold ';
              else optClasses += 'border-border bg-card opacity-50 text-muted-foreground ';
            } else {
              optClasses += 'cursor-pointer ';
              if (isSelected) optClasses += 'border-primary bg-accent text-accent-foreground font-bold shadow-lg ';
              else optClasses += 'border-border bg-card hover:border-primary/50 hover:bg-accent/50 text-foreground ';
            }

            return (
              <button
                key={idx}
                className={optClasses}
                onClick={() => !isStudyAnswered && onSelectAnswer(opt.text)}
                disabled={isStudyAnswered}
                role="radio"
                aria-checked={isSelected}
              >
                <div className={`option-icon w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground' :
                  isStudyAnswered && isCorrectOpt ? 'bg-emerald-500 text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {letter}
                </div>
                <div className="flex-1 text-left text-sm sm:text-base leading-relaxed">{opt.text}</div>
              </button>
            );
          })}
        </div>

        {/* Skill & topic info (study mode) */}
        {mode === 'study' && isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8 p-3 sm:p-5 bg-card rounded-xl border border-border shadow-sm"
          >
            <h4 className="text-xs sm:text-sm font-bold text-primary mb-3 flex items-center gap-2">
              🏷️ Skill Analysis
            </h4>
            <div className="p-2 sm:p-3 bg-accent rounded-lg">
              <div className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reading Comprehension Skill</div>
              <div className="text-xs sm:text-sm font-medium text-foreground">{question.skill || 'Uncategorized'}</div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border gap-2 sm:gap-4">
          <button
            onClick={() => onChangeQuestion(-1)}
            disabled={questionNumber === 1}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
              questionNumber === 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-foreground text-background hover:opacity-90'
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={onToggleFlag}
              className={`px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                isFlagged
                  ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-600'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
            </button>
            <button
              onClick={onOpenMap}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-card border border-border text-muted-foreground font-medium hover:bg-muted transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          <button
            onClick={() => onChangeQuestion(1)}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
              isLastQuestion
                ? 'btn-brand text-primary-foreground'
                : 'bg-foreground text-background hover:opacity-90'
            }`}
          >
            {isLastQuestion ? <>Finish <Check className="w-4 h-4 sm:w-5 sm:h-5" /></> : <><span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
