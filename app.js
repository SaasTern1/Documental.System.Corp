if(a.hora_real_inicio && a.hora_real_fin && $('ma-duracion')) { 
        let m = new Date(a.hora_real_fin) - new Date(a.hora_real_inicio); 
        $('ma-duracion').innerText = `${Math.floor(m/3600000)}h ${Math.floor((m%3600000)/60000)}m`; 
    }
    
    const isAdm = currentUser.permisos.admin || currentUser.permisos.p_audit_admin;
    const isAud = a.auditor && a.auditor.includes(currentUser.nombre);
    const canEd = (isAdm || isAud) && e !== 'Completada';
    
    setDisplay('btn-comenzar-auditoria', (isAdm || isAud) && e === 'Programada' ? 'inline-block' : 'none'); 
    setDisplay('btn-finalizar-auditoria', (isAdm || isAud) && e === 'En Progreso' ? 'inline-block' : 'none');
    
    if($('chat-box-audit')) $('chat-box-audit').innerHTML = a.bitacora ? a.bitacora.map(c => `<div class="chat-msg"><b style="font-size:10px">${c.u}</b> <span style="font-size:9px;color:#94a3b8">${c.t}</span><br>${c.m}${c.archivo ? `<br><a href="#" onclick="window.abrirDocumento('${c.archivo}','${c.archivo_nombre}');return false;" style="font-size:10px;color:blue;">📎 Ver</a>` : ''}</div>`).join('') : '';
    
    currentAuditF020 = a.lista_verificacion || []; window.renderF020();
    
    ['f003-conclusiones','f003-n-proceso','f003-n-personal','f003-n-cargo','f003-n-req','f003-n-doc','f003-n-evidencia'].forEach(i => { if($(i)) $(i).disabled = !canEd; });
    if(a.reporte_auditoria) { ['conclusiones','n_proceso','n_personal','n_cargo','n_req','n_doc','n_evidencia'].forEach(k => { if($('f003-'+k)) $('f003-'+k).value = a.reporte_auditoria[k] || ""; }); }
    
    window.actualizarMetricasF003(canEd); window.renderAuditSACs();
    
    setDisplay('btn-tab-f020', (isAdm || isAud) ? 'inline-block' : 'none'); 
    setDisplay('btn-add-f020', canEd ? 'inline-block' : 'none'); 
    setDisplay('btn-save-f020', canEd ? 'inline-block' : 'none'); 
    setDisplay('btn-submit-f020', canEd ? 'inline-block' : 'none'); 
    setDisplay('btn-save-f003', canEd ? 'inline-block' : 'none'); 
    setDisplay('btn-add-sac-manual', canEd ? 'inline-block' : 'none');
    
    window.switchAuditTab('info'); setDisplay('modal-auditoria', 'flex');
} catch(e) {
    console.error("Error abriendo auditoría:", e);
} finally {
    window.hideLoading();
}
};

window.comenzarAuditoria = async () => { await window.iniciarAuditoriaDirecto(selectedAuditId); window.verModalAuditoria(selectedAuditId); };
window.finalizarAuditoria = async () => { await window.finalizarAuditoriaDirecto(selectedAuditId); window.verModalAuditoria(selectedAuditId); };
window.enviarComentarioAuditoria = async () => { const b = $('ma-comentario-libre'); const th = b.innerHTML; const f = $('ma-file-comentario'); if(!b.innerText.trim() && !f.files[0]) return; window.showLoading(); let u = null, fn = null; if(f.files[0]) { u = await window.uploadToCloudinary(f.files[0]); fn = f.files[0].name; } await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId), {bitacora: arrayUnion({u:currentUser.nombre, m:`💬 ${th}`, t:new Date().toLocaleString(), archivo:u, archivo_nombre:fn})}); b.innerHTML=""; f.value=""; window.hideLoading(); window.verModalAuditoria(selectedAuditId); };

