const fs = require('fs');
const path = require('path');

const dir = './src';
const colorRegex = /\b(?:bg|text|border|ring|shadow|fill|stroke|from|via|to|accent)-(rose|sage|cream|blush|lavender|warm-brown|mid-brown|lav-lt)(-[0-9]+)?(?:\/[0-9]+)?\b/g;

const uniqueClasses = new Set();
let filesWithMatches = 0;

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(colorRegex);
      if (matches) {
        matches.forEach(m => uniqueClasses.add(m));
        filesWithMatches++;
      }
    }
  }
}

walk(dir);
console.log(`Found ${uniqueClasses.size} unique color classes in ${filesWithMatches} files:`);
console.log(Array.from(uniqueClasses).sort());
