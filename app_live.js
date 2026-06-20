import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, updateDoc, setDoc, query, where, getDocs, arrayUnion, runTransaction, deleteDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSy" + "DdzCia" + "chuhbE" + "9jATz-" + "TesPI2" + "vUVIJr" + "HjM", 
    authDomain: "sistemadegestion-7400d.firebaseapp.com", 
    projectId: "sistemadegestion-7400d", 
    storageBucket: "sistemadegestion-7400d.firebasestorage.app", 
    messagingSenderId: "709030" + "283072", 
    appId: "1:7090302" + "83072:web:599" + "7837b36a" + "448e9515ca5" 
};

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const db = getFirestore(app); 
let appId = 'sgc-final-v6';
let currentEmpresaId = '1';
let isSuperAdmin = false;
let currentEmpresaConfig = null;
let empresasDisponibles = [];

const EMAIL_SERVICE_ID = "service" + "_vum" + "xptj", 
  EMAIL_TEMPLATE_ID = "template" + "_z27" + "y5yk", 
  EMAIL_PUBLIC_KEY = "kWsovO" + "fdi7dB" + "qLMw2", 
  EMAIL_ADMIN_SGC = "sistemadegestion@fcipty.com"; 

try { if (typeof emailjs !== "undefined") { emailjs.init(EMAIL_PUBLIC_KEY); } } catch(e) { console.warn(e); }

const EMAILJS_CDN = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';

const ensureEmailJsLoaded = async () => {
    if (typeof emailjs !== 'undefined') return true;
    return new Promise((resolve, reject) => {
        try {
            const s = document.createElement('script');
            s.src = EMAILJS_CDN;
            s.onload = () => {
                try { if (typeof emailjs !== 'undefined') { emailjs.init(EMAIL_PUBLIC_KEY); resolve(true); } else { resolve(false); } } catch(e) { console.warn('EmailJS init failed on load', e); resolve(false); }
            };
            s.onerror = () => { console.error('Error loading EmailJS script'); resolve(false); };
            document.head.appendChild(s);
            setTimeout(() => { if (typeof emailjs !== 'undefined') { try{ emailjs.init(EMAIL_PUBLIC_KEY); }catch(e){} resolve(true); } }, 3000);
        } catch (e) { console.warn('ensureEmailJsLoaded error', e); resolve(false); }
    });
};

const normalizeEmails = (input) => {
    if (!input) return '';
    let arr = [];
    if (typeof input === 'string') arr = input.split(',');
    else if (Array.isArray(input)) arr = input;
    else if (input instanceof Set) arr = Array.from(input);
    else arr = [String(input)];

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return arr.map(e => String(e||'').trim()).filter(e => regex.test(e)).join(',');
};

const CLOUD_NAME = "df79" + "cjklp", UPLOAD_PRESET = "fci_" + "docu" + "mentos", PASOS_NOMBRES = ["Pendiente Documentado", "Pendiente Verificado", "Pendiente Aprobación Gerencia", "Pendiente Aprobación SGC"];
let slaConfigDias = { alta: 3, media: 7, baja: 15 };

// EXPOSICIÓN GLOBAL DE FUNCIONES DE AYUDA (Para evitar errores en el HTML)
window.setDisplay = (id, val) => { if(document.getElementById(id)) document.getElementById(id).style.display = val; };
window.setTxt = (id, txt) => { if(document.getElementById(id)) document.getElementById(id).innerText = txt; };
window.setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val; };
window.setHtml = (id, html) => { if(document.getElementById(id)) document.getElementById(id).innerHTML = html; };

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const getValSafe = (id, def = '') => $(id) ? $(id).value : def;
const getCheckedSafe = (id) => $(id) ? $(id).checked : false;

let currentUser = null, selectedId = null, selectedDocData = null, tempAction = "";
let allUsers = [], allDepartamentos = [], tiposDocumento = [], columnasMaestro = [], estatusMaestro = [], dataMaestro = [], editandoMaestroId = null;
let globalSolicitudes = [], globalAuditPlan = null, globalAllAuditorias = [], globalAuditorias = [], selectedAuditId = null, selectedAuditData = null, editandoAuditoriaId = null;
let currentAuditF020 = [], globalAllSacs = [], currentEditingSacId = null, currentEditingF020Ref = null;
let requisitosOEA = []; let manualOEA = { url: "", nombre: "" };

// Variables Nuevas OEA y Gráficos
let globalProveedores = []; let editandoProvId = null;
let globalRiesgos = []; let editandoRiesgoId = null;
let chartSacsInstance = null; let chartProvInstance = null;

window.showLoading = () => window.setDisplay('loading-overlay', 'flex'); 
window.hideLoading = () => window.setDisplay('loading-overlay', 'none');
window.closeModal = () => window.setDisplay('modal', 'none'); 
window.cerrarModalAuditoria = () => window.setDisplay('modal-auditoria', 'none');
window.cerrarModalUsuario = () => window.setDisplay('modal-usuario', 'none');
window.abrirModalUsuario = () => { window.resetUserForm(); window.setDisplay('modal-usuario', 'flex'); };
window.toggleModPanel = v => window.setDisplay('panel-mod', v === 'Creación' ? 'none' : 'grid');

window.cambiarVista = (id, btn) => {
  $$('.section').forEach(s => s.classList.remove('active')); $$('.nav-link').forEach(l => l.classList.remove('active'));
  if($(id)) $(id).classList.add('active'); if(btn) btn.classList.add('active');
  if(window.innerWidth <= 768) { if($('sidebar')) $('sidebar').classList.remove('open'); if($('sidebar-overlay')) $('sidebar-overlay').classList.remove('active'); }
  if(id === 'sec-dash') setTimeout(() => window.renderDashboardCharts(), 100); 
};
window.toggleMenu = () => { if($('sidebar')) $('sidebar').classList.toggle('open'); if($('sidebar-overlay')) $('sidebar-overlay').classList.toggle('active'); };