window.renderF020 = () => {
if(!$('tbody-f020')) return; 
let canEd = selectedAuditData && String(selectedAuditData.estado||"") !== 'Completada' && (currentUser.permisos.admin || currentUser.permisos.p_audit_admin || (selectedAuditData.auditor && selectedAuditData.auditor.includes(currentUser.nombre))); 
let h = "";
let rqs = selectedAuditData && selectedAuditData.requisitos ? selectedAuditData.requisitos.split(', ') : [];
let aOps = `<option value="">-- Sel --</option>` + (selectedAuditData && selectedAuditData.auditado ? selectedAuditData.auditado.split(', ').map(a => `<option value="${a}">${a}</option>`).join('') : '');

currentAuditF020.forEach((i, idx) => {
    let dis = canEd ? '' : 'disabled';
    let rOpt = `<option value="">-- Sel --</option>` + rqs.map(r => `<option value="${r}" ${i.requisito === r ? 'selected' : ''}>${r}</option>`).join('');
    let aOpt = `<option value="${i.auditado || ''}" selected>${i.auditado || '-- Sel --'}</option>` + aOps;
    let nOpt = `<option value="N/A" ${i.nc==='N/A'||!i.nc?'selected':''}>N/A</option><option value="NC Menor" ${i.nc==='NC Menor'?'selected':''}>NC Menor</option><option value="NC Mayor" ${i.nc==='NC Mayor'?'selected':''}>NC Mayor</option><option value="OM" ${i.nc==='OM'?'selected':''}>OM</option>`;
    let fOpt = `<option value="N/A" ${i.fortaleza==='N/A'||!i.fortaleza?'selected':''}>N/A</option><option value="Sí" ${i.fortaleza==='Sí'?'selected':''}>Sí</option>`;
    h += `<tr data-id="${i.id}"><td>${idx+1}</td><td><textarea class="table-input" rows="2" ${dis}>${i.pregunta||''}</textarea></td><td><select class="table-select" ${dis}>${rOpt}</select></td><td><textarea class="table-input" rows="2" ${dis}>${i.comentarios||''}</textarea></td><td><select class="table-select" ${dis}>${aOpt}</select></td><td><select class="table-select hallazgo-sel" ${dis}>${nOpt}</select></td><td><textarea class="table-input" rows="2" ${dis}>${i.observacion||''}</textarea></td><td><select class="table-select" ${dis}>${fOpt}</select></td><td class="f020-action-col">${canEd?`<button class="btn-icon-danger" onclick="window.eliminarF020('${i.id}')"><span class="material-icons-round">delete</span></button>`:''}</td></tr>`;
}); 
setHtml('tbody-f020', h); 
$$('.f020-action-col').forEach(e => e.style.display = canEd ? '' : 'none');
};

window.agregarFilaF020 = () => { currentAuditF020.push({ id:'f020_'+Date.now(), pregunta:'', requisito:'', comentarios:'', auditado:'', nc:'N/A', observacion:'', fortaleza:'N/A' }); window.renderF020(); };
window.eliminarF020 = (id) => { if(!confirm("?")) return; currentAuditF020 = currentAuditF020.filter(x => x.id !== id); window.renderF020(); };
window.guardarF020 = async (notificar=false) => { 
let dA = []; 
$$('#tbody-f020 tr').forEach(tr => { let inps = tr.querySelectorAll('.table-input, .table-select'); dA.push({id: tr.dataset.id, pregunta: inps[0].value, requisito: inps[1].value, comentarios: inps[2].value, auditado: inps[3].value, nc: inps[4].value, observacion: inps[5].value, fortaleza: inps[6].value}); }); 
window.showLoading(); 
await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId), {lista_verificacion: dA}); 
if(notificar) { window.sendNotification({to: EMAIL_ADMIN_SGC}, "F-020 Actualizado", `Auditor ${currentUser.nombre} subió F-020 para la auditoría ${selectedAuditData.audit_num}.`); alert("Guardado y Notificado a SGC"); } else { alert("F-020 Guardado."); } 
window.hideLoading(); window.verModalAuditoria(selectedAuditId); 
};
window.enviarPreguntasSGC = () => window.guardarF020(true);

