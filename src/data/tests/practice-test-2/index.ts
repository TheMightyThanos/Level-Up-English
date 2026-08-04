// Practice Test 2 - CLIFFS TOEFL Preparation Guide
import { section1Questions } from './section1';
import { section2Questions } from './section2';
import { section3Passages } from './section3';
import type { PracticeTestConfig } from '../../test-registry';

const practiceTest2: PracticeTestConfig = {
  id: 'practice-test-2',
  name: 'Practice Test 2',
  description: 'CLIFFS TOEFL Preparation Guide - Practice Test 2',
  audioFile: '/audio/practice-test-2.mp3', // TODO: Add audio file to public/audio/
  section1Questions,
  section2Questions,
  section3Passages,
};

export default practiceTest2;