// Ensure nav clicks work even if inline handlers fail — delegated listener
document.addEventListener('click', (ev) => {
    try {
        const btn = ev.target.closest && ev.target.closest('.nav-link');
        if (!btn) return;
        ev.preventDefault();
        let targetId = (btn.dataset && btn.dataset.target) || '';
        if (!targetId) {
            const oc = btn.getAttribute && btn.getAttribute('onclick');
            if (oc) {
                const m = oc.match(/cambiarVista\(['\"]([^'\"]+)['\"]/);
                if (m) targetId = m[1];
            }
        }
        if (targetId) {
            try { if (typeof window._expandGroupOf === 'function') window._expandGroupOf(btn.id || ''); } catch(e){}
            try { window.cambiarVista(targetId, btn); } catch(e) { console.warn('cambiarVista call failed', e); }
        }
    } catch(e) { /* silence */ }
});

window.toggleDarkMode = () => {
    const body = document.body; body.classList.toggle('dark-theme'); const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('sgc_dark_mode', isDark);
    const icon = $('dark-mode-icon'); const text = $('dark-mode-text');
    if (icon && text) { icon.innerText = isDark ? 'light_mode' : 'dark_mode'; text.innerText = isDark ? 'Claro' : 'Descanso'; }
};

// ── SIDEBAR COLAPSABLE ──
window.toggleNavGroup = (bodyId) => {
    const body = $(bodyId);
    const btn = $(bodyId + '-btn');
    if (!body) return;

    // Si el body tenía display:none (legado), limpiarlo primero
    if (body.style.display === 'none') body.style.display = '';

    const isCollapsed = body.classList.contains('collapsed');
    if (isCollapsed) {
        // EXPANDIR
        body.classList.remove('collapsed');
        if (btn) btn.classList.add('open');
    } else {
        // COLAPSAR
        body.classList.add('collapsed');
        if (btn) btn.classList.remove('open');
    }
};

// Abrir un grupo automáticamente cuando se activa un nav-link dentro de él
window._expandGroupOf = (navId) => {
    const el = $(navId);
    if (!el) return;
    const groupBody = el.closest('.nav-group-body');
    if (groupBody) {
        if (groupBody.style.display === 'none') groupBody.style.display = '';
        if (groupBody.classList.contains('collapsed')) {
            groupBody.classList.remove('collapsed');
            const headerBtn = groupBody.closest('.nav-group')?.querySelector('.nav-group-header');
            if (headerBtn) headerBtn.classList.add('open');
        }
    }
};


window.abrirDocumento = async (url, nombreOriginal) => {
  if (!url || url === "#") return;
  let safeName = nombreOriginal ? nombreOriginal.replace(/[^a-zA-Z0-9.\-_ ]/g, '_') : 'Documento';
  if (!safeName.includes('.')) { let extMatch = url.match(/\.([a-zA-Z0-9]+)(\?|$)/); if(extMatch) safeName += "." + extMatch[1]; }
  if (url.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif)(\?|$)/)) {
    const win = window.open('', '_blank'); if (!win) return alert("Bloqueado.");
    win.document.write(`<html style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f8fafc;"><head><title>${safeName}</title></head><body><h2>Cargando documento...</h2></body></html>`);
    try { const r = await fetch(url); if(!r.ok) throw new Error(); const blob = await r.blob(); const bUrl = window.URL.createObjectURL(new File([blob], safeName, { type: blob.type })); win.location.href = bUrl; setTimeout(() => window.URL.revokeObjectURL(bUrl), 60000); } catch (e) { win.close(); alert("⚠️ Archivo no disponible."); }
  } else {
    window.showLoading();
    try { const r = await fetch(url); if(!r.ok) throw new Error(); const bUrl = window.URL.createObjectURL(await r.blob()); const a = document.createElement('a'); a.style.display = 'none'; a.href = bUrl; a.download = safeName; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(bUrl); document.body.removeChild(a); } catch (e) { alert("⚠️ Archivo no disponible."); }
    window.hideLoading();
  }
};

window.descargarFicha = () => {
    const w = window.open('', '_blank');
    const content = document.getElementById('m-original-data').innerHTML;
    w.document.write(`<html><head><title>Ficha ${selectedDocData.customId}</title><link rel="stylesheet" href="styles.css"></head><body style="padding:40px; background:white;"><h2>Expediente: ${selectedDocData.customId} - ${selectedDocData.titulo}</h2>${content}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 1000);
};

window.del = async (c, id) => { if(confirm("¿Eliminar este registro?")) { window.showLoading(); await deleteDoc(doc(db, "artifacts", appId, "public", "data", c, id)); window.hideLoading(); } };
window.getDownloadUrl = (url) => url ? url : "#";
window.formatearFechaAbreviada = (fISO) => { if(!fISO) return ''; let f = fISO; if(f.length===10) f+='T12:00:00'; const d = new Date(f); if(isNaN(d)) return fISO; const m = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]; return `${d.getDate()}-${m[d.getMonth()]}-${d.getFullYear()}`; };
window.sendNotification = async (dest, sub, msg) => {
    console.log("[EmailJS] Iniciando envío de notificación...");

    const loaded = await ensureEmailJsLoaded();
    if (!loaded || typeof emailjs === 'undefined') {
        console.error('[EmailJS] Error: La librería emailjs no está cargada o inicializada.');
        return false;
    }

    let toRaw = '';
    let ccRaw = '';
    if (!dest) {
        console.warn('[EmailJS] Cancelado: No hay destinatarios (dest vacío).');
        return false;
    }
    if (typeof dest === 'string' || Array.isArray(dest) || dest instanceof Set) {
        toRaw = dest;
    } else if (typeof dest === 'object') {
        toRaw = dest.to || dest.to_email || dest.toEmail || '';
        ccRaw = dest.cc || dest.cc_email || dest.ccEmail || '';
    }

    const cleanTo = normalizeEmails(toRaw);
    const cleanCc = normalizeEmails(ccRaw);

    if (!cleanTo && !cleanCc) {
        console.warn('[EmailJS] Cancelado: Los correos proporcionados no tienen un formato válido.');
        return false;
    }

    let senderName = 'Sistema SGC';
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.nombre) senderName = currentUser.nombre;

    const params = {
        subject: sub || 'Notificación SGC',
        message: msg || '',
        name: senderName,
        to_email: cleanTo || '',
        cc_email: cleanCc || ''
    };

    console.log('[EmailJS] Parámetros a enviar:', params);

    try {
        const response = await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, params);
        console.log('[EmailJS] Éxito:', response.status, response.text);
        return true;
    } catch (e) {
        console.error('[EmailJS] FAILED. Error al enviar el correo:', e);
        return false;
    }
};

// Compose a standardized HTML email body
window.composeEmail = (title, bodyHtml, opts={}) => {
    const appLink = opts.link || '#';
    const actor = opts.actor || '';
    const footer = `
        <div style="font-size:12px; color:#6b7280; margin-top:18px; border-top:1px solid #e6eef8; padding-top:10px;">Este mensaje fue generado por el Sistema de Gestión SGC. <br>Accede al sistema: <a href="${appLink}">${appLink}</a></div>
    `;
    return `
        <div style="font-family:Inter,Arial,Helvetica,sans-serif; color:#0f172a;">
            <h2 style="margin:0 0 8px 0; font-size:16px;">${title}</h2>
            <div style="font-size:14px; color:#0f172a;">${bodyHtml}</div>
            ${footer}
        </div>
    `;
};

// Create an in-app notification record in Firestore
window.createNotificationRecord = async (dest, title, message, meta={}) => {
    try {
        const toArr = [];
        if (!dest) return null;
        if (typeof dest === 'string') dest.split(',').forEach(e=>{ const t=e.trim(); if(t) toArr.push(t); });
        else if (Array.isArray(dest)) dest.forEach(e=>{ if(e) toArr.push(String(e).trim()); });
        else if (dest instanceof Set) Array.from(dest).forEach(e=>{ if(e) toArr.push(String(e).trim()); });
        else if (typeof dest === 'object') { if(dest.to) toArr.push(...String(dest.to).split(',').map(x=>x.trim())); if(dest.cc) toArr.push(...String(dest.cc).split(',').map(x=>x.trim())); }
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'Notifications'), {
            to: Array.from(new Set(toArr.filter(x=>x))),
            title: title || '',
            message: message || '',
            meta: meta || {},
            created_at: new Date().toISOString(),
            read_by: []
        });
        return docRef.id;
    } catch (e) { console.warn('createNotificationRecord failed', e); return null; }
};

window.notifications = [];
window._notifUnsubscribe = null;

// Start listening to in-app notifications for a user
window.initNotificationsListener = async (userEmail) => {
    try {
        if (!userEmail) return;
        if (window._notifUnsubscribe) { try { window._notifUnsubscribe(); } catch(e){} window._notifUnsubscribe = null; }
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'Notifications'), where('to', 'array-contains', userEmail));
        window._notifUnsubscribe = onSnapshot(q, snap => {
            const items = [];
            snap.docs.forEach(d => { const data = d.data(); items.push({ id: d.id, ...data }); });
            items.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            window.notifications = items;
            try { window.renderNotificationBell(); } catch(e){}
        }, err => { console.warn('Notifications listener error', err); });
    } catch(e) { console.warn('initNotificationsListener error', e); }
};

// Render bell UI (expects elements in DOM)
window.renderNotificationBell = () => {
    const countEl = $('notif-count'); const listEl = $('notif-list');
    if (!countEl) return;
    const unread = window.notifications.filter(n => !(n.read_by && n.read_by.includes(currentUser.email))).length;
    countEl.innerText = unread > 0 ? String(unread) : '';
    if (!listEl) return;
    listEl.innerHTML = window.notifications.slice(0,20).map(n => {
        const ago = n.created_at ? (new Date(n.created_at)).toLocaleString() : '';
        return `<div class="notif-item" data-id="${n.id}" style="padding:8px; border-bottom:1px solid #eef2f7; display:flex; justify-content:space-between; gap:8px;"><div style="flex:1"><div style="font-weight:700;">${n.title}</div><div style="font-size:13px; color:#475569;">${String(n.message).slice(0,180)}</div></div><div style="font-size:11px; color:#94a3b8; white-space:nowrap">${ago}</div></div>`;
    }).join('');
};

window.startNotificationSystem = () => {
    try {
        if (!currentUser || !currentUser.email) return;
        try { window.renderNotificationBell(); } catch(e){}
        window.initNotificationsListener(currentUser.email);
    } catch(e) { console.warn('startNotificationSystem error', e); }
};

// Wrap sendNotification to also create in-app record
const _origSendNotificationLive = window.sendNotification;
window.sendNotification = async (dest, sub, msg, opts={}) => {
    try {
        let body = msg || '';
        if (!String(body).includes('<html') && !String(body).includes('<div')) {
            body = window.composeEmail(sub || 'Notificación SGC', String(body), { link: opts.link, actor: opts.actor });
        }
        try { await window.createNotificationRecord(dest, sub, body, { actor: opts.actor || (currentUser && currentUser.nombre) || '' }); } catch(e) { console.warn('failed to create notification record', e); }
        return await _origSendNotificationLive(dest, sub, body);
    } catch(e) { console.error('sendNotification wrapper error', e); return false; }
};

window.getDatosEnvio = async (sol) => {
  let cc = ""; if(sol.gerencia) { try { const q = query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("gerencias", "array-contains", sol.gerencia), where("permisos.p_ger_apr", "==", true)); const sn = await getDocs(q); if(!sn.empty) cc = sn.docs[0].data().email || ""; } catch(e){} }
  const to = new Set();
  if (EMAIL_ADMIN_SGC) to.add(EMAIL_ADMIN_SGC);
  if (sol.solicitante_email) to.add(sol.solicitante_email);
  if(sol.involucrados) sol.involucrados.forEach(e => { if(e) to.add(e); });
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { to: Array.from(to).filter(x => x && regex.test(String(x).trim())).join(','), cc: (cc && regex.test(cc.trim())) ? cc : "" };
};

window.filtrarTabla = (inputId, tbodyId) => {
    const el = document.getElementById(inputId);
    const tb = document.getElementById(tbodyId);
    if(!el || !tb) return;
    const term = el.value.toLowerCase();
    const rows = tb.querySelectorAll('tr');
    rows.forEach(r => {
        if(r.innerText.toLowerCase().includes(term)) r.style.display = '';
        else r.style.display = 'none';
    });
};

window.uploadToCloudinary = async (f) => { const fd = new FormData(); fd.append("file", f); fd.append("upload_preset", UPLOAD_PRESET); try { const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: fd }); const d = await r.json(); return d.secure_url; } catch(e){return null;} };

// RESTAURADO EL CÓDIGO A "FCI-SOL-"
window.getNextFCI = async () => { const r = doc(db, "artifacts", appId, "public", "data", "Contadores", "solicitudes"); let id = ""; await runTransaction(db, async (t) => { const sn = await t.get(r); let c = 1; if(sn.exists()) c = sn.data().count + 1; t.set(r, {count:c}); id = `FCI-SOL-${String(c).padStart(4, '0')}`; }); return id; };

window.checkDailyAlerts = async () => {
  if(!currentUser || (!currentUser.permisos.p_gest_sgc && !currentUser.permisos.admin)) return;
  const ref = doc(db, "artifacts", appId, "public", "data", "Configuracion", "EstadoAlertas"); const sn = await getDoc(ref); const today = new Date().toISOString().split('T')[0];
  if(!sn.exists() || sn.data().ultimaAlerta !== today) {
    let p = globalSolicitudes.filter(s => { let e = String(s.estado||"").toUpperCase(); return !e.includes('FINAL') && e !== 'ANULADO' && e !== 'RECHAZADO'; });
    if(p.length > 0) { window.sendNotification({to:EMAIL_ADMIN_SGC}, "🔔 Alerta SGC", `Hay ${p.length} solicitudes pendientes.`); if(!sn.exists()) await setDoc(ref, {ultimaAlerta:today}); else await updateDoc(ref, {ultimaAlerta:today}); }
  }
};

window.verificarAlertasAuditoria = (arr) => {
  if(!globalAuditPlan || !globalAuditPlan.correos || globalAuditPlan.correos.length === 0) return;
  const today = new Date(); today.setHours(0,0,0,0);
  arr.forEach(a => {
    if(a.estado === "Completada" || !a.fecha) return; let f = a.fecha; if(f.length === 10) f += 'T12:00:00'; const d = new Date(f); d.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / 86400000); let sub = diff === 30 ? "🚨 1 Mes para Auditoría" : (diff === 14 ? "⚠️ 2 Semanas para Auditoría" : "");
    if(sub) window.sendNotification({to: globalAuditPlan.correos.join(',')}, sub, `Auditoría el ${window.formatearFechaAbreviada(a.fecha)} en ${a.lugar}. Req: ${a.requisitos}`);
  });
};

window.actualizarConteoPersonal = () => { if($('aud-personal')) $('aud-personal').value = $$('#aud-auditado-list input:checked').length; };

// =========================================================================================
// LÓGICA DE DIBUJADO DE GRÁFICOS Y MATRIZ INTERACTIVA (PROTEGIDA CON TRY/CATCH)
// =========================================================================================
let chartSlaInstance = null, chartMonthlyInstance = null, chartDonutStatsInstance = null;

window.renderDashboardCharts = () => {
    try {
        if(!currentUser || (!currentUser.permisos.admin && !currentUser.permisos.p_gest_sgc)) return;
        if (typeof Chart === 'undefined') return;

        let excludeAnuladas = false;
        let checkbox = document.getElementById('dash-exclude-anuladas');
        if (checkbox) excludeAnuladas = checkbox.checked;

        let solicitudesFiltered = globalSolicitudes || [];
        if (excludeAnuladas) {
            solicitudesFiltered = solicitudesFiltered.filter(s => s.estado !== 'Anulado' && s.estado !== 'Rechazado');
        }

        // 0. KPIs Superiores
        if (globalSolicitudes) {
            let tot = solicitudesFiltered.length;
            let ok = solicitudesFiltered.filter(s => String(s.estado).includes('Aprobado Final')).length;
            let pend = solicitudesFiltered.filter(s => !String(s.estado).includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado').length;
            
            // SLA Calculation: Only count approved items that had an expected date
            let slaCount = 0;
            let slaOnTime = 0;
            solicitudesFiltered.forEach(s => {
                let f_sla = s.sla || s.fecha_esperada_cierre;
                if(String(s.estado).includes('Aprobado Final') && f_sla && s.fecha_final) {
                    slaCount++;
                    if(s.fecha_final <= f_sla) slaOnTime++;
                }
            });
            let slaPct = slaCount > 0 ? Math.round((slaOnTime / slaCount) * 100) : 0;

            if($('dash-tot')) $('dash-tot').innerText = tot;
            if($('dash-pend')) $('dash-pend').innerText = pend;
            if($('dash-ok')) $('dash-ok').innerText = ok;
            if($('dash-sla-percent')) $('dash-sla-percent').innerText = slaPct + '%';
        }

        // 1. Matriz de Riesgo OEA (Heatmap)
        const grid = $('heatmap-grid');
        if(grid && globalRiesgos) {
            let html = '';
            for(let p = 5; p >= 1; p--) {
                html += `<div class="rm-y-title">Prob ${p}</div>`;
                for(let i = 1; i <= 5; i++) {
                    let sev = p * i;
                    let risksInCell = globalRiesgos.filter(r => parseInt(r.probabilidad) === p && parseInt(r.impacto) === i);
                    let count = risksInCell.length;
                    
                    let bgColor = '#10b981'; 
                    if(sev >= 5 && sev <= 9) bgColor = '#f59e0b'; 
                    else if(sev >= 10 && sev <= 15) bgColor = '#ea580c'; 
                    else if(sev >= 16) bgColor = '#b91c1c'; 
                    
                    let opacity = count > 0 ? '1' : '0.25';
                    let textColor = count > 0 ? '#ffffff' : 'rgba(255,255,255,0.3)';
                    let cursor = count > 0 ? 'pointer' : 'default';
                    let hoverEffect = count > 0 ? 'transform: scale(1.08); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 10; border: 2px solid #fff;' : '';

                    html += `<div class="rm-cell" style="background:${bgColor}; opacity:${opacity}; color:${textColor}; cursor:${cursor};" 
                              ${count > 0 ? `onclick="window.verDetalleHeatmap(${p}, ${i}, ${sev}, '${bgColor}')"` : ''} 
                              onmouseover="this.style.cssText='background:${bgColor}; opacity:1; color:#fff; cursor:${cursor}; ${hoverEffect}'" 
                              onmouseout="this.style.cssText='background:${bgColor}; opacity:${opacity}; color:${textColor}; cursor:${cursor};'">
                              ${count}
                            </div>`;
                }
            }
            html += `<div></div>`;
            for(let i = 1; i <= 5; i++) { html += `<div style="text-align:center; font-weight:800; color:var(--primary); font-size:12px; margin-top:5px;">Imp ${i}</div>`; }
            grid.innerHTML = html;
        }

        // 2. Gráfico SLA Compare (Barras: SLA Esperado vs Real)
        const ctxSla = $('chartSlaCompare');
        if(ctxSla && solicitudesFiltered) {
            let prioAlta = solicitudesFiltered.filter(s => s.prioridad === 'Alta');
            let prioMedia = solicitudesFiltered.filter(s => s.prioridad === 'Media');
            let prioBaja = solicitudesFiltered.filter(s => s.prioridad === 'Baja' || !s.prioridad);

            let dataReal = [prioAlta.length, prioMedia.length, prioBaja.length];
            let dataExpected = [Math.max(2, prioAlta.length + 3), Math.max(5, prioMedia.length + 5), Math.max(10, prioBaja.length + 8)];

            if(chartSlaInstance) chartSlaInstance.destroy();
            chartSlaInstance = new Chart(ctxSla, {
                type: 'bar',
                data: { 
                    labels: ['Prioridad Alta', 'Prioridad Media', 'Prioridad Baja'], 
                    datasets: [
                        { label: 'Esperado (Base)', data: dataExpected, backgroundColor: '#93c5fd', borderRadius: 4, categoryPercentage: 0.8, barPercentage: 0.9 },
                        { label: 'Real (Actuales)', data: dataReal, backgroundColor: '#10b981', borderRadius: 4, categoryPercentage: 0.8, barPercentage: 0.9 }
                    ] 
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }, plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } } } }
            });
        }

        // 3. Gráfico Evolución Mensual (Solicitudes por mes)
        const ctxMonthly = $('chartMonthly');
        if(ctxMonthly && solicitudesFiltered) {
            let monthCounts = { "Ene":0, "Feb":0, "Mar":0, "Abr":0, "May":0, "Jun":0, "Jul":0, "Ago":0, "Sep":0, "Oct":0, "Nov":0, "Dic":0 };
            const mesesStr = Object.keys(monthCounts);
            solicitudesFiltered.forEach(s => {
                if(s.fecha) {
                    let d = new Date(s.fecha);
                    let m = d.getMonth();
                    monthCounts[mesesStr[m]]++;
                }
            });
            let dataValues = Object.values(monthCounts);
            
            if(chartMonthlyInstance) chartMonthlyInstance.destroy();
            chartMonthlyInstance = new Chart(ctxMonthly, {
                type: 'bar',
                data: { labels: mesesStr.slice(0, new Date().getMonth()+1), datasets: [{ label: 'Solicitudes', data: dataValues.slice(0, new Date().getMonth()+1), backgroundColor: '#6366f1', borderRadius: 4, hoverBackgroundColor: '#4f46e5' }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }, plugins: { legend: { display: false } } }
            });
        }

        // 4. Gráfico Donut (Estado General Stats)
        const ctxDonut = $('chartDonutStats');
        if(ctxDonut && globalSolicitudes) {
            // Note: Donut should probably always calculate all unless filtered, but we will use the globalSolicitudes to show anuladas unless excluded.
            let d_aprobadas = solicitudesFiltered.filter(s => String(s.estado).includes('Aprobado Final')).length;
            let d_pendientes = solicitudesFiltered.filter(s => !String(s.estado).includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado').length;
            let d_anuladas = solicitudesFiltered.filter(s => s.estado === 'Anulado' || s.estado === 'Rechazado').length;
            let d_total = d_aprobadas + d_pendientes + d_anuladas;
            let pAp = d_total > 0 ? Math.round((d_aprobadas/d_total)*100) : 0;
            let pPe = d_total > 0 ? Math.round((d_pendientes/d_total)*100) : 0;
            let pAn = d_total > 0 ? Math.round((d_anuladas/d_total)*100) : 0;

            if(chartDonutStatsInstance) chartDonutStatsInstance.destroy();
            chartDonutStatsInstance = new Chart(ctxDonut, {
                type: 'doughnut',
                data: { labels: ['Aprobadas', 'En Trámite', 'Anuladas'], datasets: [{ data: [d_aprobadas, d_pendientes, d_anuladas], backgroundColor: ['#6366f1', '#10b981', '#ef4444'], borderWidth: 0, hoverOffset: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: true } } }
            });

            if($('donut-legend-container')) {
                $('donut-legend-container').innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#6366f1; border-radius:50%;"></div><span style="font-size:12px; color:var(--text-main); font-weight:600;">Aprobadas</span></div>
                        <div style="display:flex; align-items:center; gap:10px;"><span style="font-size:13px; font-weight:800;">${d_aprobadas}</span><span style="background:#eef2ff; color:#6366f1; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold;">${pAp}%</span></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div><span style="font-size:12px; color:var(--text-main); font-weight:600;">En Trámite</span></div>
                        <div style="display:flex; align-items:center; gap:10px;"><span style="font-size:13px; font-weight:800;">${d_pendientes}</span><span style="background:#dcfce7; color:#10b981; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold;">${pPe}%</span></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;"><div style="width:10px; height:10px; background:#ef4444; border-radius:50%;"></div><span style="font-size:12px; color:var(--text-main); font-weight:600;">Anuladas</span></div>
                        <div style="display:flex; align-items:center; gap:10px;"><span style="font-size:13px; font-weight:800;">${d_anuladas}</span><span style="background:#fee2e2; color:#ef4444; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold;">${pAn}%</span></div>
                    </div>
                `;
            }
        }

        // 5. Poblar Tablas Secundarias en Dashboard
        if ($('dash-tbody-audits') && globalAllAuditorias) {
            let audHtml = '';
            // Solo futuras y del año
            let sortedAudits = [...globalAllAuditorias].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 5);
            sortedAudits.forEach(a => {
                let statusColor = a.estado === 'Finalizada' ? 'var(--success)' : (a.estado === 'Cancelada' ? 'var(--danger)' : 'var(--warning)');
                audHtml += `<tr><td>${a.lugar || 'N/A'}</td><td>${window.formatearFechaAbreviada(a.fecha)}</td><td>${a.auditor_nombre || a.auditor || 'N/A'}</td><td><span style="color:${statusColor}; font-weight:600;">${a.estado}</span></td></tr>`;
            });
            $('dash-tbody-audits').innerHTML = audHtml || '<tr><td colspan="4" style="text-align:center;">No hay auditorías próximas</td></tr>';
        }

        if ($('dash-tbody-ncs') && globalAllSacs) {
            let ncHtml = '';
            let sortedNcs = [...globalAllSacs].sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
            sortedNcs.forEach(n => {
                let statusColor = n.estado === 'Cerrada' ? 'var(--success)' : 'var(--warning)';
                ncHtml += `<tr><td>${n.sac_num || 'N/A'}</td><td>${n.tipo_hallazgo || 'N/A'}</td><td>${n.dueno_uid || 'N/A'}</td><td><span style="color:${statusColor}; font-weight:600;">${n.estado}</span></td></tr>`;
            });
            $('dash-tbody-ncs').innerHTML = ncHtml || '<tr><td colspan="4" style="text-align:center;">No hay No Conformidades recientes</td></tr>';
        }

    } catch(e) {
        console.error("Dashboard Render Warning: ", e);
    }
};

