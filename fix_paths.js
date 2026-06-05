const fs = require('fs');

// Fix app.js
let js = fs.readFileSync('app.js', 'utf8');

// All patterns that need 'main' inserted as intermediate doc
const replacements = [
    // usuariosIndex references
    ["'plataforma', 'usuariosIndex',", "'plataforma', 'main', 'usuariosIndex',"],
    // superAdmins references  
    ["'plataforma', 'superAdmins',", "'plataforma', 'main', 'superAdmins',"],
    // empresas as collection
    ["collection(db, 'plataforma', 'empresas')", "collection(db, 'plataforma', 'main', 'empresas')"],
    // empresas as doc - different trailing patterns
    ["doc(db, 'plataforma', 'empresas',", "doc(db, 'plataforma', 'main', 'empresas',"],
    ["setDoc(doc(db, 'plataforma', 'empresas',", "setDoc(doc(db, 'plataforma', 'main', 'empresas',"],
];

let count = 0;
for (const [from, to] of replacements) {
    while (js.includes(from)) {
        js = js.replace(from, to);
        count++;
    }
}

// Prevent double-insertion if already fixed
js = js.replace(/'plataforma', 'main', 'main',/g, "'plataforma', 'main',");

fs.writeFileSync('app.js', js, 'utf8');
console.log(`app.js: ${count} replacements made`);

// Fix migration.html
let html = fs.readFileSync('migration.html', 'utf8');

const htmlReplacements = [
    ["doc(db, 'plataforma', 'empresas', '1')", "doc(db, 'plataforma', 'main', 'empresas', '1')"],
    ["doc(db, 'plataforma', 'superAdmins', 'sysadm2006')", "doc(db, 'plataforma', 'main', 'superAdmins', 'sysadm2006')"],
    ["doc(db, 'plataforma', 'usuariosIndex', uid)", "doc(db, 'plataforma', 'main', 'usuariosIndex', uid)"],
    ["doc(db, 'plataforma', 'usuariosIndex', u)", "doc(db, 'plataforma', 'main', 'usuariosIndex', u)"],
    ["collection(db, 'plataforma', 'empresas')", "collection(db, 'plataforma', 'main', 'empresas')"],
];

let htmlCount = 0;
for (const [from, to] of htmlReplacements) {
    while (html.includes(from)) {
        html = html.replace(from, to);
        htmlCount++;
    }
}

html = html.replace(/'plataforma', 'main', 'main',/g, "'plataforma', 'main',");

fs.writeFileSync('migration.html', html, 'utf8');
console.log(`migration.html: ${htmlCount} replacements made`);

// Verify no leftover bad patterns
const badPatterns = [
    "'plataforma', 'usuariosIndex',",
    "'plataforma', 'superAdmins',",
    "collection(db, 'plataforma', 'empresas')",
];
let remaining = 0;
for (const p of badPatterns) {
    if (js.includes(p)) { console.log("STILL PRESENT in app.js:", p); remaining++; }
    if (html.includes(p)) { console.log("STILL PRESENT in migration.html:", p); remaining++; }
}
if (remaining === 0) console.log("✅ All paths fixed correctly.");
