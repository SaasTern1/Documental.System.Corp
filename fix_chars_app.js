const fs = require('fs');
const file = 'app.js';
let c = fs.readFileSync(file, 'utf8');

const fixes = [
  ['Ã³', 'ó'],
  ['Ã¡', 'á'],
  ['Ã±', 'ñ'],
  ['Ã­', 'í'],
  ['Ã©', 'é'],
  ['Ãº', 'ú'],
  ['Ã"', 'Ó'],
  ['Ã‰', 'É'],
];

for (const [from, to] of fixes) {
  c = c.split(from).join(to);
}

c = c.replace(/Gesti(&#243;|&amp;#243;)n/g, 'Gestión');
c = c.replace(/Gestai(&#243;|&amp;#243;)n/g, 'Gestión');
c = c.replace(/Gestái(&#243;|&amp;#243;)n/g, 'Gestión');
c = c.replace(/Aprobaci(&#243;|&amp;#243;)n/g, 'Aprobación');

fs.writeFileSync(file, c, 'utf8');
console.log('Done fixing app.js');

const remaining = (c.match(/Ã[³¡±­©º]/g) || []);
console.log('Remaining mojibake instances in app.js:', remaining.length);
