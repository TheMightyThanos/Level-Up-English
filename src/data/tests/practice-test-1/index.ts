// EPT Reading Platform - Practice Test 1
import { section1Questions } from './section1';
import { section2Questions } from './section2';
import { section3Passages } from './section3';
import type { PracticeTestConfig } from '../../test-registry';

const practiceTest1: PracticeTestConfig = {
  id: 'practice-test-1',
  name: 'Diagnostic Pre-Test',
  description:
    'Full TOEFL Simulation (Listening, Structure, Reading).',
  audioFile: '/audio/Listening Test Soal 1.mp3', // Audio for Listening
  section1Questions,
  section2Questions,
  section3Passages,
};

export default practiceTest1;
