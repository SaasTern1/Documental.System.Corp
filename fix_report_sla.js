const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// 1. Fix Mojibake in extraerTodaInformacion columns
code = code.replace(/"ID \/ CÃ³digo"/g, '"ID / Código"');
code = code.replace(/"TÃ­tulo"/g, '"Título"');
code = code.replace(/"AuditorÃ­a"/g, '"Auditoría"');
code = code.replace(/"DescripciÃ³n"/g, '"Descripción"');
code = code.replace(/"RazÃ³n Social"/g, '"Razón Social"');
code = code.replace(/"Ev. FÃ­sica"/g, '"Ev. Física"');
code = code.replace(/"AcciÃ³n MitigaciÃ³n"/g, '"Acción Mitigación"');
code = code.replace(/"DÃ­as Laborables"/g, '"Días Laborables"');

// 2. Expand columns for Solicitudes to have "todos los datos completos"
let solColsOld = `["ID / CÃ³digo", "Fecha Creada", "Solicitante", "TÃ­tulo", "Gerencia", "Prioridad", "Estado", "SLA / Esperada", "Fecha Cierre", "Autorizado Por", "Tiempo Total Flujo"]`;
let solColsNew = `["ID / Código", "Fecha Creada", "Solicitante", "Email Solicitante", "Título", "Tipo Doc", "Acción", "Motivo", "Departamento", "Gerencia", "Prioridad", "Estado", "SLA", "Fecha Cierre", "Autorizado Por", "Tiempo Total Flujo", "Adjunto Nombre"]`;
code = code.replace(solColsOld, solColsNew);

let solPushOld = `                    s.customId || s.id || '', s.fecha || '', s.solicitante || '', s.titulo || '', 
                    s.gerencia || '', s.prioridad || '', s.estado || '', 
                    s.sla || s.fecha_esperada_cierre || '', s.fecha_final || '', authPor || '',
                    tTot
                ]);`;
let solPushNew = `                    s.customId || s.id || '', s.fecha || '', s.solicitante || '', s.solicitante_email || '', s.titulo || '', 
                    s.tipoDoc || '', s.accion || '', s.motivo || '', s.departamento || '', s.gerencia || '', s.prioridad || '', s.estado || '', 
                    s.sla || s.fecha_esperada_cierre || '', s.fecha_final || '', authPor || '',
                    tTot, s.adjunto_nombre || ''
                ]);`;
code = code.replace(solPushOld, solPushNew);

// Expand Auditorias
let audColsOld = `["ID AuditorÃ­a", "Lugar / Proceso", "Fecha", "Requisitos", "LÃ­der", "Equipo Auditor", "Estado", "Puntaje Promedio"]`;
let audColsNew = `["ID Auditoría", "Lugar / Proceso", "Fecha", "Objetivo", "Alcance", "Requisitos", "Técnica", "Criterios", "Líder", "Equipo Auditor", "Recursos Tec", "Recursos HH", "Estado", "Puntaje Promedio"]`;
code = code.replace(audColsOld, audColsNew);

let audPushOld = `                    a.id || '', a.lugar || '', a.fecha || '', a.requisitos || '', 
                    a.lider || '', a.auditores || '', a.estado || '', a.puntaje_global || ''
                ]);`;
let audPushNew = `                    a.id || '', a.lugar || '', a.fecha || '', a.objetivo || '', a.alcance || '', a.requisitos || '', 
                    a.tecnica || '', a.criterios || '', a.lider || '', a.auditores || '', a.recursos_tec || '', a.recursos_hh || '', a.estado || '', a.puntaje_global || ''
                ]);`;
code = code.replace(audPushOld, audPushNew);

// Expand NC
let ncColsOld = `["SAC NÂ°", "Fecha de EmisiÃ³n", "Tipo", "Requisito Evaluado", "Responsable", "DescripciÃ³n", "AcciÃ³n Inmediata", "Estado", "Fecha Cierre"]`;
let ncColsNew = `["SAC N°", "Fecha de Emisión", "Proceso", "Tipo", "Requisito Evaluado", "Responsable", "Descripción", "Acción Inmediata", "Causa Raíz", "Acción Correctiva", "Estado", "Fecha Cierre"]`;
code = code.replace(ncColsOld, ncColsNew);

let ncPushOld = `                    n.sac_n || '', n.fecha || '', n.tipo_sac || '', n.requisito_evaluado || '', 
                    n.responsable || '', n.descripcion || '', n.accion_inmediata || '', n.estado || '', n.fecha_cierre || ''
                ]);`;
