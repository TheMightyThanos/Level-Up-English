const fs = require('fs');
const content = fs.readFileSync('src/data/section3-questions.ts', 'utf8');

const regex = /\{ id:\s*(\d+),\s*text:\s*(?:"([^"]+)"|'([^']+)'|The word <span[^>]+>\\"([^"]+)\\"<\/span>[^,]+)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  const text = match[2] || match[3] || match[4] || match[0];
  console.log(id, text);
}
