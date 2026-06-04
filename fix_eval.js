const fs = require('fs');

// PART 1: INDEX.HTML
let idxContent = fs.readFileSync('index.html', 'utf8');

const targetHtml = `                <div id="m-tiempos-panel" style="margin-bottom:25px; background:var(--card-bg); padding:20px; border-radius:12px; border:1px solid var(--border); display:none; box-shadow:var(--shadow-sm);">`;
const replHtml = `                <div id="m-asignados-panel" style="display:none; margin-bottom:20px; background:#f0f9ff; padding:15px; border-radius:10px; border:1px solid #bae6fd;">
                    <div class="custom-label" style="color:var(--primary); font-weight:800; font-size:12px; margin-bottom:10px; display:flex; align-items:center; gap:6px;"><span class="material-icons-round" style="font-size:16px;">people</span> Responsables Asignados (Evaluación SGC)</div>
                    <div class="resp-grid" style="gap:10px;">
                        <div><div class="custom-label">Paso 1 (Documentar)</div><p id="m-asig-p1" style="font-size:13px; font-weight:600;"></p></div>
                        <div><div class="custom-label">Paso 2 (Verificar)</div><p id="m-asig-p2" style="font-size:13px; font-weight:600;"></p></div>
                        <div><div class="custom-label">Paso 4 (Publicar)</div><p id="m-asig-p4" style="font-size:13px; font-weight:600;"></p></div>
                    </div>
                </div>
                
                <div id="m-tiempos-panel" style="margin-bottom:25px; background:var(--card-bg); padding:20px; border-radius:12px; border:1px solid var(--border); display:none; box-shadow:var(--shadow-sm);">`;

if (idxContent.indexOf('m-asignados-panel') === -1) {
    idxContent = idxContent.replace(targetHtml, replHtml);
    fs.writeFileSync('index.html', idxContent);
}

// PART 2: APP.JS
let appContent = fs.readFileSync('app.js', 'utf8');

// A) Update bitacora message in guardarEvaluacion
const targetGuardar = `        let fSLA = dObj.toISOString().split('T')[0];
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { idx: 0, estado: PASOS_NOMBRES[0], fase_eval_fin: now, fase_0_ini: now, sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1: p1, asig_paso2: p2, asig_paso4: p4, chat: arrayUnion({u: currentUser.nombre, m: \`✅ EVALUACIÓN APROBADA. SLA Fijado para: \${fSLA}.\`, t: new Date().toLocaleString()}) });
    }`;

const replGuardar = `        let fSLA = dObj.toISOString().split('T')[0];
        let p1Name = p1 || 'No especificado (Cualquiera)'; let p2Name = p2 || 'No especificado (Cualquiera)'; let p4Name = p4 || 'No especificado (Cualquiera)';
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { idx: 0, estado: PASOS_NOMBRES[0], fase_eval_fin: now, fase_0_ini: now, sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1: p1, asig_paso2: p2, asig_paso4: p4, chat: arrayUnion({u: currentUser.nombre, m: \`✅ EVALUACIÓN APROBADA. SLA Fijado para: \${fSLA}. <br><br><b>Asignados SGC:</b><br>- Paso 1: \${p1Name}<br>- Paso 2: \${p2Name}<br>- Paso 4: \${p4Name}\`, t: new Date().toLocaleString()}) });
    }`;
appContent = appContent.replace(targetGuardar, replGuardar).replace(targetGuardar.replace(/\r\n/g, '\n'), replGuardar);

// B) Update verDetalle to show the assigned people panel
const targetVerDetalle = `    const fDiff = (ini, fin) => { if(!ini || !fin) return "-"; let ms = new Date(fin) - new Date(ini); if(ms < 0) return "-"; let d = Math.floor(ms / 86400000); let h = Math.floor((ms % 86400000) / 3600000); return \`\${d}d \${h}h\`; };`;

const replVerDetalle = `    const fDiff = (ini, fin) => { if(!ini || !fin) return "-"; let ms = new Date(fin) - new Date(ini); if(ms < 0) return "-"; let d = Math.floor(ms / 86400000); let h = Math.floor((ms % 86400000) / 3600000); return \`\${d}d \${h}h\`; };

    if($('m-asignados-panel')) {
        if(stepIdx >= 0 && (s.asig_paso1 || s.asig_paso2 || s.asig_paso4)) {
            window.setDisplay('m-asignados-panel', 'block');
            window.setTxt('m-asig-p1', s.asig_paso1 || 'Cualquiera (Gestor SGC)');
            window.setTxt('m-asig-p2', s.asig_paso2 || 'Cualquiera (Gestor SGC)');
            window.setTxt('m-asig-p4', s.asig_paso4 || 'Cualquiera (Gestor SGC)');
        } else {
            window.setDisplay('m-asignados-panel', 'none');
        }
    }
`;

if (appContent.indexOf('m-asignados-panel') === -1) {
    appContent = appContent.replace(targetVerDetalle, replVerDetalle).replace(targetVerDetalle.replace(/\r\n/g, '\n'), replVerDetalle);
}

fs.writeFileSync('app.js', appContent);

console.log('Fixed assignation display logic');
