const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const replacements = [
    // Palabras con tildes comunes (Manejando el caracter  - \uFFFD)
    { from: /Evaluacin/g, to: 'Evaluación' },
    { from: /evaluacin/g, to: 'evaluación' },
    { from: /Creacin/g, to: 'Creación' },
    { from: /creacin/g, to: 'creación' },
    { from: /Aprobacin/g, to: 'Aprobación' },
    { from: /aprobacin/g, to: 'aprobación' },
    { from: /Inactivacin/g, to: 'Inactivación' },
    { from: /inactivacin/g, to: 'inactivación' },
    { from: /Ttulo/g, to: 'Título' },
    { from: /ttulo/g, to: 'título' },
    { from: /Gestin/g, to: 'Gestión' },
    { from: /gestin/g, to: 'gestión' },
    { from: /Ocurri/g, to: 'Ocurrió' },
    { from: /Das/g, to: 'Días' },
    { from: /das/g, to: 'días' },
    { from: /Da/g, to: 'Día' },
    { from: /da/g, to: 'día' },
    { from: /Reunin/g, to: 'Reunión' },
    { from: /REUNI"N/g, to: 'REUNIÓN' },
    { from: /Aadir/g, to: 'Añadir' },
    { from: /aadir/g, to: 'añadir' },
    { from: /Aade/g, to: 'Añade' },
    { from: /Auditora/g, to: 'Auditoría' },
    { from: /auditora/g, to: 'auditoría' },
    { from: /Descripcin/g, to: 'Descripción' },
    { from: /descripcin/g, to: 'descripción' },
    { from: /Razn/g, to: 'Razón' },
    { from: /razn/g, to: 'razón' },
    { from: /Fsica/g, to: 'Física' },
    { from: /fsica/g, to: 'física' },
    { from: /Accin/g, to: 'Acción' },
    { from: /accin/g, to: 'acción' },
    { from: /Nmero/g, to: 'Número' },
    { from: /nmero/g, to: 'número' },
    { from: /Cdigo/g, to: 'Código' },
    { from: /cdigo/g, to: 'código' },
    { from: /ndice/g, to: 'Índice' },
    { from: /ndices/g, to: 'índices' },
    { from: /Est/g, to: 'Está' },
    { from: /est/g, to: 'está' },
    { from: /Ms/g, to: 'Más' },
    { from: /ms/g, to: 'más' },
    { from: /Ejecucin/g, to: 'Ejecución' },
    { from: /Inspeccin/g, to: 'Inspección' },
    { from: /Configuracin/g, to: 'Configuración' },
    { from: /Seccin/g, to: 'Sección' },
    { from: /Modificacin/g, to: 'Modificación' },
    { from: /Informacin/g, to: 'Información' },
    { from: /Versin/g, to: 'Versión' },
    { from: /versin/g, to: 'versión' },
    { from: /lmite/g, to: 'límite' },
    { from: /Lmite/g, to: 'Límite' },
    { from: /xit/g, to: 'éxit' },
    { from: /Ǹxito/g, to: 'éxito' }, // sometimes it showed up like this
    { from: /ǭ/g, to: 'á' }, // bitǭcora
    
    // Emojis corruptos
    { from: /Y"Z/g, to: '📄' },
    { from: /Y'/g, to: '💬' },
    { from: /Y"\./g, to: '📅' },
    { from: /s\?/g, to: '🚫' },
    { from: /o"/g, to: '✅' },
    { from: /\?\?/g, to: '⏳' },
    { from: /s!/g, to: '❌' },
    { from: /Y"/g, to: '📊' },
    { from: /Y/g, to: '🚨' },
    { from: /s/g, to: '⚠️' }
];

replacements.forEach(r => {
    code = code.replace(r.from, r.to);
});

// Write to file
fs.writeFileSync('app.js', code, 'utf8');

// Do the same for index.html if necessary
if (fs.existsSync('index.html')) {
    let htmlCode = fs.readFileSync('index.html', 'utf8');
    replacements.forEach(r => {
        htmlCode = htmlCode.replace(r.from, r.to);
    });
    fs.writeFileSync('index.html', htmlCode, 'utf8');
}

console.log("Fixes applied.");
