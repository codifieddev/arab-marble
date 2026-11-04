const fs = require('fs');
const path = require('path');

const map = {
  '--rose': '--primary',
  '--rose-dk': '--primary-dark',
  '--sage': '--secondary',
  '--sage-lt': '--secondary',
  '--sage-dk': '--secondary',
  '--cream': '--background',
  '--cream-dark': '--border',
  '--blush': '--accent',
  '--blush-dk': '--accent-hover',
  '--lavender': '--accent',
  '--lav-lt': '--accent-soft',
  '--warm-brown': '--text',
  '--mid-brown': '--text-secondary',
  '--muted': '--text-muted'
};

const dir = './src';

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldVar, newVar] of Object.entries(map)) {
        const regex = new RegExp(`var\\(${oldVar}\\)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `var(${newVar})`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated inline CSS vars in ${fullPath}`);
      }
    }
  }
}

walk(dir);
console.log('Inline CSS vars replacement complete.');
