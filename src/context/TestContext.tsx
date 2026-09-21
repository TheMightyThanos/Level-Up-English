import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { UserData, TestMode, SectionKey, ViewState, TestData, TestResults } from '@/types/toefl';
import { initializeTestData } from '@/data/questions';
import { calculateResults } from '@/data/scoring';
import {
  saveExamState,
  loadExamState,
  clearExamState,
  PersistedExamState,
} from '@/services/examPersistence';

/* ── sessionStorage key for lightweight login persistence ── */
const LOGIN_SESSION_KEY = 'levelup_ept_login_session';

interface PersistedLoginSession {
  userData: UserData;
  view: ViewState;
  selectedTestId: string;
}

function saveLoginSession(session: PersistedLoginSession): void {
  try {
    sessionStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify(session));
  } catch { /* sessionStorage may be unavailable */ }
}

function loadLoginSession(): PersistedLoginSession | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedLoginSession;
    if (!data.userData?.name || !data.view) return null;
    return data;
  } catch {
    return null;
  }
}

function clearLoginSession(): void {
  try {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
  } catch { /* ignore */ }
}

interface TestState {
  view: ViewState;
  mode: TestMode;
  userData: UserData;
  selectedTestId: string;
  audioFile: string;
  testData: TestData | null;
  currentSection: SectionKey;
  currentQIndex: number;
  userAnswers: Record<SectionKey, Record<number, string>>;
  flags: Record<SectionKey, Record<number, boolean>>;
  timeLeft: number;
  isTestSubmitted: boolean;
  results: TestResults | null;
  tabSwitchCount: number;
  visitedSections: Record<SectionKey, boolean>;
  startedAt: number | null;
  /** Absolute epoch-ms when the exam timer reaches zero. */
  targetEndTime: number | null;
  /** True when the session was restored from localStorage (skip countdown). */
  isRestored: boolean;
}

type TestAction =
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'SET_MODE'; payload: TestMode }
  | { type: 'SET_SELECTED_TEST'; payload: string }
  | { type: 'START_TEST'; payload?: { testData: TestData; audioFile: string } }
  | { type: 'SET_TEST_DATA'; payload: { testData: TestData; audioFile: string; preserveState?: boolean } }
  | { type: 'SET_SECTION'; payload: SectionKey }
  | { type: 'SET_QUESTION_INDEX'; payload: number }
  | { type: 'SET_ANSWER'; payload: { section: SectionKey; index: number; answer: string } }
  | { type: 'TOGGLE_FLAG'; payload: { section: SectionKey; index: number } }
  | { type: 'SET_TIME_LEFT'; payload: number }
  | { type: 'SUBMIT_TEST' }
  | { type: 'INCREMENT_TAB_SWITCH' }
  | { type: 'RESET' }
  | { type: 'RESET_TEST' }
  | { type: 'RESTORE_SESSION'; payload: PersistedExamState }
  | { type: 'RESTORE_LOGIN'; payload: PersistedLoginSession }
  | { type: 'SET_TARGET_END_TIME'; payload: number };