window.generarBloqueNCDinamico = (i, idx, t, canEd) => {
let d = selectedAuditData.reporte_auditoria?.detalles_nc?.[i.id] || {}; let dis = canEd ? '' : 'disabled';
return `<div style="border:1px solid #ccc;font-size:12px;margin-bottom:15px;" class="f003-hallazgo-block" data-id="${i.id}"><div style="display:grid;grid-template-columns:150px 1fr;"><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">No. de ${t}</div><div style="padding:8px;border:1px solid #ccc;">${idx}</div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Dpto/Función</div><div style="padding:0;border:1px solid #ccc;"><input type="text" class="h-dep" value="${d.departamento||i.auditado||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Doc Ref</div><div style="padding:0;border:1px solid #ccc;"><input type="text" class="h-doc" value="${d.doc_ref||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Requisito Afectado</div><div style="padding:0;border:1px solid #ccc;"><input type="text" class="h-req" value="${d.requisito||i.requisito||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Detalle</div><div style="padding:0;border:1px solid #ccc;"><textarea class="h-det" ${dis} style="border:none;width:100%;height:100%;min-height:40px;padding:8px;">${d.detalle||i.comentarios||i.pregunta||''}</textarea></div></div></div>`;
};

window.actualizarMetricasF003 = (canEd) => {
let nM = 0, nm = 0, om = 0, hM = "", hm = "", ho = ""; 
currentAuditF020.forEach(i => { if(i.nc === 'NC Mayor'){nM++; hM += window.generarBloqueNCDinamico(i,nM,'NC Mayor',canEd);} if(i.nc === 'NC Menor'){nm++; hm += window.generarBloqueNCDinamico(i,nm,'NC Menor',canEd);} if(i.nc === 'OM'){om++; ho += window.generarBloqueNCDinamico(i,om,'OM',canEd);} });
if($('f003-nc-mayor')) $('f003-nc-mayor').innerText = nM; if($('f003-nc-menor')) $('f003-nc-menor').innerText = nm; if($('f003-om')) $('f003-om').innerText = om;
if($('container-nc-menor')) $('container-nc-menor').innerHTML = hm || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>"; if($('container-nc-mayor')) $('container-nc-mayor').innerHTML = hM || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>"; if($('container-om')) $('container-om').innerHTML = ho || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>";
};

window.guardarF003 = async () => { 
window.showLoading(); let dN = {}; $$('.f003-hallazgo-block').forEach(b => dN[b.dataset.id] = {departamento:b.querySelector('.h-dep').value, doc_ref:b.querySelector('.h-doc').value, requisito:b.querySelector('.h-req').value, detalle:b.querySelector('.h-det').value}); 
let rD = { conclusiones:$('f003-conclusiones').value, n_proceso:$('f003-n-proceso').value, n_personal:$('f003-n-personal').value, n_cargo:$('f003-n-cargo').value, n_req:$('f003-n-req').value, n_doc:$('f003-n-doc').value, n_evidencia:$('f003-n-evidencia').value, detalles_nc:dN }; 
await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId),{reporte_auditoria:rD}); window.hideLoading(); alert("Reporte F-003 guardado."); 
};