let ncPushNew = `                    n.sac_num || n.sac_n || '', n.fecha_registro || n.fecha || '', n.proceso || '', n.tipo_hallazgo || n.tipo_sac || '', n.requisito || n.requisito_evaluado || '', 
                    n.dueno_uid || n.responsable || '', n.detalle_nc || n.descripcion || '', n.accion_inmediata || '', n.causa_raiz || '', n.accion_correctiva || '', n.estado || '', n.fecha_cierre || ''
                ]);`;
code = code.replace(ncPushOld, ncPushNew);

// Add window.agregarFechaSLA and window.renderSlaDates
let slaFunctions = `
window.slaDatesArray = [];

window.agregarFechaSLA = () => {
    const picker = document.getElementById('eval-sla-date-picker');
    if (!picker || !picker.value) return alert("Seleccione una fecha primero.");
    if (!window.slaDatesArray.includes(picker.value)) {
        window.slaDatesArray.push(picker.value);
        window.slaDatesArray.sort();
        window.renderSlaDates();
    }
    picker.value = '';
};

window.eliminarFechaSLA = (date) => {
    window.slaDatesArray = window.slaDatesArray.filter(d => d !== date);
    window.renderSlaDates();
};

window.renderSlaDates = () => {
    const list = document.getElementById('eval-sla-dates-list');
    if(!list) return;
    list.innerHTML = '';
    window.slaDatesArray.forEach(d => {
        list.innerHTML += \`<div style="background:#fef3c7; border:1px solid #f59e0b; padding:4px 8px; border-radius:4px; font-size:12px; display:flex; align-items:center; gap:5px;">
            \${d} <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:#b45309;" onclick="window.eliminarFechaSLA('\${d}')">close</span>
        </div>\`;
    });
};
`;

// Insert the functions before window.guardarEvaluacion
code = code.replace("window.guardarEvaluacion = async () => {", slaFunctions + "\nwindow.guardarEvaluacion = async () => {");

// Update abrirEvalModal
let abrirEvalOld = `    let pr = String(selectedDocData.prioridad || "Baja").toLowerCase();
    window.setVal('eval-sla-dias', slaConfigDias[pr] || 7);
    window.setVal('eval-motivo', '');`;

let abrirEvalNew = `    let pr = String(selectedDocData.prioridad || "Baja").toLowerCase();
    let dias = window.slaConfigDias ? (window.slaConfigDias[pr] || 7) : 7;
    window.slaDatesArray = [];
    let dObj = new Date();
    let added = 0;
    while(added < dias) {
        dObj.setDate(dObj.getDate() + 1);
        if (dObj.getDay() !== 0 && dObj.getDay() !== 6) { // skip weekends
            added++;
            window.slaDatesArray.push(dObj.toISOString().split('T')[0]);
        }
    }
    window.renderSlaDates();
    window.setVal('eval-motivo', '');`;
code = code.replace(abrirEvalOld, abrirEvalNew);

// Update guardarEvaluacion SLA logic
let evalSlaOld = `        let p1 = $('eval-asig-p1').value, p2 = $('eval-asig-p2').value, p4 = $('eval-asig-p4').value;
        let dias = parseInt($('eval-sla-dias').value) || 0; let dObj = new Date(); dObj.setDate(dObj.getDate() + dias);
        let fSLA = dObj.toISOString().split('T')[0];
        let p1Name = p1 || 'No especificado (Cualquiera)'; let p2Name = p2 || 'No especificado (Cualquiera)'; let p4Name = p4 || 'No especificado (Cualquiera)';`;

let evalSlaNew = `        let p1 = $('eval-asig-p1').value, p2 = $('eval-asig-p2').value, p4 = $('eval-asig-p4').value;
        if (window.slaDatesArray.length === 0) return alert("Debe haber al menos 1 día de SLA asignado.");
        let fSLA = window.slaDatesArray[window.slaDatesArray.length - 1]; // Max date
        let p1Name = p1 || 'No especificado (Cualquiera)'; let p2Name = p2 || 'No especificado (Cualquiera)'; let p4Name = p4 || 'No especificado (Cualquiera)';`;
code = code.replace(evalSlaOld, evalSlaNew);

// Add SLA explicitly to updateDoc (it already uses fSLA)
// Find updateDoc in guardarEvaluacion and ensure sla_dates is added.
let updateDocOld = `sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1`;
let updateDocNew = `sla: fSLA, fecha_esperada_cierre: fSLA, sla_dates: window.slaDatesArray, asig_paso1`;
code = code.replace(updateDocOld, updateDocNew);

fs.writeFileSync('app.js', code, 'utf8');
console.log("Fixes applied successfully.");
