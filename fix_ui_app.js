const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// TASK 1: Fix isAdm permission for delete button
const admTarget = `    const isAdm = currentUser.permisos.admin || currentUser.permisos.p_audit_admin;
    const isAud = a.auditor && a.auditor.includes(currentUser.nombre);`;
const admRepl = `    const isAdm = currentUser.permisos.admin || currentUser.permisos.p_audit_admin || currentUser.permisos.p_gest_sgc;
    const isAud = a.auditor && a.auditor.includes(currentUser.nombre);`;
content = content.replace(admTarget, admRepl).replace(admTarget.replace(/\r\n/g, '\n'), admRepl);


// TASK 2: Heatmap Modal instead of panel
const heatmapTarget = `    window.setDisplay('heatmap-details-panel', 'block');
    let titleEl = $('heatmap-details-title');
    if(titleEl) {
        titleEl.innerHTML = \`<span class="material-icons-round" style="color:\${color}">zoom_in</span> Riesgos en Cuadrante (Prob: \${p} x Imp: \${i} = Severidad \${sev})\`;
        titleEl.style.color = color;
    }

    let trs = '';
    risks.forEach(r => { trs += \`<tr><td style="padding:10px; border-bottom:1px solid #e2e8f0;"><b>\${r.rsk_id}</b></td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">\${r.proceso}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">\${r.amenaza}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0; color:var(--primary); font-weight:600;">\${r.accion_mitigacion}</td></tr>\`; });
    window.setHtml('tbody-heatmap-details', trs);
    $('heatmap-details-panel').scrollIntoView({ behavior: 'smooth', block: 'end' });`;

const heatmapRepl = `    let titleEl = $('heatmap-details-title');
    if(titleEl) {
        titleEl.innerHTML = \`<span class="material-icons-round" style="color:\${color}">zoom_in</span> Riesgos en Cuadrante (Prob: \${p} x Imp: \${i} = Severidad \${sev})\`;
        titleEl.style.color = color;
    }

    let trs = '';
    risks.forEach(r => { trs += \`<tr><td style="padding:10px; border-bottom:1px solid #e2e8f0;"><b>\${r.rsk_id}</b></td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">\${r.proceso}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">\${r.amenaza}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0; color:var(--primary); font-weight:600;">\${r.accion_mitigacion}</td></tr>\`; });
    window.setHtml('tbody-heatmap-details', trs);
    window.setDisplay('modal-heatmap-details', 'flex');`;

content = content.replace(heatmapTarget, heatmapRepl).replace(heatmapTarget.replace(/\r\n/g, '\n'), heatmapRepl);

fs.writeFileSync('app.js', content);
console.log('Fixed app.js ui logic');
