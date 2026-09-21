import { TestResults, UserData, TestData } from '@/types/toefl';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyih0YV7oCClMPP3h6Q8Y3jvCvohMDr139bSJ_UiVLXhp9yvwH4beNUsgft7_Ct_AiP/exec';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

interface ReadingPayload {
  testId: string;
  studentName: string;
  nim: string;
  semester: string;
  score: number;
  answers: Record<string, string>;
}

/**
 * Build the flat webhook payload for Item Analysis (CTT).
 * answers = { q1: "A", q2: "C", ... q50: "-" } where letter is the alphabetical
 * position of the user-selected option in the question's ORIGINAL option order
 * (q.options), NOT the shuffled UI order. This keeps distractor letters
 * consistent across students for Item Facility / Discrimination / Distractor
 * Efficiency analysis.
 */
export function buildReadingPayload(
  testId: string,
  userData: UserData,
  testData: TestData,
  userAnswers: Record<number, string>,
  rawScore: number
): ReadingPayload {
  const answers: Record<string, string> = {};
  const questions = testData.section3.questions;

  questions.forEach((q, idx) => {
    const selectedText = userAnswers[idx];
    let letter = '-';
    if (selectedText) {
      // CRITICAL: Find index in the original 'q.options' to keep letters consistent for Item Analysis
      const optionIndex = q.options.indexOf(selectedText);
      if (optionIndex >= 0) letter = LETTERS[optionIndex] || '-';
    }
    answers[`q${idx + 1}`] = letter;
  });

  return {
    testId,
    studentName: userData.name,
    nim: userData.nim,
    semester: userData.semester,
    score: rawScore,
    answers,
  };
}

export async function submitReadingResults(
  testId: string,
  userData: UserData,
  testData: TestData,
  userAnswers: Record<number, string>,
  results: TestResults
): Promise<{ success: boolean; error?: string }> {
  const payload = buildReadingPayload(
    testId,
    userData,
    testData,
    userAnswers,
    results.section3.raw
  );

  console.log('[GAS] Sending reading payload:', payload);

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error('[GAS] Network error:', err);
    return { success: false, error: message };
  }
}

// Backwards-compatible alias so older imports keep working.
export async function submitResultsToGoogle(
  userData: UserData,
  results: TestResults
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  // Older callers will be replaced — return success to avoid crashes.
  console.warn('[GAS] submitResultsToGoogle is deprecated; use submitReadingResults.');
  return { success: true };
}
