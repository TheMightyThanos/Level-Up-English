import * as fs from 'fs';

const originalFile = fs.readFileSync('../src/data/section3-questions.ts', 'utf-8');
const keyText = fs.readFileSync('key.txt', 'utf-8');

const qBlocks = keyText.split(/\n\s*(?=Q\d+ )/g).filter(b => b.trim().startsWith('Q'));

const questions = [];

for (const block of qBlocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let id = 0;
  let text = '';
  let skill = '';
  let options = [];
  let key = 0;
  let explanation = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Q')) {
      const match = line.match(/^Q(\d+)\s+(.*)$/);
      if (match) {
        id = parseInt(match[1]);
        text = match[2];
      }
    } else if (line.startsWith('Skill:')) {
      skill = line.replace('Skill:', '').trim();
    } else if (line.match(/^[A-D]\s/)) {
      const isCorrect = line.includes('✓') || line.includes('✔');
      const optText = line.replace(/^[A-D]\s*(✓|✔)?\s*/, '').trim();
      options.push(optText);
      if (isCorrect) {
        key = options.length - 1;
      }
    } else if (line.startsWith('Answer:')) {
      const letter = line.replace('Answer:', '').trim();
      const code = letter.charCodeAt(0) - 65;
      key = code;
    } else if (line.startsWith('Explanation:')) {
      explanation = line.replace('Explanation:', '').trim();
      // look ahead for more explanation lines
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].startsWith('Q') && !lines[j].startsWith('Passage')) {
          explanation += ' ' + lines[j].trim();
        } else {
          break;
        }
      }
      break;
    }
  }

  questions.push({ id, text, options, key, skill, explanation });
}

console.log(`Parsed ${questions.length} questions`);

// Now extract the titles and texts from the original file
// The original file is a TS module exporting section3Passages.
const passages = [];
const passageRegex = /\{\s*title:\s*'([^']+)',\s*text:\s*`([\s\S]*?)`,\s*questions:/g;
let m;
while ((m = passageRegex.exec(originalFile)) !== null) {
  passages.push({ title: m[1], text: m[2] });
}
console.log(`Parsed ${passages.length} passages`);

if (questions.length !== 50 || passages.length !== 5) {
  console.error("Mismatch in counts!");
  process.exit(1);
}

// Generate the new TS code
let output = `import { RawPassage } from './question-types';

// EPT Reading Platform - 50 Parallel Constructed Reading Items
// Five passages, multiple-choice (A/B/C/D), 55-minute limit.
// Taxonomy strictly mapped to expert-validated Parallel Form.

export const section3Passages: RawPassage[] = [
`;

for (let i = 0; i < 5; i++) {
  output += `  {
    title: '${passages[i].title}',
    text: \`${passages[i].text}\`,
    questions: [
`;
  for (let j = 0; j < 10; j++) {
    const q = questions[i * 10 + j];
    output += `      { id: ${q.id}, text: ${JSON.stringify(q.text)}, options: ${JSON.stringify(q.options)}, key: ${q.key}, skill: ${JSON.stringify(q.skill)}, explanation: ${JSON.stringify(q.explanation)} },\n`;
  }
  output += `    ],\n  },\n`;
}
output += `];\n`;

fs.writeFileSync('../src/data/section3-questions.ts', output, 'utf-8');
console.log("Written successfully.");