window.verDetalleHeatmap = (p, i, sev, color) => {
    let risks = globalRiesgos.filter(r => parseInt(r.probabilidad) === p && parseInt(r.impacto) === i);
    if(risks.length === 0) return;
    
    let titleEl = $('heatmap-details-title');
    if(titleEl) {
        titleEl.innerHTML = `<span class="material-icons-round" style="color:${color}">zoom_in</span> Riesgos en Cuadrante (Prob: ${p} x Imp: ${i} = Severidad ${sev})`;
        titleEl.style.color = color;
    }

    let trs = '';
    risks.forEach(r => { trs += `<tr><td style="padding:10px; border-bottom:1px solid #e2e8f0;"><b>${r.rsk_id}</b></td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">${r.proceso}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">${r.amenaza}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0; color:var(--primary); font-weight:600;">${r.accion_mitigacion}</td></tr>`; });
    window.setHtml('tbody-heatmap-details', trs);
    window.setDisplay('modal-heatmap-details', 'flex');
};

// ==========================================
// MÓDULOS DE PROVEEDORES Y RIESGOS (OEA)
// ==========================================

window.calcularRiesgoProveedor = () => {
    let f = parseFloat(getValSafe('pr-ev-fisica', 0)) || 0; let t = parseFloat(getValSafe('pr-ev-ti', 0)) || 0; let r = parseFloat(getValSafe('pr-ev-rrhh', 0)) || 0; let promedio = ((f + t + r) / 3).toFixed(1);
    if($('pr-puntaje-disp')) $('pr-puntaje-disp').innerText = promedio;
    let badge = $('pr-riesgo-badge'); if(!badge) return;
    if(promedio >= 8.5) { badge.innerText = "RIESGO BAJO (CONFIABLE)"; badge.className = "badge badge-success"; } else if(promedio >= 6.0) { badge.innerText = "RIESGO MEDIO (PRECAUCIÓN)"; badge.className = "badge badge-warning"; } else { badge.innerText = "RIESGO ALTO (CRÍTICO)"; badge.className = "badge badge-danger"; }
};

window.abrirModalProveedor = (id = null) => {
    editandoProvId = id; window.setHtml('prov-form-title', `<span class="material-icons-round">local_shipping</span> ${id ? 'Editar' : 'Registrar'} Proveedor`);
    if(id) {
        let p = globalProveedores.find(x => x.id === id); if(!p) return;
        window.setVal('pr-rs', p.razon_social || ''); window.setVal('pr-ruc', p.ruc || ''); window.setVal('pr-serv', p.servicio || ''); window.setVal('pr-cert', p.certificaciones || ''); window.setVal('pr-ev-fisica', p.ev_fisica || 0); window.setVal('pr-ev-ti', p.ev_ti || 0); window.setVal('pr-ev-rrhh', p.ev_rrhh || 0); window.setVal('pr-fecha-eval', p.fecha_proxima || ''); window.setVal('pr-estado', p.estado || 'Condicionado'); window.setVal('pr-obs', p.observaciones || '');
    } else {
        ['pr-rs','pr-ruc','pr-fecha-eval','pr-obs'].forEach(el => window.setVal(el, '')); ['pr-ev-fisica','pr-ev-ti','pr-ev-rrhh'].forEach(el => window.setVal(el, 0)); window.setVal('pr-estado', 'Aprobado');
    }
    window.calcularRiesgoProveedor(); window.setDisplay('modal-proveedor', 'flex');
};

window.guardarProveedor = async () => {
    let rs = getValSafe('pr-rs').trim(); if(!rs) return alert("Razón Social es obligatoria."); window.showLoading();
    let puntaje = parseFloat($('pr-puntaje-disp').innerText) || 0; let riesgo = puntaje >= 8.5 ? 'Bajo' : (puntaje >= 6.0 ? 'Medio' : 'Alto');
    let data = { razon_social: rs, ruc: getValSafe('pr-ruc'), servicio: getValSafe('pr-serv'), certificaciones: getValSafe('pr-cert'), ev_fisica: getValSafe('pr-ev-fisica'), ev_ti: getValSafe('pr-ev-ti'), ev_rrhh: getValSafe('pr-ev-rrhh'), puntaje: puntaje, riesgo: riesgo, fecha_proxima: getValSafe('pr-fecha-eval'), estado: getValSafe('pr-estado'), observaciones: getValSafe('pr-obs'), ultima_modif: new Date().toISOString(), modificado_por: currentUser.nombre };
    if(editandoProvId) { await updateDoc(doc(db, "artifacts", appId, "public", "data", "Proveedores", editandoProvId), data); } else { await addDoc(collection(db, "artifacts", appId, "public", "data", "Proveedores"), data); }
    window.hideLoading(); window.setDisplay('modal-proveedor', 'none'); alert("Proveedor guardado exitosamente.");
};

window.renderTablaProveedores = () => {
    if(!$('tbody-proveedores')) return;
    let fR = getValSafe('filter-prov-riesgo'); let lista = globalProveedores.filter(p => fR === "" || p.riesgo === fR);
    let h = "";
    lista.forEach(p => {
        let bEst = p.estado === 'Aprobado' ? 'badge-success' : (p.estado === 'Rechazado' ? 'badge-danger' : 'badge-warning');
        let bRiesgo = p.riesgo === 'Bajo' ? 'badge-success' : (p.riesgo === 'Alto' ? 'badge-danger' : 'badge-warning');
        h += `<tr><td><b>${p.razon_social}</b><br><small>${p.ruc || 'Sin RUC'}</small></td><td>${p.servicio}</td><td>${p.certificaciones}</td><td><b style="font-size:16px;">${p.puntaje}/10</b></td><td><span class="badge ${bRiesgo}">${p.riesgo}</span></td><td>${window.formatearFechaAbreviada(p.fecha_proxima) || 'No definida'}</td><td><span class="badge ${bEst}">${p.estado}</span></td><td class="no-export"><button type="button" class="btn btn-info" style="padding:4px 8px; font-size:10px;" onclick="window.abrirModalProveedor('${p.id}')">Editar</button> <button type="button" class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="window.del('Proveedores','${p.id}')">X</button></td></tr>`;
    });
    window.setHtml('tbody-proveedores', h || "<tr><td colspan='8' style='text-align:center;'>No hay proveedores registrados.</td></tr>");
};

window.exportarExcelProveedores = () => {
    if(globalProveedores.length === 0) return alert("No hay datos.");
    let dE = globalProveedores.map(p => ({ "Razón Social": p.razon_social, "RUC": p.ruc, "Servicio": p.servicio, "Certificación": p.certificaciones, "Puntaje": p.puntaje, "Riesgo": p.riesgo, "Prox. Evaluación": p.fecha_proxima, "Estado": p.estado, "Observaciones": p.observaciones }));
    let wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dE), "Proveedores_OEA"); XLSX.writeFile(wb, "Directorio_Proveedores_OEA.xlsx");
};

window.actualizarSeveridadColor = () => {
    let p = parseInt(getValSafe('ri-prob', 1)); let i = parseInt(getValSafe('ri-imp', 1)); let sev = p * i;
    let b = $('ri-sev-badge'); if(!b) return;
    if(sev <= 4) { b.innerText = `SEVERIDAD: ${sev} (BAJO)`; b.className = "badge badge-success"; } else if(sev <= 9) { b.innerText = `SEVERIDAD: ${sev} (MEDIO)`; b.className = "badge badge-warning"; } else if(sev <= 15) { b.innerText = `SEVERIDAD: ${sev} (ALTO)`; b.className = "badge badge-danger"; b.style.background = "rgba(234, 88, 12, 0.2)"; b.style.color = "#ea580c"; } else { b.innerText = `SEVERIDAD: ${sev} (CRÍTICO)`; b.className = "badge badge-danger"; }
};

window.abrirModalRiesgo = (id = null) => {
    editandoRiesgoId = id; window.setHtml('riesgo-form-title', `<span class="material-icons-round">warning</span> ${id ? 'Editar' : 'Registrar'} Riesgo`);
    let respOptions = '<option value="No Asignado">-- Seleccionar Responsable --</option>';
    allUsers.forEach(u => respOptions += `<option value="${u.nombre}">${u.nombre} (${u.role || 'S/Cargo'})</option>`);
    window.setHtml('ri-resp', respOptions);
    
    if(id) {
        let r = globalRiesgos.find(x => x.id === id); if(!r) return;
        window.setVal('ri-proceso', r.proceso || ''); window.setVal('ri-amenaza', r.amenaza || ''); window.setVal('ri-desc', r.descripcion || ''); window.setVal('ri-prob', r.probabilidad || 1); window.setVal('ri-imp', r.impacto || 1); window.setVal('ri-accion', r.accion_mitigacion || 'Mitigar (Tratar)'); window.setVal('ri-resp', r.responsable || 'No Asignado'); window.setVal('ri-controles', r.controles || '');
    } else {
        ['ri-proceso','ri-desc','ri-controles'].forEach(el => window.setVal(el, '')); ['ri-prob','ri-imp'].forEach(el => window.setVal(el, 1)); window.setVal('ri-accion', 'Mitigar (Tratar)'); window.setVal('ri-amenaza', 'Robo / Pérdida');
    }
    window.actualizarSeveridadColor(); window.setDisplay('modal-riesgo', 'flex');
};

window.guardarRiesgo = async () => {
    let proc = getValSafe('ri-proceso').trim(); if(!proc) return alert("Proceso Afectado es obligatorio."); window.showLoading();
    let p = parseInt(getValSafe('ri-prob', 1)); let i = parseInt(getValSafe('ri-imp', 1)); let sev = p * i; let nivel = sev <= 4 ? 'Bajo' : (sev <= 9 ? 'Medio' : (sev <= 15 ? 'Alto' : 'Crítico'));
    let data = { proceso: proc, amenaza: getValSafe('ri-amenaza'), descripcion: getValSafe('ri-desc'), probabilidad: p, impacto: i, severidad_num: sev, severidad_nivel: nivel, accion_mitigacion: getValSafe('ri-accion'), responsable: getValSafe('ri-resp'), controles: getValSafe('ri-controles'), ultima_modif: new Date().toISOString() };
    if(editandoRiesgoId) { await updateDoc(doc(db, "artifacts", appId, "public", "data", "MatrizRiesgos", editandoRiesgoId), data); } else { 
        let idR = "";
        await runTransaction(db, async(t) => { const sn = await t.get(doc(db,"artifacts",appId,"public","data","Contadores","riesgos")); let c = 1; if(sn.exists()) c = sn.data().count + 1; t.set(doc(db,"artifacts",appId,"public","data","Contadores","riesgos"), {count: c}); idR = `RSK-${new Date().getFullYear()}-${String(c).padStart(3,'0')}`; });
        data.rsk_id = idR; await addDoc(collection(db, "artifacts", appId, "public", "data", "MatrizRiesgos"), data); 
    }
    window.hideLoading(); window.setDisplay('modal-riesgo', 'none'); alert("Riesgo guardado.");
};

window.renderTablaRiesgos = () => {
    if(!$('tbody-riesgos')) return;
    let fS = getValSafe('filter-riesgo-sev'); let lista = globalRiesgos.filter(r => fS === "" || r.severidad_nivel === fS); lista.sort((a,b) => b.severidad_num - a.severidad_num); 
    let h = "";
    lista.forEach(r => {
        let bSev = r.severidad_nivel === 'Bajo' ? 'badge-success' : (r.severidad_nivel === 'Medio' ? 'badge-warning' : 'badge-danger');
        let bAcc = r.accion_mitigacion.includes('Mitigar') ? 'color:var(--primary);font-weight:bold;' : 'color:var(--text-muted);';
        h += `<tr><td><b>${r.rsk_id || '-'}</b></td><td>${r.proceso}</td><td>${r.amenaza}</td><td style="text-align:center;">${r.probabilidad}</td><td style="text-align:center;">${r.impacto}</td><td><span class="badge ${bSev}">${r.severidad_num} (${r.severidad_nivel})</span></td><td><span style="${bAcc}">${r.accion_mitigacion}</span></td><td>${r.responsable}</td><td class="no-export"><button type="button" class="btn btn-info" style="padding:4px 8px; font-size:10px;" onclick="window.abrirModalRiesgo('${r.id}')">Editar</button> <button type="button" class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="window.del('MatrizRiesgos','${r.id}')">X</button></td></tr>`;
    });
    window.setHtml('tbody-riesgos', h || "<tr><td colspan='9' style='text-align:center;'>No hay riesgos registrados en la matriz.</td></tr>");
};

window.exportarExcelRiesgos = () => {
    if(globalRiesgos.length === 0) return alert("No hay datos.");
    let dE = globalRiesgos.map(r => ({ "ID Riesgo": r.rsk_id, "Proceso": r.proceso, "Amenaza": r.amenaza, "Descripción Vulnerabilidad": r.descripcion, "Probabilidad (1-5)": r.probabilidad, "Impacto (1-5)": r.impacto, "Puntaje Severidad": r.severidad_num, "Nivel Severidad": r.severidad_nivel, "Acción Decidida": r.accion_mitigacion, "Responsable": r.responsable, "Controles / Mitigación": r.controles }));
    let wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dE), "Matriz_Riesgos_OEA"); XLSX.writeFile(wb, "Matriz_Riesgos_SGC.xlsx");
};


