import { PerformanceCategory, Recommendation, AnalysisItem, TestData, SectionKey } from '@/types/toefl';

// ============================================================================
// EPT Reading Platform — Pure Section 3 Reading Comprehension scoring.
// All Listening / Structure / global TOEFL (310–677) logic has been removed.
// ============================================================================

// Cliffs Section 3 Reading scale (raw 0..50 → EPT Reading Scaled 31..67)
export const READING_SCALE = [
  31, 31, 31, 31, 31, 31, 31, 31, 31, 31,
  31, 31, 31, 32, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 43, 44, 45, 46, 46, 47,
  48, 48, 49, 50, 51, 52, 52, 53, 54, 55,
  56, 57, 58, 59, 60, 61, 63, 65, 66, 66, 67,
];

export function getReadingScaledScore(rawScore: number): number {
  const idx = Math.max(0, Math.min(rawScore, READING_SCALE.length - 1));
  return READING_SCALE[idx];
}

// ============================================================================
// Brown's Taxonomy — Reading microskill classifier.
// Auto-tags each item based on its stem so we can build a Skill Mastery
// Breakdown without hand-labeling all 50 items.
// ============================================================================

export type ReadingMicroskill =
  | 'Main Idea / Gist'
  | 'Vocabulary in Context'
  | 'Reference'
  | 'Factual Detail'
  | 'Negative Factual'
  | 'Inference'
  | "Author's Purpose / Tone";

export const MICROSKILL_TO_MACROSKILL: Record<ReadingMicroskill, string> = {
  'Main Idea / Gist': 'Literal Comprehension',
  'Vocabulary in Context': 'Literal Comprehension',
  'Reference': 'Literal Comprehension',
  'Factual Detail': 'Literal Comprehension',
  'Negative Factual': 'Literal Comprehension',
  'Inference': 'Inferential Comprehension',
  "Author's Purpose / Tone": 'Inferential Comprehension',
};

// ---------------------------------------------------------------------------
// Canonical 7-bucket grouping for the Skill Mastery Breakdown.
// Every fragmented authored sub-skill (e.g. "Explicit Detail — Cause/Reason",
// "Vocabulary in Context (idiom)") is normalized into ONE of these 7 buckets.
// ---------------------------------------------------------------------------

export type CanonicalReadingSkill =
  | 'Vocabulary in Context / Reading Strategies'
  | 'Explicit Detail'
  | 'Explicit Detail with Computation'
  | 'Inference and Implied Meaning'
  | 'Negative Detail (EXCEPT/NOT)'
  | 'Main Idea / Best Title'
  | 'Cohesive Device / Pronoun Reference';

export const CANONICAL_READING_SKILLS: CanonicalReadingSkill[] = [
  'Vocabulary in Context / Reading Strategies',
  'Explicit Detail',
  'Explicit Detail with Computation',
  'Inference and Implied Meaning',
  'Negative Detail (EXCEPT/NOT)',
  'Main Idea / Best Title',
  'Cohesive Device / Pronoun Reference',
];

/**
 * Normalize any authored skill label OR a raw question stem into one of the
 * 7 canonical buckets. Order of checks matters: negative + computation are
 * tested before generic "detail" so they don't get swallowed.
 */
export function toCanonicalSkill(input: string, questionText = ''): CanonicalReadingSkill {
  const hay = `${input || ''} ${questionText || ''}`.toLowerCase();

  // 1. Negative detail beats everything else (the stem literally says NOT/EXCEPT).
  if (/\bexcept\b|\bnot\b|negative/.test(hay)) return 'Negative Detail (EXCEPT/NOT)';

  // 2. Pronoun / cohesive reference.
  if (/refer(s|red|ence)?\b|pronoun|cohesive|cohesion|antecedent/.test(hay))
    return 'Cohesive Device / Pronoun Reference';

  // 3. Main idea / best title / primary purpose.
  if (/main idea|best title|primary purpose|mainly (about|concerned|discuss)|gist|overall/.test(hay))
    return 'Main Idea / Best Title';

  // 4. Vocabulary in context / reading strategies (scanning, skimming, etc.).
  if (/vocab|closest in meaning|nearest in meaning|could best be replaced|idiom|word .* mean|reading strateg|scan|skim/.test(hay))
    return 'Vocabulary in Context / Reading Strategies';

  // 5. Inference / implied meaning / author tone / purpose.
  if (/infer|imply|implied|suggest|author|tone|attitude|purpose/.test(hay))
    return 'Inference and Implied Meaning';

  // 6. Explicit detail WITH computation (numbers, dates, durations, calculations).
  if (/computation|calculat|how many|how much|how long|how old|percent|number of|ratio/.test(hay))
    return 'Explicit Detail with Computation';

  // 7. Default — explicit detail (stated facts, cause/reason, location, etc.).
  return 'Explicit Detail';
}

