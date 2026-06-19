const fs = require('fs');

let files = ['app.js', 'index.html'];

const reverse_emojis = [
    { from: /⚠️/g, to: 's' },
    { from: /🚨/g, to: 'Y' },
    { from: /📊/g, to: 'Y"' },
    { from: /❌/g, to: 's!' },
    { from: /⏳/g, to: '??' },
    { from: /✅/g, to: 'o"' },
    { from: /🚫/g, to: 's?' },
    { from: /📅/g, to: 'Y".' },
    { from: /💬/g, to: "Y'" },
    { from: /📄/g, to: 'Y"Z' }
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let code = fs.readFileSync(f, 'utf8');
        reverse_emojis.forEach(r => {
            code = code.replace(r.from, r.to);
        });
        
        // Manual restores for the buttons in index.html that were legit
        code = code.replace(/o" Firmar y Aprobar/g, '✅ Firmar y Aprobar');
        code = code.replace(/s\? Rechazar/g, '🚫 Rechazar');
        code = code.replace(/Y"\. Agendar Reuni/g, '📅 Agendar Reuni');
        code = code.replace(/Y' Enviar Consulta/g, '💬 Enviar Consulta');
        code = code.replace(/⚖️ Evaluar Solicitud/g, '⚖️ Evaluar Solicitud'); // Was not affected by my script
        code = code.replace(/⏪ Devolver Fase/g, '⏪ Devolver Fase'); // Was not affected
        
        fs.writeFileSync(f, code, 'utf8');
        console.log(`Fixed ${f}`);
    }
});
console.log("Undo complete.");