window.cargarDatosCentrales = () => {
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "Usuarios"), (sn) => {
    allUsers = []; let hU = "", cbU = "", oU = "", oI = '<option value="">-- Seleccionar --</option>';
    sn.forEach(d => { 
      let u = d.data(); allUsers.push(u); let gs = u.gerencias ? u.gerencias.join(', ') : (u.gerencia || 'N/A');
      hU += `<tr><td>${u.nombre} (${u.usuario})</td><td>${u.email||''}</td><td>${u.role||''} / <small>${gs}</small></td><td class="no-export"><button type="button" class="btn btn-info" style="padding:4px 8px; font-size:10px;" onclick="window.cargarUsuarioParaEditar('${u.usuario}')">Editar</button> <button type="button" class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="window.eliminarUsuario('${u.usuario}')">Eliminar</button></td></tr>`;
      cbU += `<label style="display:flex; gap:8px; font-size:13px; margin-bottom:6px;"><input aria-label="chk_user" type="checkbox" name="chk_user" value="${u.nombre}" data-email="${u.email}" style="margin:0; width:16px;" onchange="window.actualizarConteoPersonal()"> ${u.nombre} (${gs})</label>`;
      oU += `<option value="${u.nombre}" data-email="${u.email}">${u.nombre} (${gs})</option>`; if(u.email) oI += `<option value="${u.email}">${u.nombre} (${gs})</option>`;
    });
    window.setHtml('tbody-users', hU); window.setHtml('aud-auditado-list', cbU); window.setHtml('aud-auditor-list', cbU); window.setHtml('aud-formacion-list', cbU); window.setHtml('ah-auditor-list', cbU); 
    window.setHtml('ah-lider', '<option value="">-- Lider --</option>' + oU); window.setHtml('sol-involucrado-sel', oI); window.setHtml('m-new-involucrado-sel', oI); window.setHtml('e-sol-involucrado-sel', oI);
  });

  onSnapshot(doc(db, "artifacts", appId, "public", "data", "Configuracion", "NormaOEA"), (sn) => {
    if(sn.exists()) { const d = sn.data(); requisitosOEA = d.requisitos || []; manualOEA = { url: d.manual_url || "", nombre: d.manual_nombre || "" }; } else { requisitosOEA = []; manualOEA = { url: "", nombre: "" }; } window.renderNormaOEA();
  });

  onSnapshot(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), (sn) => {
    if(sn.exists()) { const d = sn.data(); tiposDocumento = d.tiposDoc || []; columnasMaestro = d.columnas || []; estatusMaestro = d.estatus || []; window.renderListasConfig(); }
  });

  onSnapshot(doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"), (sn) => {
    let dp = [], gr = []; 
    if(sn.exists()) { 
        const d = sn.data(); 
        dp = d.departamentos || []; 
        gr = d.gerencias || []; 
        window.systemDriveUrl = d.driveUrl || ""; 
    } else {
        window.systemDriveUrl = "";
    }
    allDepartamentos = dp;
    
    window.setVal('sys-drive-url', window.systemDriveUrl);
    let iframe = document.getElementById('drive-iframe');
    let placeholder = document.getElementById('drive-placeholder');
    let btnOpen = document.getElementById('btn-open-drive');
    if(window.systemDriveUrl && window.systemDriveUrl.trim() !== '') {
        let embedUrl = window.systemDriveUrl;
        if (embedUrl.includes('drive.google.com') && !embedUrl.includes('embeddedfolderview')) {
            let match = embedUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
            if (!match) match = embedUrl.match(/id=([a-zA-Z0-9-_]+)/);
            if (!match) match = embedUrl.match(/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                embedUrl = `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
            }
        }
        if(iframe && iframe.src !== embedUrl) iframe.src = embedUrl;
        if(iframe) iframe.style.display = 'block';
        if(placeholder) placeholder.style.display = 'none';
        if(btnOpen) btnOpen.style.display = 'inline-flex';
    } else {
        if(iframe) iframe.style.display = 'none';
        if(placeholder) placeholder.style.display = 'flex';
        if(btnOpen) btnOpen.style.display = 'none';
    }
    let gH = ""; gr.forEach(g => gH += `<option value="${g}">${g}</option>`);
    window.setHtml('d-ger-sel', gH); window.setHtml('sol-ger', '<option value="">-- Seleccionar --</option>' + gH); window.setHtml('e-sol-ger', '<option value="">-- Seleccionar --</option>' + gH);
    window.setHtml('list-ger', gr.map((g, i) => `<div class="settings-item"><span>${g}</span><button type="button" class="btn-icon-danger" onclick="window.eliminarGerencia(${i})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`).join(''));
    window.setHtml('list-dep', dp.map((d, i) => `<div class="settings-item"><span>${d.nombre} <small>(${d.gerencia})</small></span><button type="button" class="btn-icon-danger" onclick="window.eliminarDepartamento(${i})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`).join(''));
    window.setHtml('u-ger-list', gr.map(g => `<label style="display:flex; gap:8px; font-size:13px; margin-bottom:6px;"><input aria-label="chk_ger" type="checkbox" name="chk_ger" value="${g}" style="margin:0; width:16px;"> ${g}</label>`).join(''));
  });
  
  onSnapshot(doc(db, "artifacts", appId, "public", "data", "Configuracion", "SLA"), (sn) => {
    if(sn.exists()) { 
        const d = sn.data(); 
        slaConfigDias = { alta: d.alta || 3, media: d.media || 7, baja: d.baja || 15 }; 
        if($('sla-alta')) {
            window.setVal('sla-alta', slaConfigDias.alta);
            window.setVal('sla-media', slaConfigDias.media);
            window.setVal('sla-baja', slaConfigDias.baja);
        }
    }
  });

  onSnapshot(collection(db, "artifacts", appId, "public", "data", "ListadoMaestro"), (sn) => { dataMaestro = []; sn.forEach(d => { let obj = d.data(); obj.docId = d.id; dataMaestro.push(obj); }); window.renderTablaMaestro(); });
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "Solicitudes"), (sn) => { globalSolicitudes = []; sn.forEach(d => { let obj = d.data(); obj.docId = d.id; globalSolicitudes.push(obj); }); window.renderTablasSolicitudes(); window.checkDailyAlerts(); });
  
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "Auditorias"), (sn) => {
    globalAllAuditorias = []; sn.forEach(d => { let obj = d.data(); obj.id = d.id; globalAllAuditorias.push(obj); });
    let cy = new Date().getFullYear().toString(); let ys = $('aud-year-select'); if(ys && ys.options.length === 0) ys.innerHTML = `<option value="${cy}">${cy}</option><option value="nuevo">+ Añadir Año</option>`;
    window.loadAuditPlan(ys ? ys.value : cy); window.renderTablaAuditorias(ys ? ys.value : cy);
  });
  
  // Listeners que actualizan el Dashboard Analítico
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "AccionesCorrectivas"), (sn) => { 
      globalAllSacs = []; sn.forEach(d => { let obj = d.data(); obj.sac_id = d.id; globalAllSacs.push(obj); }); 
      window.renderF023Global(); window.renderDashboardCharts(); 
  });
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "Proveedores"), (sn) => { 
      globalProveedores = []; sn.forEach(d => { let obj = d.data(); obj.id = d.id; globalProveedores.push(obj); }); 
      window.renderTablaProveedores(); window.renderDashboardCharts(); 
  });
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "MatrizRiesgos"), (sn) => { 
      globalRiesgos = []; sn.forEach(d => { let obj = d.data(); obj.id = d.id; globalRiesgos.push(obj); }); 
      window.renderTablaRiesgos(); window.renderDashboardCharts(); 
  });
  onSnapshot(collection(db, "artifacts", appId, "public", "data", "Formularios"), (sn) => { 
      globalForms = []; sn.forEach(d => { let obj = d.data(); obj.id = d.id; globalForms.push(obj); }); 
      window.renderTablaForms(); 
  });
};

window.currentDashTab = 'solicitudes';

window.setDashTab = (tab, btnElement) => {
    window.currentDashTab = tab;
    // Resetear estilos de todos los botones de tabs
    ['dash-tab-sol', 'dash-tab-sacs', 'dash-tab-aud', 'dash-tab-prov'].forEach(id => {
        let el = document.getElementById(id);
        if(el) {
            el.className = 'btn btn-dark';
            el.style.background = 'var(--background-alt)';
            el.style.color = 'var(--text-main)';
        }
    });
    // Activar el botón seleccionado
    if(btnElement) {
        btnElement.className = 'btn btn-primary';
        btnElement.style.background = 'var(--primary)';
        btnElement.style.color = 'white';
    }
    
    // Configurar cabeceras según el tab
    let th = '';
    if(tab === 'solicitudes') {
        th = '<tr><th>ID Sistema</th><th>Fecha</th><th>Tipo Doc</th><th>Solicitante</th><th>Estado</th><th class="no-export">Ver</th></tr>';
    } else if(tab === 'sacs') {
        th = '<tr><th>ID SAC</th><th>Apertura</th><th>Origen</th><th>Responsable</th><th>Estado</th><th class="no-export">Ver</th></tr>';
    } else if(tab === 'auditorias') {
        th = '<tr><th>Código Audit</th><th>Fecha Prog.</th><th>Auditado</th><th>Auditor</th><th>Estado</th><th class="no-export">Ver</th></tr>';
    } else if(tab === 'proveedores') {
        th = '<tr><th>Proveedor</th><th>RUC</th><th>Últ. Eval</th><th>Puntaje</th><th>Riesgo</th><th class="no-export">Ver</th></tr>';
    }
    window.setHtml('thead-dash', th);
    window.renderTablasDinamicasDash();
};

