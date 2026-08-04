/**
 * examPersistence.ts
 * ------------------
 * localStorage helpers for persisting the Examination Mode session so that
 * a page refresh / accidental close does not lose the student's progress.
 *
 * Only **exam** mode sessions are persisted.  Study mode is never saved.
 *
 * Timer strategy:  We store `targetEndTime` (an absolute epoch-ms timestamp)
 * so the clock keeps ticking even while the page is closed.  On reload we
 * derive `timeLeft = max(0, ceil((targetEndTime - now) / 1000))`.
 */

import type { SectionKey, UserData } from '@/types/toefl';

const STORAGE_KEY = 'levelup_ept_exam_session';

/* ── Persisted shape ────────────────────────────────────────────────── */

export interface PersistedExamState {
  version: 1;
  selectedTestId: string;
  mode: 'exam';
  userData: UserData;
  currentSection: SectionKey;
  currentQIndex: number;
  userAnswers: Record<SectionKey, Record<number, string>>;
  flags: Record<SectionKey, Record<number, boolean>>;
  targetEndTime: number;   // absolute epoch-ms
  startedAt: number;
  tabSwitchCount: number;
  visitedSections: Record<SectionKey, boolean>;
  savedAt: number;         // epoch-ms when this snapshot was taken
}

/* ── Public API ─────────────────────────────────────────────────────── */

/**
 * Persist the current exam session to localStorage.
 *
 * @param params  The fields to persist (cherry-picked from TestState).
 * @param targetEndTime  The absolute epoch-ms when the timer hits zero.
 */
export function saveExamState(params: {
  selectedTestId: string;
  userData: UserData;
  currentSection: SectionKey;
  currentQIndex: number;
  userAnswers: Record<SectionKey, Record<number, string>>;
  flags: Record<SectionKey, Record<number, boolean>>;
  startedAt: number | null;
  tabSwitchCount: number;
  visitedSections: Record<SectionKey, boolean>;
}, targetEndTime: number): void {
  try {
    const data: PersistedExamState = {
      version: 1,
      selectedTestId: params.selectedTestId,
      mode: 'exam',
      userData: params.userData,
      currentSection: params.currentSection,
      currentQIndex: params.currentQIndex,
      userAnswers: params.userAnswers,
      flags: params.flags,
      targetEndTime,
      startedAt: params.startedAt ?? Date.now(),
      tabSwitchCount: params.tabSwitchCount,
      visitedSections: params.visitedSections,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or disabled — fail silently
    console.warn('[examPersistence] Could not save exam state.');
  }
}

/**
 * Attempt to load a previously-saved exam session.
 * Returns `null` if nothing is found, the data is corrupt, or the schema
 * version is unrecognised.
 */
export function loadExamState(): PersistedExamState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: PersistedExamState = JSON.parse(raw);

    // Basic sanity checks
    if (
      data.version !== 1 ||
      data.mode !== 'exam' ||
      typeof data.targetEndTime !== 'number' ||
      typeof data.startedAt !== 'number'
    ) {
      clearExamState();
      return null;
    }

    return data;
  } catch {
    clearExamState();
    return null;
  }
}

/**
 * Remove saved exam session from localStorage.
 * Safe to call even if nothing is stored.
 */
export function clearExamState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
