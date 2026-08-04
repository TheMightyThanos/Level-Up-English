const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'section3-questions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The issue was: <span class="text-violet-600..." inside a double-quoted string: text: "..."
// Let's replace class="text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md"
// with class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'

content = content.replace(/class="text-violet-600 font-bold bg-violet-100 dark:bg-violet-900\/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md"/g, "class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed quotes successfully.');