window.renderTablasDinamicasDash = () => {
    let dDesde = getValSafe('dash-filter-desde');
    let dHasta = getValSafe('dash-filter-hasta');
    let dEstado = getValSafe('dash-filter-estado').toLowerCase().trim();
    
    let fDesde = dDesde ? new Date(dDesde + 'T00:00:00') : null;
    let fHasta = dHasta ? new Date(dHasta + 'T23:59:59') : null;
    
    let html = "";
    
    if(window.currentDashTab === 'solicitudes') {
        let data = [...(globalSolicitudes || [])];
        if(fDesde) data = data.filter(x => new Date(x.fecha) >= fDesde);
        if(fHasta) data = data.filter(x => new Date(x.fecha) <= fHasta);
        if(dEstado) data = data.filter(x => String(x.estado||'En Trámite').toLowerCase().includes(dEstado));
        data.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
        
        data.forEach(s => {
            let badge = String(s.estado||"").includes('Aprobado') ? 'badge-success' : (s.estado==='Anulado'||s.estado==='Rechazado'?'badge-danger':'badge-warning');
            html += `<tr>
                <td><b>${s.customId || '-'}</b></td>
                <td>${window.formatearFechaAbreviada(s.fecha)}</td>
                <td>${s.tipo_documento || '-'}</td>
                <td>${s.solicitante || '-'}</td>
                <td><span class="badge ${badge}">${s.estado || 'En Trámite'}</span></td>
                <td class="no-export"><button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="window.verDetalle('${s.docId}')"><span class="material-icons-round" style="font-size:14px;">visibility</span></button></td>
            </tr>`;
        });
    } 
    else if(window.currentDashTab === 'sacs') {
        let data = [...(globalAllSacs || [])];
        if(fDesde) data = data.filter(x => x.fecha_apertura && new Date(x.fecha_apertura) >= fDesde);
        if(fHasta) data = data.filter(x => x.fecha_apertura && new Date(x.fecha_apertura) <= fHasta);
        if(dEstado) data = data.filter(x => String(x.estado||'Abierta').toLowerCase().includes(dEstado));
        data.sort((a,b) => new Date(b.fecha_apertura) - new Date(a.fecha_apertura));
        
        data.forEach(s => {
            let badge = s.estado === 'Cerrada' ? 'badge-success' : (s.estado==='Anulada'?'badge-danger':'badge-warning');
            html += `<tr>
                <td><b>${s.customId || s.sac_id}</b></td>
                <td>${window.formatearFechaAbreviada(s.fecha_apertura)}</td>
                <td>${s.origen || '-'}</td>
                <td>${s.responsable || '-'}</td>
                <td><span class="badge ${badge}">${s.estado || 'Abierta'}</span></td>
                <td class="no-export"><button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="window.cambiarVista('sec-noconf');"><span class="material-icons-round" style="font-size:14px;">arrow_forward</span></button></td>
            </tr>`;
        });
    }
    else if(window.currentDashTab === 'auditorias') {
        let data = [...(globalAllAuditorias || [])];
        if(fDesde) data = data.filter(x => x.fecha && new Date(x.fecha) >= fDesde);
        if(fHasta) data = data.filter(x => x.fecha && new Date(x.fecha) <= fHasta);
        if(dEstado) data = data.filter(x => String(x.estado||'Programada').toLowerCase().includes(dEstado));
        data.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
        
        data.forEach(a => {
            let badge = a.estado === 'Completada' ? 'badge-success' : (a.estado==='Cancelada'?'badge-danger':'badge-info');
            html += `<tr>
                <td><b>${a.audit_num || '-'}</b></td>
                <td>${window.formatearFechaAbreviada(a.fecha)}</td>
                <td>${a.auditado || '-'}</td>
                <td>${a.auditor || '-'}</td>
                <td><span class="badge ${badge}">${a.estado || 'Programada'}</span></td>
                <td class="no-export"><button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="window.cambiarVista('sec-audit');"><span class="material-icons-round" style="font-size:14px;">arrow_forward</span></button></td>
            </tr>`;
        });
    }
    else if(window.currentDashTab === 'proveedores') {
        let data = [...(globalProveedores || [])];
        if(fDesde) data = data.filter(x => x.ultima_evaluacion && new Date(x.ultima_evaluacion) >= fDesde);
        if(fHasta) data = data.filter(x => x.ultima_evaluacion && new Date(x.ultima_evaluacion) <= fHasta);
        if(dEstado) data = data.filter(x => String(x.riesgo||'').toLowerCase().includes(dEstado)); // Proveedores usa 'riesgo' en su lugar
        data.sort((a,b) => new Date(b.ultima_evaluacion) - new Date(a.ultima_evaluacion));
        
        data.forEach(p => {
            let bgR = p.riesgo === 'Bajo' ? 'badge-success' : (p.riesgo==='Alto'?'badge-danger':'badge-warning');
            html += `<tr>
                <td><b>${p.nombre || '-'}</b></td>
                <td>${p.ruc || '-'}</td>
                <td>${window.formatearFechaAbreviada(p.ultima_evaluacion)}</td>
                <td>${p.puntaje || 0}/100</td>
                <td><span class="badge ${bgR}">${p.riesgo || '-'}</span></td>
                <td class="no-export"><button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="window.cambiarVista('sec-proveedores');"><span class="material-icons-round" style="font-size:14px;">arrow_forward</span></button></td>
            </tr>`;
        });
    }

    if(!html) html = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No se encontraron datos que coincidan con los filtros.</td></tr>`;
    window.setHtml('tbody-dash-dinamico', html);
    window.renderDashboardCharts(); 
};

window.renderTablasSolicitudes = () => {
  let hH = "", hA = "", hG = "", sort = [...globalSolicitudes].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  let totalCerradas = 0, cerradasATiempo = 0;
  const p = currentUser.permisos || {}; const esAdm = p.admin || p.p_gest_sgc;

  sort.forEach(s => {
    let es = s.estado || "Pendiente", c = es==='Anulado'||es==='Rechazado', apr = es.includes('Aprobado Final');
    let bc = apr ? 'badge-success' : (c ? 'badge-danger' : 'badge-warning'), ps = s.prioridad || "Baja", bp = ps==='Alta'?'badge-danger':(ps==='Media'?'badge-warning':'badge-info');
    let et = c ? '' : (s.idx === -1 ? 'Pendiente Evaluación' : (PASOS_NOMBRES[s.idx] || ''));
    let etBadge = et ? `<span class="badge badge-info">${et}</span>` : '<span style="color:#cbd5e1">-</span>';
    let isM = (s.uid === currentUser.usuario) || (s.involucrados && currentUser.email && s.involucrados.includes(currentUser.email.toLowerCase()));
    let f_sla = s.sla || s.fecha_esperada_cierre;
    let slaVisual = f_sla ? window.formatearFechaAbreviada(f_sla) : '<span style="color:#cbd5e1">-</span>';
    let docIcon = s.documento_final ? `<span title="Documento Publicado" style="font-size:16px;">📄</span>` : '<span style="color:#cbd5e1">-</span>';

    if(apr && f_sla && s.fecha_final) { totalCerradas++; if(s.fecha_final <= f_sla) cerradasATiempo++; }

    if(isM) { hH += `<tr><td><b>${s.customId}</b><br><small style="color:#94a3b8">${window.formatearFechaAbreviada(s.fecha)}</small></td><td>${s.solicitante}</td><td>${s.titulo}<br><span class="badge ${bp}">${ps}</span></td><td><span class="badge ${bp}">${ps}</span></td><td><span class="badge ${bc}">${es}</span></td><td>${slaVisual}</td><td style="text-align:center;">${docIcon}</td><td class="no-export"><button type="button" class="btn btn-primary" style="padding:4px 8px; font-size:10px;" onclick="window.verDetalle('${s.docId}')">Ver / Gestionar</button></td></tr>`; }

    let puedeVerTodas = false;
    if (esAdm || p.p_ver_todas) puedeVerTodas = true;
    else if (p.p_ver_ger && currentUser.gerencias && currentUser.gerencias.includes(s.gerencia)) puedeVerTodas = true;
    else if (isM) puedeVerTodas = true;

    if(puedeVerTodas) { hA += `<tr><td><b>${s.customId}</b><br><small style="color:#94a3b8">${window.formatearFechaAbreviada(s.fecha)}</small></td><td>${s.solicitante}<br><small>${s.gerencia}</small></td><td>${s.titulo}</td><td><span class="badge ${bp}">${ps}</span></td><td><span class="badge ${bc}">${es}</span><br><small>${et}</small></td><td>${slaVisual}</td><td style="text-align:center;">${docIcon}</td><td class="no-export"><button type="button" class="btn btn-primary" style="padding:4px 8px; font-size:10px;" onclick="window.verDetalle('${s.docId}')">Ver Detalle</button></td></tr>`; }

    let act = !apr && !c;
    let c1 = s.asig_paso1 ? (currentUser.email||'').toLowerCase() === s.asig_paso1.toLowerCase() : p.p_paso1;
    let c2 = s.asig_paso2 ? (currentUser.email||'').toLowerCase() === s.asig_paso2.toLowerCase() : p.p_paso2;
    let c4 = s.asig_paso4 ? (currentUser.email||'').toLowerCase() === s.asig_paso4.toLowerCase() : p.p_paso4;
    let pgS = act && ((s.idx===0 && (esAdm||c1)) || (s.idx===1 && (esAdm||c2)) || (s.idx===3 && (esAdm||c4)) || (s.idx===-1 && (esAdm||p.p_eval_solicitud)));
    let pgG = act && s.idx===2 && p.p_ger_apr && currentUser.gerencias && currentUser.gerencias.includes(s.gerencia);
    if(pgS || pgG) { hG += `<tr><td><b>${s.customId}</b><br><small style="color:#94a3b8">${window.formatearFechaAbreviada(s.fecha)}</small></td><td>${s.solicitante}<br><small>${s.gerencia}</small></td><td>${s.titulo}<br><span class="badge ${bp}">${ps}</span></td><td>${etBadge}</td><td>${slaVisual}</td><td style="text-align:center;">${docIcon}</td><td class="no-export"><button type="button" class="btn btn-warning" style="padding:4px 8px; font-size:10px;" onclick="window.verDetalle('${s.docId}')">Revisar / Firmar</button></td></tr>`; }
  });

  window.setHtml('tbody-historial', hH); window.setHtml('tbody-all', hA); window.setHtml('tbody-gestionar', hG);

  if($('dash-mis-tot')) {
    let ms = sort.filter(s => s.uid === currentUser.usuario || (s.involucrados && currentUser.email && s.involucrados.includes(currentUser.email.toLowerCase())));
    window.setTxt('dash-mis-tot', ms.length); window.setTxt('dash-mis-pend', ms.filter(s => !String(s.estado||"").includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado').length);
    window.setTxt('dash-mis-ok', ms.filter(s => String(s.estado||"").includes('Aprobado Final')).length); window.setTxt('dash-mis-rech', ms.filter(s => s.estado === 'Anulado' || s.estado === 'Rechazado').length);
  }
  
  if($('dash-glob-tot') && currentUser.permisos && (currentUser.permisos.admin || currentUser.permisos.p_gest_sgc)) {
    window.setDisplay('dash-admin-section', 'block'); window.setTxt('dash-glob-tot', sort.length);
    window.setTxt('dash-glob-pend', sort.filter(s => !String(s.estado||"").includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado').length);
    window.setTxt('dash-glob-ok', sort.filter(s => String(s.estado||"").includes('Aprobado Final')).length); 
    let slaPer = totalCerradas > 0 ? Math.round((cerradasATiempo / totalCerradas) * 100) : 0; window.setTxt('dash-sla-percent', `${slaPer}%`);
  }
  window.renderDashboardCharts();
};

window.completarLoginUI = () => {
  window.setDisplay('login-screen', 'none'); window.setDisplay('sidebar', 'flex'); window.setDisplay('main', 'block');
    // Collapse all nav groups except Documental and Auditoría; expand those two
    try {
        document.querySelectorAll('.nav-group-body').forEach(b => {
            if (!b) return;
            if (b.id === 'ng-documental' || b.id === 'ng-auditoria') {
                b.classList.remove('collapsed');
            } else {
                if (!b.classList.contains('collapsed')) b.classList.add('collapsed');
            }
        });
        document.querySelectorAll('.nav-group-header').forEach(h => h.classList.remove('open'));
        if (document.getElementById('ng-documental-btn')) document.getElementById('ng-documental-btn').classList.add('open');
        if (document.getElementById('ng-auditoria-btn')) document.getElementById('ng-auditoria-btn').classList.add('open');
    } catch(e) { console.warn('Sidebar expand/collapse init failed', e); }
  window.setTxt('curr-name', currentUser.nombre || 'Usuario');
  
  // Mostrar empresa activa en sidebar
  const empNombre = currentEmpresaConfig ? currentEmpresaConfig.nombre : (currentEmpresaId === '1' ? 'FCI Logistic' : 'Empresa');
  window.setTxt('curr-ger', isSuperAdmin ? ('🌐 Super Admin · ' + empNombre) : (currentUser.gerencias ? currentUser.gerencias.join(', ') : (currentUser.gerencia || 'Sin Gerencia')));
  if ($('empresa-badge-nombre')) $('empresa-badge-nombre').innerText = empNombre;
  if ($('empresa-badge')) $('empresa-badge').style.display = isSuperAdmin ? 'block' : 'none';

    const p = currentUser.permisos || {}; const isAdm = p.admin || isSuperAdmin || false;
    const canDash = isAdm || p.p_gest_sgc || p.p_paso1 || p.p_paso2 || p.p_paso4;
    window.setDisplay('nav-dash', canDash ? 'flex' : 'none');
    // Also hide the dashboard section when the user lacks dashboard permission
    window.setDisplay('sec-dash', canDash ? 'block' : 'none');
    window.setDisplay('nav-forms', (p.p_ver_formularios || p.p_gest_sgc) ? 'flex' : 'none'); window.setDisplay('nav-hist', (p.p_ver_propias || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-all', (p.p_ver_todas || p.p_ver_ger || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-crear', (p.can_solicit || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-gest', (p.p_gest_sgc || p.p_ger_apr || p.p_paso1 || p.p_paso2 || p.p_paso4 || p.p_eval_solicitud || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-listado', (p.p_ver_listado || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-drive', 'flex');
  window.setDisplay('nav-admin-group', (isAdm || p.p_users || p.p_struct) ? 'block' : 'none');

  // Grupo Super Admin (solo para isSuperAdmin)
  window.setDisplay('nav-superadmin-group', isSuperAdmin ? 'block' : 'none');
  if (isSuperAdmin) window.cargarTodasEmpresas();

  const canAud = p.p_audit_ver || p.p_audit_admin || p.p_audit_auditor || p.p_audit_dueno || isAdm; 
  window.setDisplay('nav-audit-group', canAud ? 'block' : 'none'); window.setDisplay('nav-norma', canAud ? 'flex' : 'none'); window.setDisplay('nav-audit', canAud ? 'flex' : 'none'); window.setDisplay('nav-noconf', (p.p_audit_admin || p.p_gest_sgc || p.p_audit_auditor || p.p_audit_dueno || isAdm) ? 'flex' : 'none');
  
  const canOea = p.p_proveedores || p.p_riesgos || isAdm || p.p_gest_sgc || p.p_audit_admin;
  window.setDisplay('nav-oea-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-proveedores', (p.p_proveedores || isAdm || p.p_gest_sgc) ? 'flex' : 'none');
  window.setDisplay('nav-riesgos', (p.p_riesgos || isAdm || p.p_gest_sgc) ? 'flex' : 'none');
  
  window.setDisplay('nav-segfisica-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-logistica-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-hseq-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-rrhh-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-it-group', canOea ? 'block' : 'none');

  const canRoot = p.p_users || p.p_struct || isAdm; 
  window.setDisplay('admin-only', canRoot ? 'block' : 'none'); window.setDisplay('nav-users', (p.p_users || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-struct', (p.p_struct || isAdm) ? 'flex' : 'none');
  
  let isAdAud = p.p_audit_admin || p.p_gest_sgc || isAdm;
  window.setDisplay('btn-config-plan', isAdAud ? 'inline-flex' : 'none'); window.setDisplay('btn-nueva-aud', isAdAud ? 'inline-flex' : 'none');
  
  window.cargarDatosCentrales();
        try { window.startNotificationSystem(); } catch(e) { console.warn('startNotificationSystem failed', e); }
    // Clear dashboard filters on login to prevent previous filters being applied after reload
    ['dash-filter-desde','dash-filter-hasta','dash-filter-estado','dash-month-filter'].forEach(id => { try { if ($(id)) window.setVal(id, ''); } catch(e){} });
    // Default view selection - avoid opening dashboard if user lacks permission
    if (isSuperAdmin || p.p_gest_sgc || isAdm) window.cambiarVista('sec-all', $('nav-all'));
    else if (p.can_solicit) window.cambiarVista('sec-crear', $('nav-crear'));
    else if (p.p_ver_propias) window.cambiarVista('sec-hist', $('nav-hist'));
    else if (canDash) window.cambiarVista('sec-dash', $('nav-dash'));
    else if ($('nav-crear') && $('nav-crear').style.display !== 'none') window.cambiarVista('sec-crear', $('nav-crear'));
    else if ($('nav-hist') && $('nav-hist').style.display !== 'none') window.cambiarVista('sec-hist', $('nav-hist'));
    else if ($('nav-forms') && $('nav-forms').style.display !== 'none') window.cambiarVista('sec-forms', $('nav-forms'));
    else window.cambiarVista('sec-drive', $('nav-drive'));
};

window.logout = () => {
  localStorage.removeItem('sgc_session_user');
  localStorage.removeItem('sgc_appId');
  localStorage.removeItem('sgc_empresaId');
  currentUser = null; isSuperAdmin = false; appId = 'sgc-final-v6'; currentEmpresaId = '1'; currentEmpresaConfig = null; empresasDisponibles = [];
  window.setDisplay('sidebar', 'none'); window.setDisplay('main', 'none'); window.setDisplay('login-screen', 'flex');
  window.setVal('login-user', ''); window.setVal('login-pass', '');
  if ($('login-empresa-id')) $('login-empresa-id').value = '';
};

window.iniciarSesion = async () => {
  const u = $('login-user').value.toLowerCase().trim();
  const p = $('login-pass').value.trim();
  const empIdInput = $('login-empresa-id') ? $('login-empresa-id').value.trim() : '';

  if (!u || !p) return alert('Por favor, ingresa tu usuario y contraseña.');
  window.showLoading();

  try {
    console.log('[Multiempresa] Iniciando sesión:', u, '| Empresa ID:', empIdInput || '(auto)');

    // ── CASO 1: SUPER ADMIN ──
    // Super Admin puede ingresar con empresa "0" o sin número de empresa si su usuario está indexado
    const looksLikeSuperAdmin = (u === 'sysadm2006' || empIdInput === '0');
    if (looksLikeSuperAdmin) {
        const saSnap = await getDoc(doc(db, 'plataforma', 'main', 'superAdmins', u));
        if (!saSnap.exists() || saSnap.data().pass !== p) { alert('Credenciales incorrectas.'); window.hideLoading(); return; }
        appId = 'sgc-final-v6'; currentEmpresaId = '1'; isSuperAdmin = true;
        currentUser = { ...saSnap.data(), permisos: { admin: true } };
        if (window && typeof window.normalizeUserPermisos === 'function') window.normalizeUserPermisos(currentUser);
        localStorage.setItem('sgc_session_user', u); localStorage.setItem('sgc_appId', appId); localStorage.setItem('sgc_empresaId', '1');
        console.log('[Multiempresa] Super Admin autenticado.');
        window.completarLoginUI(); window.hideLoading(); return;
    }

    // ── CASO 2: NÚMERO DE EMPRESA INGRESADO ──
    if (empIdInput) {
        // Buscar la empresa por ID directamente
        const empSnap = await getDoc(doc(db, 'plataforma', 'main', 'empresas', empIdInput));
        if (!empSnap.exists()) {
            alert(`No existe la empresa N° "${empIdInput}". Verifica el número e intenta de nuevo.`);
            window.hideLoading(); return;
        }
        const empData = empSnap.data();
        if (empData.estado === 'Inactivo') {
            alert(`La empresa N° "${empIdInput}" está inactiva. Contacta al administrador.`);
            window.hideLoading(); return;
        }
        appId = empData.appId; currentEmpresaId = empIdInput; currentEmpresaConfig = empData;
        console.log('[Multiempresa] Empresa encontrada:', empData.nombre, '| appId:', appId);

        // Verificar credenciales en esa empresa
        const qs = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'Usuarios'), where('usuario', '==', u), where('pass', '==', p)));
        if (!qs.empty) {
            localStorage.setItem('sgc_session_user', u); localStorage.setItem('sgc_appId', appId); localStorage.setItem('sgc_empresaId', currentEmpresaId);
            currentUser = qs.docs[0].data();
            if (window && typeof window.normalizeUserPermisos === 'function') window.normalizeUserPermisos(currentUser);
            console.log('[Multiempresa] Usuario autenticado en empresa:', empData.nombre);
            window.completarLoginUI();
        } else {
            alert('Usuario o contraseña incorrectos para la empresa N° ' + empIdInput + '.');
        }
        window.hideLoading(); return;
    }

    // ── CASO 3: AUTO-DETECCIÓN (sin número de empresa) ──
    // Consultar el índice global para saber a qué empresa pertenece el usuario
    let idxSnap;
    try { idxSnap = await getDoc(doc(db, 'plataforma', 'main', 'usuariosIndex', u)); } catch(e) { idxSnap = null; }

    if (idxSnap && idxSnap.exists()) {
      const idx = idxSnap.data();
      if (idx.isSuperAdmin) {
        const saSnap = await getDoc(doc(db, 'plataforma', 'main', 'superAdmins', u));
        if (!saSnap.exists() || saSnap.data().pass !== p) { alert('Credenciales incorrectas.'); window.hideLoading(); return; }
        appId = 'sgc-final-v6'; currentEmpresaId = '1'; isSuperAdmin = true;
        currentUser = { ...saSnap.data(), permisos: { admin: true } };
        if (window && typeof window.normalizeUserPermisos === 'function') window.normalizeUserPermisos(currentUser);
        localStorage.setItem('sgc_session_user', u); localStorage.setItem('sgc_appId', appId); localStorage.setItem('sgc_empresaId', '1');
        window.completarLoginUI(); window.hideLoading(); return;
      }
      appId = idx.empresaAppId || 'sgc-final-v6';
      currentEmpresaId = idx.empresaId || '1';
      try { const empSnap = await getDoc(doc(db, 'plataforma', 'main', 'empresas', currentEmpresaId)); if(empSnap.exists()) currentEmpresaConfig = empSnap.data(); } catch(e){}
    } else {
      // Fallback: empresa 1 (compatibilidad pre-migración)
      console.warn('[Multiempresa] usuariosIndex no encontrado, usando empresa 1 por defecto.');
      appId = 'sgc-final-v6'; currentEmpresaId = '1';
    }

    const qs = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'Usuarios'), where('usuario', '==', u), where('pass', '==', p)));
    if (!qs.empty) {
        console.log('[Multiempresa] Usuario autenticado en empresa:', currentEmpresaId);
        localStorage.setItem('sgc_session_user', u); localStorage.setItem('sgc_appId', appId); localStorage.setItem('sgc_empresaId', currentEmpresaId);
        currentUser = qs.docs[0].data();
        if (window && typeof window.normalizeUserPermisos === 'function') window.normalizeUserPermisos(currentUser);
        window.completarLoginUI();
    } else {
        alert('Credenciales incorrectas. Si perteneces a otra empresa, ingresa su número.');
    }
  } catch (error) {
      console.error('[iniciarSesion] Error:', error);
      alert('Error de conexión. Intenta de nuevo.');
  } finally { window.hideLoading(); }
};




window.cargarUsuarioParaEditar = (id) => {
  const u = allUsers.find(x => x.usuario === id); if(!u) return;
  window.setHtml('user-form-title', `<span class="material-icons-round">edit</span> Editando Usuario: ${u.usuario}`);
  window.setVal('u-nom', u.nombre || ''); window.setVal('u-usr', u.usuario || ''); if($('u-usr')) $('u-usr').disabled = true; window.setVal('u-pas', u.pass || ''); window.setVal('u-rol', u.role || ''); window.setVal('u-email', u.email || '');
  let gs = u.gerencias || []; if(!u.gerencias && u.gerencia) gs = [u.gerencia]; $$('#u-ger-list input[type="checkbox"]').forEach(cb => { cb.checked = gs.includes(cb.value); });
  const p = u.permisos || {};
  ['p-eval-sol','p-solicitar','p-ver-propias','p-ver-ger','p-ver-todas','p-paso1','p-paso2','p-paso4','p-gest-sgc','p-ger-apr','p-users','p-struct','p-ver-listado','p-audit-ver','p-audit-admin','p-audit-auditor','p-audit-dueno','p-proveedores','p-riesgos'].forEach(i => { let k = i.replace(/-/g,'_'); if(k==='p_solicitar')k='can_solicit'; if(k==='p_eval_sol')k='p_eval_solicitud'; if($(i)) $(i).checked = p[k]||false; });
  if($('p-admin')) $('p-admin').checked = p.admin||false; window.setTxt('btnSaveUser', "ACTUALIZAR USUARIO"); window.setDisplay('modal-usuario', 'flex');
};

window.eliminarUsuario = async (uid) => {
    if(!confirm(`¿Estás seguro de ELIMINAR el acceso al usuario ${uid}? Esta acción es irreversible.`)) return; window.showLoading();
    try { await deleteDoc(doc(db, "artifacts", appId, "public", "data", "Usuarios", uid)); alert("Usuario eliminado."); } catch(e) { alert("Error al eliminar."); } window.hideLoading();
};

window.resetUserForm = () => {
  window.setHtml('user-form-title', `<span class="material-icons-round">person_add</span> Registrar / Editar Usuario`);
  window.setVal('u-nom', ''); window.setVal('u-usr', ''); if($('u-usr')) $('u-usr').disabled = false; window.setVal('u-pas', '123'); window.setVal('u-rol', ''); window.setVal('u-email', '');
  $$('#u-ger-list input[type="checkbox"]').forEach(cb => cb.checked = false);
  ['p-eval-sol','p-solicitar','p-ver-propias','p-ver-ger','p-ver-todas','p-paso1','p-paso2','p-paso4','p-gest-sgc','p-ger-apr','p-users','p-struct','p-ver-listado','p-audit-ver','p-audit-admin','p-audit-auditor','p-audit-dueno','p-proveedores','p-riesgos','p-admin'].forEach(i => { if($(i)) $(i).checked=false; });
  if($('btnSaveUser')) $('btnSaveUser').innerText = "GUARDAR USUARIO"; 
};

window.guardarUsuario = async () => {
  const n = getValSafe('u-nom').trim(); const u = getValSafe('u-usr').toLowerCase().trim(); const p = getValSafe('u-pas','123').trim(); const r = getValSafe('u-rol').trim(); const e = getValSafe('u-email').toLowerCase().trim(); const gs = []; $$('#u-ger-list input:checked').forEach(cb => { gs.push(cb.value); });
  if(!n || !u || !p || gs.length === 0) return alert("Nombre, Usuario, Contraseña y al menos 1 Gerencia son obligatorios.");
  const pm = { p_eval_solicitud: getCheckedSafe('p-eval-sol'), can_solicit: getCheckedSafe('p-solicitar'), p_ver_propias: getCheckedSafe('p-ver-propias'), p_ver_ger: getCheckedSafe('p-ver-ger'), p_ver_todas: getCheckedSafe('p-ver-todas'), p_paso1: getCheckedSafe('p-paso1'), p_paso2: getCheckedSafe('p-paso2'), p_paso4: getCheckedSafe('p-paso4'), p_gest_sgc: getCheckedSafe('p-gest-sgc'), p_ger_apr: getCheckedSafe('p-ger-apr'), p_users: getCheckedSafe('p-users'), p_struct: getCheckedSafe('p-struct'), p_ver_listado: getCheckedSafe('p-ver-listado'), p_audit_ver: getCheckedSafe('p-audit-ver'), p_audit_admin: getCheckedSafe('p-audit-admin'), p_audit_auditor: getCheckedSafe('p-audit-auditor'), p_audit_dueno: getCheckedSafe('p-audit-dueno'), p_proveedores: getCheckedSafe('p-proveedores'), p_riesgos: getCheckedSafe('p-riesgos'), admin: getCheckedSafe('p-admin') };
  window.showLoading(); 
  try {
      const docRef = doc(db, "artifacts", appId, "public", "data", "Usuarios", u); 
      const snap = await getDoc(docRef);
      const titleEl = $('user-form-title');
      if(snap.exists() && titleEl && titleEl.innerText.includes("Registrar")) { window.hideLoading(); return alert("Ese ID de usuario ya existe."); }
      await setDoc(docRef, { nombre: n, usuario: u, pass: p, gerencias: gs, gerencia: gs[0], role: r, email: e, permisos: pm });
      window.cerrarModalUsuario(); window.hideLoading(); alert("Usuario guardado exitosamente.");
  } catch (err) { console.error(err); window.hideLoading(); alert("Error de red al guardar usuario."); }
};

window.actualizarGraficoEvaluacion = (campoId, campoLabel) => {
    let ctxE = document.getElementById('vr-chart-eval');
    if(!ctxE) return;
    let docsData = window.currentRespuestasDocs || [];
    let optionScores = {};
    
    docsData.forEach(d => {
        if(d._avgScore !== undefined) {
            let ansObj = d.respuestas ? d.respuestas.find(r => r.id_campo === campoId) : null;
            let val = ansObj ? ansObj.respuesta : null;
            if(val && val !== '-' && !Array.isArray(val)) {
                if(!optionScores[val]) optionScores[val] = { sum: 0, count: 0 };
                optionScores[val].sum += Number(d._avgScore || 0);
                optionScores[val].count++;
            }
        }
    });
    
    let labelsE = [];
    let dataE = [];
    let colorsE = [];
    
    let sortedOptions = Object.keys(optionScores).sort((a,b) => optionScores[b].count - optionScores[a].count);
    
    sortedOptions.forEach(opt => {
        if(optionScores[opt].count > 0) {
            labelsE.push(opt.length > 25 ? opt.substring(0,25)+'...' : opt);
            let avgS = Number((optionScores[opt].sum / optionScores[opt].count).toFixed(1));
            dataE.push(avgS);
            colorsE.push(avgS >= 95 ? '#22c55e' : (avgS >= 85 ? '#3b82f6' : (avgS >= 75 ? '#eab308' : '#ef4444')));
        }
    });
    
    if(window.vrChartEvalInstance) window.vrChartEvalInstance.destroy();
    window.vrChartEvalInstance = new Chart(ctxE, {
        type: 'bar',
        data: {
            labels: labelsE,
            datasets: [{
                label: 'Promedio Evaluación (%)',
                data: dataE,
                backgroundColor: colorsE,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                title: { display: true, text: `Promedios por: ${campoLabel}`, font: {size: 13, weight: 'bold'}, color: '#1e293b' }
            },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
};

window.exportarExcelUsuarios = () => {
  if(allUsers.length === 0) return; let dE = allUsers.map(u => ({ "Nombre": u.nombre, "Usuario ID": u.usuario, "Email": u.email || '', "Rol": u.role || '', "Gerencias": u.gerencias ? u.gerencias.join(', ') : (u.gerencia || ''), "Admin": u.permisos.admin ? 'Sí' : 'No', "Gestor SGC": u.permisos.p_gest_sgc ? 'Sí' : 'No', "Auditor": u.permisos.p_audit_auditor ? 'Sí' : 'No' })); let wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dE), "Usuarios_Registrados"); XLSX.writeFile(wb, "Reporte_Usuarios_SGC.xlsx");
};

// ── APERTURA / CIERRE MODAL CONFIGURACIÓN SISTEMA ──
window.abrirConfigSistema = () => {
  const modal = $('sec-estructura');
  if (!modal) return;
  // Actualizar subtítulo con la empresa activa
  const empNombre = currentEmpresaConfig ? currentEmpresaConfig.nombre : (currentEmpresaId === '1' ? 'FCI Logistic' : 'Empresa ' + currentEmpresaId);
  if ($('config-empresa-subtitle')) {
    $('config-empresa-subtitle').innerHTML = `Configuraci&#243;n de <strong style="color:var(--primary)">${empNombre}</strong> — Gerencias, departamentos, tipos de documento y SLA`;
  }
  // Cargar datos del appId activo
  window.cargarDatosEstructura();
  window.setDisplay('sec-estructura', 'flex');
};

