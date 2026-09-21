import { Question, TestData } from '@/types/toefl';
import { RawQuestion } from './question-types';
import { getTestById } from './test-registry';
import { supabase } from '@/lib/supabase';

// Default fallback imports for backward compatibility
import { section1Questions as defaultS1 } from './section1-questions';
import { section2Questions as defaultS2 } from './section2-questions';
import { section3Passages as defaultS3 } from './section3-questions';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resolveKeyIndex(key: number | string): number {
  if (typeof key === 'number') return key;
  const letterMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  return letterMap[key.toUpperCase()] ?? 0;
}

function processOptions(options: string[], correctIndex: number | string) {
  const idx = resolveKeyIndex(correctIndex);
  return options.map((opt, i) => ({
    text: opt,
    isCorrect: i === idx
  }));
}

function processRawQuestion(q: RawQuestion): Question {
  return {
    text: q.text,
    options: q.options,
    key: q.key,
    explanation: q.explanation,
    skill: q.skill,
    sub_skill: q.sub_skill,
    cognitive_level: q.cognitive_level,
    longman_skill: q.longman_skill,
    shuffledOptions: processOptions(q.options, q.key)
  };
}

export function initializeTestData(testId: string = 'practice-test-1'): { testData: TestData; audioFile: string } {
  const testConfig = getTestById(testId);

  const section1Questions = testConfig?.section1Questions ?? defaultS1;
  const section2Questions = testConfig?.section2Questions ?? defaultS2;
  const section3Passages = testConfig?.section3Passages ?? defaultS3;
  const audioFile = testConfig?.audioFile ?? '/audio/audio_doang_part_B.mp3';

  // Process section 1 & 2
  const s1Questions = section1Questions.map(processRawQuestion);
  const s2Questions = section2Questions.map(processRawQuestion);

  // Process section 3 (reading passages)
  const s3Questions: Question[] = [];
  section3Passages.forEach((passage, passageIdx) => {
    passage.questions.forEach(q => {
      s3Questions.push({
        text: q.text,
        options: q.options,
        key: q.key,
        explanation: q.explanation,
        skill: q.skill,
        sub_skill: q.sub_skill,
        cognitive_level: q.cognitive_level,
        longman_skill: q.longman_skill,
        passageTitle: passage.title,
        passageText: passage.text,
        passageId: passageIdx,
        shuffledOptions: processOptions(q.options, q.key)
      });
    });
  });

  return {
    testData: {
      section1: {
        name: 'Listening Comprehension',
        duration: 35,
        questions: s1Questions
      },
      section2: {
        name: 'Structure & Written Expression',
        duration: 25,
        questions: s2Questions
      },
      section3: {
        name: 'EPT Reading Comprehension',
        duration: 55,
        questions: s3Questions
      }
    },
    audioFile,
  };
}

export async function fetchTestDataFromSupabase(testId: string = 'practice-test-1'): Promise<{ testData: TestData; audioFile: string }> {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('section_type')
      .order('question_number');
    
    if (error || !data || data.length === 0) {
      console.warn('Failed to fetch questions from Supabase or empty. Falling back to local data.', error);
      return initializeTestData(testId);
    }

    const s1Questions: Question[] = [];
    const s2Questions: Question[] = [];
    const s3Questions: Question[] = [];

    data.forEach(q => {
      const options = [q.option_a, q.option_b, q.option_c, q.option_d];
      const key = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
      
      const question: Question = {
        text: q.question_text,
        options,
        key: key >= 0 ? key : 0,
        explanation: q.explanation,
        shuffledOptions: processOptions(options, key >= 0 ? key : 0)
      };

      if (q.section_type === 'listening') {
        s1Questions.push(question);
      } else if (q.section_type === 'structure') {
        s2Questions.push(question);
      } else if (q.section_type === 'reading') {
        question.passageText = q.passage_text;
        s3Questions.push(question);
      }
    });

    const testConfig = getTestById(testId);
    const audioFile = testConfig?.audioFile ?? '/audio/audio_doang_part_B.mp3';

    return {
      testData: {
        section1: {
          name: 'Listening Comprehension',
          duration: 35,
          questions: s1Questions
        },
        section2: {
          name: 'Structure & Written Expression',
          duration: 25,
          questions: s2Questions
        },
        section3: {
          name: 'EPT Reading Comprehension',
          duration: 55,
          questions: s3Questions
        }
      },
      audioFile,
    };
  } catch (err) {
    console.warn('Error fetching test data from Supabase. Falling back to local data.', err);
    return initializeTestData(testId);
  }
}


export const SECTION_NAMES: Record<string, string> = {
  section1: 'Listening Comprehension',
  section2: 'Structure & Written Expression',
  section3: 'Reading Comprehension'
};

export const INSTRUCTIONS = {
  s1_intro: '<b>Section 1 has three parts.</b> Each part has its own set of directions. Do not take notes while listening or make any marks on the test pages. Notetaking, underlining, or crossing out will be considered cheating on the actual TOEFL exam. Answer the questions following the conversations or talks based on what the speakers have stated or implied.',
  s1_partA: '<b>Part A DIRECTIONS</b><br>In Part A, you will hear short conversations between two speakers. At the end of each conversation, a third voice will ask a question about what was said. The question will be spoken just one time. After you hear a conversation and the question about it, read the four possible answers and decide which one would be the best answer to the question you have heard. Then, on your answer sheet, find the number of the problem and mark your answer.',
  s1_partB: '<b>Part B DIRECTIONS</b><br>In Part B, you will hear longer conversations. After each conversation, you will be asked some questions. The conversations and questions will be spoken just one time. They will not be written out for you, so you will have to listen carefully in order to understand and remember what the speaker says.<br><br>When you hear a question, read the four possible answers in your test book and decide which one would be the best answer to the question you have heard. Then, on your answer sheet, find the number of the problem and fill in the space that corresponds to the letter of the answer you have chosen.',
  s1_partC: '<b>Part C DIRECTIONS</b><br>In Part C, you will hear several talks. After each talk, you will be asked some questions. The talks and questions will be spoken just one time. They will not be written out for you, so you will have to listen carefully in order to understand and remember what the speaker says.<br><br>When you hear a question, read the four possible answers in your test book and decide which one would be the best answer to the question you have heard. Then, on your answer sheet, find the number of the problem and fill in the space that corresponds to the letter of the answer you have chosen.',
  s2_partA: '<b>Part A DIRECTIONS</b><br>Questions 1-15 are incomplete sentences. Beneath each sentence you will see four words or phrases, marked (A), (B), (C), and (D). Choose the one word or phrase that best completes the sentence. Then, on your answer sheet, find the number of the question and fill in the space that corresponds to the letter of the answer you have chosen.',
  s2_partB: '<b>Part B DIRECTIONS</b><br>In questions 16-40, each sentence has four underlined words or phrases. The four underlined parts of the sentence are marked (A), (B), (C), and (D). Identify the one underlined word or phrase that must be changed in order for the sentence to be correct.',
  s3_general: '<b>READING COMPREHENSION DIRECTIONS</b><br>In this section, you will read a number of passages. Each one is followed by approximately ten questions about it. For questions 1-50, choose the one best answer, (A), (B), (C), or (D), to each question. Answer all of the questions following a passage on the basis of what is stated or implied in that passage.'
};
