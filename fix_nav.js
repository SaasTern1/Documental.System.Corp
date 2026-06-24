const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(
    /<button class="nav-link nav-sub" id="nav-dash" onclick="window\.cambiarVista\('sec-dash', this\)"><span class="material-icons-round">dashboard<\/span> Panel Analítico<\/button>\s*/,
    ''
);

c = c.replace(
    '<!-- --- MÓDULO DOCUMENTAL (colapsable) --- -->',
    `<button class="nav-link" id="nav-dash" onclick="window.cambiarVista('sec-dash', this)" style="margin-bottom: 5px; border-radius: 8px;"><span class="material-icons-round" style="color:#10b981;">dashboard</span> Panel Analítico</button>

<!-- --- MÓDULO DOCUMENTAL (colapsable) --- -->`
);

fs.writeFileSync('index.html', c);