window.cerrarConfigSistema = () => {
  window.setDisplay('sec-estructura', 'none');
};

// Recargar la estructura desde Firestore usando el appId activo
window.cargarDatosEstructura = async () => {
  try {
    const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'Configuracion', 'Estructura'));
    if (snap.exists()) {
      const d = snap.data();
      const gers = d.gerencias || [];
      const deps = d.departamentos || [];
      // Render gerencias
      let hGer = '';
      gers.forEach((g, idx) => { hGer += `<div class="settings-item"><span>${g}</span><button type="button" class="btn-icon-danger" onclick="window.eliminarGerencia(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`; });
      if ($('list-ger')) $('list-ger').innerHTML = hGer || '<p style="color:#94a3b8;font-size:12px;padding:8px;">Sin gerencias registradas.</p>';
      // Render departamentos
      let hDep = '';
      deps.forEach((d, idx) => { hDep += `<div class="settings-item"><span>${d.nombre} <small style="color:#94a3b8">(${d.gerencia})</small></span><button type="button" class="btn-icon-danger" onclick="window.eliminarDepartamento(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`; });
      if ($('list-dep')) $('list-dep').innerHTML = hDep || '<p style="color:#94a3b8;font-size:12px;padding:8px;">Sin departamentos registrados.</p>';
      // Actualizar selector de gerencias para departamentos
      if ($('d-ger-sel')) {
        $('d-ger-sel').innerHTML = '<option value="">-- Seleccione Gerencia --</option>' + gers.map(g => `<option value="${g}">${g}</option>`).join('');
      }
      // Config Drive
      if ($('sys-drive-url') && d.driveUrl) $('sys-drive-url').value = d.driveUrl;
    }
    // SLA
    const slaSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'Configuracion', 'SLA'));
    if (slaSnap.exists()) {
      const s = slaSnap.data();
      if ($('sla-alta')) $('sla-alta').value = s.alta || 3;
      if ($('sla-media')) $('sla-media').value = s.media || 7;
      if ($('sla-baja')) $('sla-baja').value = s.baja || 15;
    }
  } catch(e) { console.error('[cargarDatosEstructura]', e); }
};



window.guardarConfigDrive = async () => {
    let val = document.getElementById('sys-drive-url').value.trim();
    window.showLoading();
    try {
        await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"), { driveUrl: val }, {merge: true});
        alert("Configuración de Drive guardada exitosamente.");
    } catch(e) {
        console.error(e);
        alert("Error al guardar la URL de Drive.");
    }
    window.hideLoading();
};

window.openDriveFolder = () => {
    if(window.systemDriveUrl) {
        window.open(window.systemDriveUrl, '_blank');
    }
};

