import { useTest } from '@/context/TestContext';
import { SectionKey } from '@/types/toefl';
import { SECTION_NAMES, INSTRUCTIONS } from '@/data/questions';
import TestNavbar from '@/components/test/TestNavbar';
import QuestionPanel from '@/components/test/QuestionPanel';
import ReadingPanel from '@/components/test/ReadingPanel';
import QuestionMap from '@/components/test/QuestionMap';
import SectionCountdown from '@/components/test/SectionCountdown';
import SectionConfirmDialog from '@/components/test/SectionConfirmDialog';
import AudioPlayer from '@/components/test/AudioPlayer';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

export default function TestPage() {
  const { state, dispatch } = useTest();
  const [showMap, setShowMap] = useState(false);
  // Skip countdown animation when resuming a restored session
  const [showCountdown, setShowCountdown] = useState(!state.isRestored);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mobileView, setMobileView] = useState<'passage' | 'questions'>('passage');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto fullscreen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Security: disable right-click, copy, paste, cut, print shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);

  // Warn before page refresh/close during exam
  useEffect(() => {
    if (state.isTestSubmitted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isTestSubmitted]);

  // Detect tab switch in exam mode + increment counter
  useEffect(() => {
    if (state.mode !== 'exam' || state.isTestSubmitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch({ type: 'INCREMENT_TAB_SWITCH' });
        toast({
          title: "⚠️ Peringatan!",
          description: `Anda terdeteksi meninggalkan halaman ujian. (Pelanggaran ke-${state.tabSwitchCount + 1})`,
          variant: "destructive",
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.mode, state.isTestSubmitted, state.tabSwitchCount, dispatch]);

  // Set the absolute target end time when the countdown finishes (fresh sessions only).
  // Restored sessions already have targetEndTime set from localStorage.
  useEffect(() => {
    if (state.mode === 'exam' && !state.isTestSubmitted && !showCountdown) {
      if (state.targetEndTime === null) {
        dispatch({ type: 'SET_TARGET_END_TIME', payload: Date.now() + state.timeLeft * 1000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.isTestSubmitted, showCountdown]);

  // Timer logic for exam mode (only when countdown done)
  useEffect(() => {
    if (state.mode !== 'exam' || state.isTestSubmitted || showCountdown) return;

    // Core tick — runs every second (may be throttled by browser in bg tabs)
    timerRef.current = setInterval(() => {
      if (state.targetEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
        dispatch({ type: 'SET_TIME_LEFT', payload: remaining });
      }
    }, 1000);

    // Immediately sync timer when tab/window regains focus so the user never
    // sees a stale value.  Browsers throttle setInterval to ~1×/min in
    // background tabs — this compensates for that.
    const syncTimer = () => {
      if (state.targetEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
        dispatch({ type: 'SET_TIME_LEFT', payload: remaining });
      }
    };

    // visibilitychange  → covers Chrome tab switches
    // focus             → covers Alt-Tab / window switching
    const handleVisibility = () => { if (!document.hidden) syncTimer(); };
    const handleFocus = () => syncTimer();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.isTestSubmitted, showCountdown, state.targetEndTime, dispatch]);

  // Handle time up
  useEffect(() => {
    if (state.mode !== 'exam' || state.timeLeft > 0) return;
    proceedToNextSection();
  }, [state.timeLeft]);

  const proceedToNextSection = useCallback(() => {
    if (state.currentSection === 'section1') {
      dispatch({ type: 'SET_SECTION', payload: 'section2' });
      setShowCountdown(true);
    } else if (state.currentSection === 'section2') {
      dispatch({ type: 'SET_SECTION', payload: 'section3' });
      setShowCountdown(true);
    } else {
      dispatch({ type: 'SUBMIT_TEST' });
    }
  }, [state.currentSection, dispatch]);

  const handleSectionChange = useCallback((section: SectionKey) => {
    if (state.mode !== 'study') return;
    if (!state.visitedSections[section]) return;
    dispatch({ type: 'SET_SECTION', payload: section });
    setShowCountdown(false); // No countdown when switching back in study mode
  }, [state.mode, state.visitedSections, dispatch]);

  const handleNextSection = useCallback(() => {
    // Show confirm dialog instead of directly proceeding
    setShowConfirm(true);
  }, []);

  const handleSelectAnswer = useCallback((answer: string) => {
    dispatch({
      type: 'SET_ANSWER',
      payload: { section: state.currentSection, index: state.currentQIndex, answer }
    });
  }, [state.currentSection, state.currentQIndex, dispatch]);

  const handleChangeQuestion = useCallback((delta: number) => {
    if (!state.testData) return;
    const total = state.testData[state.currentSection].questions.length;
    const newIdx = state.currentQIndex + delta;
    if (newIdx >= total) {
      handleNextSection();
      return;
    }
    if (newIdx < 0) return;
    dispatch({ type: 'SET_QUESTION_INDEX', payload: newIdx });
  }, [state.testData, state.currentSection, state.currentQIndex, dispatch, handleNextSection]);

  const handleToggleFlag = useCallback(() => {
    dispatch({ type: 'TOGGLE_FLAG', payload: { section: state.currentSection, index: state.currentQIndex } });
  }, [state.currentSection, state.currentQIndex, dispatch]);

  // Keyboard shortcuts for navigation and answering
  useEffect(() => {
    if (!state.testData) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is interacting with form elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleChangeQuestion(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleChangeQuestion(1);
      } else {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(key)) {
          const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          const currentQuestionData = state.testData![state.currentSection].questions[state.currentQIndex];
          if (currentQuestionData && currentQuestionData.shuffledOptions[index]) {
            const isStudyAnswered = state.mode === 'study' && state.userAnswers[state.currentSection][state.currentQIndex] !== undefined;
            if (!isStudyAnswered) {
              handleSelectAnswer(currentQuestionData.shuffledOptions[index].text);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.testData, state.currentSection, state.currentQIndex, state.mode, state.userAnswers, handleChangeQuestion, handleSelectAnswer]);

  if (!state.testData) return null;

  const currentQuestion = state.testData[state.currentSection].questions[state.currentQIndex];
  const totalQuestions = state.testData[state.currentSection].questions.length;
  const userAnswer = state.userAnswers[state.currentSection][state.currentQIndex];
  const isFlagged = !!state.flags[state.currentSection][state.currentQIndex];
  const isReadingSection = state.currentSection === 'section3';
  const answeredCount = Object.keys(state.userAnswers[state.currentSection]).length;
  const flaggedCount = Object.keys(state.flags[state.currentSection]).length;
  const unansweredCount = totalQuestions - answeredCount;
  const isLastSection = state.currentSection === 'section3';

  // Auto-extract the quoted reference word/phrase from the question text
  // e.g. 'In line 3, the word "derived" is closest in meaning to' -> 'derived'
  const passageHighlight = (() => {
    const t = currentQuestion?.text || '';
    const m = t.match(/["“]([^"”]+)["”]/);
    return m ? m[1] : undefined;
  })();

  // Auto-extract the referenced line number from the question text
  // e.g. 'In line 17, the word "eras" ...' -> 17
  const passageHighlightLine = (() => {
    const t = currentQuestion?.text || '';
    const m = t.match(/\bline\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : undefined;
  })();

  // Get instruction
  let instruction = '';
  const qNum = state.currentQIndex + 1;
  if (state.currentSection === 'section1' && qNum === 1) instruction = INSTRUCTIONS.s1_intro + '<br><hr class="my-3 border-primary/20">' + INSTRUCTIONS.s1_partA;
  else if (state.currentSection === 'section1' && qNum === 31) instruction = INSTRUCTIONS.s1_partB;
  else if (state.currentSection === 'section1' && qNum === 39) instruction = INSTRUCTIONS.s1_partC;
  else if (state.currentSection === 'section2' && qNum === 1) instruction = INSTRUCTIONS.s2_partA;
  else if (state.currentSection === 'section2' && qNum === 16) instruction = INSTRUCTIONS.s2_partB;
  else if (state.currentSection === 'section3' && qNum === 1) instruction = INSTRUCTIONS.s3_general;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} bg-background flex flex-col ${isReadingSection ? 'h-screen overflow-hidden' : 'min-h-screen'} text-foreground transition-colors duration-300`}>
      {/* Section Countdown */}
      <AnimatePresence>
        {showCountdown && (
          <SectionCountdown
            sectionName={SECTION_NAMES[state.currentSection]}
            onComplete={() => setShowCountdown(false)}
          />
        )}
      </AnimatePresence>

      {/* Section Confirm Dialog */}
      {showConfirm && (
        <SectionConfirmDialog
          sectionName={SECTION_NAMES[state.currentSection]}
          unansweredCount={unansweredCount}
          flaggedCount={flaggedCount}
          totalQuestions={totalQuestions}
          isLastSection={isLastSection}
          mode={state.mode}
          onConfirm={() => {
            setShowConfirm(false);
            proceedToNextSection();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <TestNavbar
        sectionName={SECTION_NAMES[state.currentSection]}
        timeLeft={state.timeLeft}
        mode={state.mode}
        userName={state.userData.name}
        userNim={state.userData.nim}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        currentSection={state.currentSection}
        onSectionChange={handleSectionChange}
        visitedSections={state.visitedSections}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 pt-12 sm:pt-16 flex flex-col overflow-hidden">
        {/* Mobile/Tablet view toggle — only when a reading passage is present */}
        {isReadingSection && currentQuestion.passageText && (
          <div className="lg:hidden sticky top-12 sm:top-16 z-30 bg-card/95 backdrop-blur border-b border-border px-3 py-2 flex gap-2">
            <button
              onClick={() => setMobileView('passage')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                mobileView === 'passage'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              📖 Passage
            </button>
            <button
              onClick={() => setMobileView('questions')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                mobileView === 'questions'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              ✍️ Question {qNum}/{totalQuestions}
            </button>
          </div>
        )}

        {state.currentSection === 'section1' && state.audioFile && (
          <div className="max-w-7xl mx-auto w-full px-4 mt-4 shrink-0">
            <AudioPlayer 
              src={state.audioFile} 
              autoPlay={true} 
              disableControls={state.mode === 'exam'} 
            />
          </div>
        )}

        <motion.div
          key={`${state.currentSection}-${state.currentQIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 flex ${isReadingSection ? 'flex-col lg:flex-row overflow-hidden' : 'flex-col'} ${isReadingSection ? 'w-full' : 'max-w-7xl mx-auto w-full'}`}
        >
          {isReadingSection && currentQuestion.passageText && (
            <div className={`${mobileView === 'passage' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 min-h-0 flex-1 lg:flex-initial flex-col`}>
              <ReadingPanel
                title={currentQuestion.passageTitle || 'Reading Passage'}
                text={currentQuestion.passageText}
                highlight={passageHighlight}
                highlightLine={passageHighlightLine}
                pulseKey={`${state.currentSection}-${state.currentQIndex}-${userAnswer ?? ''}`}
              />
            </div>
          )}

          <div className={`${isReadingSection && currentQuestion.passageText ? (mobileView === 'questions' ? 'flex' : 'hidden') : 'flex'} lg:flex flex-1 min-h-0 flex-col`}>
            <QuestionPanel
              question={currentQuestion}
              questionNumber={qNum}
              totalQuestions={totalQuestions}
              sectionName={SECTION_NAMES[state.currentSection]}
              userAnswer={userAnswer}
              isFlagged={isFlagged}
              mode={state.mode}
              instruction={instruction}
              onSelectAnswer={handleSelectAnswer}
              onChangeQuestion={handleChangeQuestion}
              onToggleFlag={handleToggleFlag}
              onOpenMap={() => setShowMap(true)}
              isLastQuestion={qNum === totalQuestions}
            />
          </div>
        </motion.div>
      </main>

      {showMap && (
        <QuestionMap
          totalQuestions={totalQuestions}
          currentIndex={state.currentQIndex}
          answers={state.userAnswers[state.currentSection]}
          flags={state.flags[state.currentSection]}
          onSelect={(idx) => {
            dispatch({ type: 'SET_QUESTION_INDEX', payload: idx });
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
