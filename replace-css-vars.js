const fs = require('fs');

const cssPath = './src/styles/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

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

for (const [oldVar, newVar] of Object.entries(map)) {
  const regex = new RegExp(`var\\(${oldVar}\\)`, 'g');
  content = content.replace(regex, `var(${newVar})`);
}

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Replaced custom variables in globals.css');
