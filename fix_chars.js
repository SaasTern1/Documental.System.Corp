const fs = require('fs');

const file = 'index.html';
let c = fs.readFileSync(file, 'utf8');

// Fix malformed ID for p-gest-sgc (ID had corrupt bytes)
// Match any ID like p-gest??-sgc where ?? is non-ascii or weird chars
c = c.replace(/p-gest[^a-z"'\-]*-sgc/g, 'p-gest-sgc');

// Standard mojibake: UTF-8 bytes read as Latin-1
const fixes = [
  // Double-byte mojibake patterns (most common)
  ['Ã³', 'ó'],
  ['Ã¡', 'á'],
  ['Ã±', 'ñ'],
  ['Ã­', 'í'],
  ['Ã©', 'é'],
  ['Ãº', 'ú'],
  // Uppercase
  ['Ã"', 'Ó'],
  ['Ã‰', 'É'],
  ['Ã', 'Á'],  // must come after more specific ones
];

for (const [from, to] of fixes) {
  c = c.split(from).join(to);
}

// Special: "GestÃ¡i&#243;n" or "GestÃ¡i&amp;#243;n" -> "Gestión"
// After above replacements "Gestái&#243;n" -> fix to Gestión
c = c.replace(/Gestái(&#243;|&amp;#243;)n/g, 'Gestión');
c = c.replace(/Gestai(&#243;|&amp;#243;)n/g, 'Gestión');

// Also fix any remaining &#243; sequences for 'ó' if preceded by gesti/visualizaci/etc
c = c.replace(/Gesti(&#243;|&amp;#243;)n/g, 'Gestión');
c = c.replace(/Visualizaci(&#243;|&amp;#243;)n/g, 'Visualización');
c = c.replace(/Aprobaci(&#243;|&amp;#243;)n/g, 'Aprobación');
c = c.replace(/Configuraci(&#243;|&amp;#243;)n/g, 'Configuración');

fs.writeFileSync(file, c, 'utf8');
console.log('Done fixing characters in', file);

// Verify key spots
const lines = c.split('\n');
const checks = ['p-gest-sgc', 'Módulo', 'Gestión', 'Contraseña', 'Visualización'];
for (const check of checks) {
  const found = lines.findIndex(l => l.includes(check));
  console.log(check + ':', found >= 0 ? 'OK (line ' + (found+1) + ')' : 'NOT FOUND');
}
