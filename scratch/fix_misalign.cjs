const fs = require('fs');

const file = 'src/data/section3-questions.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Helper to extract lines by condition
function extractLines(startCondition, endCondition) {
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (startIndex === -1 && startCondition(lines[i])) {
            startIndex = i;
        }
        if (startIndex !== -1 && endCondition(lines[i])) {
            endIndex = i;
            break;
        }
    }
    if (startIndex !== -1 && endIndex !== -1) {
        return lines.splice(startIndex, endIndex - startIndex + 1);
    }
    return [];
}

// 1. Extract Q21-23
const q21_23 = extractLines(l => l.includes('{ id: 21,'), l => l.includes('{ id: 23,'));

// 2. Extract Q31
const q31 = extractLines(l => l.includes('{ id: 31,'), l => l.includes('{ id: 31,'));

// 3. Extract Q41
const q41 = extractLines(l => l.includes('{ id: 41,'), l => l.includes('{ id: 41,'));

// Now insert them to the correct places.
// We need to insert Q21-23 right before the end of Passage 2's questions array.
// The end of Passage 2's questions array is right after Q20.
let q20Index = lines.findIndex(l => l.includes('{ id: 20,'));
if (q20Index !== -1) {
    lines.splice(q20Index + 1, 0, ...q21_23);
}

// Insert Q31 right after Q30
let q30Index = lines.findIndex(l => l.includes('{ id: 30,'));
if (q30Index !== -1) {
    lines.splice(q30Index + 1, 0, ...q31);
}

// Insert Q41 right after Q40
let q40Index = lines.findIndex(l => l.includes('{ id: 40,'));
if (q40Index !== -1) {
    lines.splice(q40Index + 1, 0, ...q41);
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed misplaced questions successfully.');
