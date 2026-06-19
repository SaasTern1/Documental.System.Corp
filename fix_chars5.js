const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Á + U+008D (C1 control char) → Í (U+00CD)
// Í in UTF-8 = C3 8D; misread as Á (C1) + 0x8D (control)
html = html.split('\u00C1\u008D').join('\u00CD');

// U+2500 (box drawing ─) in HTML comments → -
html = html.split('\u2500').join('-');

// DinÁƒ¡micos: Á + ƒ (U+0192) + ¡ → á (remaining from partial previous fix)
html = html.split('\u00C1\u0192\u00A1').join('á');
html = html.split('\u00C1\u0192¡').join('á');

// FÁSICA with plain Á+S (after control char fix, remaining plain ones)
html = html.replace(/F\u00C1SICA/g, 'FÍSICA');
html = html.replace(/F\u00C1sica/g, 'Física');

// LÁMITE → LÍMITE
html = html.replace(/L\u00C1MITE/g, 'LÍMITE');
html = html.replace(/L\u00C1mite/g, 'Límite');

fs.writeFileSync('index.html', html, 'utf8');

// Verify
const lines = html.split('\n');
[158, 189, 859, 1071, 1887].forEach(n => {
  console.log('L' + n + ': ' + (lines[n-1]||'').trim().slice(0,120));
});

// Final scan
const suspects = [];
lines.forEach((l, i) => {
  if (/[\u00C0-\u00C3][\u0080-\u009F\u0192\u2018-\u201F]/.test(l)) {
    suspects.push('L' + (i+1) + ': ' + l.trim().slice(0,100));
  }
});
console.log('\nRemaining suspicious lines: ' + suspects.length);
suspects.forEach(s => console.log(s));