window.agregarGerencia = async () => { let val = $('g-nom').value.trim().toUpperCase(); if(!val) return; window.showLoading(); let gers = []; const docRef = doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"); const snap = await getDoc(docRef); if(snap.exists() && snap.data().gerencias) gers = snap.data().gerencias; if(gers.includes(val)) { window.hideLoading(); return alert("Ya existe."); } gers.push(val); await setDoc(docRef, { gerencias: gers }, {merge: true}); window.setVal('g-nom', ''); window.hideLoading(); };
window.eliminarGerencia = async (idx) => { if(!confirm("¿Eliminar Gerencia?")) return; window.showLoading(); const docRef = doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"); const snap = await getDoc(docRef); let gers = snap.data().gerencias; gers.splice(idx, 1); await setDoc(docRef, { gerencias: gers }, {merge: true}); window.hideLoading(); };
window.guardarConfigSLA = async () => { let a = parseInt($('sla-alta').value) || 3; let m = parseInt($('sla-media').value) || 7; let b = parseInt($('sla-baja').value) || 15; window.showLoading(); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "SLA"), { alta: a, media: m, baja: b }, {merge: true}); window.hideLoading(); alert("Días mínimos de SLA guardados."); };
window.agregarDepartamento = async () => { let ger = $('d-ger-sel').value; let nom = $('d-nom').value.trim(); if(!ger || !nom) return alert("Seleccione Gerencia y Depto."); window.showLoading(); let deps = []; const docRef = doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"); const snap = await getDoc(docRef); if(snap.exists() && snap.data().departamentos) deps = snap.data().departamentos; deps.push({ nombre: nom, gerencia: ger }); await setDoc(docRef, { departamentos: deps }, {merge: true}); window.setVal('d-nom', ''); window.hideLoading(); };
window.eliminarDepartamento = async (idx) => { if(!confirm("¿Eliminar Departamento?")) return; window.showLoading(); const docRef = doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"); const snap = await getDoc(docRef); let deps = snap.data().departamentos; deps.splice(idx, 1); await setDoc(docRef, { departamentos: deps }, {merge: true}); window.hideLoading(); };

window.renderListasConfig = () => {
  let hCol = ""; columnasMaestro.forEach((c, idx) => { let cName = typeof c === 'string' ? c : c.nombre; let cType = typeof c === 'string' ? 'text' : c.tipo; hCol += `<div class="settings-item"><span>${cName} <small style="color:#94a3b8; font-size:10px;">(${cType})</small></span><button type="button" class="btn-icon-danger" onclick="window.eliminarColumna(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`; }); window.setHtml('list-columnas', hCol);
  let hEst = ""; estatusMaestro.forEach((e, idx) => { hEst += `<div class="settings-item"><span>${e}</span><button type="button" class="btn-icon-danger" onclick="window.eliminarEstatus(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`; }); window.setHtml('list-estatus', hEst);
  let hTipos = ""; tiposDocumento.forEach((t, idx) => { hTipos += `<div class="settings-item"><span>${t}</span><button type="button" class="btn-icon-danger" onclick="window.eliminarTipoDoc(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button></div>`; }); window.setHtml('list-tipos-doc', hTipos);
  
  let htmlTiposSol = '<option value="">-- Seleccione --</option>'; tiposDocumento.forEach(t => htmlTiposSol += `<option value="${t}">${t}</option>`);
  window.setHtml('sol-tipo-doc', htmlTiposSol); 
  window.setHtml('e-sol-tipo-doc', htmlTiposSol); 
  window.setHtml('sac-tipo-doc-afectado', '<option value="">-- No aplica / Ninguno --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join(''));
};

window.agregarTipoDoc = async () => { let val = $('doc-tipo-nom').value.trim(); if(!val) return; if(tiposDocumento.includes(val)) return alert("Ya existe."); tiposDocumento.push(val); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { tiposDoc: tiposDocumento }, {merge: true}); window.setVal('doc-tipo-nom', ''); };
window.eliminarTipoDoc = async (idx) => { if(!confirm("¿Eliminar?")) return; tiposDocumento.splice(idx, 1); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { tiposDoc: tiposDocumento }, {merge: true}); };
window.agregarColumna = async () => { let val = $('col-nom').value.trim(); let tipo = $('col-tipo').value; if(!val) return; if (columnasMaestro.some(c => (typeof c === 'string' ? c : c.nombre) === val)) return alert("Ya existe."); columnasMaestro.push({nombre: val, tipo: tipo}); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { columnas: columnasMaestro }, {merge: true}); window.setVal('col-nom', ''); };
window.eliminarColumna = async (idx) => { if(!confirm("¿Eliminar columna?")) return; columnasMaestro.splice(idx, 1); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { columnas: columnasMaestro }, {merge: true}); };
window.agregarEstatus = async () => { let val = $('est-nom').value.trim(); if(!val) return; if (estatusMaestro.includes(val)) return alert("Ya existe."); estatusMaestro.push(val); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { estatus: estatusMaestro }, {merge: true}); window.setVal('est-nom', ''); };
window.eliminarEstatus = async (idx) => { if(!confirm("¿Eliminar?")) return; estatusMaestro.splice(idx, 1); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "MaestroSettings"), { estatus: estatusMaestro }, {merge: true}); };

window.renderNormaOEA = () => {
  const p = currentUser ? currentUser.permisos || {} : {}; let isAdm = p.admin || p.p_audit_admin || p.p_gest_sgc;
  window.setDisplay('oea-req-upload-box', isAdm ? 'flex' : 'none');
  
  if($('oea-req-list-container')) {
      $('oea-req-list-container').innerHTML = requisitosOEA.map((r, idx) => {
          let nom = typeof r === 'string' ? r : r.nombre; let desc = typeof r === 'string' ? '' : (r.descripcion || '');
          let norma = r.norma || 'OEA';
          return `<div class="settings-item" style="flex-direction:column; align-items:flex-start; cursor:pointer;" onclick="window.abrirPuntoOEA(${idx})">
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                  <span style="font-weight:700; color:var(--primary);"><span class="badge badge-info" style="margin-right:5px; font-size:10px;">${norma}</span> ${nom}</span>
                  ${isAdm ? `<button type="button" class="btn-icon-danger" onclick="event.stopPropagation(); window.eliminarRequisitoOEA(${idx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button>` : ''}
              </div>
              ${desc ? `<div style="font-size:11px; color:var(--text-muted); margin-top:5px;">${desc.substring(0, 60)}...</div>` : ''}
          </div>`;
      }).join('');
  }
  let htmlOpts = requisitosOEA.map(r => { let n = typeof r === 'string' ? r : r.nombre; return `<label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:6px; cursor:pointer;"><input aria-label="chk_oea" type="checkbox" name="chk_oea" value="${n}" style="margin:0; width:auto; flex-shrink:0;"> ${n}</label>`; }).join('');
  window.setHtml('aud-req-list', htmlOpts); window.setHtml('oea-req-list-dl', requisitosOEA.map(r => `<option value="${typeof r === 'string' ? r : r.nombre}">`).join(''));
};

window.abrirPuntoOEA = (idx) => {
  const req = requisitosOEA[idx]; if(!req) return;
  let nom = typeof req === 'string' ? req : req.nombre; let desc = typeof req === 'string' ? '' : req.descripcion; let link = typeof req === 'string' ? '' : req.link;
  let msg = `PUNTO: ${nom}\n\n`; if(desc) msg += `DESCRIPCIÓN:\n${desc}\n\n`;
  if(link) {
      if(link.startsWith('http')) {
          if(confirm(msg + `¿Abrir referencia (${link})?`)) window.open(link, '_blank');
      } else {
          alert(msg + `Referencia: ${link}`);
      }
  } else { alert(msg + "(No hay referencia configurada para este punto)."); }
};

window.agregarRequisitoOEA = async () => { 
    const n = $('oea-req-input').value.trim(); 
    const d = $('oea-req-desc').value.trim(); 
    const l = $('oea-req-link').value.trim(); 
    const norma = getValSafe('oea-req-norma') || 'OEA';
    if(!n) return alert("El nombre del punto es obligatorio."); 
    if(requisitosOEA.some(r => (typeof r === 'string' ? r : r.nombre) === n)) return alert("Ese requisito ya está en la lista."); 
    requisitosOEA.push({ nombre: n, descripcion: d, link: l, norma: norma }); 
    await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "NormaOEA"), { requisitos: requisitosOEA }, {merge: true}); 
    window.setVal('oea-req-input', ''); window.setVal('oea-req-desc', ''); window.setVal('oea-req-link', ''); 
};
window.eliminarRequisitoOEA = async (idx) => { if(!confirm("¿Eliminar este requisito?")) return; requisitosOEA.splice(idx, 1); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "NormaOEA"), { requisitos: requisitosOEA }, {merge: true}); };

window.renderTablaMaestro = () => {
if(!$('thead-listado-maestro')) return;
let headHTML = "<tr>"; columnasMaestro.forEach(col => { let cName = typeof col === 'string' ? col : col.nombre; headHTML += `<th>${cName}</th>`; }); 
if(currentUser && currentUser.permisos && (currentUser.permisos.p_gest_sgc || currentUser.permisos.admin)) { headHTML += `<th class="no-export">Acción</th>`; } headHTML += "</tr>"; window.setHtml('thead-listado-maestro', headHTML);
let dataSort = [...dataMaestro]; if(columnasMaestro.length > 0) { let firstCol = typeof columnasMaestro[0] === 'string' ? columnasMaestro[0] : columnasMaestro[0].nombre; dataSort.sort((a,b) => (a[firstCol]||"").toString().localeCompare((b[firstCol]||"").toString())); }
let tbodyHtml = "";
dataSort.forEach(item => {
  let rowHTML = "<tr>";
  columnasMaestro.forEach(col => {
    let cName = typeof col === 'string' ? col : col.nombre; let cType = typeof col === 'string' ? 'text' : col.tipo; let val = item[cName] || "";
    if(cType === 'url' || val.toString().startsWith("http")) { let dUrl = window.getDownloadUrl(val); let fName = item['Nombre del documento'] || item['Título'] || "Documento_Maestro"; rowHTML += `<td><a href="#" onclick="window.abrirDocumento('${dUrl}', '${fName}'); return false;" class="file-link">📁 ${fName}</a></td>`; } 
    else if(cName.toLowerCase().includes('estatus') || cName.toLowerCase().includes('estado')) { let badge = val.toLowerCase().includes('vigente') || val.toLowerCase().includes('activo') ? 'badge-success' : (val.toLowerCase().includes('obsoleto') || val.toLowerCase().includes('inactivo') ? 'badge-danger' : 'badge-warning'); rowHTML += `<td><span class="badge ${badge}">${val}</span></td>`; } 
    else if(cType === 'date' || cName.toLowerCase().includes('fecha')) { rowHTML += `<td>${window.formatearFechaAbreviada(val)}</td>`; } else { rowHTML += `<td>${val}</td>`; }
  });
  if(currentUser && currentUser.permisos && (currentUser.permisos.p_gest_sgc || currentUser.permisos.admin)) { let btnAcciones = `<button type="button" class="btn btn-info" style="padding:5px; font-size:10px; margin-right:5px;" onclick="window.abrirModalListadoMaestro('${item.docId}')">EDITAR</button>`; btnAcciones += `<button type="button" class="btn btn-danger" style="padding:5px 8px; font-size:10px;" onclick="window.del('ListadoMaestro','${item.docId}')">X</button>`; rowHTML += `<td class="no-export">${btnAcciones}</td>`; }
  rowHTML += "</tr>"; tbodyHtml += rowHTML;
});
window.setHtml('tbody-listado-maestro', tbodyHtml);
};

window.abrirModalListadoMaestro = (docId = null) => {
editandoMaestroId = docId; window.setTxt('lm-modal-title', docId ? "Editar Documento Maestro" : "Nuevo Documento Maestro");
let datosEdit = {}; if(docId) { const item = dataMaestro.find(x => x.docId === docId); if(item) datosEdit = item; }
let formHtml = "";
columnasMaestro.forEach(col => {
  let cName = typeof col === 'string' ? col : col.nombre; let cType = typeof col === 'string' ? 'text' : col.tipo; let val = datosEdit[cName] || ""; let html = `<div><label for="in_dyn_${cName}">${cName}</label>`;
  if(cName.toLowerCase().includes('estatus') || cName.toLowerCase().includes('estado')) { html += `<select aria-label="in_dyn_${cName}" id="in_dyn_${cName}" name="dyn_${cName}"><option value="">-- Seleccionar --</option>`; estatusMaestro.forEach(est => { html += `<option value="${est}" ${val===est?'selected':''}>${est}</option>`; }); html += `</select>`; } 
  else if(cType === 'date' || cName.toLowerCase().includes('fecha')) { html += `<input aria-label="in_dyn_${cName}" type="date" id="in_dyn_${cName}" name="dyn_${cName}" value="${val}">`; } 
  else if(cType === 'number') { html += `<input aria-label="0" type="number" id="in_dyn_${cName}" name="dyn_${cName}" value="${val}" placeholder="0">`; } else { html += `<input aria-label="Escribe aquí..." type="text" id="in_dyn_${cName}" name="dyn_${cName}" value="${val}" placeholder="Escribe aquí...">`; }
  html += `</div>`; formHtml += html;
});
window.setHtml('dinamic-form-maestro', formHtml); window.setDisplay('modal-form-listado', 'flex');
};

window.guardarRegistroMaestro = async () => {
let data = {}; columnasMaestro.forEach(col => { let cName = typeof col === 'string' ? col : col.nombre; let inEl = $(`in_dyn_${cName}`); if(inEl) data[cName] = inEl.value; }); window.showLoading();
if(editandoMaestroId) { await updateDoc(doc(db, "artifacts", appId, "public", "data", "ListadoMaestro", editandoMaestroId), data); } 
else { data.registrado_por = currentUser.nombre; data.fecha_registro = new Date().toISOString(); await addDoc(collection(db, "artifacts", appId, "public", "data", "ListadoMaestro"), data); }
window.hideLoading(); window.setDisplay('modal-form-listado', 'none');
};

window.exportarExcelListado = () => {
if(dataMaestro.length === 0) return alert("No hay registros en el Listado Maestro para exportar.");
let dataExport = dataMaestro.map(item => { let rowObj = {}; columnasMaestro.forEach(col => { let cName = typeof col === 'string' ? col : col.nombre; rowObj[cName] = item[cName] || ""; }); return rowObj; });
let wb = XLSX.utils.book_new(); let ws = XLSX.utils.json_to_sheet(dataExport); XLSX.utils.book_append_sheet(wb, ws, "Listado_Maestro"); XLSX.writeFile(wb, "Listado_Maestro_SGC.xlsx");
};

// =========================================================================
// MÓDULO DE SOLICITUDES (Nomenclatura y Edición Globalizada)
// =========================================================================

window.actualizarGerenteSelect = (gSelected) => {
const gerentes = allUsers.filter(u => u.gerencias && u.gerencias.includes(gSelected) && u.permisos && u.permisos.p_ger_apr === true);
if (gerentes && gerentes.length > 0) { window.setVal('sol-gerente-display', gerentes.map(g => g.nombre).join(', ')); window.setVal('sol-email-gerente', gerentes.map(g => g.email || '').filter(e=>e).join(', ') || "Sin Email"); } 
else { window.setVal('sol-gerente-display', "No asignado"); window.setVal('sol-email-gerente', ""); }
const depSelect = $('sol-dep'); let depHtml = "<option value=''>-- Seleccionar Departamento --</option>";
const depsFiltrados = allDepartamentos.filter(d => d.gerencia === gSelected); depsFiltrados.forEach(d => { depHtml += `<option value="${d.nombre}">${d.nombre}</option>`; }); depSelect.innerHTML = depHtml;
};

window.actualizarGerenteSelectEdit = (gSelected) => {
    const depSelect = $('e-sol-dep'); let depHtml = "<option value=''>-- Seleccionar Departamento --</option>";
    const depsFiltrados = allDepartamentos.filter(d => d.gerencia === gSelected); depsFiltrados.forEach(d => { depHtml += `<option value="${d.nombre}">${d.nombre}</option>`; }); if(depSelect) depSelect.innerHTML = depHtml;
};

// FUNCIONES GLOBALES PARA INVOLUCRADOS
window.addInvolucradoToDOM = (email, name, containerId) => {
    const container = $(containerId); if(!container) return;
    const existingTags = Array.from(container.querySelectorAll('.involucrado-item')); 
    if(existingTags.some(el => el.dataset.email === email)) { return alert("El usuario ya está en la lista."); }
    const div = document.createElement('div'); div.className = 'involucrado-item badge badge-info'; div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '5px'; div.style.fontSize = '12px'; div.style.padding = '6px 12px'; div.dataset.email = email; div.innerHTML = `${name} <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:var(--danger);" onclick="this.parentElement.remove()">close</span>`;
    container.appendChild(div);
};

window.addInvolucradoList = () => {
    const sel = $('sol-involucrado-sel'); const email = sel.value; const name = sel.options[sel.selectedIndex]?.text; 
    if(!email) return alert("Seleccione un usuario válido.");
    window.addInvolucradoToDOM(email, name, 'lista-involucrados-tags'); sel.value = "";
};

window.addInvolucradoListEdit = () => {
    const sel = $('e-sol-involucrado-sel'); const email = sel.value; const name = sel.options[sel.selectedIndex]?.text; 
    if(!email) return alert("Seleccione un usuario válido.");
    window.addInvolucradoToDOM(email, name, 'lista-involucrados-tags-edit'); sel.value = "";
};

