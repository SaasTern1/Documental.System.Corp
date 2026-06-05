const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const oldCode = `    // Obtener las fechas de las auditorías de ese año
    let auditDates = new Set();
    try {
        const audsRef = window.db.collection('auditorias').where('year', '==', year);
        const snap = await audsRef.get();
        snap.forEach(doc => {
            const d = doc.data();
            if (d.fechaStr) {
                // Asume formato YYYY-MM-DD
                auditDates.add(d.fechaStr);
            }
        });
    } catch(e) { console.error("Error cargando auditorias para calendario", e); }`;

const newCode = `    // Obtener las fechas de las auditorías de ese año de forma local
    let auditDates = new Set();
    try {
        if (typeof globalAllAuditorias !== 'undefined' && globalAllAuditorias) {
            globalAllAuditorias.forEach(a => {
                if (a.fecha) {
                    const d = new Date(a.fecha);
                    if (d.getFullYear() === year) {
                        const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
                        const dStr = d.getDate().toString().padStart(2, '0');
                        auditDates.add(\`\${year}-\${mStr}-\${dStr}\`);
                    }
                }
            });
        }
    } catch(e) { console.error("Error procesando auditorias para calendario", e); }`;

js = js.replace(oldCode, newCode);
fs.writeFileSync('app.js', js, 'utf8');
console.log("Fixed calendar logic in app.js");
