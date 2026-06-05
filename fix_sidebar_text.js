const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix sidebar title
html = html.replace(
    'SGS - FCI Logistic</h2>',
    'Sistema de Gesti&#243;n</h2>'
);

// 2. Make emp-cuenta-row visible by default (it was set but we want to be sure)
// Check if the div has any hidden style
const rowIdx = html.indexOf('id="emp-cuenta-row"');
const rowContext = html.substring(Math.max(0, rowIdx - 50), rowIdx + 50);
console.log("emp-cuenta-row context:", JSON.stringify(rowContext));

// Ensure the "Nueva Empresa" button calls abrirModalEmpresa() with no args (null)
// Check how the button is currently defined
const btnNuevaEmp = html.match(/Nueva Empresa[^"<]*"[^>]*>/g);
console.log("Nueva Empresa button patterns:", btnNuevaEmp ? btnNuevaEmp.slice(0, 3) : 'not found');

// Also check line 203 (another title reference)
const line203Match = html.match(/SGS[^<]{0,30}Logistic/g);
console.log("Other SGS references:", line203Match);

fs.writeFileSync('index.html', html, 'utf8');
console.log("✅ Sidebar title updated to 'Sistema de Gestión'");
console.log("Sidebar has:", html.includes('Sistema de Gesti') ? '✅ Sistema de Gestión' : '❌ still old text');
