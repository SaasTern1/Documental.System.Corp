const fs = require('fs');
let html = fs.readFileSync('migration.html', 'utf8');

// Fix the remaining bad path on the superAdmin indexing
html = html.replace(
    "doc(db, 'plataforma', 'usuariosIndex', 'sysadm2006')",
    "doc(db, 'plataforma', 'main', 'usuariosIndex', 'sysadm2006')"
);

fs.writeFileSync('migration.html', html, 'utf8');

// Verify
const remaining = (html.match(/'plataforma', 'usuariosIndex',/g) || []).length;
console.log(remaining === 0 ? "✅ migration.html fully fixed" : `❌ Still ${remaining} bad paths`);
