const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// TASK 1: Allow Devolver to Evaluacion (idx -1)
const devolverTarget = `window.devolverPaso = async () => {
    const motivo = prompt("Motivo para devolver a la fase anterior:");
    if(!motivo) return;
    const s = selectedDocData;
    if(s.idx === 0) return;
    const nIdx = s.idx - 1;
    const nEst = PASOS_NOMBRES[nIdx];
    window.showLoading();
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { 
        idx: nIdx, 
        estado: nEst, 
        chat: arrayUnion({u: currentUser.nombre, m: \`❌ <b>DEVUELTO A FASE ANTERIOR: \${nEst}</b><br>Motivo: \${motivo}\`, t: new Date().toLocaleString()}) 
    });
    window.hideLoading();
    window.closeModal();
};`;

const devolverRepl = `window.devolverPaso = async () => {
    const motivo = prompt("Motivo para devolver a la fase anterior:");
    if(!motivo) return;
    const s = selectedDocData;
    if(s.idx === -1) return;
    const nIdx = s.idx - 1;
    const nEst = nIdx === -1 ? "En Evaluación (SGC)" : PASOS_NOMBRES[nIdx];
    window.showLoading();
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { 
        idx: nIdx, 
        estado: nEst, 
        chat: arrayUnion({u: currentUser.nombre, m: \`❌ <b>DEVUELTO A FASE ANTERIOR: \${nEst}</b><br>Motivo: \${motivo}\`, t: new Date().toLocaleString()}) 
    });
    window.hideLoading();
    window.closeModal();
};`;

content = content.replace(devolverTarget, devolverRepl).replace(devolverTarget.replace(/\r\n/g, '\n'), devolverRepl);

// TASK 2: Add window.cambiarAsignado
const cambiarAsignadoCode = `
window.cambiarAsignado = async (campo, email) => {
    if(!confirm("¿Modificar responsable asignado?")) {
        window.verDetalle(selectedId); // revert select
        return;
    }
    window.showLoading();
    try {
        let updates = {};
        updates[campo] = email;
        let pName = "Cualquiera (Gestor SGC)";
        if(email) {
            let uFound = allUsers.find(u => (u.email||'').toLowerCase() === email.toLowerCase());
            if(uFound) pName = uFound.nombre;
        }
        let stepName = campo === 'asig_paso1' ? 'Paso 1 (Documentar)' : (campo === 'asig_paso2' ? 'Paso 2 (Verificar)' : 'Paso 4 (Publicar)');
        updates.chat = arrayUnion({u: currentUser.nombre, m: \`✏️ <b>ASIGNACIÓN ACTUALIZADA:</b><br>\${stepName} asignado a: \${pName}\`, t: new Date().toLocaleString()});
        
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), updates);
        selectedDocData[campo] = email;
        window.hideLoading();
    } catch(e) {
        console.error(e);
        window.hideLoading();
        alert("Error al guardar asignación.");
    }
};
`;

if(content.indexOf('window.cambiarAsignado') === -1) {
    content += cambiarAsignadoCode;
}

// TASK 3: Allow inline edit of assigned users in verDetalle
const verDetalleAsignadosTarget = `    if($('m-asignados-panel')) {
        if(stepIdx >= 0 && (s.asig_paso1 || s.asig_paso2 || s.asig_paso4)) {
            window.setDisplay('m-asignados-panel', 'block');
            window.setTxt('m-asig-p1', s.asig_paso1 || 'Cualquiera (Gestor SGC)');
            window.setTxt('m-asig-p2', s.asig_paso2 || 'Cualquiera (Gestor SGC)');
            window.setTxt('m-asig-p4', s.asig_paso4 || 'Cualquiera (Gestor SGC)');
        } else {
            window.setDisplay('m-asignados-panel', 'none');
        }
    }`;

const verDetalleAsignadosRepl = `    if($('m-asignados-panel')) {
        if(stepIdx >= 0) {
            window.setDisplay('m-asignados-panel', 'block');
            if (esAdminSGC && activo) {
                let optsP1 = '<option value="">-- Cualquiera (Gestor SGC) --</option>';
                let optsP2 = '<option value="">-- Cualquiera (Gestor SGC) --</option>';
                let optsP4 = '<option value="">-- Cualquiera (Gestor SGC) --</option>';
                
                allUsers.forEach(u => {
                    if (u.permisos.admin || u.permisos.p_gest_sgc || u.permisos.p_paso1) optsP1 += \`<option value="\${u.email}" \${s.asig_paso1 && s.asig_paso1.toLowerCase() === u.email.toLowerCase() ? 'selected' : ''}>\${u.nombre} (\${u.email})</option>\`;
                    if (u.permisos.admin || u.permisos.p_gest_sgc || u.permisos.p_paso2) optsP2 += \`<option value="\${u.email}" \${s.asig_paso2 && s.asig_paso2.toLowerCase() === u.email.toLowerCase() ? 'selected' : ''}>\${u.nombre} (\${u.email})</option>\`;
                    if (u.permisos.admin || u.permisos.p_gest_sgc || u.permisos.p_paso4) optsP4 += \`<option value="\${u.email}" \${s.asig_paso4 && s.asig_paso4.toLowerCase() === u.email.toLowerCase() ? 'selected' : ''}>\${u.nombre} (\${u.email})</option>\`;
                });

                window.setHtml('m-asig-p1', \`<select onchange="window.cambiarAsignado('asig_paso1', this.value)" style="width:100%; padding:4px; border-radius:4px; font-size:11px;">\${optsP1}</select>\`);
                window.setHtml('m-asig-p2', \`<select onchange="window.cambiarAsignado('asig_paso2', this.value)" style="width:100%; padding:4px; border-radius:4px; font-size:11px;">\${optsP2}</select>\`);
                window.setHtml('m-asig-p4', \`<select onchange="window.cambiarAsignado('asig_paso4', this.value)" style="width:100%; padding:4px; border-radius:4px; font-size:11px;">\${optsP4}</select>\`);
            } else {
                let p1Name = s.asig_paso1 || 'Cualquiera (Gestor SGC)'; if(s.asig_paso1) { let u = allUsers.find(x => (x.email||'').toLowerCase() === s.asig_paso1.toLowerCase()); if(u) p1Name = u.nombre; }
                let p2Name = s.asig_paso2 || 'Cualquiera (Gestor SGC)'; if(s.asig_paso2) { let u = allUsers.find(x => (x.email||'').toLowerCase() === s.asig_paso2.toLowerCase()); if(u) p2Name = u.nombre; }
                let p4Name = s.asig_paso4 || 'Cualquiera (Gestor SGC)'; if(s.asig_paso4) { let u = allUsers.find(x => (x.email||'').toLowerCase() === s.asig_paso4.toLowerCase()); if(u) p4Name = u.nombre; }
                
                window.setTxt('m-asig-p1', p1Name);
                window.setTxt('m-asig-p2', p2Name);
                window.setTxt('m-asig-p4', p4Name);
            }
        } else {
            window.setDisplay('m-asignados-panel', 'none');
        }
    }`;

content = content.replace(verDetalleAsignadosTarget, verDetalleAsignadosRepl).replace(verDetalleAsignadosTarget.replace(/\r\n/g, '\n'), verDetalleAsignadosRepl);

fs.writeFileSync('app.js', content);
console.log('Fixed devolver y editar asignado');
