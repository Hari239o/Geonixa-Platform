#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the questions data file
const questionsFile = path.join(__dirname, '../src/data/questions_data.ts');
const lowVisibleFile = path.join(__dirname, './low_visible.json');

// Parse the JSON from low_visible.json to get list of questions that need fixing
const lowVisible = JSON.parse(fs.readFileSync(lowVisibleFile, 'utf-8'));

// Read the questions_data.ts file
let content = fs.readFileSync(questionsFile, 'utf-8');

// Create a map of question title -> { visible, hidden } for tracking
const needsPerQuestion = {};
lowVisible.forEach(q => {
  const neededVisible = 10 - q.visible;
  needsPerQuestion[q.title] = neededVisible;
});

console.log('Processing', Object.keys(needsPerQuestion).length, 'questions...\n');

// Process each question that needs fixing
Object.entries(needsPerQuestion).forEach(([title, neededFlips]) => {
  console.log(`Processing: "${title}" (need to flip ${neededFlips} hidden tests)`);
  
  // Find the question in the content
  const titleRegex = new RegExp(`title:\\s*["']${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
  const match = titleRegex.exec(content);
  
  if (!match) {
    console.warn(`  WARNING: Could not find title "${title}"`);
    return;
  }
  
  const startPos = match.index;
  
  // Find the next question or end of array to scope the search
  const restOfContent = content.substring(startPos);
  const nextQuestionMatch = restOfContent.substring(1).match(/^\s*}\s*,\s*\{\s*title:/);
  let endPos = startPos + restOfContent.length;
  if (nextQuestionMatch) {
    endPos = startPos + restOfContent.indexOf(nextQuestionMatch[0]) + nextQuestionMatch[0].length - 2;
  }
  
  const questionBlock = content.substring(startPos, endPos);
  
  // Count isHidden: true occurrences
  const hiddenMatches = [...questionBlock.matchAll(/isHidden:\s*true/g)];
  
  if (hiddenMatches.length < neededFlips) {
    console.warn(`  WARNING: Found ${hiddenMatches.length} hidden tests but need to flip ${neededFlips}`);
  }
  
  // Replace the first 'neededFlips' occurrences of isHidden: true with isHidden: false
  let replacedCount = 0;
  let updatedContent = content;
  let searchStart = startPos;
  
  for (let i = 0; i < neededFlips && replacedCount < neededFlips; i++) {
    const regex = /,\s*isHidden:\s*true/;
    const searchIn = updatedContent.substring(searchStart, endPos + (replacedCount * 100)); // buffer for length changes
    const match = regex.exec(searchIn);
    
    if (match) {
      const matchPos = searchStart + match.index;
      updatedContent = 
        updatedContent.substring(0, matchPos) + 
        ', isHidden: false' + 
        updatedContent.substring(matchPos + match[0].length);
      searchStart = matchPos + ', isHidden: false'.length;
      replacedCount++;
    }
  }
  
  content = updatedContent;
  console.log(`  ✓ Flipped ${replacedCount} hidden tests to visible`);
});

// Write the updated content back
fs.writeFileSync(questionsFile, content, 'utf-8');
console.log('\n✓ Successfully updated src/data/questions_data.ts');
