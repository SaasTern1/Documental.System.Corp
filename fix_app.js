const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const target1 = `        let e = String(a.estado || 'Programada'); 
        let b = e === 'Completada' ? 'badge-success' : (e === 'En Progreso' ? 'badge-info' : (e === 'Pausada' ? 'badge-dark' : 'badge-warning'));
        let btn = \`<button type="button" class="btn btn-primary" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.verModalAuditoria('\${a.id}')">Ver</button>\`;
        let roundLabel = a.rondas > 1 ? \` (R\${a.rondas})\` : '';
        
        const isAuditor = a.auditor && a.auditor.includes(currentUser.nombre); 
        const canControl = isAdm || isAuditor;
        
        if (canControl) { 
            if (e === 'Programada') btn += \`<button type="button" class="btn btn-success" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.iniciarAuditoriaDirecto('\${a.id}')">Iniciar</button>\`; 
            else if (e === 'En Progreso') {
                btn += \`<button type="button" class="btn btn-warning" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.pausarAuditoriaDirecto('\${a.id}')">Pausar</button>\`; 
                btn += \`<button type="button" class="btn btn-danger" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.finalizarAuditoriaDirecto('\${a.id}')">Fin</button>\`;
            } else if (e === 'Pausada') {
                btn += \`<button type="button" class="btn btn-success" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.reanudarAuditoriaDirecto('\${a.id}')">Reanudar</button>\`; 
                btn += \`<button type="button" class="btn btn-danger" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.finalizarAuditoriaDirecto('\${a.id}')">Fin</button>\`;
            }
            btn += \`<button type="button" class="btn btn-info" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.cargarAuditoriaParaEditar('\${a.id}')">Ed</button>\`;
        }
        
        if(isAdm) btn += \`<button type="button" class="btn-icon-danger" onclick="window.del('Auditorias','\${a.id}')"><span class="material-icons-round" style="font-size:16px;">delete</span></button>\`;
        
        h += \`<tr><td><b>\${a.audit_num || '-'}</b></td><td><b>\${window.formatearFechaAbreviada(a.fecha)}</b><br><small>\${a.hora_inicio || ''} - \${a.hora_fin || ''}</small></td><td>\${a.requisitos ? a.requisitos.substring(0,30) + '...' : '-'}</td><td>\${a.auditado || '-'}</td><td>\${a.auditor || '-'}</td><td><span class="badge \${b}">\${e}\${roundLabel}</span></td><td class="no-export" style="display:flex;gap:5px;align-items:center;">\${btn}</td></tr>\`;`;

const repl1 = `        let e = String(a.estado || 'Programada'); 
        let b = e === 'Completada' ? 'badge-success' : (e === 'En Progreso' ? 'badge-info' : (e === 'Pausada' ? 'badge-dark' : 'badge-warning'));
        let btn = \`<button type="button" class="btn btn-primary" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.verModalAuditoria('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">visibility</span> Ver</button>\`;
        let roundLabel = a.rondas > 1 ? \` (R\${a.rondas})\` : '';
        
        const isAuditor = a.auditor && a.auditor.includes(currentUser.nombre); 
        const canControl = isAdm || isAuditor;
        
        if (canControl) { 
            if (e === 'Programada') btn += \`<button type="button" class="btn btn-success" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.iniciarAuditoriaDirecto('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">play_arrow</span> Iniciar</button>\`; 
            else if (e === 'En Progreso') {
                btn += \`<button type="button" class="btn btn-warning" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.pausarAuditoriaDirecto('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">pause</span> Pausar</button>\`; 
                btn += \`<button type="button" class="btn btn-danger" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.finalizarAuditoriaDirecto('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">stop</span> Fin</button>\`;
            } else if (e === 'Pausada') {
                btn += \`<button type="button" class="btn btn-success" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.reanudarAuditoriaDirecto('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">play_arrow</span> Reanudar</button>\`; 
                btn += \`<button type="button" class="btn btn-danger" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.finalizarAuditoriaDirecto('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">stop</span> Fin</button>\`;
            }
            btn += \`<button type="button" class="btn btn-info" style="padding:6px 12px; font-size:12px; margin-right:5px; margin-bottom:5px;" onclick="window.cargarAuditoriaParaEditar('\${a.id}')"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">edit</span> Ed</button>\`;
        }
        
        h += \`<tr><td><b>\${a.audit_num || '-'}</b></td><td><b>\${window.formatearFechaAbreviada(a.fecha)}</b><br><small>\${a.hora_inicio || ''} - \${a.hora_fin || ''}</small></td><td>\${a.requisitos ? a.requisitos.substring(0,30) + '...' : '-'}</td><td>\${a.auditado || '-'}</td><td>\${a.auditor || '-'}</td><td><span class="badge \${b}">\${e}\${roundLabel}</span></td><td class="no-export" style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">\${btn}</td></tr>\`;`;


const target2 = `    window.setDisplay('btn-comenzar-auditoria', (isAdm || isAud) && (e === 'Programada' || e === 'Pausada') ? 'inline-block' : 'none'); 
    if($('btn-comenzar-auditoria')) window.setTxt('btn-comenzar-auditoria', e === 'Pausada' ? '▶️ REANUDAR AUDITORÍA' : '▶️ COMENZAR AUDITORÍA');
    window.setDisplay('btn-pausar-auditoria', (isAdm || isAud) && e === 'En Progreso' ? 'inline-block' : 'none');
    window.setDisplay('btn-finalizar-auditoria', (isAdm || isAud) && (e === 'En Progreso' || e === 'Pausada') ? 'inline-block' : 'none');`;

const repl2 = `    window.setDisplay('btn-comenzar-auditoria', (isAdm || isAud) && (e === 'Programada' || e === 'Pausada') ? 'inline-block' : 'none'); 
    if($('btn-comenzar-auditoria')) window.setTxt('btn-comenzar-auditoria', e === 'Pausada' ? '▶️ REANUDAR AUDITORÍA' : '▶️ COMENZAR AUDITORÍA');
    window.setDisplay('btn-pausar-auditoria', (isAdm || isAud) && e === 'En Progreso' ? 'inline-block' : 'none');
    window.setDisplay('btn-finalizar-auditoria', (isAdm || isAud) && (e === 'En Progreso' || e === 'Pausada') ? 'inline-block' : 'none');
    window.setDisplay('btn-eliminar-auditoria', isAdm ? 'inline-block' : 'none');`;

let newContent = content.replace(target1, repl1);
newContent = newContent.replace(target1.replace(/\r\n/g, '\n'), repl1);

newContent = newContent.replace(target2, repl2);
newContent = newContent.replace(target2.replace(/\r\n/g, '\n'), repl2);

const funcAdd = `
window.eliminarAuditoriaDetalle = async () => {
    if(!selectedAuditId) return;
    if(!confirm("¿Está seguro de eliminar definitivamente esta auditoría? Esto no se puede deshacer.")) return;
    window.showLoading();
    try {
        await window.del('Auditorias', selectedAuditId, true); // true to skip inner confirm
        window.setDisplay('modal-aud-detalles', 'none');
        window.hideLoading();
    } catch(e) {
        console.error(e);
        window.hideLoading();
    }
};
`;

if (!newContent.includes('window.eliminarAuditoriaDetalle =')) {
    newContent += funcAdd;
}

fs.writeFileSync('app.js', newContent);
console.log('App.js patched successfully');
