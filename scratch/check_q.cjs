const fs = require('fs');
const content = fs.readFileSync('src/data/section3-questions.ts', 'utf8');

const regex = /title:\s*'([^']+)'|text:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (match[1]) console.log('\n--- PASSAGE: ' + match[1].substring(0, 50) + ' ---');
  if (match[2]) console.log('Q: ' + match[2]);
}