window.renderAuditSACs = () => {
const tb = $('tbody-audit-sacs'); if(!tb) return; let hs = currentAuditF020.filter(i => i.nc === 'NC Mayor' || i.nc === 'NC Menor' || i.nc === 'OM');
if(hs.length === 0) { tb.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No hay NC/OM.</td></tr>"; return; } let ht = "";
hs.forEach((h, idx) => {
    let sac = globalAllSacs.find(s => s.f020_id === h.id), bd = '', es = 'SIN GENERAR', btn = '', cb = h.nc === 'NC Mayor' ? 'badge-danger' : (h.nc === 'NC Menor' ? 'badge-warning' : 'badge-info');
    if(sac) { 
        es = String(sac.estado || ''); let bs = es.includes('Abierta') ? 'badge-danger' : (es === 'En Seguimiento' ? 'badge-warning' : 'badge-success'); 
        bd = `<span class="badge ${bs}">${es.toUpperCase()}</span><br><small>${sac.sac_num}</small>`; btn = `<button class="btn btn-primary" style="padding:4px;font-size:10px;" onclick="window.verSAC('${sac.sac_id}')">VER</button>`; 
    } else { 
        bd = `<span class="badge badge-dark">NO CREADA</span>`; 
        if(currentUser.permisos.p_audit_auditor || currentUser.permisos.admin || (selectedAuditData && selectedAuditData.auditor && selectedAuditData.auditor.includes(currentUser.nombre))) btn = `<button class="btn btn-info" style="padding:4px;font-size:10px;" onclick="window.abrirCrearSAC('${h.id}')">CREAR SAC</button>`; 
    }
    ht += `<tr><td><b>Ref. ${idx+1}</b><br><small>${(h.pregunta || "").substring(0,30)}...</small></td><td>${h.comentarios || ""}</td><td><span class="badge ${cb}">${h.nc}</span></td><td>${bd}</td><td>${btn}</td></tr>`;
}); tb.innerHTML = ht;
};

window.addPlanRow = (d="", r="", i="", f="") => { const tb = $('tbody-plan-accion'); let tr = document.createElement('tr'); tr.innerHTML = `<td style="border:1px solid #ccc;">${tb.children.length+1}</td><td style="padding:0;"><input type="text" value="${d}" style="width:100%;border:none;margin:0;"></td><td style="padding:0;"><input type="text" value="${r}" style="width:100%;border:none;margin:0;"></td><td style="padding:0;"><input type="date" value="${i}" style="width:100%;border:none;margin:0;"></td><td style="padding:0;"><input type="date" value="${f}" style="width:100%;border:none;margin:0;"></td><td style="text-align:center;"><button class="btn-icon-danger" onclick="this.parentElement.parentElement.remove()"><span class="material-icons-round">delete</span></button></td>`; tb.appendChild(tr); };
window.addSeguimientoRow = (res="", r="", f="") => { const tb = $('tbody-seguimiento'); let tr = document.createElement('tr'); tr.innerHTML = `<td style="border:1px solid #ccc;">${tb.children.length+1}</td><td style="padding:0;"><input type="text" value="${res}" style="width:100%;border:none;margin:0;"></td><td style="padding:0;"><input type="text" value="${r}" style="width:100%;border:none;margin:0;"></td><td style="padding:0;"><input type="date" value="${f}" style="width:100%;border:none;margin:0;"></td><td style="text-align:center;"><button class="btn-icon-danger" onclick="this.parentElement.parentElement.remove()"><span class="material-icons-round">delete</span></button></td>`; tb.appendChild(tr); };

window.abrirCrearSAC = (id) => {
let h = currentAuditF020.find(i => i.id === id); if(!h) return; currentEditingSacId = null; currentEditingF020Ref = h;
if($('sac-num')) $('sac-num').innerText = "POR ASIGNAR"; 
if($('sac-estado-badge')) { $('sac-estado-badge').innerText = "NUEVA"; $('sac-estado-badge').className = "badge badge-info"; }
if($('sac-fecha')) $('sac-fecha').value = new Date().toISOString().split('T')[0];
if($('sac-proceso')) $('sac-proceso').value = h.requisito || ""; 
if($('sac-tipo')) $('sac-tipo').value = h.nc || "";

if($('sac-tipo-doc-afectado')) { $('sac-tipo-doc-afectado').innerHTML = '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join(''); $('sac-tipo-doc-afectado').value = ""; }
if($('sac-fuente')) $('sac-fuente').value = "Auditoría Interna"; if($('sac-fuente-otro')) $('sac-fuente-otro').value = ""; if($('sac-detalle')) $('sac-detalle').value = h.comentarios || h.pregunta || ""; if($('sac-beneficio')) $('sac-beneficio').value = ""; if($('sac-causa')) $('sac-causa').value = ""; if($('sac-accion')) $('sac-accion').value = "";
if($('tbody-plan-accion')) $('tbody-plan-accion').innerHTML = ""; if($('sac-fecha-aprob-plan')) $('sac-fecha-aprob-plan').value = ""; if($('tbody-seguimiento')) $('tbody-seguimiento').innerHTML = ""; if($('sac-resp-cierre')) $('sac-resp-cierre').value = ""; if($('sac-fecha-cierre')) $('sac-fecha-cierre').value = ""; if($('sac-check-cerrar')) $('sac-check-cerrar').checked = false;

let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
let op = '<option value="">-- Responsable --</option>';
allUsers.forEach(u => { op += `<option value="${u.usuario}">${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
if($('sac-dueno')) $('sac-dueno').innerHTML = op; 

setDisplay('modal-sac', 'flex');
};

window.abrirCrearSACManual = () => {
currentEditingSacId = null; currentEditingF020Ref = null;
if($('sac-num')) $('sac-num').innerText = "POR ASIGNAR"; 
if($('sac-estado-badge')) { $('sac-estado-badge').innerText = "NUEVA"; $('sac-estado-badge').className = "badge badge-info"; }
if($('sac-fecha')) $('sac-fecha').value = new Date().toISOString().split('T')[0];
if($('sac-proceso')) $('sac-proceso').value = selectedAuditData?.requisitos || ""; 
if($('sac-tipo')) $('sac-tipo').value = "OM";

if($('sac-tipo-doc-afectado')) { $('sac-tipo-doc-afectado').innerHTML = '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join(''); $('sac-tipo-doc-afectado').value = ""; }
if($('sac-fuente')) $('sac-fuente').value = "Auditoría Interna"; if($('sac-fuente-otro')) $('sac-fuente-otro').value = ""; if($('sac-detalle')) $('sac-detalle').value = ""; if($('sac-beneficio')) $('sac-beneficio').value = ""; if($('sac-causa')) $('sac-causa').value = ""; if($('sac-accion')) $('sac-accion').value = "";
if($('tbody-plan-accion')) $('tbody-plan-accion').innerHTML = ""; if($('sac-fecha-aprob-plan')) $('sac-fecha-aprob-plan').value = ""; if($('tbody-seguimiento')) $('tbody-seguimiento').innerHTML = ""; if($('sac-resp-cierre')) $('sac-resp-cierre').value = ""; if($('sac-fecha-cierre')) $('sac-fecha-cierre').value = ""; if($('sac-check-cerrar')) $('sac-check-cerrar').checked = false;

let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
let op = '<option value="">-- Responsable --</option>';
allUsers.forEach(u => { op += `<option value="${u.usuario}">${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
if($('sac-dueno')) $('sac-dueno').innerHTML = op; 

setDisplay('modal-sac', 'flex');
};

window.verSAC = (id) => {
let sac = globalAllSacs.find(s => s.sac_id === id); if(!sac) return; currentEditingSacId = id;
if($('sac-num')) $('sac-num').innerText = sac.sac_num || ""; 
let es = String(sac.estado || ""); let bs = es.includes('Abierta') ? 'badge-danger' : (es === 'En Seguimiento' ? 'badge-warning' : 'badge-success'); 
if($('sac-estado-badge')) { $('sac-estado-badge').innerText = es.toUpperCase(); $('sac-estado-badge').className = `badge ${bs}`; }

if($('sac-fecha')) $('sac-fecha').value = sac.fecha_registro || (sac.fecha_apertura ? sac.fecha_apertura.split('T')[0] : ""); 
if($('sac-proceso')) $('sac-proceso').value = sac.proceso || ""; 
if($('sac-tipo')) $('sac-tipo').value = sac.tipo_hallazgo || "";

if($('sac-tipo-doc-afectado')) { $('sac-tipo-doc-afectado').innerHTML = '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join(''); $('sac-tipo-doc-afectado').value = sac.tipo_doc_afectado || ""; }

if($('sac-fuente')) $('sac-fuente').value = sac.fuente_nc || "Auditoría Interna"; if($('sac-fuente-otro')) $('sac-fuente-otro').value = sac.fuente_otro || ""; if($('sac-detalle')) $('sac-detalle').value = sac.detalle_nc || ""; if($('sac-beneficio')) $('sac-beneficio').value = sac.beneficio_esperado || ""; if($('sac-causa')) $('sac-causa').value = sac.causa_raiz || ""; if($('sac-accion')) $('sac-accion').value = sac.accion_implementar || "";

let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
let op = '<option value="">-- Responsable --</option>';
allUsers.forEach(u => { op += `<option value="${u.usuario}" ${sac.dueno_uid === u.usuario ? 'selected' : ''}>${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
if($('sac-dueno')) $('sac-dueno').innerHTML = op;

if($('tbody-plan-accion')) { $('tbody-plan-accion').innerHTML = ""; if(sac.plan_accion) sac.plan_accion.forEach(p => window.addPlanRow(p.detalle, p.resp, p.inicio, p.fin)); }
if($('sac-fecha-aprob-plan')) $('sac-fecha-aprob-plan').value = sac.fecha_aprobacion_plan || "";
if($('tbody-seguimiento')) { $('tbody-seguimiento').innerHTML = ""; if(sac.seguimiento) sac.seguimiento.forEach(s => window.addSeguimientoRow(s.resultado, s.resp, s.fecha)); }

if($('sac-resp-cierre')) $('sac-resp-cierre').value = sac.cerrado_por || ""; 
if($('sac-fecha-cierre')) $('sac-fecha-cierre').value = sac.fecha_cierre ? sac.fecha_cierre.split('T')[0] : ""; 
if($('sac-check-cerrar')) $('sac-check-cerrar').checked = es === 'Cerrada'; 

setDisplay('modal-sac', 'flex');
};

window.guardarSAC = async () => {
window.showLoading(); let pA = [], sA = []; 
$$('#tbody-plan-accion tr').forEach(tr => { let i = tr.querySelectorAll('input'); if(i[0].value.trim()) pA.push({detalle: i[0].value, resp: i[1].value, inicio: i[2].value, fin: i[3].value}); });
$$('#tbody-seguimiento tr').forEach(tr => { let i = tr.querySelectorAll('input'); if(i[0].value.trim()) sA.push({resultado: i[0].value, resp: i[1].value, fecha: i[2].value}); });

let es = "Abierta (En Plan)"; if($('sac-fecha-aprob-plan') && $('sac-fecha-aprob-plan').value) es = "En Seguimiento"; if($('sac-check-cerrar') && $('sac-check-cerrar').checked) es = "Cerrada";
let tipoDocAfectado = $('sac-tipo-doc-afectado') ? $('sac-tipo-doc-afectado').value : "";

let dt = { fecha_registro: $('sac-fecha')?$('sac-fecha').value:'', proceso: $('sac-proceso')?$('sac-proceso').value:'', tipo_doc_afectado: tipoDocAfectado, fuente_nc: $('sac-fuente')?$('sac-fuente').value:'', fuente_otro: $('sac-fuente-otro')?$('sac-fuente-otro').value:'', beneficio_esperado: $('sac-beneficio')?$('sac-beneficio').value:'', causa_raiz: $('sac-causa')?$('sac-causa').value:'', accion_implementar: $('sac-accion')?$('sac-accion').value:'', dueno_uid: $('sac-dueno')?$('sac-dueno').value:'', plan_accion: pA, fecha_aprobacion_plan: $('sac-fecha-aprob-plan')?$('sac-fecha-aprob-plan').value:'', seguimiento: sA, fecha_cierre: $('sac-fecha-cierre')?$('sac-fecha-cierre').value:'', cerrado_por: $('sac-check-cerrar')&&$('sac-check-cerrar').checked ? currentUser.nombre : "", estado: es };

try {
    if(!currentEditingSacId) {
        let nS = ""; 
        await runTransaction(db, async(t) => { 
            const sn = await t.get(doc(db,"artifacts",appId,"public","data","Contadores","sacs")); 
            let c = 1; if(sn.exists()) c = sn.data().count + 1; 
            t.set(doc(db,"artifacts",appId,"public","data","Contadores","sacs"), {count: c}); 
            nS = `SAC-${new Date().getFullYear()}-${String(c).padStart(3,'0')}`; 
        });
        dt.sac_num = nS; dt.audit_id = selectedAuditId || "N/A"; dt.f020_id = currentEditingF020Ref ? currentEditingF020Ref.id : "MANUAL"; dt.tipo_hallazgo = currentEditingF020Ref ? currentEditingF020Ref.nc : ($('sac-tipo')?$('sac-tipo').value:''); dt.detalle_nc = $('sac-detalle')?$('sac-detalle').value:''; dt.fecha_apertura = new Date().toISOString(); dt.auditor_nombre = currentUser.nombre;
        await addDoc(collection(db, "artifacts", appId, "public", "data", "AccionesCorrectivas"), dt); 
        alert(`SAC ${nS} Generada.`);
    } else { 
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "AccionesCorrectivas", currentEditingSacId), dt); 
        alert("SAC Actualizada."); 
    }
    setDisplay('modal-sac', 'none'); 
    if(selectedAuditId) window.verModalAuditoria(selectedAuditId);
} catch(e) {
    console.error(e);
    alert("Error al guardar SAC.");
} finally {
    window.hideLoading();
}
};

window.renderF023Global = () => {
const tb = $('tbody-noconf'); if(!tb) return; 
let hs = "", fs = [...globalAllSacs], sE = $('filter-noconf-estado'); 
if(sE && sE.value) fs = fs.filter(s => s.estado === sE.value);
if(!currentUser.permisos.admin && !currentUser.permisos.p_gest_sgc && !currentUser.permisos.p_audit_admin) fs = fs.filter(s => s.dueno_uid === currentUser.usuario || s.auditor_nombre === currentUser.nombre);
fs.sort((a,b) => b.sac_num > a.sac_num ? -1 : 1);
fs.forEach(s => {
    let es = String(s.estado || ''), bs = es.includes('Abierta') ? 'badge-danger' : (es === 'En Seguimiento' ? 'badge-warning' : 'badge-success'); 
    let uD = allUsers.find(u => u.usuario === s.dueno_uid);
    hs += `<tr><td><b>${s.sac_num}</b></td><td>${s.proceso}</td><td><b style="${s.tipo_hallazgo === 'NC Mayor' ? 'color:var(--danger)' : 'color:var(--warning)'}">${s.tipo_hallazgo}</b></td><td>${uD ? uD.nombre : s.dueno_uid}</td><td><div style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${s.detalle_nc}">${s.detalle_nc}</div></td><td>${window.formatearFechaAbreviada(s.fecha_registro || s.fecha_apertura)}</td><td><span class="badge ${bs}">${es}</span></td><td>${s.fecha_cierre ? window.formatearFechaAbreviada(s.fecha_cierre) : '-'}</td><td class="no-export"><button class="btn btn-primary" style="padding:4px;font-size:10px;" onclick="window.verSACGlobal('${s.sac_id}', '${s.audit_id || 'N/A'}')">Revisar</button></td></tr>`;
}); 
if($('tbody-noconf')) $('tbody-noconf').innerHTML = hs;
};

window.setFilterGestNC = () => window.renderF023Global();

window.verSACGlobal = async (sId, aId) => { 
selectedAuditData = null; selectedAuditId = null; 
if(aId && aId !== "N/A" && aId !== "undefined") { 
    try { 
        const sn = await getDoc(doc(db,"artifacts",appId,"public","data","Auditorias",aId)); 
        if(sn.exists()) { selectedAuditData = sn.data(); selectedAuditId = aId; } 
    } catch(e) {} 
} 
window.verSAC(sId); 
};

window.exportarExcelNoConf = () => {
if(globalAllSacs.length === 0) return alert("No hay registros SAC para exportar."); 
let dE = globalAllSacs.map(s => { 
    let u = allUsers.find(x => x.usuario === s.dueno_uid); 
    return { "N° SAC": s.sac_num, "Req": s.proceso, "Tipo Doc": s.tipo_doc_afectado || 'N/A', "Tipo": s.tipo_hallazgo, "Resp": u ? u.nombre : s.dueno_uid, "Detalle": s.detalle_nc, "Apertura": s.fecha_apertura ? new Date(s.fecha_apertura).toLocaleString() : '', "Causa": s.causa_raiz || '', "Acción": s.accion_implementar || '', "Estado": s.estado, "Cierre": s.fecha_cierre ? new Date(s.fecha_cierre).toLocaleString() : '', "Cerrado Por": s.cerrado_por || '' }; 
});
let wb = XLSX.utils.book_new(); let ws = XLSX.utils.json_to_sheet(dE); XLSX.utils.book_append_sheet(wb, ws, "F-023"); XLSX.writeFile(wb, "F-023_Control_NC.xlsx");
};

const inicializarApp = async () => {
window.hideLoading(); const su = localStorage.getItem('sgc_session_user');
if (su) {
    window.showLoading();
    try { 
        const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("usuario", "==", su)));
        if (!qs.empty) { currentUser = qs.docs[0].data(); window.completarLoginUI(); } else window.logout();
    } catch(e) { window.logout(); } 
    window.hideLoading();
} else { setDisplay('login-screen', 'flex'); }
};

document.addEventListener("DOMContentLoaded", inicializarApp);
