import { useTest } from '@/context/TestContext';
import { SectionKey } from '@/types/toefl';
import { SECTION_NAMES, INSTRUCTIONS, initializeTestData } from '@/data/questions';
import TestNavbar from '@/components/test/TestNavbar';
import QuestionPanel from '@/components/test/QuestionPanel';
import ReadingPanel from '@/components/test/ReadingPanel';
import QuestionMap from '@/components/test/QuestionMap';
import SectionCountdown from '@/components/test/SectionCountdown';
import SectionConfirmDialog from '@/components/test/SectionConfirmDialog';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { resolveCorrectAnswer, sanitizeOptionText, extractReadingReference, cleanQuestionSentence } from '@/data/scoring';

// Helper for shuffling options
const shuffle = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const processOptions = (options: string[], rawKey: any) => {
  const resolved = resolveCorrectAnswer(options, rawKey);
  const mapped = options.map((opt, idx) => {
    let isCorrect = false;
    if (resolved.index >= 0) {
      isCorrect = idx === resolved.index;
    } else if (resolved.text) {
      isCorrect = opt.trim().toLowerCase() === resolved.text.trim().toLowerCase();
    }
    return { text: opt, isCorrect };
  });
  return shuffle(mapped);
};

export default function TestPage() {
  const { state, dispatch } = useTest();
  const params = useParams<{ packageId?: string; id?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  // Skip countdown animation when resuming a restored session
  const [showCountdown, setShowCountdown] = useState(!state.isRestored);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mobileView, setMobileView] = useState<'passage' | 'questions'>('passage');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!state.testData);
  const [error, setError] = useState<string | null>(null);
  const [queriedPackageId, setQueriedPackageId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastValidTime = useRef<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 1. Resolve raw incoming package ID from all potential sources
  const rawCandidate =
    params.packageId ||
    params.id ||
    (location.state as any)?.packageId ||
    (location.state as any)?.preselectedSet ||
    (location.state as any)?.selectedTestId ||
    (location.state as any)?.id ||
    (location.state as any)?.exam_package_id ||
    (typeof location.state === 'string' ? location.state : undefined) ||
    searchParams.get('packageId') ||
    searchParams.get('package_id') ||
    searchParams.get('id') ||
    searchParams.get('preselectedSet') ||
    state.selectedTestId;

  // Extract string ID properly if passed as an object or other type
  let resolvedPackageId = '';
  if (typeof rawCandidate === 'string') {
    resolvedPackageId = rawCandidate;
  } else if (rawCandidate && typeof rawCandidate === 'object') {
    resolvedPackageId =
      (rawCandidate as any).id ||
      (rawCandidate as any).packageId ||
      (rawCandidate as any).preselectedSet ||
      (rawCandidate as any).selectedTestId ||
      (rawCandidate as any).exam_package_id ||
      '';
  } else if (rawCandidate) {
    resolvedPackageId = String(rawCandidate);
  }

  resolvedPackageId = (resolvedPackageId || '').trim();
  const packageId = resolvedPackageId;

  // Comprehensive ID check for the local 50-item reading mock (available to all hooks and render)
  const isMockPackage = Boolean(
    packageId === 'mock-skripsi' ||
    packageId === 'reading-only' ||
    packageId === 'reading-section-only' ||
    packageId === 'practice-test-1' ||
    packageId === 'default'
  );

  // 1. Log incoming packageId clearly
  console.log('Active Package ID:', packageId, 'isMockPackage:', isMockPackage);

  // Defensively resolve active section and safe index at the top so ALL hooks have access
  let activeSectionKey: SectionKey = state.currentSection || 'section1';
  let currentSectionData = state.testData?.[activeSectionKey];

  if ((!currentSectionData?.questions || currentSectionData.questions.length === 0) && state.testData) {
    const fallbackSection = (['section1', 'section2', 'section3'] as SectionKey[]).find(
      (sec) => state.testData?.[sec]?.questions && state.testData[sec].questions.length > 0
    );
    if (fallbackSection) {
      activeSectionKey = fallbackSection;
      currentSectionData = state.testData[fallbackSection];
    }
  }

  const safeQIndex =
    currentSectionData?.questions?.length &&
    state.currentQIndex >= 0 &&
    state.currentQIndex < currentSectionData.questions.length
      ? state.currentQIndex
      : 0;

  const currentQuestion = currentSectionData?.questions?.[safeQIndex];
  const totalQuestions = currentSectionData?.questions?.length || 0;

  // Mount and state diagnostic logger (guaranteed to run on every render before any returns)
  useEffect(() => {
    console.log('[TestEngine Mount Guard]', {
      mode: state.mode,
      packageId,
      isMockPackage,
      currentSection: activeSectionKey,
      questionsCount: totalQuestions,
      currentQuestionIndex: safeQIndex,
      timeLeft: state.timeLeft,
      targetEndTime: state.targetEndTime,
      isTestSubmitted: state.isTestSubmitted,
    });
  }, [state.mode, packageId, isMockPackage, activeSectionKey, totalQuestions, safeQIndex, state.timeLeft, state.targetEndTime, state.isTestSubmitted]);

  // Sync mode from navigation state if provided
  useEffect(() => {
    const passedMode = (location.state as any)?.mode;
    if (passedMode && passedMode !== state.mode && (passedMode === 'exam' || passedMode === 'study')) {
      dispatch({ type: 'SET_MODE', payload: passedMode });
    }
  }, [location.state, state.mode, dispatch]);

  // Prevent any outer page/window scrollbar while in TestPage
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Auto-sync section if mismatch detected (e.g. initial state section1 with 0 questions)
  useEffect(() => {
    if (state.testData && activeSectionKey && state.currentSection !== activeSectionKey) {
      dispatch({ type: 'SET_SECTION', payload: activeSectionKey });
      dispatch({ type: 'SET_QUESTION_INDEX', payload: safeQIndex });
    }
  }, [state.testData, activeSectionKey, state.currentSection, safeQIndex, dispatch]);

  const handlePlayAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(e => console.error(e));
    }
  }, []);

  // Auto-play audio when section1 starts and countdown finishes
  useEffect(() => {
    if (
      activeSectionKey === 'section1' &&
      !showCountdown &&
      !isLoadingData &&
      state.testData &&
      state.audioFile &&
      audioRef.current &&
      !isPlayingAudio
    ) {
      const timer = setTimeout(() => {
        audioRef.current?.play()
          .then(() => setIsPlayingAudio(true))
          .catch(e => console.warn('Auto-play blocked by browser:', e));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeSectionKey, showCountdown, isLoadingData, state.testData, state.audioFile, isPlayingAudio]);

  // Fetch actual questions from Supabase or local mock
  useEffect(() => {
    // If testData is already populated for this exact package, skip refetching
    if (state.testData && (state.selectedTestId === packageId || (isMockPackage && (state.selectedTestId === 'mock-skripsi' || state.selectedTestId === 'practice-test-1')))) {
      if (isMockPackage && (!state.testData.section1?.questions?.length && state.currentSection !== 'section3')) {
        dispatch({ type: 'SET_SECTION', payload: 'section3' });
        dispatch({ type: 'SET_QUESTION_INDEX', payload: 0 });
      }
      setIsLoadingData(false);
      return;
    }

    async function fetchQuestions() {
      setIsLoadingData(true);
      setError(null);

      // Keep context selectedTestId in sync if valid
      const targetTestId = packageId || 'mock-skripsi';
      if (state.selectedTestId !== targetTestId) {
        dispatch({ type: 'SET_SELECTED_TEST', payload: targetTestId });
      }

      // 3. Immediately load local 50-item reading mock without hitting Supabase for mock/reading/missing ID
      if (isMockPackage) {
        try {
          console.log('Loading local 50-question mock array safely for package ID:', packageId);
          const { testData, audioFile } = initializeTestData('practice-test-1');
          dispatch({ type: 'SET_SELECTED_TEST', payload: targetTestId });
          dispatch({ type: 'SET_TEST_DATA', payload: { testData, audioFile } });
          dispatch({ type: 'SET_SECTION', payload: 'section3' });
          dispatch({ type: 'SET_QUESTION_INDEX', payload: 0 });
          setIsLoadingData(false);
          return;
        } catch (mockErr: any) {
          console.error('Error loading local mock array:', mockErr);
          setError(`Failed to load local mock questions: ${mockErr?.message || String(mockErr)}`);
          setIsLoadingData(false);
          return;
        }
      }

      // 3. For database packages, query Supabase with resolved string ID
      try {
        setQueriedPackageId(packageId);
        console.log('Querying Supabase questions for package ID:', packageId);

        let { data, error: dbError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_package_id', packageId)
          .order('question_number', { ascending: true });

        // Safeguard fallback: user might have data split or migrated between exam_package_id and package_id columns
        const fallbackRes = await supabase
          .from('questions')
          .select('*')
          .eq('package_id', packageId)
          .order('question_number', { ascending: true });

        const len1 = data ? data.length : 0;
        const len2 = fallbackRes.data ? fallbackRes.data.length : 0;

        // Use whichever column returned MORE questions
        if (len2 > len1) {
          data = fallbackRes.data;
          dbError = fallbackRes.error;
        }

        console.log('Supabase questions query result for', packageId, ':', { count: data?.length, error: dbError });

        if (dbError) throw dbError;

        // 4. If empty array returned, log warning and display clear debug UI
        if (!data || data.length === 0) {
          console.warn('DB returned 0 questions for ID:', packageId);
          setError(`DB returned 0 questions for package ID: "${packageId}"`);
          setIsLoadingData(false);
          return;
        }

        // Detect if this package contains Test 4 questions
        const isTest4 =
          packageId === '28ed5a50-31f3-4dd4-b229-3826e7510996' ||
          data.some((q: any) =>
            q.option_a === 'Her concerns were expressed.' ||
            (q.question_text && q.question_text.includes('concert'))
          );

        // Correct audio for Test 4 is served from /audio/Listening Soal TEST 4.mp3
        let audioFile = isTest4
          ? '/audio/Listening Soal TEST 4.mp3'
          : 'https://coomgargeznmhdsobvtu.supabase.co/storage/v1/object/public/audio-files/Listening%20Soal%20TEST%202.mp3';

        const testData = {
          section1: { name: "Listening Comprehension", duration: 35, questions: [] },
          section2: { name: "Structure & Written Expression", duration: 25, questions: [] },
          section3: { name: "Reading Comprehension", duration: 55, questions: [] },
        };

        // Deduplicate rows by section_type and question_number (avoids multiple imports clutter)
        const seenQ = new Set<string>();
        const uniqueData = data.filter((q: any, idx: number) => {
          const type = (q.section_type || '').toLowerCase().trim();
          const qNum = Number(q.question_number) || (idx + 1);
          const key = `${type}-${qNum}`;
          if (seenQ.has(key)) return false;
          seenQ.add(key);
          return true;
        });

        uniqueData.forEach((q: any, idx: number) => {
          // Robust fallback mapping for options regardless of database structure
          const rawOptions = [
            q.option_a || q.options?.[0] || '',
            q.option_b || q.options?.[1] || '',
            q.option_c || q.options?.[2] || '',
            q.option_d || q.options?.[3] || ''
          ].map((opt: string) => sanitizeOptionText(opt));

          const rawKey =
            q.correct_answer ??
            q.answer ??
            q.key ??
            q.correct_option ??
            q.answer_key ??
            q.correct_choice;

          const resolved = resolveCorrectAnswer(rawOptions, rawKey);
          const correctText = resolved.text || (typeof rawKey === 'string' ? sanitizeOptionText(rawKey) : '');

          const type = (q.section_type || '').toLowerCase().trim();
          const qNum = Number(q.question_number) || (idx + 1);

          let cleanedText = cleanQuestionSentence(q.question_text || q.text || `Question ${q.question_number || idx + 1}`);

          // Structure Part B is usually question 16-40 (if numbered 1-40) or 66-90 (if numbered 1-140)
          const isPartB = type === 'structure' && ((qNum >= 16 && qNum <= 40) || (qNum >= 66 && qNum <= 90));
          if (isPartB) {
            const opts = rawOptions.filter((o: string) => o.trim().length > 0).sort((a: string, b: string) => b.length - a.length);
            const marker = `(?:\\([A-Da-d]\\)|[A-Da-d]\\.)`;
            opts.forEach((opt: string) => {
              if (opt.length < 1) return;
              const escapedOpt = opt.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex1 = new RegExp(`${marker}\\s*(${escapedOpt})`, 'gi');
              const regex2 = new RegExp(`(${escapedOpt})\\s*${marker}`, 'gi');
              
              if (regex1.test(cleanedText)) {
                cleanedText = cleanedText.replace(regex1, '<u class="underline decoration-2 underline-offset-4 decoration-primary font-semibold text-foreground">$1</u>');
              } else if (regex2.test(cleanedText)) {
                cleanedText = cleanedText.replace(regex2, '<u class="underline decoration-2 underline-offset-4 decoration-primary font-semibold text-foreground">$1</u>');
              } else {
                const regex3 = new RegExp(`\\b(${escapedOpt})\\b`, 'gi');
                cleanedText = cleanedText.replace(regex3, '<u class="underline decoration-2 underline-offset-4 decoration-primary font-semibold text-foreground">$1</u>');
              }
            });
            cleanedText = cleanedText.replace(new RegExp(`\\s*${marker}\\s*`, 'gi'), ' ').replace(/\s{2,}/g, ' ').trim();
          }

          const processedQ = {
            text: cleanedText,
            options: rawOptions,
            key: resolved.index >= 0 ? resolved.index : (typeof q.key === 'number' ? q.key : 0),
            correct_answer: correctText,
            answer: correctText,
            explanation: q.explanation,
            skill: q.skill,
            sub_skill: q.sub_skill,
            cognitive_level: q.cognitive_level,
            longman_skill: q.longman_skill,
            passageTitle: q.passage_title,
            passageText: q.passage_text,
            passageId: q.passage_id,
            shuffledOptions: processOptions(rawOptions, rawKey)
          };

          if (type === 'listening' || (!type && qNum <= 50)) {
            if (q.audio_url) {
              if (packageId && packageId.length > 20) {
                // Force correct audio for UUID packages
                audioFile = 'https://coomgargeznmhdsobvtu.supabase.co/storage/v1/object/public/audio-files/Listening%20Test%201-Longman.mp3';
              } else if (isTest4 && (q.audio_url.includes('TEST%202') || q.audio_url.includes('TEST 2'))) {
                audioFile = '/audio/Listening Soal TEST 4.mp3';
              } else {
                audioFile = q.audio_url;
              }
            }
            testData.section1.questions.push(processedQ as any);
          } else if (type === 'structure' || (!type && qNum > 50 && qNum <= 90)) {
            testData.section2.questions.push(processedQ as any);
          } else if (type === 'reading' || (!type && qNum > 90)) {
            testData.section3.questions.push(processedQ as any);
          } else {
            testData.section3.questions.push(processedQ as any);
          }
        });

        dispatch({ type: 'SET_TEST_DATA', payload: { testData, audioFile, preserveState: state.isRestored } });
      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(err.message || 'Failed to fetch test data.');
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchQuestions();
  }, [packageId, state.testData, state.selectedTestId, dispatch, retryCount]);

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
    if (state.mode === 'exam' && !state.isTestSubmitted && !showCountdown && state.testData && !isLoadingData) {
      if (state.targetEndTime === null) {
        const isReadingOnly = !state.testData?.section1?.questions?.length && !state.testData?.section2?.questions?.length;
        const currentSec = activeSectionKey || state.currentSection || (isReadingOnly ? 'section3' : 'section1');
        const durationMin = state.testData?.[currentSec]?.duration || (isReadingOnly ? 55 : 35);
        const validTimeSec = state.timeLeft > 0 ? state.timeLeft : (durationMin > 0 ? durationMin * 60 : 55 * 60);

        if (state.timeLeft <= 0) {
          dispatch({ type: 'SET_TIME_LEFT', payload: validTimeSec });
        }
        dispatch({ type: 'SET_TARGET_END_TIME', payload: Date.now() + validTimeSec * 1000 });
      }
    }
  }, [state.mode, state.isTestSubmitted, showCountdown, state.testData, isLoadingData, state.targetEndTime, state.timeLeft, activeSectionKey, state.currentSection, dispatch]);

  // Timer logic for exam mode (only when countdown done and targetEndTime armed)
  useEffect(() => {
    if (state.mode !== 'exam' || state.isTestSubmitted || showCountdown || isLoadingData || !state.testData) return;

    // Core tick — runs every second
    timerRef.current = setInterval(() => {
      if (state.targetEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
        dispatch({ type: 'SET_TIME_LEFT', payload: remaining });
      }
    }, 1000);

    const syncTimer = () => {
      if (state.targetEndTime !== null) {
        const remaining = Math.max(0, Math.ceil((state.targetEndTime - Date.now()) / 1000));
        dispatch({ type: 'SET_TIME_LEFT', payload: remaining });
      }
    };

    const handleVisibility = () => { if (!document.hidden) syncTimer(); };
    const handleFocus = () => syncTimer();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [state.mode, state.isTestSubmitted, showCountdown, isLoadingData, state.testData, state.targetEndTime, dispatch]);

  const proceedToNextSection = useCallback(() => {
    if (!state.testData || isLoadingData || state.isTestSubmitted) return;

    const isReadingOnly = !state.testData?.section1?.questions?.length && !state.testData?.section2?.questions?.length;
    const currentSec = activeSectionKey || state.currentSection;

    if (isReadingOnly || currentSec === 'section3') {
      dispatch({ type: 'SUBMIT_TEST' });
      return;
    }
    if (currentSec === 'section1') {
      dispatch({ type: 'SET_SECTION', payload: 'section2' });
      setShowCountdown(true);
    } else if (currentSec === 'section2') {
      dispatch({ type: 'SET_SECTION', payload: 'section3' });
      setShowCountdown(true);
    } else {
      dispatch({ type: 'SUBMIT_TEST' });
    }
  }, [state.testData, isLoadingData, state.isTestSubmitted, activeSectionKey, state.currentSection, dispatch]);

  // Navigate to results when test is submitted
  useEffect(() => {
    if (state.isTestSubmitted && state.view === 'results') {
      navigate('/results', { replace: true });
    }
  }, [state.isTestSubmitted, state.view, navigate]);

  // Handle time up — ONLY when examination mode is active, testData is loaded, not in countdown, targetEndTime is armed, and time has genuinely expired
  useEffect(() => {
    if (
      state.mode !== 'exam' ||
      state.isTestSubmitted ||
      showCountdown ||
      isLoadingData ||
      !state.testData ||
      state.targetEndTime === null
    ) {
      return;
    }

    if (state.timeLeft <= 0 && Date.now() >= state.targetEndTime) {
      console.log('[TestEngine] Time genuinely expired for section:', activeSectionKey || state.currentSection);
      proceedToNextSection();
    }
  }, [state.mode, state.isTestSubmitted, showCountdown, isLoadingData, state.testData, state.targetEndTime, state.timeLeft, activeSectionKey, state.currentSection, proceedToNextSection]);

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
    const currentSec = activeSectionKey || state.currentSection;
    dispatch({
      type: 'SET_ANSWER',
      payload: { section: currentSec, index: safeQIndex, answer }
    });
  }, [activeSectionKey, state.currentSection, safeQIndex, dispatch]);

  const handleChangeQuestion = useCallback((delta: number) => {
    if (!state.testData) return;
    const currentSec = activeSectionKey || state.currentSection;
    const total = state.testData[currentSec]?.questions?.length || 0;
    const newIdx = safeQIndex + delta;
    if (newIdx >= total) {
      handleNextSection();
      return;
    }
    if (newIdx < 0) return;
    dispatch({ type: 'SET_QUESTION_INDEX', payload: newIdx });
  }, [state.testData, activeSectionKey, state.currentSection, safeQIndex, dispatch, handleNextSection]);

  const handleToggleFlag = useCallback(() => {
    const currentSec = activeSectionKey || state.currentSection;
    dispatch({ type: 'TOGGLE_FLAG', payload: { section: currentSec, index: safeQIndex } });
  }, [activeSectionKey, state.currentSection, safeQIndex, dispatch]);

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
          const currentSec = activeSectionKey || state.currentSection;
          const currentQuestionData = state.testData?.[currentSec]?.questions?.[safeQIndex];
          if (currentQuestionData && currentQuestionData.shuffledOptions?.[index]) {
            const isStudyAnswered = state.mode === 'study' && state.userAnswers?.[currentSec]?.[safeQIndex] !== undefined;
            if (!isStudyAnswered) {
              handleSelectAnswer(currentQuestionData.shuffledOptions[index].text);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.testData, activeSectionKey, state.currentSection, safeQIndex, state.mode, state.userAnswers, handleChangeQuestion, handleSelectAnswer]);

  if (isLoadingData || !state.testData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030014] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-white/70 text-sm">Loading test questions...</div>
        </div>
      </div>
    );
  }

  // 4. Debug UI when empty array is returned or error occurred
  if (error || (!state.testData && !isLoadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030014] text-white p-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
        <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

        <div className="max-w-xl w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            No Questions Found
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mb-6">
            The test engine could not find any questions for the requested package. Please verify the package ID in Supabase or load the local fallback mock test.
          </p>

          {/* Debug Box */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 text-left font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">Active Package ID:</span>
              <span className="text-amber-300 font-semibold select-all break-all ml-2">
                {packageId || queriedPackageId || '(none provided)'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">Queried Table / Column:</span>
              <span className="text-indigo-300 ml-2">questions.exam_package_id</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Questions Returned:</span>
              <span className="text-rose-400 font-bold ml-2">0 items</span>
            </div>
            {error && (
              <div className="pt-2 border-t border-white/5 text-rose-300/80 text-[11px] leading-tight">
                Detail: {error}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                try {
                  const { testData, audioFile } = initializeTestData('practice-test-1');
                  dispatch({ type: 'SET_SELECTED_TEST', payload: 'mock-skripsi' });
                  dispatch({ type: 'SET_TEST_DATA', payload: { testData, audioFile } });
                  dispatch({ type: 'SET_SECTION', payload: 'section3' });
                  dispatch({ type: 'SET_QUESTION_INDEX', payload: 0 });
                  setError(null);
                } catch (e: any) {
                  setError(e.message || 'Failed to load fallback');
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20"
            >
              <BookOpen className="w-4 h-4" />
              Load Mock Skripsi (50 Items)
            </button>

            <button
              onClick={() => {
                setError(null);
                setIsLoadingData(true);
                setRetryCount(c => c + 1);
              }}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Query
            </button>

            <button
              onClick={() => {
                dispatch({ type: 'RESET_TEST' });
                navigate('/');
              }}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#030014] text-white p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-4">
          <p className="text-base font-semibold text-white/90">Question not found</p>
          <p className="text-xs text-white/50">The test questions could not be loaded into the current view.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                const { testData, audioFile } = initializeTestData('practice-test-1');
                dispatch({ type: 'SET_SELECTED_TEST', payload: 'mock-skripsi' });
                dispatch({ type: 'SET_TEST_DATA', payload: { testData, audioFile } });
                dispatch({ type: 'SET_SECTION', payload: 'section3' });
                dispatch({ type: 'SET_QUESTION_INDEX', payload: 0 });
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-600/20"
            >
              Load Reading Questions (50 Items)
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'RESET_TEST' });
                navigate('/');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userAnswer = state.userAnswers?.[activeSectionKey]?.[safeQIndex];
  const isFlagged = Boolean(state.flags?.[activeSectionKey]?.[safeQIndex]);
  const isReadingSection = activeSectionKey === 'section3';
  const answeredCount = Object.keys(state.userAnswers?.[activeSectionKey] || {}).length;
  const flaggedCount = Object.keys(state.flags?.[activeSectionKey] || {}).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const isLastSection = activeSectionKey === 'section3';

  // Auto-extract reference word/phrase and line number from question text
  // Supports single/double quotes, unquoted terms, HTML tags, and line numbers
  const readingRef = isReadingSection
    ? extractReadingReference(currentQuestion?.text || '')
    : {};
  const passageHighlight = readingRef.word;
  const passageHighlightLine = readingRef.line;

  // Get instruction
  let instruction = '';
  const qNum = safeQIndex + 1;
  if (activeSectionKey === 'section1' && qNum === 1) instruction = INSTRUCTIONS.s1_intro + '<br><hr class="my-3 border-primary/20">' + INSTRUCTIONS.s1_partA;
  else if (activeSectionKey === 'section1' && qNum === 31) instruction = INSTRUCTIONS.s1_partB;
  else if (activeSectionKey === 'section1' && qNum === 39) instruction = INSTRUCTIONS.s1_partC;
  else if (activeSectionKey === 'section2' && qNum === 1) instruction = INSTRUCTIONS.s2_partA;
  else if (activeSectionKey === 'section2' && qNum === 16) instruction = INSTRUCTIONS.s2_partB;
  else if (activeSectionKey === 'section3' && qNum === 1) instruction = INSTRUCTIONS.s3_general;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} bg-background flex flex-col h-screen h-[100dvh] overflow-hidden text-foreground transition-colors duration-300`}>
      {/* Section Countdown */}
      <AnimatePresence>
        {showCountdown && (
          <SectionCountdown
            sectionName={SECTION_NAMES[activeSectionKey] || 'Section'}
            onComplete={() => setShowCountdown(false)}
          />
        )}
      </AnimatePresence>

      {/* Section Confirm Dialog */}
      {showConfirm && (
        <SectionConfirmDialog
          sectionName={SECTION_NAMES[activeSectionKey] || 'Section'}
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
        sectionName={SECTION_NAMES[activeSectionKey] || 'Section'}
        timeLeft={state.timeLeft}
        mode={state.mode}
        userName={state.userData.name}
        userNim={state.userData.nim}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        currentSection={activeSectionKey}
        onSectionChange={handleSectionChange}
        visitedSections={state.visitedSections}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 min-h-0 pt-12 sm:pt-16 flex flex-col overflow-hidden">
        {activeSectionKey === 'section1' && state.audioFile && (
          <div className="w-full bg-card/80 backdrop-blur border-b border-border p-3 z-20 flex flex-col sm:flex-row items-center justify-center gap-4 flex-shrink-0">
            <span className="text-sm font-semibold text-primary/80 hidden sm:inline-block">Listening Audio</span>
            
            {state.mode === 'study' ? (
              <audio controls controlsList="nodownload" className="w-full max-w-lg h-10 outline-none" onContextMenu={(e) => e.preventDefault()}>
                <source src={state.audioFile} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="flex items-center gap-4 w-full max-w-lg bg-muted/50 rounded-lg p-2 border border-border/50">
                <audio 
                  ref={audioRef}
                  onEnded={() => setIsPlayingAudio(false)}
                  onPlay={() => setIsPlayingAudio(true)}
                  onPause={(e) => {
                    if (state.mode === 'exam' && e.currentTarget.currentTime > 0 && !e.currentTarget.ended) {
                      e.currentTarget.play();
                    }
                  }}
                  onSeeking={(e) => {
                    if (state.mode === 'exam') {
                      e.currentTarget.currentTime = lastValidTime.current;
                    }
                  }}
                  onTimeUpdate={(e) => {
                    if (state.mode === 'exam' && isPlayingAudio) {
                      lastValidTime.current = e.currentTarget.currentTime;
                    }
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={state.audioFile} type="audio/mpeg" />
                </audio>
                
                <div className="flex items-center gap-3 flex-1">
                  {isPlayingAudio ? (
                    <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md font-bold text-sm flex-shrink-0 animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full animate-ping" />
                      Playing... (Cannot be paused)
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-md font-bold text-sm flex-shrink-0 animate-pulse">
                      Preparing Audio...
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground flex-1">
                    Audio plays once per official EPT rules.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

        <motion.div
          key={`${activeSectionKey}-${safeQIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 min-h-0 flex ${isReadingSection ? 'flex-col lg:flex-row overflow-hidden' : 'flex-col overflow-hidden'} ${isReadingSection ? 'w-full' : 'max-w-7xl mx-auto w-full'}`}
        >
          {isReadingSection && currentQuestion.passageText && (
            <div className={`${mobileView === 'passage' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 min-h-0 flex-1 flex-col overflow-hidden`}>
              <ReadingPanel
                title={currentQuestion.passageTitle || 'Reading Passage'}
                text={currentQuestion.passageText}
                highlight={passageHighlight}
                highlightLine={passageHighlightLine}
                pulseKey={`${activeSectionKey}-${safeQIndex}-${userAnswer ?? ''}`}
              />
            </div>
          )}

          <div className={`${isReadingSection && currentQuestion.passageText ? (mobileView === 'questions' ? 'flex' : 'hidden') : 'flex'} lg:flex flex-1 min-h-0 flex-col overflow-hidden`}>
            <QuestionPanel
              question={currentQuestion}
              questionNumber={qNum}
              totalQuestions={totalQuestions}
              sectionName={SECTION_NAMES[activeSectionKey] || 'Section'}
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
          currentIndex={safeQIndex}
          answers={state.userAnswers?.[activeSectionKey] || {}}
          flags={state.flags?.[activeSectionKey] || {}}
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
