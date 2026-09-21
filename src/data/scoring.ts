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

function getSectionScaledScore(raw: number, total: number): number {
  if (total === 0) return 0;
  // Standard TOEFL ITP linear approximation mapping raw score to 31-68 scale
  return Math.round((raw / total) * 37) + 31;
}

// ============================================================================
// Text Sanitization & Reference Extraction Helpers
// ============================================================================

/**
 * Aggressively cleans question sentence text: strips HTML tags, class attributes,
 * Tailwind/CSS residue, and rogue markup.
 */
export function cleanQuestionSentence(rawText: string = ''): string {
  if (!rawText) return '';
  return String(rawText)
    .replace(/class\s*=\s*"[^"]*"/gi, '')
    .replace(/class\s*=\s*'[^']*'/gi, '')
    .replace(/font-semibold.*?(?=>|\s|"|;|')/gi, '')
    .replace(/text-primary.*?(?=>|\s|"|;|')/gi, '')
    .replace(/border-primary.*?(?=>|\s|"|;|')/gi, '')
    .replace(/bg-primary.*?(?=>|\s|"|;|')/gi, '')
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Strips rogue HTML tags, markdown symbols, or debug metadata from option strings.
 */
export function sanitizeOptionText(raw: string = ''): string {
  if (!raw) return '';
  return String(raw)
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip HTML tags
    .replace(/\[\/?(?:b|i|u|strong|em|mark|tag)[^\]]*\]/gi, '') // Strip BBCode tags
    .replace(/^\[.*?\]\s*/g, '') // Strip leading bracket tags like [tag]
    .trim();
}

export interface ReadingReference {
  word?: string;
  line?: number;
}

/**
 * Robustly extracts referenced line numbers and target vocabulary words/phrases
 * from question stems (e.g. for Reading vocabulary-in-context questions).
 */
export function extractReadingReference(text: string = ''): ReadingReference {
  if (!text) return {};

  // 1. Extract line number
  let line: number | undefined;
  const lineMatch = text.match(/\blines?\s+(\d+)/i) || text.match(/\b(\d+)(?:st|nd|rd|th)?\s+line\b/i);
  if (lineMatch) {
    const parsed = parseInt(lineMatch[1], 10);
    if (!isNaN(parsed)) line = parsed;
  }

  // 2. Extract target word or phrase
  let word: string | undefined;

  // Pattern A: Explicit indicator with quotes: (the word|phrase|term|expression)\s+["'“‘]([^"'”’]+)["'”’]
  const explicitQuoted = text.match(/(?:word|phrase|term|expression)\s*[:\s]?\s*["'“‘]([^"'”’]+)["'”’]/i);
  if (explicitQuoted && explicitQuoted[1]) {
    word = explicitQuoted[1].trim();
  }

  // Pattern B: Explicit indicator with HTML/Markdown: (the word|phrase|term)\s+<b>([^<]+)<\/b>
  if (!word) {
    const explicitTag = text.match(/(?:word|phrase|term|expression)\s*[:\s]?\s*(?:<b>|<strong>)([^<]+)(?:<\/b>|<\/strong>)/i);
    if (explicitTag && explicitTag[1]) {
      word = explicitTag[1].trim();
    }
  }

  // Pattern C: Any quoted phrase that precedes "in line" or "is closest in meaning" or "refers to"
  if (!word) {
    const contextualQuoted = text.match(/["'“‘]([^"'”’]{1,50})["'”’]\s*(?:in\s+line|is\s+closest|refers\s+to|means)/i);
    if (contextualQuoted && contextualQuoted[1]) {
      word = contextualQuoted[1].trim();
    }
  }

  // Pattern D: General quoted term (single or double quotes) if it's 1-4 words (avoid matching full sentence questions)
  if (!word) {
    const allQuotes = Array.from(text.matchAll(/["'“‘]([^"'”’]{1,50})["'”’]/g));
    for (const m of allQuotes) {
      const candidate = m[1].trim();
      // Avoid matching option choices like (A) or empty
      if (candidate.length > 0 && !/^[A-D]$/i.test(candidate)) {
        if (/word|phrase|term|line|meaning|refer/i.test(text)) {
          word = candidate;
          break;
        }
      }
    }
  }

  // Pattern E: Unquoted word followed by "in line" or "is closest in meaning"
  if (!word) {
    const unquotedMatch = text.match(/(?:word|phrase|term)\s+([a-zA-Z\-]{2,30})\s+(?:in\s+line|is\s+closest)/i);
    if (unquotedMatch && unquotedMatch[1]) {
      word = unquotedMatch[1].trim();
    }
  }

  // Clean word if it captured extra punctuation or "in line"
  if (word) {
    word = word.replace(/\s+in\s+lines?\s+\d+.*$/i, '').trim();
    word = word.replace(/^[,\.\:;]+|[,\.\:;]+$/g, '').trim();
  }

  return { word: word && word.length > 0 ? word : undefined, line };
}

// ============================================================================
// Answer Resolution Helper
// ============================================================================

/**
 * Resolves the true correct answer index and text from various formats:
 * - Number: 0, 1, 2, 3
 * - Number string: "0", "1", "2", "3"
 * - Letter string: "A", "B", "C", "D", "(A)", "A.", "a", "b", "c", "d"
 * - Option key: "option_a", "option_b", "option_c", "option_d"
 * - Option text matching
 */
export function resolveCorrectAnswer(
  options: string[] = [],
  rawKeyOrAnswer: any
): { index: number; text: string; label: string } {
  const cleanOptions = (options || []).map((o) => sanitizeOptionText(o));
  if (!cleanOptions || cleanOptions.length === 0) {
    const fallbackText =
      rawKeyOrAnswer !== undefined && rawKeyOrAnswer !== null ? sanitizeOptionText(String(rawKeyOrAnswer)) : '';
    return { index: -1, text: fallbackText, label: fallbackText };
  }

  // 1. Direct number check
  if (typeof rawKeyOrAnswer === 'number' && rawKeyOrAnswer >= 0 && rawKeyOrAnswer < options.length) {
    const letter = String.fromCharCode(65 + rawKeyOrAnswer);
    return {
      index: rawKeyOrAnswer,
      text: options[rawKeyOrAnswer],
      label: `(${letter}) ${options[rawKeyOrAnswer]}`
    };
  }

  if (rawKeyOrAnswer === undefined || rawKeyOrAnswer === null || rawKeyOrAnswer === '') {
    return { index: -1, text: '', label: '' };
  }

  const str = String(rawKeyOrAnswer).trim();

  // 2. Numeric string: "0", "1", "2", "3"
  const parsedNum = parseInt(str, 10);
  if (!isNaN(parsedNum) && String(parsedNum) === str && parsedNum >= 0 && parsedNum < options.length) {
    const letter = String.fromCharCode(65 + parsedNum);
    return {
      index: parsedNum,
      text: options[parsedNum],
      label: `(${letter}) ${options[parsedNum]}`
    };
  }

  // 3. Option name: "option_a", "option_b", "option_c", "option_d"
  const optMatch = str.toLowerCase().match(/^option_([a-d])$/);
  if (optMatch) {
    const idx = optMatch[1].charCodeAt(0) - 97;
    if (idx >= 0 && idx < options.length) {
      const letter = String.fromCharCode(65 + idx);
      return {
        index: idx,
        text: options[idx],
        label: `(${letter}) ${options[idx]}`
      };
    }
  }

  // 4. Letter string: "A", "B", "C", "D", "(A)", "A.", " [A] ", etc.
  const cleanLetter = str.replace(/[\(\)\[\]\.\:\s]/g, '').toUpperCase();
  if (cleanLetter.length === 1 && cleanLetter >= 'A' && cleanLetter <= 'D') {
    const idx = cleanLetter.charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) {
      return {
        index: idx,
        text: options[idx],
        label: `(${cleanLetter}) ${options[idx]}`
      };
    }
  }

  // 5. Match option text (exact or trimmed)
  const exactIdx = options.findIndex((opt) => opt && opt.trim() === str);
  if (exactIdx !== -1) {
    const letter = String.fromCharCode(65 + exactIdx);
    return {
      index: exactIdx,
      text: options[exactIdx],
      label: `(${letter}) ${options[exactIdx]}`
    };
  }

  // 6. Match option text (case-insensitive)
  const lowerStr = str.toLowerCase();
  const ciIdx = options.findIndex((opt) => opt && opt.trim().toLowerCase() === lowerStr);
  if (ciIdx !== -1) {
    const letter = String.fromCharCode(65 + ciIdx);
    return {
      index: ciIdx,
      text: options[ciIdx],
      label: `(${letter}) ${options[ciIdx]}`
    };
  }

  // 7. Partial match: if str starts with or is contained in an option
  const partialIdx = options.findIndex(
    (opt) => opt && (opt.toLowerCase().includes(lowerStr) || lowerStr.includes(opt.toLowerCase()))
  );
  if (partialIdx !== -1 && options[partialIdx].length > 0) {
    const letter = String.fromCharCode(65 + partialIdx);
    return {
      index: partialIdx,
      text: options[partialIdx],
      label: `(${letter}) ${options[partialIdx]}`
    };
  }

  // Fallback: if cannot resolve index, return string as text and label
  return { index: -1, text: str, label: str };
}

// ============================================================================
// Main scoring
// ============================================================================

export function calculateResults(
  testData: TestData,
  userAnswers: Record<SectionKey, Record<number, string>>,
  completionSeconds = 0,
  testId?: string
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

  const sections: SectionKey[] = ['section1', 'section2', 'section3'];
  
  sections.forEach((secKey) => {
    const sectionData = testData[secKey];
    const answers = userAnswers[secKey] || {};

    sectionData.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      const correctOpt = q.shuffledOptions?.find((opt) => opt.isCorrect);

      // 1. Resolve true correct answer
      const rawCorrect =
        correctOpt?.text ||
        q.correct_answer ||
        q.answer ||
        (typeof q.key === 'number' && q.options ? q.options[q.key] : q.key);

      const resolved = resolveCorrectAnswer(q.options || [], rawCorrect);
      const trueCorrectText =
        correctOpt?.text || resolved.text || (typeof rawCorrect === 'string' ? rawCorrect : '');

      // 2. Cleanly compare user's answer against true correct answer
      let isCorrect = false;
      if (userAns && userAns !== 'Not Answered') {
        const trimmedUser = userAns.trim();
        const trimmedCorrect = trueCorrectText.trim();

        // Direct match with correct option from shuffled list
        if (correctOpt && trimmedUser === correctOpt.text.trim()) {
          isCorrect = true;
        }
        // Case-insensitive direct text match
        else if (trimmedCorrect && trimmedUser.toLowerCase() === trimmedCorrect.toLowerCase()) {
          isCorrect = true;
        }
        // User selected a letter choice like 'A', 'B', 'C', 'D' (or '(A)', 'A.')
        else {
          const cleanUserLetter = trimmedUser.replace(/[\(\)\[\]\.\:\s]/g, '').toUpperCase();
          if (cleanUserLetter.length === 1 && cleanUserLetter >= 'A' && cleanUserLetter <= 'D') {
            const userLetterIdx = cleanUserLetter.charCodeAt(0) - 65;

            // Check against resolved original index (e.g. A=0, B=1, C=2, D=3 in q.options)
            if (resolved.index >= 0 && userLetterIdx === resolved.index) {
              isCorrect = true;
            }
            // Check against shuffledOptions index if user selected letter in UI
            else if (q.shuffledOptions && q.shuffledOptions[userLetterIdx]?.isCorrect) {
              isCorrect = true;
            }
            // Check if q.options[userLetterIdx] matches trueCorrectText
            else if (
              q.options &&
              q.options[userLetterIdx] &&
              q.options[userLetterIdx].trim().toLowerCase() === trimmedCorrect.toLowerCase()
            ) {
              isCorrect = true;
            }
          }
          // User answer matches an option text that is the correct one
          else if (q.options) {
            const userOptIdx = q.options.findIndex(
              (opt) => opt && opt.trim().toLowerCase() === trimmedUser.toLowerCase()
            );
            if (
              userOptIdx >= 0 &&
              (userOptIdx === resolved.index || (typeof q.key === 'number' && userOptIdx === q.key))
            ) {
              isCorrect = true;
            }
          }
        }
      }

      const authoredSkill = (q.skill || '').trim();
      let microskill = authoredSkill;
      if (!microskill && secKey === 'section3') {
        microskill = classifyReadingSkill(q.text || '') as ReadingMicroskill;
      }
      
      const macroskill = secKey === 'section3' 
        ? MICROSKILL_TO_MACROSKILL[microskill as ReadingMicroskill] || 'Reading Comprehension'
        : secKey === 'section1' ? 'Listening Comprehension' : 'Structure & Written Expression';

      // 3. Format clean display values for userAnswer and correctAnswer
      let displayCorrect = trueCorrectText;
      if (!displayCorrect || displayCorrect.toLowerCase() === 'unknown') {
        if (resolved.label) {
          displayCorrect = resolved.label;
        } else if (q.correct_answer) {
          displayCorrect = String(q.correct_answer);
        } else if (q.answer) {
          displayCorrect = String(q.answer);
        } else if (typeof q.key === 'number' && q.options?.[q.key]) {
          const letter = String.fromCharCode(65 + q.key);
          displayCorrect = `(${letter}) ${q.options[q.key]}`;
        } else if (q.key !== undefined && q.key !== null) {
          displayCorrect = `Option ${q.key}`;
        } else {
          displayCorrect = 'Key unavailable';
        }
      } else {
        const alreadyHasLetter = /^\(?[A-Da-d]\)?[\.\s]/.test(displayCorrect);
        if (resolved.index >= 0 && !alreadyHasLetter) {
          const letter = String.fromCharCode(65 + resolved.index);
          displayCorrect = `(${letter}) ${displayCorrect}`;
        }
      }

      let displayUser = userAns || 'Not Answered';
      if (userAns && q.options) {
        const userOptIdx = q.options.findIndex((opt) => opt && opt.trim() === userAns.trim());
        const alreadyHasLetter = /^\(?[A-Da-d]\)?[\.\s]/.test(userAns);
        if (userOptIdx >= 0 && !alreadyHasLetter) {
          const letter = String.fromCharCode(65 + userOptIdx);
          displayUser = `(${letter}) ${sanitizeOptionText(userAns)}`;
        } else {
          displayUser = sanitizeOptionText(userAns);
        }
      } else if (userAns) {
        displayUser = sanitizeOptionText(userAns);
      }

      const item: AnalysisItem = {
        number: idx + 1,
        section: secKey,
        question: cleanQuestionSentence(q.text) || 'No question text',
        userAnswer: displayUser,
        correctAnswer: sanitizeOptionText(displayCorrect),
        isCorrect,
        skill: microskill,
        sub_skill: macroskill,
        explanation: q.explanation || '',
        topic: microskill,
        longman_skill: q.longman_skill || undefined,
      };

      analysis[secKey].push(item);
      if (!isCorrect) analysis.wrongQuestions.push(item);

      if (secKey === 'section3') {
        const canonical = toCanonicalSkill(authoredSkill || microskill, q.text || '');
        if (!analysis.skillBreakdown[canonical]) {
          analysis.skillBreakdown[canonical] = { correct: 0, total: 0 };
        }
        analysis.skillBreakdown[canonical].total++;
        if (isCorrect) analysis.skillBreakdown[canonical].correct++;
      }
    });
  });

  const rawSection1 = analysis.section1.filter((i) => i.isCorrect).length;
  const rawSection2 = analysis.section2.filter((i) => i.isCorrect).length;
  const rawSection3 = analysis.section3.filter((i) => i.isCorrect).length;
  
  const isReadingOnly = testId === 'mock-skripsi' || (!testData.section1.questions.length && !testData.section2.questions.length);

  if (isReadingOnly) {
    const totalItems = testData.section3.questions.length;
    const scaledReading = getReadingScaledScore(rawSection3);
    const percentage = totalItems > 0 ? Math.round((rawSection3 / totalItems) * 1000) / 10 : 0;

    return {
      totalScore: percentage,
      percentage,
      completionSeconds,
      section1: { raw: 0, scaled: 0, total: 0 },
      section2: { raw: 0, scaled: 0, total: 0 },
      section3: { raw: rawSection3, scaled: scaledReading, total: totalItems },
      analysis,
    };
  } else {
    // Full EPT Logic
    const lTotal = testData.section1.questions.length;
    const sTotal = testData.section2.questions.length;
    const rTotal = testData.section3.questions.length;

    const lScaled = getSectionScaledScore(rawSection1, lTotal);
    const sScaled = getSectionScaledScore(rawSection2, sTotal);
    const rScaled = getSectionScaledScore(rawSection3, rTotal);

    // Standard EPT Final Score Formula
    const finalScore = Math.round(((lScaled + sScaled + rScaled) * 10) / 3);

    const totalRaw = rawSection1 + rawSection2 + rawSection3;
    const totalItems = lTotal + sTotal + rTotal;
    const percentage = totalItems > 0 ? Math.round((totalRaw / totalItems) * 1000) / 10 : 0;

    return {
      totalScore: finalScore,
      percentage,
      completionSeconds,
      section1: { raw: rawSection1, scaled: lScaled, total: lTotal },
      section2: { raw: rawSection2, scaled: sScaled, total: sTotal },
      section3: { raw: rawSection3, scaled: rScaled, total: rTotal },
      analysis,
    };
  }
}