export function classifyReadingSkill(text: string): ReadingMicroskill {
  const t = (text || '').toLowerCase();
  if (/\bnot\b|\bexcept\b/.test(text)) return 'Negative Factual';
  if (/main(ly)?\s+(concerned|about|idea)|best title|primarily about|main purpose|passage mainly/.test(t))
    return 'Main Idea / Gist';
  if (/refer(s|red)?\s+to/.test(t)) return 'Reference';
  if (/closest in meaning|nearest in meaning|could best be replaced/.test(t)) return 'Vocabulary in Context';
  if (/infer|inferred|imply|implied|suggest/.test(t)) return 'Inference';
  if (/author('s)?|tone|attitude|purpose of the (passage|author)/.test(t)) return "Author's Purpose / Tone";
  return 'Factual Detail';
}

// ============================================================================
// Performance category — based on Reading percentage (0–100), not TOEFL scale.
// ============================================================================

export function getPerformanceCategory(percentage: number): PerformanceCategory {
  if (percentage >= 90) return { level: 'Excellent', color: 'green', message: 'Outstanding reading comprehension!' };
  if (percentage >= 75) return { level: 'Very Good', color: 'blue', message: 'Strong reading skills' };
  if (percentage >= 60) return { level: 'Good', color: 'indigo', message: 'Solid reading foundation' };
  if (percentage >= 45) return { level: 'Fair', color: 'yellow', message: 'Room for improvement' };
  return { level: 'Needs Improvement', color: 'red', message: 'Keep practicing your reading!' };
}

export function generateRecommendations(
  analysis: { skillBreakdown: Record<string, { correct: number; total: number }> }
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  if (!analysis.skillBreakdown) return recommendations;

  Object.entries(analysis.skillBreakdown).forEach(([skill, data]) => {
    if (data.total === 0) return;
    const accuracy = (data.correct / data.total) * 100;
    if (accuracy < 70) {
      recommendations.push({
        skill,
        accuracy: accuracy.toFixed(1),
        priority: accuracy < 40 ? 'critical' : accuracy < 60 ? 'high' : 'medium',
        message: `Focus on ${skill} — current accuracy ${accuracy.toFixed(1)}% (${data.correct}/${data.total}).`,
      });
    }
  });

  return recommendations.sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));
}

// ============================================================================
// Main scoring — Reading-only.
// ============================================================================

export function calculateResults(
  testData: TestData,
  userAnswers: Record<SectionKey, Record<number, string>>,
  completionSeconds = 0,
) {
  const analysis: {
    section1: AnalysisItem[];
    section2: AnalysisItem[];
    section3: AnalysisItem[];
    wrongQuestions: AnalysisItem[];
    skillBreakdown: Record<string, { correct: number; total: number }>;
  } = {
    section1: [],
    section2: [],
    section3: [],
    wrongQuestions: [],
    skillBreakdown: {},
  };

  const sectionData = testData.section3;
  const answers = userAnswers.section3 || {};

  sectionData.questions.forEach((q, idx) => {
    const userAns = answers[idx];
    const correctOpt = q.shuffledOptions?.find((opt) => opt.isCorrect);
    const isCorrect = !!(userAns && correctOpt && userAns === correctOpt.text);
    // Prefer the explicitly authored skill on the question; fall back to the
    // auto-classifier so legacy items without a skill still get tagged.
    const authoredSkill = (q.skill || '').trim();
    const microskill = (authoredSkill || classifyReadingSkill(q.text || '')) as ReadingMicroskill;
    const macroskill =
      MICROSKILL_TO_MACROSKILL[microskill as ReadingMicroskill] || 'Reading Comprehension';

    const item: AnalysisItem = {
      number: idx + 1,
      section: 'section3',
      question: q.text || 'No question text',
      userAnswer: userAns || 'Not Answered',
      correctAnswer: correctOpt?.text || 'Unknown',
      isCorrect,
      skill: microskill,
      sub_skill: macroskill,
      explanation: q.explanation || '',
      topic: microskill,
      longman_skill: q.longman_skill || undefined,
    };


    analysis.section3.push(item);
    if (!isCorrect) analysis.wrongQuestions.push(item);

    // Group into one of the 7 canonical buckets for the Skill Mastery Breakdown.
    const canonical = toCanonicalSkill(authoredSkill || microskill, q.text || '');
    if (!analysis.skillBreakdown[canonical]) {
      analysis.skillBreakdown[canonical] = { correct: 0, total: 0 };
    }
    analysis.skillBreakdown[canonical].total++;
    if (isCorrect) analysis.skillBreakdown[canonical].correct++;
  });

  const rawReading = analysis.section3.filter((i) => i.isCorrect).length;
  const totalItems = sectionData.questions.length;
  const scaledReading = getReadingScaledScore(rawReading);
  const percentage = totalItems > 0 ? Math.round((rawReading / totalItems) * 1000) / 10 : 0;

  return {
    // Kept for backwards compatibility with existing UI; represents READING percentage (0-100).
    totalScore: percentage,
    percentage,
    completionSeconds,
    section1: { raw: 0, scaled: 0, total: 0 },
    section2: { raw: 0, scaled: 0, total: 0 },
    section3: { raw: rawReading, scaled: scaledReading, total: totalItems },
    analysis,
  };
}