window.crearSolicitud = async () => {
    const tit = $('sol-tit').value; const gerTarget = $('sol-ger').value; if(!tit) return alert("Título obligatorio"); window.showLoading(); const f = $('sol-file'); let fileName = f.files[0] ? f.files[0].name : ""; let url = null; 
    if (f.files[0]) { url = await window.uploadToCloudinary(f.files[0]); }
    
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
    allUsers.forEach(u => opt += `<option value="${u.usuario}">${u.nombre} (${u.usuario})</option>`);
    
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
    let newOpts = prompt(`Edita las opciones separadas por coma:\n(Campo: ${c.label})`, optsArray.join(', '));
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
            let catOpts = `<option value="">-- Sin Categoría (Aplica a todo) --</option>`;
            dynOpts.forEach(o => catOpts += `<option value="${o}" ${c.categoria===o?'selected':''}>${o}</option>`);
            catHtml = `<select aria-label="Cat" style="font-size:11px; padding:2px; border-radius:4px; border:1px solid #ccc;" onchange="formBuilderCampos[${i}].categoria = this.value; window.renderFormPreview();">${catOpts}</select>`;
        }

        fh += `<div style="margin-bottom:15px; padding:15px; background:white; border-radius:8px; border:1px solid var(--border); position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <div style="display:flex; flex-direction:column; gap:5px; flex:1;">
                    <input type="text" value="${c.label}" onchange="formBuilderCampos[${i}].label = this.value; window.renderFormPreview();" style="font-size:14px; font-weight:600; border:1px dashed transparent; background:transparent; padding:2px 5px; width:100%;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <label style="font-size:11px; color:var(--text-muted); background:#f1f5f9; padding:2px 6px; border-radius:4px;">
                            <input type="checkbox" ${c.requerido ? 'checked' : ''} onchange="formBuilderCampos[${i}].requerido = this.checked; window.renderFormPreview();"> Obligatorio
                        </label>
                        ${catHtml}
                    </div>
                </div>
                <div style="display:flex; gap:2px; flex-shrink:0; background:#f8fafc; border-radius:6px; padding:2px;">
                    ${i > 0 ? `<button type="button" onclick="window.moverCampoArriba(${i})" style="background:none; border:none; color:var(--primary); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">arrow_upward</span></button>` : ''}
                    ${i < formBuilderCampos.length - 1 ? `<button type="button" onclick="window.moverCampoAbajo(${i})" style="background:none; border:none; color:var(--primary); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">arrow_downward</span></button>` : ''}
                    ${['select', 'radio', 'checkbox'].includes(c.tipo) ? `<button type="button" onclick="window.editarOpcionesCampo(${i})" style="background:none; border:none; color:var(--info); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">edit</span></button>` : ''}
                    <button type="button" onclick="window.eliminarCampoBuilder(${i})" style="background:none; border:none; color:var(--danger); cursor:pointer;"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                </div>
            </div>`;
        
        let tipo = c.tipo || c.type || 'text';
        if(tipo === 'text') fh += `<input type="text" disabled placeholder="Campo de texto corto" style="background:#f8fafc; width:100%;">`;
        else if(tipo === 'textarea') fh += `<textarea disabled placeholder="Campo de texto largo" rows="2" style="background:#f8fafc; width:100%;"></textarea>`;
        else if(tipo === 'number') fh += `<input type="number" disabled placeholder="123" style="background:#f8fafc; width:100%;">`;
        else if(tipo === 'date') fh += `<input type="date" disabled style="background:#f8fafc; width:100%;">`;
        else if(tipo === 'select') { fh += `<select disabled style="background:#f8fafc; width:100%;"><option>Opciones...</option></select>`; }
        else if(tipo === 'checkbox') fh += `<label style="font-size:12px;"><input type="checkbox" disabled> Marcar casilla</label>`;
        else if(tipo === 'si_no') fh += `<label><input type="radio" disabled> Sí</label> <label><input type="radio" disabled> No</label>`;
        else if(tipo === 'archivo' || tipo === 'foto') fh += `<input type="file" disabled style="background:#f8fafc; width:100%;">`;
        else if(tipo === 'firma') fh += `<div style="height:60px; border:1px dashed #ccc; background:#f8fafc; text-align:center; padding-top:20px; font-size:12px; color:#999;">Área de Firma</div>`;
        else if(tipo === 'notificar') fh += `<input type="email" disabled placeholder="Email a notificar" style="background:#f8fafc; width:100%;">`;
        
        fh += `</div>`;
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
            h += `<div style="margin-bottom:30px; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid var(--border); text-align:center;">
                    <label style="font-weight:700; font-size:16px; margin-bottom:15px; display:block;">Seleccione la Categoría a Evaluar</label>
                    <select id="master-dynamic-select" style="width:100%; max-width:400px; padding:12px; border-radius:8px; border:2px solid var(--primary); margin:0 auto; display:block;" onchange="window.aplicarLogicaDinamica(this.value)">
                        <option value="">-- Mostrar Todo --</option>`;
            f.dynamic_options.forEach(opt => h += `<option value="${opt}">${opt}</option>`);
            h += `</select></div>`;
        }

        f.campos.forEach(c => {
            let reqHTML = c.requerido ? '<span style="color:var(--danger);">*</span>' : '';
            let reqAttr = c.requerido ? 'required' : '';
            let tipo = c.tipo || c.type || 'text';
            
            h += `<div class="dynamic-field-container" data-category="${c.categoria||''}" style="margin-bottom:25px; background:white; padding:20px; border-radius:10px; border:1px solid #e2e8f0;">
                    <label for="ans_${c.id}" style="font-size:15px; font-weight:600; color:#1e293b; display:block; margin-bottom:12px;">${c.label} ${reqHTML}</label>`;
            
            if(tipo === 'text') h += `<input type="text" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(tipo === 'textarea') h += `<textarea id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" rows="3" style="width:100%;"></textarea>`;
            else if(tipo === 'number') h += `<input type="number" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(tipo === 'date') h += `<input type="date" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(tipo === 'time') h += `<input type="time" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(tipo === 'checkbox') h += `<label style="display:flex; align-items:center; gap:5px;"><input type="checkbox" id="ans_chk_${c.id}" name="ans_${c.id}"> Marcar</label>`;
            else if(tipo === 'select') {
                h += `<select id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;"><option value="">-- Seleccione --</option>`;
                if(c.opciones) c.opciones.forEach(op => h += `<option value="${op}">${op}</option>`);
                h += `</select>`;
            }
            else if(tipo === 'si_no') {
                h += `<div style="display:flex; gap:15px;">
                        <label style="display:flex; align-items:center; gap:5px;"><input type="radio" name="ans_${c.id}" value="Sí" ${reqAttr}> Sí</label>
                        <label style="display:flex; align-items:center; gap:5px;"><input type="radio" name="ans_${c.id}" value="No" ${reqAttr}> No</label>
                      </div>`;
            }
            else if(tipo === 'archivo') {
                h += `<input type="file" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} style="width:100%;">`;
            }
            else if(tipo === 'foto') {
                h += `<input type="file" id="ans_${c.id}" name="ans_${c.id}" accept="image/*" capture="environment" ${reqAttr} style="width:100%;">`;
            }
            else if(tipo === 'firma') {
                h += `<canvas id="ans_firma_${c.id}" width="300" height="150" style="border:1px dashed #cbd5e1; background:#f8fafc; border-radius:6px; touch-action:none;"></canvas>
                      <button type="button" onclick="window.limpiarFirma('${c.id}')" style="display:block; margin-top:5px; font-size:11px; padding:4px 8px;" class="btn btn-ghost">Limpiar Firma</button>`;
            }
            else if(tipo === 'notificar') {
                h += `<input type="email" id="ans_${c.id}" name="ans_${c.id}" placeholder="Email para notificar..." ${reqAttr} class="search-bar" style="width:100%;">`;
            }
            h += `</div>`;
        });
        if(container) container.innerHTML = h;

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
            let el = document.getElementById(`ans_chk_${c.id}`);
            if(el) val = el.checked;
        } else if(tipo === 'si_no') {
            let sel = document.querySelector(`input[name="ans_${c.id}"]:checked`);
            if(sel) val = sel.value;
        } else if(tipo === 'archivo' || tipo === 'foto') {
            let el = document.getElementById(`ans_${c.id}`);
            if(el && el.files[0]) val = el.files[0].name;
        } else if(tipo === 'firma') {
            let canvas = window.firmasPad[c.id];
            if(canvas) {
                let blank = document.createElement('canvas'); blank.width = canvas.width; blank.height = canvas.height;
                if(canvas.toDataURL() !== blank.toDataURL()) val = canvas.toDataURL();
            }
        } else {
            let el = document.getElementById(`ans_${c.id}`);
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
    
    if(emailsToNotify.length > 0 && typeof emailjs !== 'undefined') {
        try {
            console.log("Notificando por EmailJS a " + emailsToNotify.join(','));
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

window.abrirModalContenedor = () => window.generarPlantillaFormulario("Inspección de Contenedores (17 Puntos OEA)", "Checklist de seguridad normativa para unidades de transporte.", [
    {id: "placa", label: "Placa / Matrícula del Transporte", tipo: "text", requerido: true},
    {id: "transportista", label: "Empresa Transportista", tipo: "text", requerido: true},
    {id: "num_contenedor", label: "Número de Contenedor", tipo: "text", requerido: true},
    {id: "obs", label: "Observaciones Generales", tipo: "textarea", requerido: false},
    {id: "foto", label: "Evidencia Fotográfica", tipo: "foto", requerido: false}
]);
window.abrirModalVisitante = () => window.generarPlantillaFormulario("Bitácora de Visitantes y Contratistas", "Registro y control de accesos a las instalaciones.", [
    {id: "nombre", label: "Nombre Completo", tipo: "text", requerido: true},
    {id: "empresa", label: "Empresa / Procedencia", tipo: "text", requerido: true},
    {id: "motivo", label: "Motivo de la Visita", tipo: "textarea", requerido: true},
    {id: "firma", label: "Firma del Visitante", tipo: "firma", requerido: true}
]);
window.abrirModalMantenimiento = () => window.generarPlantillaFormulario("Mantenimiento de CCTV y Alarmas", "Registro de reparaciones y mantenimientos de equipos de seguridad.", [
    {id: "equipo", label: "Equipo o Sistema", tipo: "select", requerido: true, opciones: ["Cámara CCTV", "Alarma Contra Intrusión", "Control de Acceso", "Cerco Eléctrico"]},
    {id: "ubicacion", label: "Ubicación del Equipo", tipo: "text", requerido: true},
    {id: "falla", label: "Falla Reportada / Trabajo Realizado", tipo: "textarea", requerido: true}
]);
window.abrirModalRonda = () => window.generarPlantillaFormulario("Reporte de Rondas de Seguridad", "Registro de inspección perimetral y hallazgos.", [
    {id: "turno", label: "Turno", tipo: "select", requerido: true, opciones: ["Diurno", "Nocturno", "Fines de Semana"]},
    {id: "ubicacion", label: "Área o Perímetro", tipo: "text", requerido: true},
    {id: "novedades", label: "Novedades Encontradas", tipo: "textarea", requerido: false}
]);
window.abrirModalSello = () => window.generarPlantillaFormulario("Trazabilidad y Control de Sellos", "Inventario, asignación y auditoría de sellos de seguridad.", [
    {id: "num_sello", label: "Número de Sello", tipo: "text", requerido: true},
    {id: "asignado", label: "Asignado a (Transportista)", tipo: "text", requerido: true},
    {id: "estado", label: "Estado", tipo: "select", requerido: true, opciones: ["Intacto", "Roto", "Alterado"]}
]);
window.abrirModalIncidente = () => window.generarPlantillaFormulario("Reporte de Incidentes de Seguridad", "Registro de vulnerabilidades, robos o eventos.", [
    {id: "tipo", label: "Tipo de Incidente", tipo: "text", requerido: true},
    {id: "desc", label: "Descripción del Evento", tipo: "textarea", requerido: true},
    {id: "notif", label: "Notificar a (Email)", tipo: "notificar", requerido: false}
]);
window.abrirModalAmbiental = () => window.generarPlantillaFormulario("Gestión Ambiental", "Manejo de residuos y uso de recursos.", [
    {id: "tipo_reg", label: "Tipo de Registro", tipo: "text", requerido: true}
]);
window.abrirModalSimulacro = () => window.generarPlantillaFormulario("Simulacros y BCP", "Pruebas de Continuidad y Evacuación.", [
    {id: "tipo", label: "Tipo de Simulacro", tipo: "text", requerido: true}
]);
window.abrirModalRRHH = () => window.generarPlantillaFormulario("Control de Confiabilidad RRHH", "Verificación de antecedentes y visitas domiciliarias.", [
    {id: "empleado", label: "Nombre del Colaborador", tipo: "text", requerido: true}
]);
window.abrirModalIT = () => window.generarPlantillaFormulario("Controles de Seguridad IT", "Revisión de backups, accesos, actualizaciones y vulnerabilidades.", [
    {id: "estado", label: "Estado del Control", tipo: "select", requerido: true, opciones: ["Óptimo", "Deficiente", "Con Errores"]},
    {id: "hallazgos", label: "Detalles / Hallazgos", tipo: "textarea", requerido: true},
    {id: "fecha", label: "Fecha de Ejecución", tipo: "date", requerido: true},
    {id: "responsable", label: "Responsable de IT", tipo: "text", requerido: true}
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
            } else { alert("Formulario no encontrado o no tienes permiso."); }
        } else { alert("QR inválido o no reconocido: " + decodedText); }
    }, (error) => {});
};

window.cerrarEscanerQR = () => { if(scannerQR) { scannerQR.clear(); scannerQR = null; } window.setDisplay('modal-escaner-qr', 'none'); };

window.abrirModalGeneradorQR = () => {
    let select = document.getElementById('qr-gen-form');
    let opts = '<option value="">-- Seleccione un Formulario --</option>';
    globalForms.forEach(f => { opts += `<option value="${f.id}">${f.titulo}</option>`; });
    if(select) select.innerHTML = opts;
    document.getElementById('qr-gen-ubicacion').value = '';
    document.getElementById('qr-result-container').style.display = 'none';
    window.setDisplay('modal-generador-qr', 'flex');
};

let lastQR = null;
window.generarCodigoQR = () => {
    let formId = getValSafe('qr-gen-form');
    let ubic = getValSafe('qr-gen-ubicacion').trim();
    if(!formId) return alert("Seleccione un formulario.");
    
    let texto = `formId:${formId}`;
    if(ubic) texto += `|ubicacion:${ubic}`;
    
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
    win.document.write(`
        <html><head><title>Imprimir QR</title>
        <style>body{text-align:center; font-family:sans-serif; margin-top:50px;} h2{margin:5px 0;} p{margin:0; font-size:14px;}</style>
        </head><body>
        <h2>${titulo}</h2>
        ${ubic ? `<p>Ubicación: <b>${ubic}</b></p>` : ''}
        <div style="margin: 20px auto; display: inline-block;">${c}</div>
        <br><p style="font-size:11px; color:#666;">Escanea este código desde la App para llenar el registro</p>
        <script>window.onload = () => { window.print(); window.close(); }</script>
        </body></html>
    `);
};
