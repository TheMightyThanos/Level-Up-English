import { GraduationCap, User, Clock, BookOpen, Shield, Moon, Sun } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SectionKey } from '@/types/toefl';

interface TestNavbarProps {
  sectionName: string;
  timeLeft: number;
  mode: 'exam' | 'study';
  userName: string;
  userNim: string;
  answeredCount: number;
  totalQuestions: number;
  currentSection?: SectionKey;
  onSectionChange?: (section: SectionKey) => void;
  visitedSections?: Record<SectionKey, boolean>;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  section1: 'Listening',
  section2: 'Structure',
  section3: 'Reading',
};

export default function TestNavbar({ sectionName, timeLeft, mode, userName, userNim, answeredCount, totalQuestions, currentSection, onSectionChange, visitedSections, isDarkMode, onToggleDarkMode }: TestNavbarProps) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isUrgent = mode === 'exam' && timeLeft <= 300 && timeLeft > 0;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-12 sm:h-14 flex items-center justify-between gap-2">
        {/* Logo & Section */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg btn-brand flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
          {/* Desktop & Tablet */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-display font-bold text-[12px] lg:text-[13px] tracking-tight text-primary">
              <span className="hidden lg:inline">Digitalized EPT Reading Preparation Materials</span>
              <span className="lg:hidden">Digitalized EPT</span>
            </span>
            <span className="text-[10px] lg:text-[11px] font-semibold text-primary px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md uppercase tracking-wider">{sectionName}</span>
          </div>
          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-1.5 min-w-0">
            <span className="font-display font-bold text-[11px] tracking-tight text-primary truncate">
              Digitalized EPT
            </span>
            <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-md uppercase tracking-wider flex-shrink-0">
              {sectionName.replace(' Comprehension', '')}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-3">
            <Progress value={progressPercent} className="w-24 h-2" />
            <span className="text-xs text-muted-foreground font-mono">{answeredCount}/{totalQuestions}</span>
          </div>
        </div>

        {/* Right side: user + timer */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Progress (mobile) */}
          <div className="flex md:hidden items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono">{answeredCount}/{totalQuestions}</span>
          </div>

          {/* User info - desktop only */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-xs font-bold text-foreground">{userName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{userNim}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button 
              onClick={onToggleDarkMode}
              className="p-1.5 sm:p-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors ml-1 sm:ml-2"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all duration-300 ${
            mode === 'study'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
              : isUrgent
                ? 'bg-destructive/10 border-destructive animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)] dark:shadow-[0_0_20px_rgba(248,113,113,0.4)]'
                : 'bg-muted border-border'
          }`}>
            {mode === 'study' ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold text-[10px] sm:text-xs">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">STUDY</span><span className="sm:hidden">📖</span>
              </span>
            ) : (
              <>
                <Shield className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
                <span className={`font-mono font-bold text-sm sm:text-base tabular-nums transition-colors ${
                  isUrgent ? 'text-destructive dark:text-red-400' : 'text-foreground'
                }`}>
                  {minutes}:{seconds}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
