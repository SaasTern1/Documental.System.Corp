const fs = require('fs');

// Extract all checkbox IDs from modal-usuario in index.html
const html = fs.readFileSync('index.html', 'utf8');
const modalStart = html.indexOf('id="modal-usuario"');
const modalEnd = html.indexOf('id="modal-form-listado"');
const modalHtml = html.substring(modalStart, modalEnd);

const idMatches = [...modalHtml.matchAll(/id="(p-[^"]+)"/g)];
const htmlIds = idMatches.map(m => m[1]).filter(id => id !== 'p-admin');
htmlIds.push('p-admin');
console.log('HTML checkbox IDs (' + htmlIds.length + '):');
htmlIds.forEach(id => console.log(' ', id));

const js = fs.readFileSync('app.js', 'utf8');

// Check guardarUsuario pm object
const guardarMatch = js.match(/const pm = \{[^;]+\}/);
const pm = guardarMatch ? guardarMatch[0] : '';

// Check editarUsuario forEach array
const editarMatch = js.match(/\['p-eval-sol'[^\]]+\]\.forEach\(i => \{ let k/);
const editarArr = editarMatch ? editarMatch[0] : '';

// Check resetUserForm forEach array
const resetMatch = js.match(/\['p-eval-sol'[^\]]+\]\.forEach\(i => \{ if/);
const resetArr = resetMatch ? resetMatch[0] : '';

console.log('\n--- Missing from guardarUsuario pm ---');
let allGood = true;
htmlIds.forEach(id => {
  if (!pm.includes("'" + id + "'")) {
    console.log('  MISSING:', id);
    allGood = false;
  }
});
if (allGood) console.log('  All OK!');

console.log('\n--- Missing from editarUsuario load array ---');
allGood = true;
htmlIds.filter(id => id !== 'p-admin').forEach(id => {
  if (!editarArr.includes("'" + id + "'")) {
    console.log('  MISSING:', id);
    allGood = false;
  }
});
if (allGood) console.log('  All OK!');

console.log('\n--- Missing from resetUserForm clear array ---');
allGood = true;
htmlIds.forEach(id => {
  if (!resetArr.includes("'" + id + "'")) {
    console.log('  MISSING:', id);
    allGood = false;
  }
});
if (allGood) console.log('  All OK!');
