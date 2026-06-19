const fs = require('fs');

// Fix both files: replace Á + U+201C (left double quote) → Ó
['index.html', 'app.js'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  // U+00C1 (Á) + U+201C (left double quote) = mojibake for Ó
  c = c.split('\u00C1\u201C').join('\u00D3');
  // U+00C1 (Á) + U+201D (right double quote) = also mojibake for Ó
  c = c.split('\u00C1\u201D').join('\u00D3');
  // U+00C1 + U+2018 (left single quote) = mojibake for Ñ? Let's not guess, just the above
  fs.writeFileSync(file, c, 'utf8');
  
  const remaining = (c.match(/\u00C1[\u201C\u201D]/g) || []).length;
  console.log(file + ': done. Remaining patterns: ' + remaining);
});

// Verify the fixed line in index.html
const html = fs.readFileSync('index.html', 'utf8');
const l = html.split('\n')[1584];
console.log('Line 1585:', l.trim().slice(0, 180));

// Check all remaining Á+ sequences that look wrong
const allA = (html.match(/\u00C1./g) || []);
const weird = allA.filter(s => !/[a-záéíóúüñ\s<>/="'.,;:()\-_]/i.test(s[1]));
if (weird.length > 0) {
  console.log('Remaining weird Á+ sequences:', [...new Set(weird)].join(', '));
} else {
  console.log('No more weird Á+ sequences found.');
}
