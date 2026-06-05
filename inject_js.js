const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const newFunctions = `
// ==========================================
// NUEVO: TOGGLE PLAN Y CALENDARIO ANUAL
// ==========================================
window.toggleAuditPlanDetails = () => {
    const details = document.getElementById('audit-plan-details');
    const icon = document.getElementById('icon-toggle-audit-plan');
    if (!details) return;
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        if(icon) icon.style.transform = 'rotate(0deg)';
    } else {
        details.style.display = 'none';
        if(icon) icon.style.transform = 'rotate(180deg)';
    }
};

window.abrirModalCalendarioMensual = async () => {
    const year = parseInt(document.getElementById('aud-year-select').value) || new Date().getFullYear();
    document.getElementById('cal-year-title').innerText = year;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // Obtener las fechas de las auditorías de ese año
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
    } catch(e) { console.error("Error cargando auditorias para calendario", e); }

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysOfWeek = ["D", "L", "M", "M", "J", "V", "S"];
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    let html = '';
    
    for (let m = 0; m < 12; m++) {
        let firstDay = new Date(year, m, 1).getDay();
        let daysInMonth = new Date(year, m + 1, 0).getDate();
        
        let monthHtml = \`<div style="background:white; border:1px solid var(--border); border-radius:8px; padding:15px; box-shadow:var(--shadow-sm);">
            <div style="font-weight:bold; color:var(--primary); text-align:center; margin-bottom:10px; padding-bottom:5px; border-bottom:1px solid var(--border);">\${months[m]}</div>
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:2px; text-align:center; font-size:11px; margin-bottom:5px; color:#64748b; font-weight:bold;">\`;
            
        daysOfWeek.forEach(d => {
            monthHtml += \`<div>\${d}</div>\`;
        });
        monthHtml += \`</div><div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:2px; text-align:center; font-size:12px;">\`;
        
        // Celdas vacías iniciales
        for (let i = 0; i < firstDay; i++) {
            monthHtml += \`<div style="padding:4px;"></div>\`;
        }
        
        // Días
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = \`\${year}-\${(m+1).toString().padStart(2, '0')}-\${d.toString().padStart(2, '0')}\`;
            const isAudit = auditDates.has(dateStr);
            const isToday = (year === currentYear && m === currentMonth && d === currentDate);
            
            let style = "padding:4px; border-radius:4px; margin:2px; ";
            if (isAudit) {
                style += "background:var(--primary); color:white; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(30,64,175,0.3);";
            } else if (isToday) {
                style += "border:2px solid var(--danger); color:var(--danger); font-weight:bold;";
            } else {
                style += "color:#334155; background:#f8fafc;";
            }
            
            let title = isAudit ? 'title="Auditoría Programada"' : '';
            
            monthHtml += \`<div style="\${style}" \${title}>\${d}</div>\`;
        }
        
        monthHtml += \`</div></div>\`;
        html += monthHtml;
    }
    
    grid.innerHTML = html;
    window.setDisplay('modal-calendario-anual', 'flex');
};
`;

let lines = js.split('\\n');
let insertIndex = lines.findIndex(l => l.includes("window.abrirNuevaAuditoria = () =>"));
if(insertIndex !== -1) {
    lines.splice(insertIndex + 2, 0, newFunctions);
    fs.writeFileSync('app.js', lines.join('\\n'), 'utf8');
    console.log("Injected JS");
} else {
    console.log("Not found");
}
