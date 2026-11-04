const fs = require('fs');
const path = require('path');

const dir = './src';
const colorMap = {
  'rose-50': 'primary/10',
  'rose-100': 'primary/20',
  'rose-200': 'primary/30',
  'rose-300': 'primary-light',
  'rose-400': 'primary-light',
  'rose-500': 'primary',
  'rose-600': 'primary-hover',
  'rose-700': 'primary-dark',
  'rose-800': 'primary-dark',
  'rose-900': 'primary-dark',
  'rose-950': 'primary-dark',
  'sage-50': 'secondary/10',
  'sage-100': 'secondary/20',
  'sage-200': 'secondary/30',
  'sage-300': 'secondary',
  'sage-400': 'secondary',
  'sage-500': 'secondary',
  'sage-600': 'secondary',
  'sage-700': 'secondary',
  'sage-800': 'secondary',
  'sage-900': 'secondary',
  'sage-950': 'secondary',
  'cream': 'background',
  'cream-dark': 'border',
  'blush': 'accent',
  'blush-dk': 'accent-hover',
  'lavender': 'accent',
  'lav-lt': 'accent-soft',
  'warm-brown': 'foreground',
  'mid-brown': 'text-secondary',
};

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace bg-, text-, border-, ring-, shadow-, fill-, stroke-, from-, via-, to-, accent-
      const regex = /\b(bg|text|border|ring|shadow|fill|stroke|from|via|to|accent)-(rose-\d+|sage-\d+|cream(?:-dark)?|blush(?:-dk)?|lavender|lav-lt|warm-brown|mid-brown)(?:\/(\d+))?\b/g;

      content = content.replace(regex, (match, prefix, color, opacity) => {
        let mapped = colorMap[color];
        if (!mapped) return match; // fallback just in case
        
        // If mapped already has an opacity like 'primary/10', and the original had an opacity like '/50',
        // we should probably just use the original opacity or combine them. 
        // In Tailwind v4, primary/10/50 is invalid.
        // Let's strip the mapped opacity if original had one.
        if (opacity) {
          mapped = mapped.split('/')[0]; // take 'primary' from 'primary/10'
          return `${prefix}-${mapped}/${opacity}`;
        }
        return `${prefix}-${mapped}`;
      });

      if (changed || content !== fs.readFileSync(fullPath, 'utf8')) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(dir);
console.log("Replacement complete.");
