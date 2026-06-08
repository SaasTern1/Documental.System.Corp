const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

// The file was truncated at:
//     if (f.files[0]) { url = await window.uploadToCloudinary(f.files[0]);
// 1298: 

// Fix the end of crearSolicitud
const fixCrearSolicitud = ` }
    
    let sol = {
        id: 'SOL-' + Date.now(),
        titulo: tit,
        gerencia: gerTarget,
        estado: 'Pendiente',
        fecha: new Date().toISOString(),
        solicitante: currentUser.usuario,
        archivo: url,
        fileName: fileName,
        historial: [{ fecha: new Date().toISOString(), estado: 'Pendiente', obs: 'Solicitud creada', usuario: currentUser.usuario }]
    };
    globalData.push(sol);
    window.renderSolicitudes();
    window.cambiarVista('sec-hist', document.getElementById('nav-hist'));
    window.hideLoading();
};
`;

const formBuilderLogic = `
// ==========================================
// CREADOR DE FORMULARIOS DINÁMICOS
// ==========================================
window.globalForms = window.globalForms || [];
window.formBuilderCampos = [];
window.editandoFormId = null;
window.formPermLlenarUsers = [];
window.formPermVerUsers = [];
window.formPermEditarUsers = [];
window.currentFormLlenar = null;

window.getValSafe = (id) => { let el = document.getElementById(id); return el ? el.value : ''; };

window.abrirModalNuevoFormulario = (id) => {
    editandoFormId = id || null;
    let opt = '<option value="">Seleccionar usuario...</option>';
    allUsers.forEach(u => opt += \`<option value="\${u.usuario}">\${u.nombre} (\${u.usuario})</option>\`);
    
    let setSel = (selId) => { let el = document.getElementById(selId); if(el) el.innerHTML = opt; };
    setSel('fb-perm-llenar-sel'); setSel('fb-perm-ver-sel'); setSel('fb-perm-editar-sel');

    if(editandoFormId) {
        window.setDisplay('btn-eliminar-form-interno', 'block');
        if(currentUser.permisos && (currentUser.permisos.admin || currentUser.permisos.p_gest_sgc)) {
            window.setDisplay('btn-ver-respuestas-interno', 'block');
        } else {
            window.setDisplay('btn-ver-respuestas-interno', 'none');
        }
        let f = globalForms.find(x => x.id === editandoFormId);
        if(f) {
            window.setVal('fb-titulo', f.titulo);
            window.setVal('fb-desc', f.descripcion);
            let isEval = document.getElementById('fb-is-eval'); if(isEval) isEval.checked = !!f.is_eval;
            let isDyn = document.getElementById('fb-is-dynamic'); if(isDyn) isDyn.checked = !!f.is_dynamic;
            window.setDisplay('fb-dynamic-options-panel', !!f.is_dynamic ? 'block' : 'none');
            window.setVal('fb-dynamic-options', f.dynamic_options ? f.dynamic_options.join(', ') : '');
            formPermLlenarUsers = f.perm_llenar_users || [];
            formPermVerUsers = f.perm_ver_users || [];
            formPermEditarUsers = f.perm_editar_users || [];
            formBuilderCampos = f.campos ? JSON.parse(JSON.stringify(f.campos)) : [];
        }
    } else {
        window.setDisplay('btn-eliminar-form-interno', 'none');
        window.setDisplay('btn-ver-respuestas-interno', 'none');
        formBuilderCampos = [];
        window.setVal('fb-titulo', ''); window.setVal('fb-desc', ''); window.setVal('fb-dynamic-options', '');
        let isEval = document.getElementById('fb-is-eval'); if(isEval) isEval.checked = false;
        let isDyn = document.getElementById('fb-is-dynamic'); if(isDyn) isDyn.checked = false;
        window.setDisplay('fb-dynamic-options-panel', 'none');
        formPermLlenarUsers = []; formPermVerUsers = []; formPermEditarUsers = [];
    }
    window.renderFormPreview();
    window.renderPermUsersList('llenar'); window.renderPermUsersList('ver'); window.renderPermUsersList('editar');
    window.setDisplay('modal-nuevo-formulario', 'flex');
};

window.cerrarModalNuevoFormulario = () => { window.setDisplay('modal-nuevo-formulario', 'none'); };

window.agregarCampoBuilder = () => {
    let tipo = getValSafe('fb-tipo-campo');
    let label = getValSafe('fb-label-campo').trim();
    let opciones = getValSafe('fb-opciones-campo').trim();
    let reqEl = document.getElementById('fb-req-campo');
    let req = reqEl ? reqEl.checked : false;

    if(!label) return alert("Por favor, ingrese la etiqueta o pregunta para el campo.");
    
    let campoObj = { id: 'field_' + Date.now(), tipo: tipo, label: label, requerido: req };
    if(tipo === 'select') {
        if(!opciones) return alert("Ingrese al menos una opción para la lista desplegable.");
        campoObj.opciones = opciones.split(',').map(s => s.trim()).filter(s => s);
    } else if (tipo === 'semaforo') {
        campoObj.matriz_filas = [{ id: Date.now().toString(), label: 'Concepto a evaluar 1' }];
        campoObj.matriz_cols = [
            { id: '1', label: 'Excelente', score: 5, color: '#22c55e' },
            { id: '2', label: 'Bueno', score: 3, color: '#eab308' },
            { id: '3', label: 'Malo', score: 1, color: '#ef4444' }
        ];
    }
    formBuilderCampos.push(campoObj);
    document.getElementById('fb-label-campo').value = '';
    document.getElementById('fb-opciones-campo').value = '';
    window.renderFormPreview();
};

window.eliminarCampoBuilder = (idx) => { formBuilderCampos.splice(idx, 1); window.renderFormPreview(); };
window.moverCampoArriba = (idx) => { if(idx > 0) { let temp = formBuilderCampos[idx]; formBuilderCampos[idx] = formBuilderCampos[idx-1]; formBuilderCampos[idx-1] = temp; window.renderFormPreview(); } };
window.moverCampoAbajo = (idx) => { if(idx < formBuilderCampos.length - 1) { let temp = formBuilderCampos[idx]; formBuilderCampos[idx] = formBuilderCampos[idx+1]; formBuilderCampos[idx+1] = temp; window.renderFormPreview(); } };

window.editarOpcionesCampo = (i) => {
    let c = formBuilderCampos[i];
    let optsArray = c.opciones || [];
    let newOpts = prompt(\`Edita las opciones separadas por coma:\\n(Campo: \${c.label})\`, optsArray.join(', '));
    if(newOpts !== null) {
        let cleanOpts = newOpts.split(',').map(s => s.trim()).filter(s => s);
        if(cleanOpts.length > 0) { c.opciones = cleanOpts; window.renderFormPreview(); } 
        else { alert('Debes ingresar al menos una opción válida.'); }
    }
};

window.renderFormPreview = () => {
    let container = document.getElementById('fb-preview-area');
    if(!container) return;

    if(formBuilderCampos.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:50px;">El formulario está vacío. Añade campos desde el panel izquierdo.</p>';
        return;
    }

    let isDynEl = document.getElementById('fb-is-dynamic');
    let isDyn = isDynEl && isDynEl.checked;
    let dynOptsRaw = getValSafe('fb-dynamic-options').trim();
    let dynOpts = dynOptsRaw ? dynOptsRaw.split(',').map(s => s.trim()).filter(s => s) : [];

    let fh = '';
    formBuilderCampos.forEach((c, i) => {
        let catHtml = '';
        if(isDyn && dynOpts.length > 0) {
            let catOpts = \`<option value="">-- Sin Categoría (Aplica a todo) --</option>\`;
            dynOpts.forEach(o => catOpts += \`<option value="\${o}" \${c.categoria===o?'selected':''}>\${o}</option>\`);
            catHtml = \`<select aria-label="Cat" style="font-size:11px; padding:2px; border-radius:4px; border:1px solid #ccc;" onchange="formBuilderCampos[\${i}].categoria = this.value; window.renderFormPreview();">\${catOpts}</select>\`;
        }

        fh += \`<div style="margin-bottom:15px; padding:15px; background:white; border-radius:8px; border:1px solid var(--border); position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <div style="display:flex; flex-direction:column; gap:5px; flex:1;">
                    <input type="text" value="\${c.label}" onchange="formBuilderCampos[\${i}].label = this.value; window.renderFormPreview();" style="font-size:14px; font-weight:600; border:1px dashed transparent; background:transparent; padding:2px 5px; width:100%;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <label style="font-size:11px; color:var(--text-muted); background:#f1f5f9; padding:2px 6px; border-radius:4px;">
                            <input type="checkbox" \${c.requerido ? 'checked' : ''} onchange="formBuilderCampos[\${i}].requerido = this.checked; window.renderFormPreview();"> Obligatorio
                        </label>
                        \${catHtml}
                    </div>
                </div>
                <div style="display:flex; gap:2px; flex-shrink:0; background:#f8fafc; border-radius:6px; padding:2px;">
                    \${i > 0 ? \`<button type="button" onclick="window.moverCampoArriba(\${i})" style="background:none; border:none; color:var(--primary); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">arrow_upward</span></button>\` : ''}
                    \${i < formBuilderCampos.length - 1 ? \`<button type="button" onclick="window.moverCampoAbajo(\${i})" style="background:none; border:none; color:var(--primary); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">arrow_downward</span></button>\` : ''}
                    \${['select', 'radio', 'checkbox'].includes(c.tipo) ? \`<button type="button" onclick="window.editarOpcionesCampo(\${i})" style="background:none; border:none; color:var(--info); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">edit</span></button>\` : ''}
                    <button type="button" onclick="window.eliminarCampoBuilder(\${i})" style="background:none; border:none; color:var(--danger); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                </div>
            </div>\`;
        
        let tipo = c.tipo || c.type || 'text';
        if(tipo === 'text') fh += \`<input type="text" disabled placeholder="Campo de texto corto" style="background:#f8fafc; width:100%;">\`;
        else if(tipo === 'textarea') fh += \`<textarea disabled placeholder="Campo de texto largo" rows="2" style="background:#f8fafc; width:100%;"></textarea>\`;
        else if(tipo === 'number') fh += \`<input type="number" disabled placeholder="123" style="background:#f8fafc; width:100%;">\`;
        else if(tipo === 'date') fh += \`<input type="date" disabled style="background:#f8fafc; width:100%;">\`;
        else if(tipo === 'select') { fh += \`<select disabled style="background:#f8fafc; width:100%;"><option>Opciones...</option></select>\`; }
        else if(tipo === 'checkbox') fh += \`<label style="font-size:12px;"><input type="checkbox" disabled> Marcar casilla</label>\`;
        else if(tipo === 'si_no') fh += \`<label><input type="radio" disabled> Sí</label> <label><input type="radio" disabled> No</label>\`;
        else if(tipo === 'archivo' || tipo === 'foto') fh += \`<input type="file" disabled style="background:#f8fafc; width:100%;">\`;
        else if(tipo === 'firma') fh += \`<div style="height:60px; border:1px dashed #ccc; background:#f8fafc; text-align:center; padding-top:20px; font-size:12px; color:#999;">Área de Firma</div>\`;
        else if(tipo === 'notificar') fh += \`<input type="email" disabled placeholder="Email a notificar" style="background:#f8fafc; width:100%;">\`;
        
        fh += \`</div>\`;
    });
    container.innerHTML = fh;
};

window.guardarFormulario = () => {
    let titulo = getValSafe('fb-titulo').trim();
    let desc = getValSafe('fb-desc').trim();
    if(!titulo) return alert("El título del formulario es obligatorio.");
    if(formBuilderCampos.length === 0) return alert("Añade al menos un campo al formulario.");

    let dynOptsRaw = getValSafe('fb-dynamic-options').trim();
    let isEvalEl = document.getElementById('fb-is-eval');
    let isDynEl = document.getElementById('fb-is-dynamic');

    let formData = {
        titulo: titulo,
        descripcion: desc,
        campos: formBuilderCampos,
        is_eval: isEvalEl ? isEvalEl.checked : false,
        is_dynamic: isDynEl ? isDynEl.checked : false,
        dynamic_options: (isDynEl && isDynEl.checked && dynOptsRaw) ? dynOptsRaw.split(',').map(s=>s.trim()).filter(s=>s) : [],
        perm_llenar_users: formPermLlenarUsers,
        perm_ver_users: formPermVerUsers,
        perm_editar_users: formPermEditarUsers,
        estado: 'Activo',
        creado_por: currentUser.usuario,
        fecha_creacion: new Date().toISOString()
    };

    if(editandoFormId) {
        let idx = globalForms.findIndex(x => x.id === editandoFormId);
        if(idx > -1) {
            formData.id = editandoFormId;
            globalForms[idx] = formData;
        }
    } else {
        formData.id = 'FORM-' + Date.now();
        globalForms.push(formData);
    }
    
    alert("Formulario guardado correctamente.");
    window.cerrarModalNuevoFormulario();
    if(window.renderTablasDinamicasForms) window.renderTablasDinamicasForms();
};

window.eliminarFormulario = () => {
    if(!editandoFormId) return;
    if(confirm("¿Estás seguro de que deseas eliminar este formulario?")) {
        globalForms = globalForms.filter(x => x.id !== editandoFormId);
        window.cerrarModalNuevoFormulario();
        if(window.renderTablasDinamicasForms) window.renderTablasDinamicasForms();
    }
};

window.abrirLlenarFormulario = (id) => {
    let f = globalForms.find(x => x.id === id);
    if (!f) return;

    if(f.perm_llenar_users && f.perm_llenar_users.length > 0 && !f.perm_llenar_users.includes(currentUser.usuario)) {
        return alert("Acceso denegado: No estás autorizado para llenar este formulario.");
    }
    
    currentFormLlenar = f;
    let titleEl = document.getElementById('fill-form-title');
    let descEl = document.getElementById('fill-form-desc');
    let container = document.getElementById('fill-form-container');
    
    if(titleEl) titleEl.innerText = f.titulo;
    if(descEl) descEl.innerText = f.descripcion || 'Por favor, complete los siguientes campos:';
    
    if (!f.campos || f.campos.length === 0) {
        if(container) container.innerHTML = '<p style="text-align:center;">Este formulario no tiene campos configurados.</p>';
    } else {
        let h = '';
        if(f.is_dynamic && f.dynamic_options && f.dynamic_options.length > 0) {
            h += \`<div style="margin-bottom:30px; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid var(--border); text-align:center;">
                    <label style="font-weight:700; font-size:16px; margin-bottom:15px; display:block;">Seleccione la Categoría a Evaluar</label>
                    <select id="master-dynamic-select" style="width:100%; max-width:400px; padding:12px; border-radius:8px; border:2px solid var(--primary); margin:0 auto; display:block;" onchange="window.aplicarLogicaDinamica(this.value)">
                        <option value="">-- Mostrar Todo --</option>\`;
            f.dynamic_options.forEach(opt => h += \`<option value="\${opt}">\${opt}</option>\`);
            h += \`</select></div>\`;
        }

        f.campos.forEach(c => {
            let reqHTML = c.requerido ? '<span style="color:var(--danger);">*</span>' : '';
            let reqAttr = c.requerido ? 'required' : '';
            let tipo = c.tipo || c.type || 'text'; // Fallback for old forms
            
            h += \`<div class="dynamic-field-container" data-category="\${c.categoria||''}" style="margin-bottom:25px; background:white; padding:20px; border-radius:10px; border:1px solid #e2e8f0;">
                    <label for="ans_\${c.id}" style="font-size:15px; font-weight:600; color:#1e293b; display:block; margin-bottom:12px;">\${c.label} \${reqHTML}</label>\`;
            
            if(tipo === 'text') h += \`<input type="text" id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" style="width:100%;">\`;
            else if(tipo === 'textarea') h += \`<textarea id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" rows="3" style="width:100%;"></textarea>\`;
            else if(tipo === 'number') h += \`<input type="number" id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" style="width:100%;">\`;
            else if(tipo === 'date') h += \`<input type="date" id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" style="width:100%;">\`;
            else if(tipo === 'time') h += \`<input type="time" id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" style="width:100%;">\`;
            else if(tipo === 'checkbox') h += \`<label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="ans_chk_\${c.id}" name="ans_\${c.id}"> Marcar</label>\`;
            else if(tipo === 'select') {
                h += \`<select id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} class="search-bar" style="width:100%;"><option value="">-- Seleccione --</option>\`;
                if(c.opciones) c.opciones.forEach(op => h += \`<option value="\${op}">\${op}</option>\`);
                h += \`</select>\`;
            }
            else if(tipo === 'si_no') {
                h += \`<div style="display:flex; gap:15px;">
                        <label style="display:flex; align-items:center; gap:5px;"><input type="radio" name="ans_\${c.id}" value="Sí" \${reqAttr}> Sí</label>
                        <label style="display:flex; align-items:center; gap:5px;"><input type="radio" name="ans_\${c.id}" value="No" \${reqAttr}> No</label>
                      </div>\`;
            }
            else if(tipo === 'archivo') {
                h += \`<input type="file" id="ans_\${c.id}" name="ans_\${c.id}" \${reqAttr} style="width:100%;">\`;
            }
            else if(tipo === 'foto') {
                h += \`<input type="file" id="ans_\${c.id}" name="ans_\${c.id}" accept="image/*" capture="environment" \${reqAttr} style="width:100%;">\`;
            }
            else if(tipo === 'firma') {
                h += \`<canvas id="ans_firma_\${c.id}" width="300" height="150" style="border:1px dashed #cbd5e1; background:#f8fafc; border-radius:6px; touch-action:none;"></canvas>
                      <button type="button" onclick="window.limpiarFirma('\${c.id}')" style="display:block; margin-top:5px; font-size:11px; padding:4px 8px;" class="btn btn-ghost">Limpiar Firma</button>\`;
            }
            else if(tipo === 'notificar') {
                h += \`<input type="email" id="ans_\${c.id}" name="ans_\${c.id}" placeholder="Email para notificar..." \${reqAttr} class="search-bar" style="width:100%;">\`;
            }
            h += \`</div>\`;
        });
        if(container) container.innerHTML = h;

        // Init signature pads
        f.campos.forEach(c => {
            let t = c.tipo || c.type || 'text';
            if(t === 'firma') {
                let canvas = document.getElementById('ans_firma_' + c.id);
                if(canvas) window.initSignaturePad(canvas, c.id);
            }
        });
    }
    window.setDisplay('modal-llenar-formulario', 'flex');
};

window.firmasPad = {};
window.initSignaturePad = (canvas, id) => {
    let ctx = canvas.getContext('2d');
    let drawing = false;
    let getPos = (e) => {
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };
    let start = (e) => { drawing = true; let pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); e.preventDefault(); };
    let draw = (e) => { if(!drawing) return; let pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); e.preventDefault(); };
    let end = () => { drawing = false; };
    
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseout', end);
    canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', draw); canvas.addEventListener('touchend', end);
    
    window.firmasPad[id] = canvas;
};
window.limpiarFirma = (id) => {
    let canvas = window.firmasPad[id];
    if(canvas) { let ctx = canvas.getContext('2d'); ctx.clearRect(0,0, canvas.width, canvas.height); }
};

window.aplicarLogicaDinamica = (cat) => {
    let containers = document.querySelectorAll('.dynamic-field-container');
    containers.forEach(div => {
        let dc = div.getAttribute('data-category');
        if(!dc || !cat || dc === cat) div.style.display = 'block';
        else div.style.display = 'none';
    });
};

window.guardarFormularioLleno = async () => {
    if(!currentFormLlenar) return;
    window.showLoading();
    
    let respuestas = [];
    let isValid = true;
    let emailsToNotify = [];

    let masterCat = '';
    let masterSel = document.getElementById('master-dynamic-select');
    if(currentFormLlenar.is_dynamic && masterSel) masterCat = masterSel.value;

    for (let c of currentFormLlenar.campos) {
        if(masterCat && c.categoria && c.categoria !== masterCat) continue;
        let tipo = c.tipo || c.type || 'text';
        let val = null;

        if(tipo === 'checkbox') {
            let el = document.getElementById(\`ans_chk_\${c.id}\`);
            if(el) val = el.checked;
        } else if(tipo === 'si_no') {
            let sel = document.querySelector(\`input[name="ans_\${c.id}"]:checked\`);
            if(sel) val = sel.value;
        } else if(tipo === 'archivo' || tipo === 'foto') {
            let el = document.getElementById(\`ans_\${c.id}\`);
            if(el && el.files[0]) val = el.files[0].name; // Mock upload
        } else if(tipo === 'firma') {
            let canvas = window.firmasPad[c.id];
            if(canvas) {
                let blank = document.createElement('canvas'); blank.width = canvas.width; blank.height = canvas.height;
                if(canvas.toDataURL() !== blank.toDataURL()) val = canvas.toDataURL();
            }
        } else {
            let el = document.getElementById(\`ans_\${c.id}\`);
            if(el) {
                val = el.value;
                if(tipo === 'notificar' && val) emailsToNotify.push(val);
            }
        }

        if (c.requerido && !val) isValid = false;
        respuestas.push({ id_campo: c.id, label: c.label, valor: val });
    }

    if(!isValid) { window.hideLoading(); return alert("Por favor complete todos los campos obligatorios."); }

    let registro = {
        id: 'RES-' + Date.now(),
        form_id: currentFormLlenar.id,
        form_titulo: currentFormLlenar.titulo,
        respuestas: respuestas,
        usuario: currentUser.usuario,
        fecha: new Date().toISOString()
    };
    
    // Simulate notification if EmailJS is requested
    if(emailsToNotify.length > 0 && typeof emailjs !== 'undefined') {
        try {
            // Nota: Aquí se deben poner las credenciales reales de EmailJS
            // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { to_email: emailsToNotify.join(','), message: 'Nuevo registro en ' + currentFormLlenar.titulo });
            console.log("EmailJS simulación: Correo enviado a " + emailsToNotify.join(','));
        } catch(e) { console.error(e); }
    }

    alert("Registro guardado con éxito.");
    window.setDisplay('modal-llenar-formulario', 'none');
    window.hideLoading();
};

window.cerrarLlenarFormulario = () => { window.setDisplay('modal-llenar-formulario', 'none'); };

// ==========================================
// PLANTILLAS DE FORMULARIOS AUTOMÁTICAS
// ==========================================
window.generarPlantillaFormulario = (titulo, desc, campos) => {
    let f = globalForms.find(x => x.titulo === titulo);
    if(f) {
        window.abrirLlenarFormulario(f.id);
    } else {
        window.showLoading();
        let nuevoForm = { 
            id: 'FORM-' + Date.now(), 
            titulo: titulo, 
            descripcion: desc, 
            campos: campos, 
            estado: 'Activo',
            perm_llenar_users: [], perm_ver_users: [], perm_editar_users: [],
            fecha_creacion: new Date().toISOString()
        };
        globalForms.push(nuevoForm);
        window.hideLoading();
        window.abrirLlenarFormulario(nuevoForm.id);
    }
};

window.editarPlantillaFormulario = (titulo) => {
    let f = globalForms.find(x => x.titulo === titulo);
    if(f) window.abrirModalNuevoFormulario(f.id);
    else alert("Primero presiona el botón 'Nuevo Registro' para generar la plantilla. Luego podrás editarla.");
};

window.abrirModalContenedor = () => window.generarPlantillaFormulario("Inspección de Contenedores (17 Puntos OEA)", "Checklist de seguridad.", [
    {id: "placa", label: "Placa / Matrícula", tipo: "text", requerido: true},
    {id: "obs", label: "Observaciones Generales", tipo: "textarea", requerido: false},
    {id: "foto", label: "Evidencia Fotográfica", tipo: "foto", requerido: false}
]);
window.abrirModalVisitante = () => window.generarPlantillaFormulario("Bitácora de Visitantes y Contratistas", "Registro de entrada y salida.", [
    {id: "nombre", label: "Nombre Completo", tipo: "text", requerido: true},
    {id: "empresa", label: "Empresa", tipo: "text", requerido: true},
    {id: "firma", label: "Firma del Visitante", tipo: "firma", requerido: true}
]);
window.abrirModalMantenimiento = () => window.generarPlantillaFormulario("Mantenimiento de CCTV y Alarmas", "Registro de mantenimientos.", [
    {id: "equipo", label: "Equipo", tipo: "select", requerido: true, opciones: ["CCTV", "Alarma", "Acceso"]},
    {id: "falla", label: "Falla / Trabajo", tipo: "textarea", requerido: true}
]);
window.abrirModalRonda = () => window.generarPlantillaFormulario("Reporte de Rondas de Seguridad", "Registro de inspección perimetral.", [
    {id: "turno", label: "Turno", tipo: "select", requerido: true, opciones: ["Diurno", "Nocturno"]},
    {id: "novedades", label: "Novedades", tipo: "textarea", requerido: false}
]);
window.abrirModalSello = () => window.generarPlantillaFormulario("Trazabilidad y Control de Sellos", "Inventario y asignación de sellos.", [
    {id: "num_sello", label: "Número de Sello", tipo: "text", requerido: true},
    {id: "estado", label: "Estado", tipo: "select", requerido: true, opciones: ["Intacto", "Roto"]}
]);
window.abrirModalIncidente = () => window.generarPlantillaFormulario("Reporte de Incidentes de Seguridad", "Registro de vulnerabilidades.", [
    {id: "tipo", label: "Tipo de Incidente", tipo: "text", requerido: true},
    {id: "notif", label: "Notificar a", tipo: "notificar", requerido: false}
]);
window.abrirModalAmbiental = () => window.generarPlantillaFormulario("Gestión Ambiental", "Manejo de residuos y recursos.", [
    {id: "tipo_reg", label: "Tipo de Registro", tipo: "text", requerido: true}
]);
window.abrirModalSimulacro = () => window.generarPlantillaFormulario("Simulacros y BCP", "Pruebas de Continuidad.", [
    {id: "tipo", label: "Tipo de Simulacro", tipo: "text", requerido: true}
]);
window.abrirModalRRHH = () => window.generarPlantillaFormulario("Control de Confiabilidad RRHH", "Verificación de antecedentes.", [
    {id: "empleado", label: "Colaborador", tipo: "text", requerido: true}
]);
window.abrirModalIT = () => window.generarPlantillaFormulario("Controles de Seguridad IT", "Revisión de backups y accesos.", [
    {id: "estado", label: "Estado del Control", tipo: "select", requerido: true, opciones: ["Óptimo", "Deficiente"]},
    {id: "hallazgos", label: "Detalles / Hallazgos", tipo: "textarea", requerido: true},
    {id: "fecha", label: "Fecha de Ejecución", tipo: "date", requerido: true},
    {id: "responsable", label: "Responsable", tipo: "text", requerido: true}
]);

// ==========================================
// ESCANER Y GENERADOR QR
// ==========================================
let scannerQR = null;
window.iniciarEscanerQR = () => {
    window.setDisplay('modal-escaner-qr', 'flex');
    if(scannerQR) scannerQR.clear();
    scannerQR = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    scannerQR.render((decodedText, decodedResult) => {
        scannerQR.clear();
        window.cerrarEscanerQR();
        let formId = null;
        let ubicacion = null;
        try {
            let partes = decodedText.split('|');
            partes.forEach(p => {
                let [key, val] = p.split(':');
                if(key && val) {
                    if(key.trim() === 'formId') formId = val.trim();
                    if(key.trim() === 'ubicacion') ubicacion = val.trim();
                }
            });
        } catch(e) {}
        
        if(formId) {
            let f = globalForms.find(x => x.id === formId);
            if(f) {
                window.abrirLlenarFormulario(formId);
                if(ubicacion) {
                    setTimeout(() => {
                        let inputUbicacion = Array.from(document.querySelectorAll('#fill-form-container input')).find(i => i.placeholder.toLowerCase().includes('ubicaci') || (i.name && i.name.toLowerCase().includes('ubicaci')));
                        if(inputUbicacion) inputUbicacion.value = ubicacion;
                    }, 500);
                }
            } else { alert("Formulario no encontrado."); }
        } else { alert("QR inválido: " + decodedText); }
    }, (error) => {});
};

window.cerrarEscanerQR = () => { if(scannerQR) { scannerQR.clear(); scannerQR = null; } window.setDisplay('modal-escaner-qr', 'none'); };

window.abrirModalGeneradorQR = () => {
    let select = document.getElementById('qr-gen-form');
    let opts = '<option value="">-- Seleccione un Formulario --</option>';
    globalForms.forEach(f => { opts += \`<option value="\${f.id}">\${f.titulo}</option>\`; });
    if(select) select.innerHTML = opts;
    document.getElementById('qr-gen-ubicacion').value = '';
    document.getElementById('qr-result-container').style.display = 'none';
    window.setDisplay('modal-generador-qr', 'flex');
};

window.lastQR = null;
window.generarCodigoQR = () => {
    let formId = getValSafe('qr-gen-form');
    let ubic = getValSafe('qr-gen-ubicacion').trim();
    if(!formId) return alert("Seleccione un formulario.");
    
    let texto = \`formId:\${formId}\`;
    if(ubic) texto += \`|ubicacion:\${ubic}\`;
    
    let qrc = document.getElementById('qr-code-element');
    qrc.innerHTML = '';
    window.lastQR = new QRCode(qrc, { text: texto, width: 200, height: 200, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H });
    document.getElementById('qr-result-text').innerText = texto;
    document.getElementById('qr-result-container').style.display = 'block';
};

window.imprimirQR = () => {
    let c = document.getElementById('qr-code-element').innerHTML;
    let sel = document.getElementById('qr-gen-form');
    let titulo = sel.options[sel.selectedIndex].text;
    let ubic = getValSafe('qr-gen-ubicacion');
    
    let win = window.open('', '_blank');
    win.document.write(\`
        <html><head><title>Imprimir QR</title>
        <style>body{text-align:center; font-family:sans-serif; margin-top:50px;} h2{margin:5px 0;} p{margin:0; font-size:14px;}</style>
        </head><body>
        <h2>\${titulo}</h2>
        \${ubic ? \`<p>Ubicación: <b>\${ubic}</b></p>\` : ''}
        <div style="margin: 20px auto; display: inline-block;">\${c}</div>
        <br><p style="font-size:11px; color:#666;">Escanea este código desde la App para llenar el registro</p>
        <script>window.onload = () => { window.print(); window.close(); }</script>
        </body></html>
    \`);
};
`;

js = js + fixCrearSolicitud + formBuilderLogic;
fs.writeFileSync('app.js', js, 'utf8');
console.log('Rebuilt successfully!');