const initialState: TestState = {
  view: 'login',
  mode: 'exam',
  userData: { name: '', nim: '', semester: '', gender: '' },
  selectedTestId: 'practice-test-1',
  audioFile: '/audio/audio_doang_part_B.mp3',
  testData: null,
  currentSection: 'section1',
  currentQIndex: 0,
  userAnswers: { section1: {}, section2: {}, section3: {} },
  flags: { section1: {}, section2: {}, section3: {} },
  timeLeft: 0,
  isTestSubmitted: false,
  results: null,
  tabSwitchCount: 0,
  visitedSections: { section1: true, section2: false, section3: false },
  startedAt: null,
  targetEndTime: null,
  isRestored: false,
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SELECTED_TEST':
      return { ...state, selectedTestId: action.payload };
    case 'START_TEST': {
      const { testData, audioFile } = action.payload || initializeTestData(state.selectedTestId);
      const now = Date.now();
      // Determine the first section that has questions
      const firstSection: SectionKey = testData?.section1?.questions?.length ? 'section1'
        : testData?.section2?.questions?.length ? 'section2'
        : 'section3';
      const initialDuration = testData?.[firstSection]?.duration ?? 35;
      return {
        ...state,
        testData,
        audioFile,
        view: 'test',
        currentSection: firstSection,
        currentQIndex: 0,
        userAnswers: { section1: {}, section2: {}, section3: {} },
        flags: { section1: {}, section2: {}, section3: {} },
        isTestSubmitted: false,
        results: null,
        timeLeft: initialDuration * 60,
        visitedSections: { section1: firstSection === 'section1', section2: firstSection === 'section2', section3: firstSection === 'section3' },
        startedAt: now,
        targetEndTime: now + initialDuration * 60 * 1000,
        isRestored: false,
      };
    }
    case 'SET_TEST_DATA': {
      const { testData, audioFile, preserveState } = action.payload;
      if (preserveState) {
        return {
          ...state,
          testData,
          audioFile,
        };
      }
      const now = Date.now();
      // Determine the first section that has questions
      const firstSection: SectionKey = testData?.section1?.questions?.length ? 'section1'
        : testData?.section2?.questions?.length ? 'section2'
        : 'section3';
      const initialDuration = testData?.[firstSection]?.duration ?? 35;
      return {
        ...state,
        testData,
        audioFile,
        view: 'test',
        currentSection: firstSection,
        currentQIndex: 0,
        userAnswers: { section1: {}, section2: {}, section3: {} },
        flags: { section1: {}, section2: {}, section3: {} },
        isTestSubmitted: false,
        results: null,
        timeLeft: initialDuration * 60,
        visitedSections: { section1: firstSection === 'section1', section2: firstSection === 'section2', section3: firstSection === 'section3' },
        startedAt: now,
        targetEndTime: now + initialDuration * 60 * 1000,
        isRestored: false,
      };
    }
    case 'SET_SECTION': {
      const duration = state.testData?.[action.payload]?.duration ?? 0;
      const now = Date.now();
      return {
        ...state,
        currentSection: action.payload,
        currentQIndex: 0,
        timeLeft: duration * 60,
        targetEndTime: now + duration * 60 * 1000,
        visitedSections: { ...state.visitedSections, [action.payload]: true },
      };
    }
    case 'SET_QUESTION_INDEX':
      return { ...state, currentQIndex: action.payload };
    case 'SET_ANSWER': {
      const { section, index, answer } = action.payload;
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [section]: { ...state.userAnswers[section], [index]: answer }
        }
      };
    }
    case 'TOGGLE_FLAG': {
      const { section, index } = action.payload;
      const current = { ...state.flags[section] };
      if (current[index]) {
        delete current[index];
      } else {
        current[index] = true;
      }
      return {
        ...state,
        flags: { ...state.flags, [section]: current }
      };
    }
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    case 'SET_TARGET_END_TIME':
      return { ...state, targetEndTime: action.payload };
    case 'SUBMIT_TEST': {
      if (!state.testData) return state;
      const elapsed = state.startedAt ? Math.max(0, Math.round((Date.now() - state.startedAt) / 1000)) : 0;
      const results = calculateResults(state.testData, state.userAnswers, elapsed);
      // Clear persisted session on successful submit
      clearExamState();
      return { ...state, isTestSubmitted: true, view: 'results', results, targetEndTime: null, isRestored: false };
    }
    case 'INCREMENT_TAB_SWITCH':
      return { ...state, tabSwitchCount: state.tabSwitchCount + 1 };
    case 'RESET':
      // Clear all persisted sessions on reset
      clearExamState();
      clearLoginSession();
      return initialState;
    case 'RESET_TEST':
      // Reset test state but keep user data and auth
      clearExamState();
      return {
        ...state,
        testData: null,
        currentSection: 'section1' as SectionKey,
        currentQIndex: 0,
        userAnswers: { section1: {}, section2: {}, section3: {} },
        flags: { section1: {}, section2: {}, section3: {} },
        timeLeft: 0,
        isTestSubmitted: false,
        results: null,
        tabSwitchCount: 0,
        visitedSections: { section1: true, section2: false, section3: false },
        startedAt: null,
        targetEndTime: null,
        isRestored: false,
      };
    case 'RESTORE_SESSION': {
      const saved = action.payload;
      const isMock = saved.selectedTestId === 'practice-test-1' || saved.selectedTestId === 'mock-skripsi' || saved.selectedTestId === 'reading-only' || saved.selectedTestId === 'default' || saved.selectedTestId === 'reading-section-only';
      let testData = null;
      let audioFile = '';
      if (isMock) {
        const initialized = initializeTestData(saved.selectedTestId);
        testData = initialized.testData;
        audioFile = initialized.audioFile;
      }
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((saved.targetEndTime - now) / 1000));
      return {
        ...state,
        view: 'test',
        mode: 'exam',
        userData: saved.userData,
        selectedTestId: saved.selectedTestId,
        testData,
        audioFile,
        currentSection: saved.currentSection,
        currentQIndex: saved.currentQIndex,
        userAnswers: saved.userAnswers,
        flags: saved.flags,
        timeLeft: remaining,
        targetEndTime: saved.targetEndTime,
        startedAt: saved.startedAt,
        tabSwitchCount: saved.tabSwitchCount,
        visitedSections: saved.visitedSections,
        isTestSubmitted: false,
        results: null,
        isRestored: true,
      };
    }
    case 'RESTORE_LOGIN': {
      const session = action.payload;
      return {
        ...state,
        userData: session.userData,
        view: session.view,
        selectedTestId: session.selectedTestId,
      };
    }
    default:
      return state;
  }
}

