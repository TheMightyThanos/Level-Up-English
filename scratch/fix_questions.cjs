const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'section3-questions.ts');
let content = fs.readFileSync(filePath, 'utf8');

const highlightTemplate = (word) => `The word <span class="text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md">\\"${word}\\"</span>`;

// Pattern 1: In line X, the word "word"
content = content.replace(/In line \d+,\s*(?:the word\s*)?\\"([^\\"]+)\\"/g, (match, word) => {
    return highlightTemplate(word);
});

// Pattern 2: The word "word" in line X
content = content.replace(/The word \\"([^\\"]+)\\"\s*in line \d+/g, (match, word) => {
    return highlightTemplate(word);
});

// Pattern 3: In line X, "word"
content = content.replace(/In line \d+,\s*\\"([^\\"]+)\\"/g, (match, word) => {
    return highlightTemplate(word);
});

// Fix any potential double "The word The word" if it happened (just in case)
content = content.replace(/The word The word/g, 'The word');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed questions successfully.');
