const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src/data/section3-questions.ts');
const fileContent = fs.readFileSync(srcPath, 'utf8');

// Quick and dirty conversion from TS to JS for execution
let jsCode = fileContent
  .replace(/import .* from .*/g, '')
  .replace(/export const section3Passages: RawPassage\[\] =/g, 'const section3Passages =');

jsCode += '\nmodule.exports = section3Passages;';

const tempFile = path.resolve(__dirname, 'temp_extract.cjs');
fs.writeFileSync(tempFile, jsCode);

const passages = require('./temp_extract.cjs');

let md = '# Reading Section (Items 1 - 50)\n\n';

passages.forEach((passage, pIdx) => {
  md += `## Passage ${pIdx + 1}: ${passage.title}\n\n`;
  md += `${passage.text.trim()}\n\n`;
  
  passage.questions.forEach(q => {
    md += `### Item ${q.id}\n`;
    md += `${q.text}\n\n`;
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      md += `- **${letters[idx]}.** ${opt}\n`;
    });
    md += `\n**Key:** ${letters[q.key]}\n`;
    md += `**Skill:** ${q.skill}\n`;
    md += `**Explanation:** ${q.explanation}\n\n`;
  });
});

const outPath = 'C:\\Users\\Adin DJ-X\\.gemini\\antigravity-ide\\brain\\62ba89e3-de6e-4aed-939f-10c0e56db947\\items_1_to_50.md';
fs.writeFileSync(outPath, md);

fs.unlinkSync(tempFile);
console.log('Done!');
