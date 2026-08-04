import { RawQuestion, RawPassage } from './question-types';

export interface PracticeTestConfig {
  id: string;
  name: string;
  description: string;
  audioFile: string;
  section1Questions: RawQuestion[];
  section2Questions: RawQuestion[];
  section3Passages: RawPassage[];
}

export interface PracticeTestInfo {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  questionCount: {
    section1: number;
    section2: number;
    section3: number;
  };
}

import practiceTest1 from './tests/practice-test-1';

const testRegistry: PracticeTestConfig[] = [practiceTest1];

export function getAvailableTests(): PracticeTestInfo[] {
  return testRegistry.map((test) => {
    const s3QuestionCount = test.section3Passages.reduce(
      (sum, p) => sum + p.questions.length,
      0
    );
    return {
      id: test.id,
      name: test.name,
      description: test.description,
      isAvailable: s3QuestionCount > 0,
      questionCount: {
        section1: test.section1Questions.length,
        section2: test.section2Questions.length,
        section3: s3QuestionCount,
      },
    };
  });
}

export function getTestById(testId: string): PracticeTestConfig | undefined {
  return testRegistry.find((t) => t.id === testId);
}
