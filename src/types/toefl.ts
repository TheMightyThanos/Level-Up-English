export interface UserData {
  name: string;
  email: string;
  phone: string;
  gender: 'L' | 'P' | '';
}

export type TestMode = 'exam' | 'study';
export type SectionKey = 'section1' | 'section2' | 'section3';
export type ViewState = 'login' | 'test-select' | 'mode-select' | 'test' | 'results';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  text: string;
  options: string[];
  key: number; // index of correct answer
  explanation?: string;
  skill?: string;
  sub_skill?: string;
  cognitive_level?: string;
  longman_skill?: string;
  // For reading section
  passageTitle?: string;
  passageText?: string;
  passageId?: number;
  // Processed
  shuffledOptions: QuestionOption[];
}

export interface Section {
  name: string;
  duration: number; // minutes
  questions: Question[];
  passages?: Passage[];
}

export interface Passage {
  title: string;
  text: string;
  questions: Omit<Question, 'shuffledOptions' | 'passageTitle' | 'passageText' | 'passageId'>[];
}

export interface TestData {
  section1: Section;
  section2: Section;
  section3: Section;
}

export interface SectionResult {
  raw: number;
  scaled: number;
  total: number;
}

export interface AnalysisItem {
  number: number;
  section: SectionKey;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  skill: string;
  sub_skill: string;
  explanation: string;
  topic?: string;
  longman_skill?: string;
}

export interface TestResults {
  totalScore: number; // Reading percentage (0-100), kept for backwards compat.
  percentage: number;
  completionSeconds: number;
  section1: SectionResult;
  section2: SectionResult;
  section3: SectionResult;
  analysis: {
    section1: AnalysisItem[];
    section2: AnalysisItem[];
    section3: AnalysisItem[];
    wrongQuestions: AnalysisItem[];
    skillBreakdown: Record<string, { correct: number; total: number }>;
  };
}

export interface PerformanceCategory {
  level: string;
  color: string;
  message: string;
}

export interface Recommendation {
  skill: string;
  accuracy: string;
  priority: 'critical' | 'high' | 'medium';
  message: string;
}