interface TestContextType {
  state: TestState;
  dispatch: React.Dispatch<TestAction>;
  getUnansweredCount: () => number;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, initialState);
  const hasAttemptedRestore = useRef(false);

  // ── Boot-time restore: load saved exam session from localStorage,
  //    falling back to sessionStorage login session ──
  useEffect(() => {
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    // Priority 1: Restore active exam session from localStorage
    const saved = loadExamState();
    if (saved) {
      const remaining = Math.max(0, Math.ceil((saved.targetEndTime - Date.now()) / 1000));
      if (remaining > 0) {
        dispatch({ type: 'RESTORE_SESSION', payload: saved });
        return;
      }
      clearExamState();
    }

    // Priority 2: Restore lightweight login session from sessionStorage
    const loginSession = loadLoginSession();
    if (loginSession) {
      dispatch({ type: 'RESTORE_LOGIN', payload: loginSession });
    }
  }, []);

  // ── Autosave: persist exam state to localStorage on every change ──
  useEffect(() => {
    if (
      state.view !== 'test' ||
      state.mode !== 'exam' ||
      state.isTestSubmitted ||
      !state.testData ||
      state.targetEndTime === null
    ) {
      return;
    }

    saveExamState(
      {
        selectedTestId: state.selectedTestId,
        userData: state.userData,
        currentSection: state.currentSection,
        currentQIndex: state.currentQIndex,
        userAnswers: state.userAnswers,
        flags: state.flags,
        startedAt: state.startedAt,
        tabSwitchCount: state.tabSwitchCount,
        visitedSections: state.visitedSections,
      },
      state.targetEndTime,
    );
  }, [
    state.view,
    state.mode,
    state.isTestSubmitted,
    state.testData,
    state.selectedTestId,
    state.userData,
    state.currentSection,
    state.currentQIndex,
    state.userAnswers,
    state.flags,
    state.startedAt,
    state.tabSwitchCount,
    state.visitedSections,
    state.targetEndTime,
  ]);

  // ── Persist login session to sessionStorage when view changes ──
  useEffect(() => {
    if (state.view !== 'login' && state.userData.name) {
      saveLoginSession({
        userData: state.userData,
        view: state.view,
        selectedTestId: state.selectedTestId,
      });
    }
  }, [state.view, state.userData, state.selectedTestId]);

  const getUnansweredCount = useCallback(() => {
    if (!state.testData) return 0;
    const total = state.testData[state.currentSection].questions.length;
    const answered = Object.keys(state.userAnswers[state.currentSection]).length;
    return total - answered;
  }, [state.testData, state.currentSection, state.userAnswers]);

  return (
    <TestContext.Provider value={{ state, dispatch, getUnansweredCount }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (!context) throw new Error('useTest must be used within TestProvider');
  return context;
}
