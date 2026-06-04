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
const appId = 'sgc-final-v6';

const EMAIL_SERVICE_ID = "service" + "_vum" + "xptj", 
  EMAIL_TEMPLATE_ID = "template" + "_z27" + "y5yk", 
  EMAIL_PUBLIC_KEY = "kWsovO" + "fdi7dB" + "qLMw2", 
  EMAIL_ADMIN_SGC = "sistemadegestion@fcipty.com"; 

try { if (typeof emailjs !== "undefined") { emailjs.init(EMAIL_PUBLIC_KEY); } } catch(e) { console.warn(e); }

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

window.toggleDarkMode = () => {
    const body = document.body; body.classList.toggle('dark-theme'); const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('sgc_dark_mode', isDark);
    const icon = $('dark-mode-icon'); const text = $('dark-mode-text');
    if (icon && text) { icon.innerText = isDark ? 'light_mode' : 'dark_mode'; text.innerText = isDark ? 'Claro' : 'Descanso'; }
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
    
    if (typeof emailjs === "undefined") {
        console.error("[EmailJS] Error: La librería emailjs no está cargada o inicializada.");
        return false;
    }

    if (!dest || (!dest.to && !dest.cc)) {
        console.warn("[EmailJS] Cancelado: No hay destinatarios válidos (to / cc).");
        return false;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let cleanTo = dest.to ? dest.to.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";
    let cleanCc = dest.cc ? dest.cc.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";

    if (!cleanTo && !cleanCc) {
        console.warn("[EmailJS] Cancelado: Los correos proporcionados no tienen un formato válido.");
        return false;
    }

    let senderName = "Sistema SGC";
    if (typeof currentUser !== "undefined" && currentUser && currentUser.nombre) {
        senderName = currentUser.nombre;
    }

    let params = { 
        subject: sub || "Notificación SGC", 
        message: msg || "",
        name: senderName,
        to_email: cleanTo || "",
        cc_email: cleanCc || ""
    }; 
    
    console.log("[EmailJS] Parámetros a enviar:", params);

    try {
        const response = await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, params);
        console.log("[EmailJS] Éxito:", response.status, response.text);
        return true;
    } catch (e) {
        console.error("[EmailJS] FAILED. Error al enviar el correo:", e);
        return false;
    }
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
    
    window.setDisplay('heatmap-details-panel', 'block');
    let titleEl = $('heatmap-details-title');
    if(titleEl) {
        titleEl.innerHTML = `<span class="material-icons-round" style="color:${color}">zoom_in</span> Riesgos en Cuadrante (Prob: ${p} x Imp: ${i} = Severidad ${sev})`;
        titleEl.style.color = color;
    }

    let trs = '';
    risks.forEach(r => { trs += `<tr><td style="padding:10px; border-bottom:1px solid #e2e8f0;"><b>${r.rsk_id}</b></td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">${r.proceso}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0;">${r.amenaza}</td><td style="padding:10px; border-bottom:1px solid #e2e8f0; color:var(--primary); font-weight:600;">${r.accion_mitigacion}</td></tr>`; });
    window.setHtml('tbody-heatmap-details', trs);
    $('heatmap-details-panel').scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    let dp = [], gr = []; if(sn.exists()) { const d = sn.data(); dp = d.departamentos || []; gr = d.gerencias || []; } allDepartamentos = dp;
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
  window.setTxt('curr-name', currentUser.nombre || 'Usuario'); window.setTxt('curr-ger', currentUser.gerencias ? currentUser.gerencias.join(', ') : (currentUser.gerencia || 'Sin Gerencia'));

  const p = currentUser.permisos || {}; const isAdm = p.admin || false;
  const canDash = isAdm || p.p_gest_sgc || p.p_paso1 || p.p_paso2 || p.p_paso4;
  window.setDisplay('nav-dash', canDash ? 'flex' : 'none'); window.setDisplay('nav-forms', (isAdm || p.p_gest_sgc) ? 'flex' : 'none'); window.setDisplay('nav-hist', (p.p_ver_propias || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-all', (p.p_ver_todas || p.p_ver_ger || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-crear', (p.can_solicit || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-gest', (p.p_gest_sgc || p.p_ger_apr || p.p_paso1 || p.p_paso2 || p.p_paso4 || p.p_eval_solicitud || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-listado', (p.p_ver_listado || isAdm) ? 'flex' : 'none');
  window.setDisplay('nav-admin-group', (isAdm || p.p_users || p.p_struct) ? 'block' : 'none');

  
  const canAud = p.p_audit_ver || p.p_audit_admin || p.p_audit_auditor || p.p_audit_dueno || isAdm; 
  window.setDisplay('nav-audit-group', canAud ? 'block' : 'none'); window.setDisplay('nav-norma', canAud ? 'flex' : 'none'); window.setDisplay('nav-audit', canAud ? 'flex' : 'none'); window.setDisplay('nav-noconf', (p.p_audit_admin || p.p_gest_sgc || p.p_audit_auditor || p.p_audit_dueno || isAdm) ? 'flex' : 'none');
  
  const canOea = p.p_proveedores || p.p_riesgos || isAdm || p.p_gest_sgc || p.p_audit_admin;
  window.setDisplay('nav-oea-group', canOea ? 'block' : 'none');
  window.setDisplay('nav-proveedores', (p.p_proveedores || isAdm || p.p_gest_sgc) ? 'flex' : 'none');
  window.setDisplay('nav-riesgos', (p.p_riesgos || isAdm || p.p_gest_sgc) ? 'flex' : 'none');

  const canRoot = p.p_users || p.p_struct || isAdm; 
  window.setDisplay('admin-only', canRoot ? 'block' : 'none'); window.setDisplay('nav-users', (p.p_users || isAdm) ? 'flex' : 'none'); window.setDisplay('nav-struct', (p.p_struct || isAdm) ? 'flex' : 'none');
  
  let isAdAud = p.p_audit_admin || p.p_gest_sgc || isAdm;
  window.setDisplay('btn-config-plan', isAdAud ? 'inline-flex' : 'none'); window.setDisplay('btn-nueva-aud', isAdAud ? 'inline-flex' : 'none');
  
  window.cargarDatosCentrales();
  if (p.p_gest_sgc || isAdm) window.cambiarVista('sec-all', $('nav-all')); else if (p.can_solicit) window.cambiarVista('sec-crear', $('nav-crear')); else if (p.p_ver_propias) window.cambiarVista('sec-hist', $('nav-hist')); else window.cambiarVista('sec-dash', $('nav-dash'));
};

window.logout = () => { localStorage.removeItem('sgc_session_user'); currentUser = null; window.setDisplay('sidebar', 'none'); window.setDisplay('main', 'none'); window.setDisplay('login-screen', 'flex'); window.setVal('login-user', ''); window.setVal('login-pass', ''); };

window.iniciarSesion = async () => {
  const u = $('login-user').value.toLowerCase().trim(); const p = $('login-pass').value.trim();
  if (!u || !p) return alert("Por favor, ingresa tu usuario y contraseña."); window.showLoading();
  try {
    console.log("Iniciando sesión con usuario:", u);
    const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("usuario", "==", u), where("pass", "==", p)));
    if(!qs.empty) { 
        console.log("Usuario encontrado. Autenticación exitosa.");
        localStorage.setItem('sgc_session_user', u); currentUser = qs.docs[0].data(); window.completarLoginUI(); 
    } else {
        console.warn("Credenciales incorrectas.");
        alert("Credenciales incorrectas.");
    }
  } catch (error) { 
      console.error("Error al iniciar sesión:", error);
      alert("Error de red."); 
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
  if($('oea-manual-link')) $('oea-manual-link').innerHTML = manualOEA.url ? `<a href="#" onclick="window.abrirDocumento('${manualOEA.url}', '${manualOEA.nombre}'); return false;" class="btn btn-info" style="font-size:14px; text-decoration:none;"><span class="material-icons-round" style="font-size:16px; margin-right:5px;">visibility</span> Ver ${manualOEA.nombre}</a>` : "No hay manual subido.";
  window.setDisplay('oea-manual-upload-box', isAdm ? 'flex' : 'none'); window.setDisplay('oea-req-upload-box', isAdm ? 'flex' : 'none');
  
  if($('oea-req-list-container')) {
      $('oea-req-list-container').innerHTML = requisitosOEA.map((r, idx) => {
          let nom = typeof r === 'string' ? r : r.nombre; let desc = typeof r === 'string' ? '' : (r.descripcion || '');
          return `<div class="settings-item" style="flex-direction:column; align-items:flex-start; cursor:pointer;" onclick="window.abrirPuntoOEA(${idx})">
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                  <span style="font-weight:700; color:var(--primary);"><span class="material-icons-round" style="font-size:14px; vertical-align:middle; margin-right:5px;">touch_app</span> ${nom}</span>
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
  if(link && manualOEA.url) { if(confirm(msg + `¿Abrir el manual de referencia (Ref: ${link})?`)) { let url = manualOEA.url; if(!isNaN(link)) url += `#page=${link}`; else if(link.startsWith('http')) url = link; window.open(url, '_blank'); }
  } else { alert(msg + "(No hay enlace directo configurado para este punto)."); }
};

window.subirManualOEA = async () => { const f = $('oea-file').files[0]; if(!f) return alert("Selecciona el documento."); window.showLoading(); let url = await window.uploadToCloudinary(f); if(!url) { window.hideLoading(); return alert("Error al subir."); } await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "NormaOEA"), { manual_url: url, manual_nombre: f.name }, {merge: true}); window.setVal('oea-file', ''); window.hideLoading(); alert("Manual Oficial actualizado."); };
window.agregarRequisitoOEA = async () => { const n = $('oea-req-input').value.trim(); const d = $('oea-req-desc').value.trim(); const l = $('oea-req-link').value.trim(); if(!n) return alert("El nombre del punto es obligatorio."); if(requisitosOEA.some(r => (typeof r === 'string' ? r : r.nombre) === n)) return alert("Ese requisito ya está en la lista."); requisitosOEA.push({ nombre: n, descripcion: d, link: l }); await setDoc(doc(db, "artifacts", appId, "public", "data", "Configuracion", "NormaOEA"), { requisitos: requisitosOEA }, {merge: true}); window.setVal('oea-req-input', ''); window.setVal('oea-req-desc', ''); window.setVal('oea-req-link', ''); };
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
    if (f.files[0]) { url = await window.uploadToCloudinary(f.files[0]); if (!url) { window.hideLoading(); return alert("Error al subir archivo."); } }
    
    let extraEmails = []; $$('#lista-involucrados-tags .involucrado-item').forEach(el => { if(el.dataset.email) extraEmails.push(el.dataset.email.toLowerCase()); });

    const fci = await window.getNextFCI(); const gerenteEmailVisible = $('sol-email-gerente').value; const now = new Date().toISOString();
    const data = { customId: fci, titulo: tit, accion: $('sol-accion').value, tipoDoc: $('sol-tipo-doc').value, prioridad: $('sol-prioridad').value, gerencia: gerTarget, departamento: $('sol-dep').value, motivo: $('sol-motivo').value, cod_ref: $('sol-cod-prev').value, ver_ref: $('sol-ver-prev').value, fecha_ref: $('sol-fecha-prev').value, solicitante: currentUser.nombre, solicitante_email: currentUser.email, uid: currentUser.usuario, involucrados: extraEmails, idx: -1, estado: "Pendiente Evaluación", fase_eval_ini: now, adjunto: url, adjunto_nombre: fileName, chat: [{u: "SISTEMA", m: "Solicitud creada exitosamente.", t: new Date().toLocaleString()}], fecha: now };
    
    console.log("Creando solicitud en la base de datos:", data);
    await addDoc(collection(db, "artifacts", appId, "public", "data", "Solicitudes"), data); 
    console.log("Solicitud enviada (guardada exitosamente).");

    if($('form-crear-solicitud')) $('form-crear-solicitud').reset();
    window.setHtml('lista-involucrados-tags', ""); window.setVal('sol-gerente-display', ''); window.setVal('sol-email-gerente', ''); $('sol-dep').innerHTML = '<option value="">-- Seleccione Gerencia Primero --</option>';

    const toEmails = new Set([EMAIL_ADMIN_SGC, currentUser.email, ...extraEmails]); const destinatarios = { to: Array.from(toEmails).join(','), cc: gerenteEmailVisible }; 
    let msgMail = `
    <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background: #1e40af; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">NUEVA SOLICITUD SGC</h2>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
            <p>El usuario <b>${currentUser.nombre}</b> ha registrado una nueva solicitud.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
                <b>ID Sistema:</b> ${fci}<br>
                <b>Título:</b> ${tit}<br>
                <b>Prioridad:</b> ${data.prioridad}<br>
                <b>Acción Requerida:</b> ${data.accion}<br>
                <b>Gerencia:</b> ${gerTarget}<br>
            </div>
            <p style="margin: 0;">Por favor, ingrese al Sistema de Gestión para revisarla.</p>
        </div>
    </div>`;
    window.sendNotification(destinatarios, `Nueva Solicitud Creada: ${fci}`, msgMail);
    window.hideLoading(); alert("Solicitud Creada: " + fci); window.cambiarVista('sec-hist', $('nav-hist'));
};
window.abrirEvalModal = () => {
    let opts = '<option value="">-- No Asignar (Cualquier gestor) --</option>';
    allUsers.forEach(u => { opts += `<option value="${u.email}">${u.nombre} (${u.email})</option>`; });
    window.setHtml('eval-asig-p1', opts); window.setHtml('eval-asig-p2', opts); window.setHtml('eval-asig-p4', opts);
    let pr = String(selectedDocData.prioridad || "Baja").toLowerCase();
    window.setVal('eval-sla-dias', slaConfigDias[pr] || 7);
    window.setVal('eval-motivo', '');
    document.querySelector('input[name="eval_decision"][value="valida"]').checked = true;
    window.toggleEvalDecision();
    window.setDisplay('modal-eval-sol', 'flex');
};
window.toggleEvalDecision = () => {
    let d = document.querySelector('input[name="eval_decision"]:checked').value;
    window.setDisplay('eval-valida-panel', d === 'valida' ? 'block' : 'none');
    window.setDisplay('eval-invalida-panel', d === 'invalida' ? 'block' : 'none');
};
window.guardarEvaluacion = async () => {
    let d = document.querySelector('input[name="eval_decision"]:checked').value; const now = new Date().toISOString();
    window.showLoading();
    if(d === 'invalida') {
        let mot = $('eval-motivo').value.trim(); if(!mot) { window.hideLoading(); return alert("Motivo obligatorio."); }
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { estado: 'Anulado', motivo_anulacion: mot, fecha_anulacion: now, chat: arrayUnion({u: currentUser.nombre, m: `❌ SOLICITUD ANULADA EN EVALUACIÓN: ${mot}`, t: new Date().toLocaleString()}) });
    } else {
        let p1 = $('eval-asig-p1').value, p2 = $('eval-asig-p2').value, p4 = $('eval-asig-p4').value;
        let dias = parseInt($('eval-sla-dias').value) || 0; let dObj = new Date(); dObj.setDate(dObj.getDate() + dias);
        let fSLA = dObj.toISOString().split('T')[0];
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { idx: 0, estado: PASOS_NOMBRES[0], fase_eval_fin: now, fase_0_ini: now, sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1: p1, asig_paso2: p2, asig_paso4: p4, chat: arrayUnion({u: currentUser.nombre, m: `✅ EVALUACIÓN APROBADA. SLA Fijado para: ${fSLA}.`, t: new Date().toLocaleString()}) });
    }
    window.hideLoading(); window.setDisplay('modal-eval-sol', 'none'); window.verDetalle(selectedId);
};
window.firmarPaso = async () => {
const s = selectedDocData; const nIdx = s.idx + 1; const nEst = nIdx < 4 ? PASOS_NOMBRES[nIdx] : "Aprobado Final"; const faseAprobada = s.idx === -1 ? 'Evaluación' : PASOS_NOMBRES[s.idx]; const now = new Date().toISOString();
let updates = { idx: nIdx, estado: nEst, [`fase_${s.idx}_fin`]: now, [`fase_${nIdx}_ini`]: now, chat: arrayUnion({u: currentUser.nombre, m: `✅ FASE COMPLETADA: ${faseAprobada}`, t: new Date().toLocaleString()}) };
await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), updates);
const dest = await window.getDatosEnvio(s); 
let msgMail = `
<div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="background: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">AVANCE DE SOLICITUD</h2>
    </div>
    <div style="padding: 20px; line-height: 1.6;">
        <p>La solicitud <b>${s.customId}</b> ha sido aprobada y avanzó de etapa.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
            <b>Título:</b> ${s.titulo}<br>
            <b>Nueva Etapa:</b> ${nEst}<br>
            <b>Aprobado por:</b> ${currentUser.nombre}<br>
        </div>
        <p style="margin: 0;">Ingrese al Sistema de Gestión para continuar el flujo.</p>
    </div>
</div>`;
window.sendNotification(dest, `Avance SGC: ${s.customId}`, msgMail); window.closeModal();
};

window.gestionar = (accion) => {
    tempAction = accion;
    window.setDisplay('m-input-area', 'block');
    window.setHtml('m-extra-input', '');
    window.setVal('m-file-gestion', '');
    if (accion === 'Reunión' || accion === 'Reunin') {
        window.setDisplay('reunion-container', 'block');
    } else {
        window.setDisplay('reunion-container', 'none');
    }
};

window.responderSolicitante = () => {
    tempAction = 'Respuesta Solicitante';
    window.setDisplay('m-input-area', 'block');
    window.setHtml('m-extra-input', '');
    window.setVal('m-file-gestion', '');
    window.setDisplay('reunion-container', 'none');
};

window.guardarSLA = async () => {
    const slaDate = getValSafe('m-sla-date');
    if (!slaDate) {
        alert("Por favor seleccione una fecha límite (SLA) válida.");
        return;
    }
    if (!selectedId) return;
    
    window.showLoading();
    try {
        let history = selectedDocData?.history || [];
        history.push(`[${new Date().toLocaleString()}] SLA establecido para el ${slaDate} por ${currentUser.nombre}`);
        
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), {
            sla: slaDate,
            history: history,
            chat: arrayUnion({u: currentUser.nombre, m: `📅 <b>SLA ACTUALIZADO</b><br>Nueva fecha límite: ${slaDate}`, t: new Date().toLocaleString()}),
            updatedAt: new Date().toISOString()
        });
        
        alert(`SLA guardado exitosamente para el ${slaDate}.`);
    } catch (e) {
        console.error(e);
        alert("Error al guardar SLA.");
    }
    window.hideLoading();
};

window.rechazar = async () => {
    const motivo = prompt("Motivo de rechazo:");
    if(!motivo) return;
    window.showLoading();
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { 
        estado: "Rechazado", 
        chat: arrayUnion({u: currentUser.nombre, m: `❌ <b>SOLICITUD RECHAZADA</b><br>Motivo: ${motivo}`, t: new Date().toLocaleString()}) 
    });
    window.hideLoading();
    window.closeModal();
};

window.reabrirSolicitud = async () => {
    if(!selectedDocData || !confirm("¿Está seguro de que desea REABRIR esta solicitud? Volverá al primer paso (Documentado).")) return;
    window.showLoading();
    try {
        const obs = prompt("Ingrese el motivo de la reapertura:") || "Reabierta por administrador SGC.";
        const docRef = doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedDocData.id || selectedId);
        await updateDoc(docRef, {
            paso_actual: PASOS_NOMBRES[0],
            fase_activa: true,
            estado: "Reabierta",
            chat: arrayUnion({u: currentUser.nombre, m: `🔄 <b>SOLICITUD REABIERTA</b><br>Motivo: ${obs}`, t: new Date().toLocaleString()}),
            updatedAt: new Date().toISOString()
        });
        
        window.sendNotification(await window.getDatosEnvio(selectedDocData), `Solicitud Reabierta: ${selectedDocData.customId}`, `La solicitud ha sido reabierta. Motivo: ${obs}`);
        
        alert("Solicitud reabierta con éxito.");
        window.closeModal();
    } catch(e) {
        console.error(e);
        alert("Error al reabrir la solicitud.");
    }
    window.hideLoading();
};

window.devolverPaso = async () => {
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
        chat: arrayUnion({u: currentUser.nombre, m: `? <b>DEVUELTO A FASE ANTERIOR: ${nEst}</b><br>Motivo: ${motivo}`, t: new Date().toLocaleString()}) 
    });
    window.hideLoading();
    window.closeModal();
};

window.guardarCierreFinal = async () => {
const codFinal = $('m-final-cod').value; const ver = $('m-final-ver').value; const fecha = $('m-final-fecha').value; const com = $('m-final-comentario').value; const f = $('m-final-file');
let fileUrl = selectedDocData.documento_final || null; let fileName = selectedDocData.documento_final_nombre || null;
if(!ver || !fecha) return alert("Versión Final y Fecha son obligatorios."); 
if(f.files[0]) { window.showLoading(); fileUrl = await window.uploadToCloudinary(f.files[0]); if (!fileUrl) { window.hideLoading(); return alert("Error al subir."); } fileName = f.files[0].name; }
else if(!fileUrl) return alert("Debes subir el documento final oficial.");

window.showLoading(); const now = new Date().toISOString(); 
let chatPayload = {u: "SISTEMA (SGC)", m: `🏁 <b>SOLICITUD PUBLICADA / CERRADA.</b><br>Ver: ${ver}. Obs: ${com}`, t: new Date().toLocaleString(), archivo: fileUrl, archivo_nombre: fileName};
let updates = { estado: "Aprobado Final", codigo_final: codFinal, version_final: ver, fecha_final: fecha, comentario_final: com, documento_final: fileUrl, documento_final_nombre: fileName, chat: arrayUnion(chatPayload) };
if(selectedDocData.idx === 3) { updates.idx = 4; updates.fase_3_fin = now; updates.fase_4_ini = now; }

await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), updates);
let dataMaestro = { estatus: "Vigente", registrado_por: "Sistema (Automático)", fecha_registro: new Date().toISOString() };
columnasMaestro.forEach(c => { let cName = typeof c === 'string' ? c : c.nombre; let low = cName.toLowerCase(); if(low.includes('código') || low === 'codigo') dataMaestro[cName] = codFinal || selectedDocData.cod_ref || "POR_ASIGNAR"; else if(low.includes('gerencia')) dataMaestro[cName] = selectedDocData.gerencia; else if(low.includes('departamento')) dataMaestro[cName] = selectedDocData.departamento; else if(low.includes('tipo')) dataMaestro[cName] = selectedDocData.tipoDoc; else if(low.includes('nombre')) dataMaestro[cName] = selectedDocData.titulo; else if(low.includes('vers')) dataMaestro[cName] = ver; else if(low.includes('ubicaci') || low.includes('archivo') || low.includes('documento')) dataMaestro[cName] = fileUrl; else if(low.includes('fecha última') || low.includes('fecha ultima') || low === 'fecha') dataMaestro[cName] = fecha; });
await addDoc(collection(db, "artifacts", appId, "public", "data", "ListadoMaestro"), dataMaestro);

const dest = await window.getDatosEnvio(selectedDocData); 
let msgMail = `
<div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #bbf7d0; border-radius: 8px;">
    <div style="background: #059669; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">DOCUMENTO OFICIAL PUBLICADO</h2>
    </div>
    <div style="padding: 20px; line-height: 1.6;">
        <p>El documento ha sido finalizado y publicado oficialmente en el Listado Maestro.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px dashed #166534; margin-bottom: 15px;">
            <b>ID Solicitud:</b> ${selectedDocData.customId}<br>
            <b>Título:</b> ${selectedDocData.titulo}<br>
            <b>Código Oficial:</b> ${codFinal}<br>
            <b>Versión Oficial:</b> ${ver}<br>
            <b>Publicado por:</b> ${currentUser.nombre}<br>
        </div>
        <p style="margin: 0;">Ya puede consultar la versión oficial en el sistema.</p>
    </div>
</div>`;
window.sendNotification(dest, `✅ Documento Publicado: ${codFinal} (Ver. ${ver})`, msgMail); 
window.hideLoading(); window.closeModal();
};

window.anularSolicitud = async () => {
    if(!confirm("⚠️ ¿Estás seguro de anular esta solicitud?")) return; let motivo = prompt("Motivo de anulación:"); if(!motivo) return; window.showLoading();
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { estado: "Anulado", chat: arrayUnion({u: currentUser.nombre, m: `🚫 <b>SOLICITUD ANULADA</b><br>Motivo: ${motivo}`, t: new Date().toLocaleString()}) });
    const dest = await window.getDatosEnvio(selectedDocData); 
    let msgMail = `
    <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #fecaca; border-radius: 8px;">
        <div style="background: #dc2626; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">SOLICITUD ANULADA / RECHAZADA</h2>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
            <p>La solicitud <b>${selectedDocData.customId}</b> ha sido cancelada.</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px dashed #991b1b; margin-bottom: 15px; color: #7f1d1d;">
                <b>Cancelado por:</b> ${currentUser.nombre}<br>
                <b>Motivo de Cancelación:</b><br>${motivo}
            </div>
            <p style="margin: 0;">Este expediente ha sido cerrado sin publicación.</p>
        </div>
    </div>`;
    window.sendNotification(dest, `🚫 Cancelación SGC: ${selectedDocData.customId}`, msgMail); 
    window.hideLoading(); window.closeModal();
};

window.guardarGestion = async () => {
    const f = $('m-file-gestion'); let fileUrl=null, fileName=null;
    if(f.files[0]) { window.showLoading(); fileUrl = await window.uploadToCloudinary(f.files[0]); fileName = f.files[0].name; if(!fileUrl){ window.hideLoading(); return alert("Error de subida");} }
    
    const txtHTML = $('m-extra-input').innerHTML; const txtPlain = $('m-extra-input').innerText.trim();
    if(!txtPlain && !fileUrl) return alert("Escribe un detalle o adjunta un archivo."); window.showLoading();
    
    let payload = {u: currentUser.nombre, t: new Date().toLocaleString()};
    let emTitle = "", emBody = "";
    
    if(tempAction === 'Reunión') {
        const fR = $('m-date-meeting').value; if(!fR) {window.hideLoading(); return alert("Fecha y hora de reunión obligatoria.");}
        let dateFmt = new Date(fR).toLocaleString(); payload.fR = fR; payload.tema = txtPlain; payload.m = `📅 <b>REUNIÓN AGENDADA:</b> ${dateFmt}<br><b>Tema:</b><br>${txtHTML}`;
        emTitle = `📅 Reunión Agendada: ${selectedDocData.customId}`;
        emBody = `
        <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #bae6fd; border-radius: 8px;">
            <div style="background: #0ea5e9; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">REUNIÓN AGENDADA</h2>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p>Se ha agendado una reunión oficial para revisar el expediente <b>${selectedDocData.customId}</b>.</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border: 1px dashed #0284c7; margin-bottom: 15px;">
                    <b>Fecha y Hora:</b> ${dateFmt}<br>
                    <b>Expediente:</b> ${selectedDocData.customId} - ${selectedDocData.titulo}<br>
                    <b>Convocado por:</b> ${currentUser.nombre}<br><br>
                    <b>Temas a tratar / Detalles:</b><br>${txtHTML}
                </div>
                <p style="margin: 0;">Por favor, ingrese al sistema para confirmar su asistencia o agendarla en su calendario.</p>
            </div>
        </div>`;
    } else {
        payload.m = `🗣️ <b>${tempAction.toUpperCase()}:</b><br>${txtHTML}`; emTitle = `Nueva ${tempAction}: ${selectedDocData.customId}`;
        emBody = `
        <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #bae6fd; border-radius: 8px;">
            <div style="background: #0ea5e9; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">${tempAction.toUpperCase()} REGISTRADA</h2>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p><b>${currentUser.nombre}</b> ha registrado una nueva gestión en el expediente <b>${selectedDocData.customId}</b>.</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border: 1px dashed #0284c7; margin-bottom: 15px;">
                    ${txtHTML}
                </div>
                ${fileUrl ? `<p><i>📎 Adjunto: <b>${fileName}</b></i></p>` : ''}
                <p style="margin: 0;">Ingrese al sistema para responder o verificar.</p>
            </div>
        </div>`;
    }
    
    if(fileUrl) { payload.archivo = fileUrl; payload.archivo_nombre = fileName; }
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { chat: arrayUnion(payload) });
    const dest = await window.getDatosEnvio(selectedDocData); window.sendNotification(dest, emTitle, emBody);
    window.setDisplay('m-input-area', 'none'); window.setHtml('m-extra-input', ''); window.setVal('m-date-meeting', ''); $('m-file-gestion').value=''; window.hideLoading(); window.verDetalle(selectedId);
};

window.enviarComentarioLibre = async () => {
    const box = $('m-comentario-libre'); const txtHTML = box.innerHTML; const txtPlain = box.innerText.trim(); const f = $('m-file-comentario');
    if(!txtPlain && !f.files[0] && txtHTML.replace(/<[^>]*>?/gm, '').trim() === '') return alert("Escribe un mensaje o adjunta un archivo."); window.showLoading(); let fileUrl = null; let fileName = null;
    if (f.files[0]) { fileUrl = await window.uploadToCloudinary(f.files[0]); if (!fileUrl) { window.hideLoading(); return alert("Error de red."); } fileName = f.files[0].name; }
    let chatPayload = {u: currentUser.nombre, m: `💬 <b>Comentario Libre:</b><br>${txtHTML}`, t: new Date().toLocaleString()}; 
    if (fileUrl) { chatPayload.archivo = fileUrl; chatPayload.archivo_nombre = fileName; } 
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { chat: arrayUnion(chatPayload) });
    
    const dest = await window.getDatosEnvio(selectedDocData); 
    let msgMail = `
    <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background: #475569; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">NUEVO COMENTARIO</h2>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
            <p><b>${currentUser.nombre}</b> ha dejado un comentario en el expediente <b>${selectedDocData.customId}</b>:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-bottom: 15px;">
                ${txtHTML}
            </div>
            ${fileName ? `<p><i>📎 Archivo adjunto: <b>${fileName}</b></i></p>` : ''}
            <p style="margin: 0;">Revise la bitácora en el Sistema de Gestión.</p>
        </div>
    </div>`;
    window.sendNotification(dest, `Nuevo Comentario: ${selectedDocData.customId}`, msgMail);
    box.innerHTML = ""; f.value = ""; window.hideLoading(); window.closeModal();
};

window.verRespuestasFormulario = async (id) => {
    if(!currentUser.permisos || (!currentUser.permisos.admin && !currentUser.permisos.p_gest_sgc)) {
        return alert("Acceso denegado: La consulta de respuestas es exclusiva para Gestores SGC y Administradores.");
    }

    let f = globalForms.find(x => x.id === id);
    if(!f) return;

    $('vr-tit').innerText = f.titulo;
    $('vr-subtit').innerText = "Respuestas enviadas por los usuarios";

    window.showLoading();
    try {
        const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "FormulariosRespuestas"), where("id_formulario", "==", id)));
        
        let thead = $('vr-thead');
        let tbody = $('vr-tbody');
        
        // Build thead based on form fields
        let thHTML = `<tr><th style="padding:10px; border-bottom:1px solid var(--border);">Fecha</th><th style="padding:10px; border-bottom:1px solid var(--border);">Usuario</th>`;
        if(f.is_dynamic) thHTML += `<th style="padding:10px; border-bottom:1px solid var(--border); color:var(--info);">Categoría</th>`;
        if(f.is_eval) thHTML += `<th style="padding:10px; border-bottom:1px solid var(--border); color:var(--primary);">Puntaje</th>`;
        
        f.campos.forEach(c => {
            thHTML += `<th style="padding:10px; border-bottom:1px solid var(--border);">${c.label}</th>`;
        });
        thHTML += `<th style="padding:10px; border-bottom:1px solid var(--border);">Acción</th></tr>`;
        thead.innerHTML = thHTML;
        window.currentRespuestasFormId = id;

        // Build tbody
        let tbHTML = '';
        let docsData = [];
        if(qs.empty) {
            tbHTML = `<tr><td colspan="${f.campos.length + (f.is_eval?3:2)}" style="text-align:center; padding:20px;">No hay respuestas aún para este formulario.</td></tr>`;
        } else {
            qs.forEach(doc => docsData.push(doc.data()));
            docsData.sort((a,b) => new Date(b.fecha_llenado) - new Date(a.fecha_llenado));

            let maxPosibleScore = 0;
            if(f.is_eval) {
                f.campos.forEach(c => {
                    if(c.tipo === 'si_no') maxPosibleScore += 100;
                    else if(c.tipo === 'semaforo' && c.matriz_cols) {
                        let maxScoreCol = Math.max(...c.matriz_cols.map(m => Number(m.score) || 0));
                        maxPosibleScore += (c.matriz_filas ? c.matriz_filas.length : 0) * (maxScoreCol > 0 ? maxScoreCol : 0);
                    }
                });
            }

            window.currentRespuestasDocs = docsData;
            docsData.forEach((data, rIndex) => {
                let trScore = 0;
                if(f.is_eval) {
                    f.campos.forEach(c => {
                        let ansObj = data.respuestas ? data.respuestas.find(r => r.id_campo === c.id) : null;
                        let val = ansObj ? ansObj.respuesta : null;
                        if(c.tipo === 'si_no' && val === 'Sí') {
                            trScore += 100;
                        } else if (c.tipo === 'semaforo' && Array.isArray(val)) {
                            val.forEach(v => {
                                trScore += (Number(v.score) || 0);
                            });
                        }
                    });
                }
                let avgScore = maxPosibleScore > 0 ? ((trScore / maxPosibleScore) * 100).toFixed(1) : (f.is_eval ? 0 : null);
                
                let avgScoreNum = Number(avgScore);
                let scoreLabel = '';
                let scoreColor = '';
                if(avgScoreNum >= 95) { scoreLabel = 'Excelente'; scoreColor = '#22c55e'; } // Verde
                else if(avgScoreNum >= 85) { scoreLabel = 'Bueno'; scoreColor = '#3b82f6'; } // Azul
                else if(avgScoreNum >= 75) { scoreLabel = 'Regular'; scoreColor = '#eab308'; } // Amarillo
                else { scoreLabel = 'Deficiente'; scoreColor = '#ef4444'; } // Rojo

                // Guardamos en data para el PDF
                data._avgScore = avgScore;
                data._scoreLabel = scoreLabel;
                data._scoreColor = scoreColor;

                tbHTML += `<tr><td style="padding:10px; border-bottom:1px solid var(--border);">${window.formatearFechaAbreviada(data.fecha_llenado)}</td><td style="padding:10px; border-bottom:1px solid var(--border);"><b>${data.usuario}</b></td>`;
                if(f.is_dynamic) tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border);">${data.categoria_evaluada || 'Global/Todas'}</td>`;
                if(f.is_eval) tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border);"><span style="display:inline-block; padding:4px 8px; border-radius:12px; background:${scoreColor}20; color:${scoreColor}; font-weight:bold; font-size:11px;">${avgScore}% - ${scoreLabel}</span></td>`;

                f.campos.forEach(c => {
                    let ansObj = data.respuestas ? data.respuestas.find(r => r.id_campo === c.id) : null;
                    let val = ansObj ? ansObj.respuesta : '-';
                    
                    if(c.tipo === 'archivo' && val && val !== '-') {
                        tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border);"><a href="${val}" target="_blank" class="btn btn-dark" style="padding:4px 8px; font-size:11px; text-decoration:none;"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">download</span> Descargar</a></td>`;
                    } else if(c.tipo === 'semaforo' && Array.isArray(val)) {
                        let semHTML = val.map(v => `<span style="display:inline-block; padding:4px 8px; font-size:10px; border-radius:10px; background:${v.color}20; color:${v.color}; border:1px solid ${v.color}; margin:2px;"><b>${v.fila}:</b> ${v.col}</span>`).join(' ');
                        tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border);">${semHTML || '-'}</td>`;
                    } else {
                        tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border);">${val === true ? 'Sí' : (val === false ? 'No' : val)}</td>`;
                    }
                });
                tbHTML += `<td style="padding:10px; border-bottom:1px solid var(--border); text-align:center;"><button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="window.descargarRespuestaIndividual(${rIndex}, '${id}')">PDF</button></td>`;
                tbHTML += `</tr>`;
            });
        }
        tbody.innerHTML = tbHTML;
        
        let chartContainer = $('vr-chart-container');
        let evalChartContainer = $('vr-chart-eval-container');
        if(docsData && docsData.length > 0) {
            chartContainer.style.display = 'flex';
            let usuariosCount = {};
            docsData.forEach(d => usuariosCount[d.usuario] = (usuariosCount[d.usuario] || 0) + 1);
            let ctx = $('vr-chart');
            if(window.vrChartInstance) window.vrChartInstance.destroy();
            window.vrChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(usuariosCount),
                    datasets: [{
                        label: 'Formularios Llenados',
                        data: Object.values(usuariosCount),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
            
            if(f.is_eval && evalChartContainer) {
                evalChartContainer.style.display = 'block';
                let categoricalFields = f.campos.filter(c => c.tipo === 'select' || c.tipo === 'radio' || c.tipo === 'si_no');
                if(categoricalFields.length > 0) {
                    window.actualizarGraficoEvaluacion(categoricalFields[0].id, categoricalFields[0].label);
                }
            } else if(evalChartContainer) {
                evalChartContainer.style.display = 'none';
            }
            
        } else {
            chartContainer.style.display = 'none';
            if(evalChartContainer) evalChartContainer.style.display = 'none';
        }

        let statsContainer = $('vr-stats-container');
        if(window.vrSelectCharts && window.vrSelectCharts.length > 0) {
            window.vrSelectCharts.forEach(ch => ch.destroy());
        }
        window.vrSelectCharts = [];
        
        let selectFields = f.campos.filter(c => c.tipo === 'select' || c.tipo === 'radio' || c.tipo === 'si_no');
        if(docsData && docsData.length > 0 && selectFields.length > 0) {
            statsContainer.style.display = 'flex';
            statsContainer.innerHTML = '';
            
            selectFields.forEach(c => {
                let statsData = {};
                let validCount = 0;
                docsData.forEach(d => {
                    let ansObj = d.respuestas ? d.respuestas.find(r => r.id_campo === c.id) : null;
                    let val = ansObj ? ansObj.respuesta : null;
                    if(val) {
                        if(!statsData[val]) statsData[val] = { count: 0, totalScore: 0 };
                        statsData[val].count++;
                        validCount++;
                        if(f.is_eval && d._avgScore !== undefined) {
                            statsData[val].totalScore += Number(d._avgScore);
                        }
                    }
                });
                
                if(validCount > 0) {
                    let div = document.createElement('div');
                    div.style.flex = "1";
                    div.style.minWidth = "350px";
                    div.style.maxWidth = "550px";
                    div.style.border = "1px solid var(--border)";
                    div.style.borderRadius = "8px";
                    div.style.padding = "15px";
                    div.style.background = "#fff";
                    
                    let titleContainer = document.createElement('div');
                    titleContainer.style.display = "flex";
                    titleContainer.style.justifyContent = "space-between";
                    titleContainer.style.alignItems = "center";
                    titleContainer.style.marginBottom = "15px";

                    let title = document.createElement('h5');
                    title.innerText = c.label;
                    title.style.margin = "0";
                    title.style.fontSize = "13px";
                    title.style.color = "var(--sidebar)";
                    titleContainer.appendChild(title);
                    
                    if(f.is_eval) {
                        let btnChart = document.createElement('button');
                        btnChart.className = 'btn btn-primary';
                        btnChart.style.padding = '4px 8px';
                        btnChart.style.fontSize = '10px';
                        btnChart.innerHTML = '<span class="material-icons-round" style="font-size:12px; vertical-align:middle;">bar_chart</span> Gráfico';
                        btnChart.onclick = () => {
                            window.actualizarGraficoEvaluacion(c.id, c.label);
                            // Desplazarse suavemente al gráfico
                            let chartEl = document.getElementById('vr-chart-container');
                            if(chartEl) chartEl.scrollIntoView({behavior: 'smooth', block: 'center'});
                        };
                        titleContainer.appendChild(btnChart);
                    }
                    div.appendChild(titleContainer);
                    
                    let table = document.createElement('table');
                    table.style.width = "100%";
                    table.style.borderCollapse = "collapse";
                    table.style.fontSize = "12px";
                    
                    let thScore = f.is_eval ? `<th style="padding:8px; border-bottom:2px solid var(--border); text-align:right;">Promedio Eval.</th>` : '';
                    table.innerHTML = `<thead>
                        <tr>
                            <th style="padding:8px; border-bottom:2px solid var(--border); text-align:left;">Opción</th>
                            <th style="padding:8px; border-bottom:2px solid var(--border); text-align:center;">Frecuencia</th>
                            <th style="padding:8px; border-bottom:2px solid var(--border); text-align:right;">%</th>
                            ${thScore}
                        </tr>
                    </thead><tbody></tbody>`;
                    
                    let tbodyTable = table.querySelector('tbody');
                    let sortedOptions = Object.keys(statsData).sort((a,b) => statsData[b].count - statsData[a].count);
                    
                    sortedOptions.forEach(opt => {
                        let data = statsData[opt];
                        let pct = ((data.count / validCount) * 100).toFixed(1) + '%';
                        let avgScoreHTML = '';
                        if(f.is_eval) {
                            let avgS = (data.totalScore / data.count).toFixed(1);
                            let color = avgS >= 95 ? '#22c55e' : (avgS >= 85 ? '#3b82f6' : (avgS >= 75 ? '#eab308' : '#ef4444'));
                            avgScoreHTML = `<td style="padding:8px; border-bottom:1px solid var(--border); text-align:right; font-weight:bold; color:${color};">${avgS}%</td>`;
                        }
                        
                        tbodyTable.innerHTML += `<tr>
                            <td style="padding:8px; border-bottom:1px solid var(--border); color:var(--text-main);">${opt}</td>
                            <td style="padding:8px; border-bottom:1px solid var(--border); text-align:center;">${data.count}</td>
                            <td style="padding:8px; border-bottom:1px solid var(--border); text-align:right;">${pct}</td>
                            ${avgScoreHTML}
                        </tr>`;
                    });
                    
                    div.appendChild(table);
                    statsContainer.appendChild(div);
                }
            });
            if(statsContainer.innerHTML === '') statsContainer.style.display = 'none';
        } else {
            if(statsContainer) statsContainer.style.display = 'none';
        }

        window.hideLoading();
        window.setDisplay('modal-ver-respuestas', 'flex');
    } catch(e) {
        console.error(e);
        window.hideLoading();
        alert("Error obteniendo respuestas.");
    }
};

window.descargarRespuestasExcel = () => {
    let f = globalForms.find(x => x.id === window.currentRespuestasFormId);
    if(!f || !window.currentRespuestasDocs || window.currentRespuestasDocs.length === 0) return alert("No hay datos para exportar.");
    
    let ws_data = [];
    let headers = ["Fecha", "Usuario"];
    if(f.is_dynamic) headers.push("Categoría");
    if(f.is_eval) headers.push("Puntaje (%)", "Nivel");
    f.campos.forEach(c => headers.push(c.label));
    ws_data.push(headers);

    window.currentRespuestasDocs.forEach(data => {
        let row = [
            window.formatearFechaAbreviada(data.fecha_llenado),
            data.usuario
        ];
        if(f.is_dynamic) row.push(data.categoria_evaluada || 'Global/Todas');
        if(f.is_eval) row.push(data._avgScore, data._scoreLabel);
        f.campos.forEach(c => {
            let ansObj = data.respuestas ? data.respuestas.find(r => r.id_campo === c.id) : null;
            let val = ansObj ? ansObj.respuesta : '-';
            if(c.tipo === 'semaforo' && Array.isArray(val)) {
                row.push(val.map(v => `${v.fila}: ${v.col}`).join(' | '));
            } else {
                row.push(val === true ? 'Sí' : (val === false ? 'No' : val));
            }
        });
        ws_data.push(row);
    });

    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
    XLSX.writeFile(wb, `Respuestas_${f.titulo.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
};

window.descargarRespuestaIndividual = (rIndex, formId) => {
    let f = globalForms.find(x => x.id === formId);
    let data = window.currentRespuestasDocs[rIndex];
    if(!f || !data) return;

    let html = `<div style="padding:40px; font-family:Arial,sans-serif; color:#333;">
        <h2 style="color:#0f172a; margin-bottom:5px; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">${f.titulo}</h2>
        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <p style="font-size:12px; color:#64748b; margin:0;">Respondido por: <b>${data.usuario}</b> el ${window.formatearFechaAbreviada(data.fecha_llenado)}</p>
            ${f.is_eval ? `<div style="padding:5px 15px; border-radius:20px; background:${data._scoreColor}20; color:${data._scoreColor}; font-weight:bold; border:1px solid ${data._scoreColor};">Resultado: ${data._avgScore}% - ${data._scoreLabel}</div>` : ''}
        </div>
        <div style="margin-top:20px;">`;

    f.campos.forEach(c => {
        let ansObj = data.respuestas ? data.respuestas.find(r => r.id_campo === c.id) : null;
        let val = ansObj ? ansObj.respuesta : '-';
        
        html += `<div style="margin-bottom:15px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                    <strong style="display:block; font-size:14px; margin-bottom:8px; color:#1e293b;">${c.label}</strong>`;
        
        if(c.tipo === 'semaforo' && Array.isArray(val)) {
            html += `<table style="width:100%; border-collapse:collapse; margin-top:5px;">`;
            val.forEach(v => {
                html += `<tr><td style="padding:5px 0; border-bottom:1px solid #cbd5e1; font-size:13px; color:#475569;">${v.fila}</td><td style="text-align:right; border-bottom:1px solid #cbd5e1;"><span style="display:inline-block; padding:3px 8px; font-size:11px; border-radius:12px; background:${v.color}20; color:${v.color}; border:1px solid ${v.color};"><b>${v.col}</b> (Ptos: ${v.score||0})</span></td></tr>`;
            });
            html += `</table>`;
        } else if (c.tipo === 'archivo' && val !== '-') {
             html += `<a href="${val}" target="_blank" style="font-size:12px; color:#2563eb;">Documento Adjunto (Clic para ver)</a>`;
        } else {
             html += `<div style="font-size:13px; color:#475569;">${val === true ? 'Sí' : (val === false ? 'No' : val)}</div>`;
        }
        html += `</div>`;
    });

    html += `</div></div>`;
    
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let opt = {
        margin:       0.5,
        filename:     `Respuesta_${data.usuario}_${f.titulo}.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_'),
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    window.showLoading();
    html2pdf().set(opt).from(tempDiv).save().then(() => {
        window.hideLoading();
    }).catch(err => {
        console.error(err);
        window.hideLoading();
    });
};

window.descargarRespuestasPDF = () => {
    let element = document.querySelector('#modal-ver-respuestas .modal-main');
    if(!element) return;
    
    let opt = {
        margin:       0.5,
        filename:     'Respuestas_Formulario.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    window.showLoading();
    html2pdf().set(opt).from(element).save().then(() => {
        window.hideLoading();
    }).catch(err => {
        console.error(err);
        window.hideLoading();
        alert("Error al generar PDF.");
    });
};

window.verDetalle = async (id) => {
try {
    window.showLoading(); selectedId = id; window.setHtml('m-extra-input', ""); window.setHtml('m-comentario-libre', "");
    const docSnap = await getDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", id)); 
    if(!docSnap.exists()) { window.hideLoading(); return alert("La solicitud ya no existe."); }
    selectedDocData = docSnap.data(); const s = selectedDocData || {}; const p = currentUser.permisos || {};
    
    window.setTxt('m-id', s.customId || "N/A"); window.setTxt('m-tit', s.titulo || "N/A"); window.setTxt('m-sol', s.solicitante || "N/A");
    let est = String(s.estado || "Pendiente").toUpperCase(); let apr = est.includes('APROBADO FINAL'); let cnc = est === 'ANULADO' || est === 'RECHAZADO';
    if($('m-est')) { $('m-est').innerText = apr ? 'APROBADO FINAL' : (s.estado || 'PENDIENTE'); $('m-est').className = `badge ${apr ? 'badge-success' : (cnc ? 'badge-danger' : 'badge-warning')}`; }
    window.setTxt('m-ger', s.gerencia || "N/A"); window.setTxt('m-tipo', s.tipoDoc || "N/A"); window.setTxt('m-accion', s.accion || "N/A"); window.setTxt('m-jus', s.motivo || s.justificacion || "Sin justificación");
    
    const esAdminSGC = p.admin || p.p_gest_sgc; let gerenciasUsuario = currentUser.gerencias || [];
    let userEmailLowerCase = (currentUser.email || "").toLowerCase(); let isInv = s.involucrados && s.involucrados.some(e => e.toLowerCase() === userEmailLowerCase); 
    const esDuenio = s.uid === currentUser.usuario || isInv;
    let stepIdx = parseInt(s.idx) || 0; const activo = !apr && !cnc;
    
    let pr = String(s.prioridad || "Baja"); 
    if(esAdminSGC && activo) window.setHtml('m-prioridad-container', `<select aria-label="mod_prioridad" onchange="window.cambiarPrioridad(this.value)" name="mod_prioridad" style="padding:4px 8px; font-size:12px; border-radius:6px; background:#fff; font-weight:bold; border:1px solid var(--border); color:var(--text-main);"><option value="Baja" ${pr==='Baja'?'selected':''}>BAJA</option><option value="Media" ${pr==='Media'?'selected':''}>MEDIA</option><option value="Alta" ${pr==='Alta'?'selected':''}>ALTA (URGENTE)</option></select>`);
    else window.setHtml('m-prioridad-container', `<span class="badge ${pr === 'Alta' ? 'badge-danger' : (pr === 'Media' ? 'badge-warning' : 'badge-info')}">${pr.toUpperCase()}</span>`);

    let adjOrigName = s.adjunto_nombre || "Archivo Adjunto"; let dlUrl = s.adjunto ? window.getDownloadUrl(s.adjunto) : "#"; 
    if (stepIdx >= 2 && !esDuenio && !esAdminSGC) window.setHtml('m-file-link', `<span style="color:#64748b; font-size:13px; font-style:italic;"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">lock</span> Documento original bloqueado por confidencialidad.</span>`);
    else window.setHtml('m-file-link', s.adjunto ? `<a href="#" onclick="window.abrirDocumento('${dlUrl}', '${adjOrigName}'); return false;" class="file-link">📎 ${adjOrigName}</a>` : "Sin archivo");
    
    if(s.accion !== 'Creación') { window.setDisplay('m-extra-panel', 'block'); window.setTxt('m-cod', s.cod_ref || "N/A"); window.setTxt('m-ver', s.ver_ref || "N/A"); window.setTxt('m-fecha-ult', window.formatearFechaAbreviada(s.fecha_ref)); } else { window.setDisplay('m-extra-panel', 'none'); }

    for(let i=1; i<=4; i++) { const st = $('s'+i); if(st) { st.className = 'step'; if(cnc) continue; if(i <= stepIdx) st.classList.add('completed'); if(i === stepIdx + 1 && !apr) st.classList.add('active'); } }

    const esGer = p.p_ger_apr && gerenciasUsuario.includes(s.gerencia); 
    let invHTML = "No hay personas extras añadidas.";
    if(s.involucrados && s.involucrados.length > 0) { 
        invHTML = s.involucrados.map(email => { 
            let userFound = allUsers.find(u => (u.email || "").toLowerCase() === email.toLowerCase()); let dispName = userFound ? `${userFound.nombre} (${email})` : email; 
            let btnDel = (activo && (esAdminSGC || esDuenio)) ? ` <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:var(--danger); vertical-align:middle; margin-left:5px;" onclick="window.eliminarInvolucrado('${email}')" title="Quitar">close</span>` : '';
            return `<div style="display:inline-flex; align-items:center; background:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:10px; font-size:11px; margin-right:5px; margin-bottom:5px;"><b>${dispName}</b> ${btnDel}</div>`;
        }).join(''); 
    }
    window.setHtml('m-involucrados-list', invHTML);

    const fDiff = (ini, fin) => { if(!ini || !fin) return "-"; let ms = new Date(fin) - new Date(ini); if(ms < 0) return "-"; let d = Math.floor(ms / 86400000); let h = Math.floor((ms % 86400000) / 3600000); return `${d}d ${h}h`; };
    if ($('m-tiempos-panel')) {
        if(esAdminSGC) {
            window.setDisplay('m-tiempos-panel', 'block');
            window.setHtml('m-tiempos-grid', `<div><div class="custom-label" style="color:var(--primary);">Fase 1 (Doc)</div><span style="font-size:11px;">${fDiff(s.fase_0_ini, s.fase_0_fin)}</span></div><div><div class="custom-label" style="color:var(--primary);">Fase 2 (Verif)</div><span style="font-size:11px;">${fDiff(s.fase_1_ini, s.fase_1_fin)}</span></div><div><div class="custom-label" style="color:var(--primary);">Fase 3 (Gerencia)</div><span style="font-size:11px;">${fDiff(s.fase_2_ini, s.fase_2_fin)}</span></div><div><div class="custom-label" style="color:var(--primary);">Fase 4 (SGC Final)</div><span style="font-size:11px;">${fDiff(s.fase_3_ini, s.fecha_final || s.fase_3_fin)}</span></div>`);
        } else { window.setDisplay('m-tiempos-panel', 'none'); }
    }

    let puedeGestionarSGC = false; 
    if(activo) { 
        let c1 = s.asig_paso1 ? (currentUser.email||'').toLowerCase() === s.asig_paso1.toLowerCase() : p.p_paso1;
        let c2 = s.asig_paso2 ? (currentUser.email||'').toLowerCase() === s.asig_paso2.toLowerCase() : p.p_paso2;
        let c4 = s.asig_paso4 ? (currentUser.email||'').toLowerCase() === s.asig_paso4.toLowerCase() : p.p_paso4;
        if (stepIdx === 0 && (p.p_gest_sgc || p.admin || c1)) puedeGestionarSGC = true; 
        if (stepIdx === 1 && (p.p_gest_sgc || p.admin || c2)) puedeGestionarSGC = true; 
        if (stepIdx === 3 && (p.p_gest_sgc || p.admin || c4)) puedeGestionarSGC = true; 
    }
    let puedeGestionarGerente = esGer && stepIdx === 2 && activo; 

    // PANEL DE EDICIÓN CONDICIONAL
    window.setDisplay('btn-editar-sol', (activo && (esDuenio || esAdminSGC)) ? 'inline-block' : 'none');
    window.setDisplay('m-panel-edicion-sol', 'none');
    window.setDisplay('m-original-data', 'block');

    let puedeEvaluar = stepIdx === -1 && activo && (esAdminSGC || p.p_eval_solicitud);
    window.setDisplay('btn-reabrir', (esAdminSGC && !activo) ? 'inline-flex' : 'none'); window.setDisplay('m-add-involucrado-section', activo ? 'flex' : 'none'); window.setDisplay('m-actions', (puedeGestionarSGC || puedeGestionarGerente || puedeEvaluar) ? 'block' : 'none'); window.setDisplay('applicant-actions', (esDuenio && activo) ? 'block' : 'none'); window.setDisplay('m-input-area', 'none');
    
    const puedeDevolver = (puedeGestionarSGC || puedeGestionarGerente) && stepIdx > 0 && activo; 
    window.setDisplay('btn-devolver-paso', puedeDevolver ? 'inline-block' : 'none'); window.setDisplay('btn-anular', ((puedeGestionarSGC || esDuenio) && activo) ? 'inline-block' : 'none'); 

    let slaDate = s.sla || s.fecha_esperada_cierre;
    if(slaDate) { window.setDisplay('m-admin-sla', 'block'); window.setVal('m-sla-date', slaDate); if($('m-sla-date')) $('m-sla-date').disabled = !esAdminSGC; window.setDisplay('btn-save-sla', esAdminSGC ? 'inline-block' : 'none'); } 
    else if (esAdminSGC && activo) { window.setDisplay('m-admin-sla', 'block'); window.setVal('m-sla-date', ''); if($('m-sla-date')) $('m-sla-date').disabled = false; window.setDisplay('btn-save-sla', 'inline-block'); }
    else { window.setDisplay('m-admin-sla', 'none'); }
    
    window.setDisplay('m-panel-final-sgc', 'none'); window.setDisplay('m-panel-update-sgc', 'none'); window.setDisplay('m-display-final', 'none'); 
    window.setDisplay('btn-firma-next', (stepIdx !== -1) ? 'inline-block' : 'none');
    window.setDisplay('btn-evaluar-next', puedeEvaluar ? 'inline-block' : 'none');
    if($('m-original-data')) $('m-original-data').classList.remove('locked-data'); 

    if ((esAdminSGC || p.p_paso2) && stepIdx === 1 && activo) { window.setDisplay('m-panel-update-sgc', 'block'); window.setVal('m-upd-tit', s.titulo || ''); window.setVal('m-upd-cod', s.cod_ref || ''); window.setVal('m-upd-ver', s.ver_ref || ''); }
    
    if (stepIdx === 3 && puedeGestionarSGC && activo) { window.setDisplay('m-panel-final-sgc', 'block'); window.setVal('m-final-cod', s.cod_ref || ""); window.setDisplay('m-actions', 'none'); }

    if (apr) {
        if (s.version_final) {
            if($('m-original-data')) $('m-original-data').classList.add('locked-data'); window.setDisplay('m-display-final', 'block');
            window.setTxt('m-disp-cod', s.codigo_final || s.cod_ref || "N/A"); window.setTxt('m-disp-ver', s.version_final); window.setTxt('m-disp-fecha', s.fecha_final ? window.formatearFechaAbreviada(s.fecha_final) : "N/A"); 
            let finName = s.documento_final_nombre || "Documento Oficial"; let finUrl = s.documento_final ? window.getDownloadUrl(s.documento_final) : "#"; 
            window.setHtml('m-disp-file', s.documento_final ? `<a href="#" onclick="window.abrirDocumento('${finUrl}', '${finName}'); return false;" class="btn btn-success" style="padding:10px 15px; border-radius:8px;">⬇️ Descargar Oficial</a>` : "N/A");
            if(esAdminSGC) window.setDisplay('btn-edit-final', 'inline-block');
        }
    }
    
    if(activo && stepIdx !== 3) window.setTxt('btn-firma-next', `Aprobar Etapa (${PASOS_NOMBRES[stepIdx]})`);
    
    window.setHtml('chat-box', Array.isArray(s.chat) ? s.chat.map(c => {
        let calBtn = "";
        if(c.fR) {
            try {
                let d1 = new Date(c.fR);
                let start = d1.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z'; let d2 = new Date(d1.getTime() + 3600000); let end = d2.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';
                let text = encodeURIComponent(`Reunión SGC: ${s.customId} - ${s.titulo}`); let details = encodeURIComponent(`Tema / Detalles:\n${c.tema}\n\nConvocado por: ${c.u}`);
                calBtn = `<br><a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}" target="_blank" class="btn btn-info" style="padding:6px 10px; font-size:10px; margin-top:8px; display:inline-flex; background:#ea4335;"><span class="material-icons-round" style="font-size:14px; margin-right:4px;">event</span> Agendar en Google Calendar</a>`;
            }catch(e){}
        }
        return `<div class="chat-msg" style="border-left-color:${c.u===currentUser.nombre?'var(--primary)':'#cbd5e1'}"><b style="font-size:10px">${c.u}</b> <span style="font-size:9px;color:#94a3b8">${c.t}</span><br>${c.m}${c.archivo ? `<br><a href="#" onclick="window.abrirDocumento('${window.getDownloadUrl(c.archivo)}', '${c.archivo_nombre || 'Evidencia_Adjunta'}'); return false;" style="font-size:10px;color:blue;font-weight:600;text-decoration:none;">📎 ${c.archivo_nombre || 'Ver Adjunto'}</a>` : ''}${calBtn}</div>`;
    }).join('') : '');
    
    window.setDisplay('modal', 'flex');
} catch(e) { console.error("Error abriendo detalle:", e); alert("Error abriendo solicitud: " + e.message); } finally { window.hideLoading(); }
};

window.habilitarEdicionSol = () => {
    const s = selectedDocData;
    window.setVal('e-sol-tit', s.titulo || '');
    window.setVal('e-sol-acc', s.accion || 'Creación');
    window.setVal('e-sol-pri', s.prioridad || 'Baja');
    window.setVal('e-sol-tipo-doc', s.tipoDoc || '');
    window.setVal('e-sol-ger', s.gerencia || '');
    window.actualizarGerenteSelectEdit(s.gerencia || '');
    setTimeout(() => { window.setVal('e-sol-dep', s.departamento || ''); }, 100);
    
    window.setHtml('lista-involucrados-tags-edit', "");
    if(s.involucrados && s.involucrados.length > 0) {
        s.involucrados.forEach(email => {
            let userFound = allUsers.find(u => (u.email || "").toLowerCase() === email.toLowerCase()); 
            let name = userFound ? userFound.nombre : email;
            window.addInvolucradoToDOM(email, name, 'lista-involucrados-tags-edit');
        });
    }

    window.setVal('e-sol-mot', s.motivo || s.justificacion || '');

    const p = currentUser.permisos || {};
    if(p.p_gest_sgc || p.admin) {
        window.setDisplay('e-sol-doc-id-display', 'inline-block');
        window.setHtml('e-sol-doc-id-display', `ID Interno DB: <b>${selectedId}</b>`);
    } else {
        window.setDisplay('e-sol-doc-id-display', 'none');
    }

    window.setDisplay('m-panel-edicion-sol', 'block');
    window.setDisplay('btn-editar-sol', 'none');
    window.setDisplay('m-original-data', 'none'); 
};

window.guardarEdicionSol = async () => {
    const nTit = getValSafe('e-sol-tit').trim();
    const nAcc = getValSafe('e-sol-acc');
    const nPri = getValSafe('e-sol-pri');
    const nTipo = getValSafe('e-sol-tipo-doc');
    const nGer = getValSafe('e-sol-ger');
    const nDep = getValSafe('e-sol-dep');
    const nMot = getValSafe('e-sol-mot').trim();

    let extraEmails = []; 
    $$('#lista-involucrados-tags-edit .involucrado-item').forEach(el => {
        if(el.dataset.email) extraEmails.push(el.dataset.email.toLowerCase());
    });

    if(!nTit || !nMot || !nGer || !nDep || !nTipo) return alert("Complete los campos obligatorios.");
    
    window.showLoading();
    let msjChat = `✏️ <b>Datos Editados:</b><br>- Título: ${nTit}<br>- Acción: ${nAcc}<br>- Prioridad: ${nPri}<br>- Tipo: ${nTipo}<br>- Gerencia: ${nGer} / ${nDep}`;
    
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { 
        titulo: nTit, accion: nAcc, prioridad: nPri, tipoDoc: nTipo, gerencia: nGer, departamento: nDep, involucrados: extraEmails, motivo: nMot,
        chat: arrayUnion({u: currentUser.nombre, m: msjChat, t: new Date().toLocaleString()}) 
    });
    
    window.hideLoading(); 
    alert("Solicitud actualizada correctamente."); 
    window.setDisplay('m-original-data', 'block');
    window.verDetalle(selectedId);
};

window.descargarExcelFiltrado = (origen = 'hist') => {
    let elDesde = $(`${origen}-f-desde`), elHasta = $(`${origen}-f-hasta`), elEstado = $(`${origen}-f-estado`);
    let desde = elDesde ? elDesde.value : ""; let hasta = elHasta ? elHasta.value : ""; let estado = elEstado ? elEstado.value : ""; 
    let esAdminSGC = currentUser.permisos.admin || currentUser.permisos.p_gest_sgc;

    let datosFiltrados = globalSolicitudes.filter(s => {
        let isMine = (s.uid === currentUser.usuario) || (s.involucrados && currentUser.email && s.involucrados.includes(currentUser.email.toLowerCase())); 
        if (!esAdminSGC) { 
            if (origen === 'hist' && !isMine) return false; 
            if (origen === 'all') { const p = currentUser.permisos; let puedeExportar = false; if (p.p_ver_todas) puedeExportar = true; else if (p.p_ver_ger && currentUser.gerencias && currentUser.gerencias.includes(s.gerencia)) puedeExportar = true; else if (isMine) puedeExportar = true; if(!puedeExportar) return false; }
            if (origen === 'gest') { const p = currentUser.permisos; let ver = p.p_ver_todas || (p.p_ver_ger && currentUser.gerencias && currentUser.gerencias.includes(s.gerencia)) || isMine; if(!ver) return false; } 
        }
        if (desde && s.fecha < desde) return false; 
        if (hasta && s.fecha > hasta + "T23:59:59") return false;
        if (estado) { let eStr = (s.estado || "").toUpperCase(); if (estado === 'Pendiente' && (eStr.includes('APROBADO FINAL') || eStr === 'ANULADO' || eStr === 'RECHAZADO')) return false; if (estado === 'Aprobado Final' && !eStr.includes('APROBADO FINAL')) return false; if (estado === 'Cancelado' && eStr !== 'ANULADO' && eStr !== 'RECHAZADO') return false; }
        return true; 
    });

    if(datosFiltrados.length === 0) return alert("No hay datos que coincidan con estos filtros para exportar.");
    const formatearDiferencia = (ini, fin) => { if(!ini || !fin) return "N/A"; const ms = new Date(fin) - new Date(ini); if(ms < 0) return "N/A"; const d = Math.floor(ms / 86400000); const h = Math.floor((ms % 86400000) / 3600000); const m = Math.floor((ms % 3600000) / 60000); if (d > 0) return `${d}d ${h}h ${m}m`; if (h > 0) return `${h}h ${m}m`; return `${m}m`; };

    let dataExport = datosFiltrados.map(s => {
        let p = s.idx === -1 ? 'Evaluación' : (PASOS_NOMBRES[s.idx] || ''); let estadoFormat = s.estado === 'Aprobado Final' ? 'Aprobado Final' : (s.estado === 'Anulado' || s.estado === 'Rechazado' ? s.estado : `${s.estado} (${p})`);
        let baseObj = { "ID Solicitud": s.customId, "Solicitante": s.solicitante || '', "Email Solicitante": s.solicitante_email || '', "Gerencia": s.gerencia || '', "Departamento": s.departamento || '', "Acción": s.accion || '', "Prioridad": s.prioridad || 'Baja', "Tipo Documento": s.tipoDoc || '', "Título Documento": s.titulo || '', "Estado Actual": estadoFormat, "Fecha Límite (SLA)": s.fecha_esperada_cierre || 'No definida', "Fecha de Creación": s.fecha ? new Date(s.fecha).toLocaleString() : '', "Código Ref. Original": s.cod_ref || '', "Versión Original": s.ver_ref || '', "Código Final Asignado": s.codigo_final || '', "Versión Final Asignada": s.version_final || '', "Fecha Final": s.fecha_final || '' };
        if (esAdminSGC) { 
            let isCanceled = s.estado === 'Anulado' || s.estado === 'Rechazado';
            baseObj["Tiempo Fase 1 (Documentado)"] = isCanceled ? 'N/A' : formatearDiferencia(s.fase_0_ini, s.fase_0_fin); 
            baseObj["Tiempo Fase 2 (Verificado)"] = isCanceled ? 'N/A' : formatearDiferencia(s.fase_1_ini, s.fase_1_fin); 
            baseObj["Tiempo Fase 3 (Aprob. Gerencia)"] = isCanceled ? 'N/A' : formatearDiferencia(s.fase_2_ini, s.fase_2_fin); 
            baseObj["Tiempo Fase 4 (Aprob. SGC)"] = isCanceled ? 'N/A' : formatearDiferencia(s.fase_3_ini, s.fase_3_fin); 
            baseObj["TIEMPO TOTAL DEL FLUJO"] = isCanceled ? 'N/A' : formatearDiferencia(s.fase_0_ini, s.fecha_final || s.fase_3_fin || s.fase_2_fin || s.fase_1_fin || s.fase_0_fin); 
        }
        return baseObj;
    });

    let nameF = esAdminSGC ? "Reporte_SGC_Completo_Con_Tiempos" : "Reporte_Solicitudes"; 
    let wb = XLSX.utils.book_new(); let ws = XLSX.utils.json_to_sheet(dataExport); XLSX.utils.book_append_sheet(wb, ws, "Datos_Exportados"); XLSX.writeFile(wb, `${nameF}.xlsx`);
};

// ==========================================
// MÓDULO DE AUDITORÍAS (CORREGIDO ERROR DE ARRAYS NULOS)
// ==========================================
window.switchAuditTab = (id) => { $$('.tab-btn').forEach(b=>b.classList.remove('active')); $$('.tab-content').forEach(c=>c.classList.remove('active')); if($(`btn-tab-${id}`)) $(`btn-tab-${id}`).classList.add('active'); if($(`tab-${id}`)) $(`tab-${id}`).classList.add('active'); };
window.abrirModalPlan = () => {
    window.setTxt('edit-year-label', $('aud-year-select').value); $$('#ah-auditor-list input').forEach(cb=>cb.checked=false);
    if(globalAuditPlan) {
        window.setVal('ah-obj', globalAuditPlan.objetivo || ''); window.setVal('ah-alcance', globalAuditPlan.alcance || ''); window.setVal('ah-tecnica', globalAuditPlan.tecnica || ''); window.setVal('ah-criterios', globalAuditPlan.criterios || ''); window.setVal('ah-ref', globalAuditPlan.referencia || ''); window.setVal('ah-fecha', globalAuditPlan.fecha_elab || ''); window.setVal('ah-tec', globalAuditPlan.recursos_tec || ''); window.setVal('ah-rrhh', globalAuditPlan.recursos_hh || ''); window.setVal('ah-extra-emails', (globalAuditPlan.extra_correos || []).join(', '));
        let liderSel = $('ah-lider'); for(let i=0; i<liderSel.options.length; i++){ if(liderSel.options[i].value === globalAuditPlan.lider) liderSel.selectedIndex = i; }
        let auditoresGuardados = globalAuditPlan.auditor_nombres || []; $$('#ah-auditor-list input').forEach(cb => { cb.checked = auditoresGuardados.includes(cb.value); });
    } else {
        window.setVal('ah-obj', ''); window.setVal('ah-alcance', ''); window.setVal('ah-tecnica', ''); window.setVal('ah-criterios', ''); window.setVal('ah-ref', ''); window.setVal('ah-fecha', ''); window.setVal('ah-tec', ''); window.setVal('ah-rrhh', ''); window.setVal('ah-extra-emails', ''); if($('ah-lider')) $('ah-lider').selectedIndex = 0; 
    }
    window.setDisplay('modal-plan', 'flex');
};
window.cerrarModalPlan = () => window.setDisplay('modal-plan', 'none');

window.saveAuditPlan = async () => {
    const y = $('aud-year-select').value; const docId = `Plan_${y}`;
    let motivo = "Creación inicial"; if(globalAuditPlan) { motivo = prompt("Motivo de la modificación del Plan Anual:"); if(!motivo) return alert("El motivo es obligatorio para editar."); }
    const liderSel = $('ah-lider'); const liderName = liderSel.options[liderSel.selectedIndex]?.value || ""; const liderEmail = liderSel.options[liderSel.selectedIndex]?.getAttribute('data-email') || "";
    const audNombres = []; const audEmails = []; $$('#ah-auditor-list input:checked').forEach(cb => { audNombres.push(cb.value); audEmails.push(cb.getAttribute('data-email')); });
    const extraEmails = $('ah-extra-emails').value.split(',').map(e => e.trim().toLowerCase()).filter(e=>e.includes('@'));
    let todosLosCorreos = new Set([...audEmails, ...extraEmails]); if(liderEmail) todosLosCorreos.add(liderEmail);
    const data = { year: y, objetivo: $('ah-obj').value, alcance: $('ah-alcance').value, tecnica: $('ah-tecnica').value, criterios: $('ah-criterios').value, referencia: $('ah-ref').value, fecha_elab: $('ah-fecha').value, lider: liderName, auditor: audNombres.join(', '), auditor_nombres: audNombres, recursos_tec: $('ah-tec').value, recursos_hh: $('ah-rrhh').value, extra_correos: extraEmails, correos: Array.from(todosLosCorreos), modificado_por: currentUser.nombre, ultima_modif: new Date().toISOString() };

    window.showLoading();
    if(globalAuditPlan) { await updateDoc(doc(db, "artifacts", appId, "public", "data", "AuditPlans", docId), { ...data, historial: arrayUnion({ fecha: new Date().toISOString(), usuario: currentUser.nombre, motivo: motivo }) }); } 
    else { await setDoc(doc(db, "artifacts", appId, "public", "data", "AuditPlans", docId), { ...data, historial: [{ fecha: new Date().toISOString(), usuario: currentUser.nombre, motivo: motivo }] }); }
    window.hideLoading(); alert("Plan Anual actualizado."); window.cerrarModalPlan();
};

window.cambiarAnioAuditoria = (val) => {
    if(val === 'nuevo') { let nYear = prompt("Ingrese el nuevo año a registrar (ej: 2028):"); if(nYear && !isNaN(nYear)) { let opt = document.createElement('option'); opt.value = nYear; opt.text = nYear; opt.selected = true; $('aud-year-select').add(opt, $('aud-year-select').options[1]); val = nYear; } else { window.setVal('aud-year-select', new Date().getFullYear().toString()); return; } }
    window.loadAuditPlan(val); window.renderTablaAuditorias(val);
};

window.loadAuditPlan = (year) => {
    const docId = `Plan_${year}`; window.setTxt('view-year-label', year);
    onSnapshot(doc(db, "artifacts", appId, "public", "data", "AuditPlans", docId), s => {
        if(s.exists()) {
            globalAuditPlan = s.data(); window.setDisplay('audit-header-view', 'block'); 
            window.setTxt('view-ah-obj', globalAuditPlan.objetivo || '-'); window.setTxt('view-ah-alcance', globalAuditPlan.alcance || '-'); window.setTxt('view-ah-tecnica', globalAuditPlan.tecnica || '-'); window.setTxt('view-ah-criterios', globalAuditPlan.criterios || '-'); window.setTxt('view-ah-ref', globalAuditPlan.referencia || '-'); window.setTxt('view-ah-fecha', window.formatearFechaAbreviada(globalAuditPlan.fecha_elab) || '-'); window.setTxt('view-ah-lider', globalAuditPlan.lider || '-'); window.setTxt('view-ah-auditor', globalAuditPlan.auditor || '-'); window.setTxt('view-ah-tec', globalAuditPlan.recursos_tec || '-'); window.setTxt('view-ah-rrhh', globalAuditPlan.recursos_hh || '-');
            let modInfo = `Por: ${globalAuditPlan.modificado_por || '-'} el ${window.formatearFechaAbreviada(globalAuditPlan.ultima_modif)}`; 
            if(globalAuditPlan.historial && globalAuditPlan.historial.length > 0) { let ultimoMotivo = globalAuditPlan.historial[globalAuditPlan.historial.length-1].motivo; modInfo += ` (Motivo: ${ultimoMotivo})`; } 
            window.setTxt('view-ah-mod-info', modInfo);
        } else { globalAuditPlan = null; window.setDisplay('audit-header-view', 'none'); }
    });
};

window.abrirNuevaAuditoria = () => { window.cancelarEdicionAuditoria(); window.setDisplay('modal-nueva-aud', 'flex'); };

window.cargarAuditoriaParaEditar = async (id) => {
    const au = globalAllAuditorias.find(x => x.id === id); if(!au) return; 
    editandoAuditoriaId = id; 
    if($('titulo-form-auditoria')) $('titulo-form-auditoria').innerText = "Editar Auditoría Programada"; 

    window.setVal('aud-fecha', au.fecha || ''); window.setVal('aud-h-ini', au.hora_inicio || ''); window.setVal('aud-h-fin', au.hora_fin || ''); window.setVal('aud-lugar', au.lugar || ''); window.setVal('aud-obs', au.observacion || ''); window.setVal('aud-org', au.organizacion || ''); window.setVal('aud-dir', au.direccion || ''); window.setVal('aud-sitios', au.sitios || ''); window.setVal('aud-personal', au.personal || ''); window.setVal('aud-turnos', au.turnos || '');

    let aa = au.auditado ? au.auditado.split(', ') : []; $$('#aud-auditado-list input[type="checkbox"]').forEach(cb => { cb.checked = aa.includes(cb.value); });
    let aua = au.auditor ? au.auditor.split(', ') : []; $$('#aud-auditor-list input[type="checkbox"]').forEach(cb => { cb.checked = aua.includes(cb.value); });
    let ar = au.requisitos ? au.requisitos.split(', ') : []; $$('#aud-req-list input[type="checkbox"]').forEach(cb => { cb.checked = ar.includes(cb.value); });
    let af = au.auditores_formacion ? au.auditores_formacion.split(', ') : []; $$('#aud-formacion-list input[type="checkbox"]').forEach(cb => { cb.checked = af.includes(cb.value); });

    window.setTxt('btn-guardar-aud', "ACTUALIZAR AUDITORÍA"); 
    window.setDisplay('btn-cancelar-aud', 'inline-block'); window.setDisplay('modal-nueva-aud', 'flex');
};

window.cancelarEdicionAuditoria = () => {
    editandoAuditoriaId = null; 
    if($('titulo-form-auditoria')) $('titulo-form-auditoria').innerText = "Programar Nueva Auditoría"; 

    ['aud-fecha', 'aud-h-ini', 'aud-h-fin', 'aud-lugar', 'aud-obs', 'aud-org', 'aud-dir', 'aud-sitios', 'aud-personal', 'aud-turnos'].forEach(i => { if($(i)) $(i).value = ''; });

    $$('#aud-auditado-list input[type="checkbox"]').forEach(c => c.checked = false); 
    $$('#aud-auditor-list input[type="checkbox"]').forEach(c => c.checked = false); 
    $$('#aud-req-list input[type="checkbox"]').forEach(c => c.checked = false); 
    $$('#aud-formacion-list input[type="checkbox"]').forEach(c => c.checked = false);

    if($('btn-guardar-aud')) $('btn-guardar-aud').innerText = "GENERAR AUDITORÍA Y NOTIFICAR"; 
    window.setDisplay('btn-cancelar-aud', 'none'); window.setDisplay('modal-nueva-aud', 'none');
};

window.guardarAuditoria = async () => {
    const f = $('aud-fecha').value; 
    const reqN = []; $$('#aud-req-list input:checked').forEach(c => reqN.push(c.value)); const r = reqN.join(', ');

    if(!f || !r) return alert("Fecha y Puntos son obligatorios.");

    const an = [], ae = []; $$('#aud-auditado-list input:checked').forEach(c => { an.push(c.value); ae.push(c.getAttribute('data-email')); });
    const aun = [], aue = []; $$('#aud-auditor-list input:checked').forEach(c => { aun.push(c.value); aue.push(c.getAttribute('data-email')); });
    const fn = []; $$('#aud-formacion-list input:checked').forEach(c => fn.push(c.value));

    let dt = { fecha: f, hora_inicio: $('aud-h-ini').value, hora_fin: $('aud-h-fin').value, lugar: $('aud-lugar').value, proceso: r, requisitos: r, auditado: an.join(', '), auditado_emails: ae, auditor: aun.join(', '), auditor_emails: aue, observacion: $('aud-obs').value, organizacion: $('aud-org').value, direccion: $('aud-dir').value, sitios: $('aud-sitios').value, personal: $('aud-personal').value, turnos: $('aud-turnos').value, auditores_formacion: fn.join(', ') };

    window.showLoading();

    try {
        if(editandoAuditoriaId) { 
            dt.modificado_por = currentUser.nombre; dt.ultima_modificacion = new Date().toISOString();
            await updateDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", editandoAuditoriaId), dt); 
        } else {
            let aNum = ""; 
            await runTransaction(db, async(t) => { 
                const sn = await t.get(doc(db, "artifacts", appId, "public", "data", "Contadores", "auditorias")); 
                let c = 1; if(sn.exists()) c = sn.data().count + 1; 
                t.set(doc(db, "artifacts", appId, "public", "data", "Contadores", "auditorias"), { count: c }); 
                aNum = `QSHE-${new Date().getFullYear()}-${c}`; 
            });
            dt.audit_num = aNum; dt.estado = "Programada"; dt.creado_por = currentUser.nombre; dt.timestamp = new Date().toISOString(); dt.bitacora = []; dt.lista_verificacion = []; dt.reporte_auditoria = { conclusiones: '' }; dt.rondas = 1;
            await addDoc(collection(db, "artifacts", appId, "public", "data", "Auditorias"), dt);
            
            let correosTo = Array.from(new Set([...ae, ...aue])).filter(e => e && e !== "undefined" && e !== "null");
            let correosCc = [];
            if(globalAuditPlan && globalAuditPlan.correos) globalAuditPlan.correos.forEach(x => correosCc.push(x));
            correosCc.push(EMAIL_ADMIN_SGC);
            correosCc = Array.from(new Set(correosCc)).filter(e => e && e !== "undefined" && e !== "null");
            
            let msgAuditoria = `
            <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="background: #0ea5e9; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">NUEVA AUDITORÍA PROGRAMADA</h2>
                </div>
                <div style="padding: 20px; line-height: 1.6;">
                    <p>Se ha programado una nueva Auditoría Interna (<b>${aNum}</b>) en el sistema.</p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1; margin-bottom: 15px;">
                        <b>Fecha:</b> ${window.formatearFechaAbreviada(f)}<br>
                        <b>Horario:</b> ${dt.hora_inicio || 'N/A'} - ${dt.hora_fin || 'N/A'}<br>
                        <b>Lugar:</b> ${dt.lugar || 'N/A'}<br>
                        <b>Área/Proceso:</b> ${r || 'N/A'}<br>
                        <b>Auditado(s):</b> ${dt.auditado || 'N/A'}<br>
                        <b>Auditor(es):</b> ${dt.auditor || 'N/A'}<br>
                    </div>
                    <p style="margin: 0;">Por favor, verificar la agenda en el módulo de Auditoría.</p>
                </div>
            </div>`;
            
            console.log("[Auditoría] Destinatarios identificados:", {to: correosTo, cc: correosCc});
            window.sendNotification({to: correosTo.join(','), cc: correosCc.join(',')}, `Auditoría Programada: ${aNum}`, msgAuditoria);
            alert(`Auditoría ${aNum} programada.`);
        }
        window.cancelarEdicionAuditoria(); 
    } catch(e) { console.error(e); alert("Error guardando auditoria."); } finally { window.hideLoading(); }
};

window.exportarExcelAuditoria = () => {
    if(!globalAuditorias || globalAuditorias.length === 0) return alert("No hay auditorías en pantalla para exportar.");
    let dE = globalAuditorias.map(a => ({
        "N° Auditoría": a.audit_num || '',
        "Fecha Programada": a.fecha ? window.formatearFechaAbreviada(a.fecha) : '',
        "Horario": `${a.hora_inicio || ''} - ${a.hora_fin || ''}`,
        "Lugar / Modalidad": a.lugar || '',
        "Requisitos / Norma OEA": a.requisitos || '',
        "Organización": a.organizacion || '',
        "Dirección": a.direccion || '',
        "Auditado(s)": a.auditado || '',
        "Auditor(es)": a.auditor || '',
        "Estado Actual": a.estado || '',
        "Observaciones": a.observacion || ''
    }));
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dE), "Auditorias_Programadas");
    XLSX.writeFile(wb, "Calendario_Auditorias_SGC.xlsx");
};

window.renderTablaAuditorias = (yf) => {
    if(!$('tbody-auditorias')) return; 
    let isAdm = currentUser.permisos.p_audit_admin || currentUser.permisos.admin || currentUser.permisos.p_gest_sgc;

    globalAuditorias = globalAllAuditorias.filter(a => { 
        if(a.fecha && !a.fecha.startsWith(yf)) return false; 
        return isAdm || (a.auditado && a.auditado.includes(currentUser.nombre)) || (a.auditor && a.auditor.includes(currentUser.nombre)); 
    });

    globalAuditorias.sort((a,b) => new Date(a.fecha) - new Date(b.fecha)); 
    let h = "";

    globalAuditorias.forEach(a => {
        let e = String(a.estado || 'Programada'); 
        let b = e === 'Completada' ? 'badge-success' : (e === 'En Progreso' ? 'badge-info' : (e === 'Pausada' ? 'badge-dark' : 'badge-warning'));
        let btn = `<button type="button" class="btn btn-primary" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.verModalAuditoria('${a.id}')">Ver</button>`;
        let roundLabel = a.rondas > 1 ? ` (R${a.rondas})` : '';
        
        const isAuditor = a.auditor && a.auditor.includes(currentUser.nombre); 
        const canControl = isAdm || isAuditor;
        
        if (canControl) { 
            if (e === 'Programada') btn += `<button type="button" class="btn btn-success" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.iniciarAuditoriaDirecto('${a.id}')">Iniciar</button>`; 
            else if (e === 'En Progreso') {
                btn += `<button type="button" class="btn btn-warning" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.pausarAuditoriaDirecto('${a.id}')">Pausar</button>`; 
                btn += `<button type="button" class="btn btn-danger" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.finalizarAuditoriaDirecto('${a.id}')">Fin</button>`;
            } else if (e === 'Pausada') {
                btn += `<button type="button" class="btn btn-success" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.reanudarAuditoriaDirecto('${a.id}')">Reanudar</button>`; 
                btn += `<button type="button" class="btn btn-danger" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.finalizarAuditoriaDirecto('${a.id}')">Fin</button>`;
            }
            btn += `<button type="button" class="btn btn-info" style="padding:4px;font-size:10px;margin-right:5px;" onclick="window.cargarAuditoriaParaEditar('${a.id}')">Ed</button>`;
        }
        
        if(isAdm) btn += `<button type="button" class="btn-icon-danger" onclick="window.del('Auditorias','${a.id}')"><span class="material-icons-round" style="font-size:16px;">delete</span></button>`;
        
        h += `<tr><td><b>${a.audit_num || '-'}</b></td><td><b>${window.formatearFechaAbreviada(a.fecha)}</b><br><small>${a.hora_inicio || ''} - ${a.hora_fin || ''}</small></td><td>${a.requisitos ? a.requisitos.substring(0,30) + '...' : '-'}</td><td>${a.auditado || '-'}</td><td>${a.auditor || '-'}</td><td><span class="badge ${b}">${e}${roundLabel}</span></td><td class="no-export" style="display:flex;gap:5px;align-items:center;">${btn}</td></tr>`;
    });
    window.setHtml('tbody-auditorias', h); 
    if(isAdm) window.verificarAlertasAuditoria(globalAuditorias);
};

window.iniciarAuditoriaDirecto = async (id) => { if(!confirm("¿Iniciar auditoría?")) return; window.showLoading(); await updateDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id), {estado:"En Progreso", hora_real_inicio:new Date().toISOString(), rondas: 1}); window.hideLoading(); };
window.finalizarAuditoriaDirecto = async (id) => { if(!confirm("¿Finalizar definitivamente?")) return; window.showLoading(); await updateDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id), {estado:"Completada", hora_real_fin:new Date().toISOString()}); window.hideLoading(); };
window.pausarAuditoriaDirecto = async (id) => { 
    if(!confirm("¿Pausar auditoría para una nueva ronda?")) return; window.showLoading(); 
    const sn = await getDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id)); let r = sn.data().rondas || 1; 
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id), {estado:"Pausada", rondas: r + 1}); window.hideLoading(); 
};
window.reanudarAuditoriaDirecto = async (id) => { if(!confirm("¿Reanudar auditoría?")) return; window.showLoading(); await updateDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id), {estado:"En Progreso"}); window.hideLoading(); };

window.verModalAuditoria = async (id) => {
try {
    window.showLoading(); selectedAuditId = id; 
    const sn = await getDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", id)); 
    if(!sn.exists()) { window.hideLoading(); return alert("Auditoría no encontrada."); }
    
    selectedAuditData = sn.data(); const a = selectedAuditData || {};
    
    // Asignación segura
    ['ma-proceso','ma-lugar','ma-auditado','ma-auditor','ma-obs'].forEach(i => { window.setTxt(i, a[i.replace('ma-','')] || '-'); });
    
    window.setTxt('ma-num', a.audit_num || '-');
    window.setTxt('ma-proceso', a.requisitos || '-');
    window.setTxt('ma-fecha', window.formatearFechaAbreviada(a.fecha)); 
    window.setTxt('ma-hora', `${a.hora_inicio || ''} a ${a.hora_fin || ''}`); 
    window.setTxt('ma-req', a.requisitos || ''); 
    
    window.setTxt('rep-num', a.audit_num || '-');
    window.setTxt('rep-org', a.organizacion || '-');
    window.setTxt('rep-dir', a.direccion || '-');
    window.setTxt('rep-sitios', a.sitios || '-');
    window.setTxt('rep-fechas', a.fecha ? window.formatearFechaAbreviada(a.fecha) : '-');
    window.setTxt('rep-personal', a.personal || '-');
    window.setTxt('rep-turnos', a.turnos || '-');
    window.setTxt('rep-lider', globalAuditPlan ? globalAuditPlan.lider : '-');
    window.setTxt('rep-adicionales', a.auditor || '-');
    window.setTxt('rep-formacion', a.auditores_formacion || '-');
    window.setTxt('rep-alcance', globalAuditPlan ? globalAuditPlan.alcance : '-');
    
    let e = String(a.estado || 'Programada'); 
    if($('ma-estado-badge')) {
        $('ma-estado-badge').className = `badge ${e === 'Completada' ? 'badge-success' : (e === 'En Progreso' ? 'badge-info' : (e === 'Pausada' ? 'badge-dark' : 'badge-warning'))}`; 
        window.setTxt('ma-estado-badge', e.toUpperCase() + (a.rondas && a.rondas > 1 ? ` (RONDA ${a.rondas})` : ''));
    }
    
    window.setTxt('ma-inicio-real', a.hora_real_inicio ? new Date(a.hora_real_inicio).toLocaleString() : '---'); 
    window.setTxt('ma-fin-real', a.hora_real_fin ? new Date(a.hora_real_fin).toLocaleString() : '---');
    
    if(a.hora_real_inicio && a.hora_real_fin && $('ma-duracion')) { 
        let m = new Date(a.hora_real_fin) - new Date(a.hora_real_inicio); 
        window.setTxt('ma-duracion', `${Math.floor(m/3600000)}h ${Math.floor((m%3600000)/60000)}m`); 
    }
    
    const isAdm = currentUser.permisos.admin || currentUser.permisos.p_audit_admin;
    const isAud = a.auditor && a.auditor.includes(currentUser.nombre);
    
    const canEd = (isAdm || isAud) && e !== 'Completada'; 
    const canEdReporte = (isAdm || isAud); 
    
    window.setDisplay('btn-comenzar-auditoria', (isAdm || isAud) && (e === 'Programada' || e === 'Pausada') ? 'inline-block' : 'none'); 
    if($('btn-comenzar-auditoria')) window.setTxt('btn-comenzar-auditoria', e === 'Pausada' ? '▶️ REANUDAR AUDITORÍA' : '▶️ COMENZAR AUDITORÍA');
    window.setDisplay('btn-pausar-auditoria', (isAdm || isAud) && e === 'En Progreso' ? 'inline-block' : 'none');
    window.setDisplay('btn-finalizar-auditoria', (isAdm || isAud) && (e === 'En Progreso' || e === 'Pausada') ? 'inline-block' : 'none');
    
    let chatHtml = '';
    if(Array.isArray(a.bitacora)) {
        chatHtml = a.bitacora.map(c => `<div class="chat-msg"><b style="font-size:10px">${c.u}</b> <span style="font-size:9px;color:#94a3b8">${c.t}</span><br>${c.m}${c.archivo ? `<br><a href="#" onclick="window.abrirDocumento('${c.archivo}','${c.archivo_nombre}');return false;" style="font-size:10px;color:blue;">📎 Ver</a>` : ''}</div>`).join('');
    }
    window.setHtml('chat-box-audit', chatHtml);
    
    currentAuditF020 = Array.isArray(a.lista_verificacion) ? a.lista_verificacion : []; 
    window.renderF020();
    
    let rep = a.reporte_auditoria || {};
    let evidenciasSugeridas = (currentAuditF020 || []).map(i => `- ${i.pregunta || ''} -> ${i.comentarios || 'Sin detalles'}`).join('\n').trim();
    
    let cargosAuditados = [];
    if(a.auditado) {
        a.auditado.split(', ').forEach(nm => {
            let usr = allUsers.find(u => u.nombre === nm);
            if(usr && usr.role) cargosAuditados.push(usr.role);
        });
    }
    let cargoSugerido = cargosAuditados.length > 0 ? cargosAuditados.join(', ') : '';

    window.setVal('f003-conclusiones', rep.conclusiones || "");
    window.setVal('f003-n-proceso', rep.n_proceso || a.requisitos || "");
    window.setVal('f003-n-personal', rep.n_personal || a.auditado || "");
    window.setVal('f003-n-cargo', rep.n_cargo || cargoSugerido || "");
    window.setVal('f003-n-req', rep.n_req || a.requisitos || "");
    window.setVal('f003-n-doc', rep.n_doc || ""); 
    window.setVal('f003-n-evidencia', rep.n_evidencia || evidenciasSugeridas || "");
    
    ['f003-conclusiones','f003-n-proceso','f003-n-personal','f003-n-cargo','f003-n-req','f003-n-doc','f003-n-evidencia'].forEach(i => { if($(i)) $(i).disabled = !canEdReporte; });
    
    window.actualizarMetricasF003(canEdReporte); window.renderAuditSACs();
    
    window.setDisplay('btn-tab-f020', (isAdm || isAud) ? 'inline-block' : 'none'); 
    window.setDisplay('btn-add-f020', canEd ? 'inline-block' : 'none'); 
    window.setDisplay('btn-save-f020', canEd ? 'inline-block' : 'none'); 
    window.setDisplay('btn-submit-f020', canEd ? 'inline-block' : 'none'); 
    window.setDisplay('btn-save-f003', canEdReporte ? 'inline-block' : 'none'); 
    window.setDisplay('btn-add-sac-manual', canEdReporte ? 'inline-block' : 'none');
    
    window.switchAuditTab('info'); window.setDisplay('modal-auditoria', 'flex');
} catch(e) { 
    console.error("Error abriendo auditoría:", e); 
    alert("Hubo un error de lectura en el servidor. Por favor, actualice la página: " + e.message); 
} finally { 
    window.hideLoading(); 
}
};

window.comenzarAuditoria = async () => { if(selectedAuditData.estado === 'Pausada') { await window.reanudarAuditoriaDirecto(selectedAuditId); } else { await window.iniciarAuditoriaDirecto(selectedAuditId); } window.verModalAuditoria(selectedAuditId); };
window.pausarAuditoria = async () => { await window.pausarAuditoriaDirecto(selectedAuditId); window.verModalAuditoria(selectedAuditId); };
window.finalizarAuditoria = async () => { await window.finalizarAuditoriaDirecto(selectedAuditId); window.verModalAuditoria(selectedAuditId); };
window.enviarComentarioAuditoria = async () => { const b = $('ma-comentario-libre'); const th = b.innerHTML; const f = $('ma-file-comentario'); if(!b.innerText.trim() && !f.files[0]) return; window.showLoading(); let u = null, fn = null; if(f.files[0]) { u = await window.uploadToCloudinary(f.files[0]); fn = f.files[0].name; } await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId), {bitacora: arrayUnion({u:currentUser.nombre, m:`💬 ${th}`, t:new Date().toLocaleString(), archivo:u, archivo_nombre:fn})}); b.innerHTML=""; f.value=""; window.hideLoading(); window.verModalAuditoria(selectedAuditId); };

window.sincronizarF020DOM = () => {
    let dA = [];
    $$('#tbody-f020 tr').forEach(tr => {
        let inps = tr.querySelectorAll('.table-input, .table-select');
        if(inps.length >= 7) {
            dA.push({ id: tr.dataset.id, pregunta: inps[0].value, requisito: inps[1].value, comentarios: inps[2].value, auditado: inps[3].value, nc: inps[4].value, observacion: inps[5].value, fortaleza: inps[6].value });
        }
    });
    currentAuditF020 = dA;
};

window.renderF020 = () => {
    if(!$('tbody-f020')) return; 
    let canEd = selectedAuditData && String(selectedAuditData.estado||"") !== 'Completada' && (currentUser.permisos.admin || currentUser.permisos.p_audit_admin || (selectedAuditData.auditor && selectedAuditData.auditor.includes(currentUser.nombre))); 
    
    let h = "";
    let rqs = selectedAuditData && selectedAuditData.requisitos ? selectedAuditData.requisitos.split(', ') : [];
    let aOps = `<option value="">-- Sel --</option>` + (selectedAuditData && selectedAuditData.auditado ? selectedAuditData.auditado.split(', ').map(a => `<option value="${a}">${a}</option>`).join('') : '');

    if (Array.isArray(currentAuditF020)) {
        currentAuditF020.forEach((i, idx) => {
            let dis = canEd ? '' : 'disabled';
            let rOpt = `<option value="">-- Sel --</option>` + rqs.map(r => `<option value="${r}" ${i.requisito === r ? 'selected' : ''}>${r}</option>`).join('');
            let aOpt = `<option value="${i.auditado || ''}" selected>${i.auditado || '-- Sel --'}</option>` + aOps;
            let nOpt = `<option value="N/A" ${i.nc==='N/A'||!i.nc?'selected':''}>N/A</option><option value="NC Menor" ${i.nc==='NC Menor'?'selected':''}>NC Menor</option><option value="NC Mayor" ${i.nc==='NC Mayor'?'selected':''}>NC Mayor</option><option value="OM" ${i.nc==='OM'?'selected':''}>OM</option>`;
            let fOpt = `<option value="N/A" ${i.fortaleza==='N/A'||!i.fortaleza?'selected':''}>N/A</option><option value="Sí" ${i.fortaleza==='Sí'?'selected':''}>Sí</option>`;
            
            h += `<tr data-id="${i.id}">
                <td>${idx+1}</td>
                <td><textarea aria-label="f020_pregunta_${idx}" name="f020_pregunta_${idx}" class="table-input" rows="2" ${dis}>${i.pregunta||''}</textarea></td>
                <td><select aria-label="f020_req_${idx}" name="f020_req_${idx}" class="table-select" ${dis}>${rOpt}</select></td>
                <td><textarea aria-label="f020_comentario_${idx}" name="f020_comentario_${idx}" class="table-input" rows="2" ${dis}>${i.comentarios||''}</textarea></td>
                <td><select aria-label="f020_auditado_${idx}" name="f020_auditado_${idx}" class="table-select" ${dis}>${aOpt}</select></td>
                <td><select aria-label="f020_nc_${idx}" name="f020_nc_${idx}" class="table-select hallazgo-sel" ${dis}>${nOpt}</select></td>
                <td><textarea aria-label="f020_obs_${idx}" name="f020_obs_${idx}" class="table-input" rows="2" ${dis}>${i.observacion||''}</textarea></td>
                <td><select aria-label="f020_fort_${idx}" name="f020_fort_${idx}" class="table-select" ${dis}>${fOpt}</select></td>
                <td class="f020-action-col">${canEd ? `<button type="button" class="btn-icon-danger" onclick="window.eliminarF020('${i.id}')"><span class="material-icons-round">delete</span></button>` : ''}</td>
            </tr>`;
        }); 
    }
    window.setHtml('tbody-f020', h); $$('.f020-action-col').forEach(e => e.style.display = canEd ? '' : 'none');
};

window.agregarFilaF020 = () => { window.sincronizarF020DOM(); currentAuditF020.push({ id:'f020_'+Date.now(), pregunta:'', requisito:'', comentarios:'', auditado:'', nc:'N/A', observacion:'', fortaleza:'N/A' }); window.renderF020(); };
window.eliminarF020 = (id) => { if(!confirm("¿Eliminar este ítem de la lista?")) return; window.sincronizarF020DOM(); currentAuditF020 = currentAuditF020.filter(x => x.id !== id); window.renderF020(); };
window.guardarF020 = async (notificar=false) => { window.sincronizarF020DOM(); window.showLoading(); await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId), {lista_verificacion: currentAuditF020}); if(notificar) { window.sendNotification({to: EMAIL_ADMIN_SGC}, "F-020 Actualizado", `Auditor ${currentUser.nombre} subió F-020 para la auditoría ${selectedAuditData.audit_num}.`); alert("Guardado y Notificado a SGC"); } else { alert("Lista de Verificación (F-020) Guardada exitosamente."); } window.hideLoading(); window.verModalAuditoria(selectedAuditId); };
window.enviarPreguntasSGC = () => window.guardarF020(true);

window.generarBloqueNCDinamico = (i, idx, t, canEd) => {
let d = selectedAuditData?.reporte_auditoria?.detalles_nc?.[i.id] || {}; let dis = canEd ? '' : 'disabled';
return `<div style="border:1px solid #ccc;font-size:12px;margin-bottom:15px;" class="f003-hallazgo-block" data-id="${i.id}"><div style="display:grid;grid-template-columns:150px 1fr;"><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">No. de ${t}</div><div style="padding:8px;border:1px solid #ccc;">${idx}</div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Dpto/Función</div><div style="padding:0;border:1px solid #ccc;"><input aria-label="h_dep_${i.id}" type="text" name="h_dep_${i.id}" class="h-dep" value="${d.departamento||i.auditado||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Doc Ref</div><div style="padding:0;border:1px solid #ccc;"><input aria-label="h_doc_${i.id}" type="text" name="h_doc_${i.id}" class="h-doc" value="${d.doc_ref||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Requisito Afectado</div><div style="padding:0;border:1px solid #ccc;"><input aria-label="h_req_${i.id}" type="text" name="h_req_${i.id}" class="h-req" value="${d.requisito||i.requisito||''}" ${dis} style="border:none;width:100%;height:100%;"></div><div style="padding:8px;background:#f1f5f9;border:1px solid #ccc;">Detalle</div><div style="padding:0;border:1px solid #ccc;"><textarea aria-label="h_det_${i.id}" name="h_det_${i.id}" class="h-det" ${dis} style="border:none;width:100%;height:100%;min-height:40px;padding:8px;">${d.detalle||i.comentarios||i.pregunta||''}</textarea></div></div></div>`;
};

window.actualizarMetricasF003 = (canEd) => {
let nM = 0, nm = 0, om = 0, hM = "", hm = "", ho = ""; 
if (Array.isArray(currentAuditF020)) {
    currentAuditF020.forEach(i => { 
        if(i.nc === 'NC Mayor'){nM++; hM += window.generarBloqueNCDinamico(i,nM,'NC Mayor',canEd);} 
        if(i.nc === 'NC Menor'){nm++; hm += window.generarBloqueNCDinamico(i,nm,'NC Menor',canEd);} 
        if(i.nc === 'OM'){om++; ho += window.generarBloqueNCDinamico(i,om,'OM',canEd);} 
    });
}

window.setTxt('f003-nc-mayor', nM); window.setTxt('f003-nc-menor', nm); window.setTxt('f003-om', om);

window.setHtml('container-nc-menor', hm || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>"); 
window.setHtml('container-nc-mayor', hM || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>"); 
window.setHtml('container-om', ho || "<p style='font-size:11px;color:#94a3b8;'>Ninguna.</p>");
};

window.guardarF003 = async () => { 
window.showLoading(); let dN = {}; 
$$('.f003-hallazgo-block').forEach(b => dN[b.dataset.id] = {departamento:b.querySelector('.h-dep').value, doc_ref:b.querySelector('.h-doc').value, requisito:b.querySelector('.h-req').value, detalle:b.querySelector('.h-det').value}); 
let rD = { conclusiones:$('f003-conclusiones').value, n_proceso:$('f003-n-proceso').value, n_personal:$('f003-n-personal').value, n_cargo:$('f003-n-cargo').value, n_req:$('f003-n-req').value, n_doc:$('f003-n-doc').value, n_evidencia:$('f003-n-evidencia').value, detalles_nc:dN }; 
await updateDoc(doc(db,"artifacts",appId,"public","data","Auditorias",selectedAuditId),{reporte_auditoria:rD}); 
window.hideLoading(); alert("Reporte F-003 guardado."); 
};

window.renderAuditSACs = () => {
const tb = $('tbody-audit-sacs'); if(!tb) return; 
let hs = Array.isArray(currentAuditF020) ? currentAuditF020.filter(i => i.nc === 'NC Mayor' || i.nc === 'NC Menor' || i.nc === 'OM') : [];
if(hs.length === 0) { tb.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No hay NC/OM.</td></tr>"; return; } let ht = "";
hs.forEach((h, idx) => {
    let sac = globalAllSacs.find(s => s.f020_id === h.id), bd = '', es = 'SIN GENERAR', btn = '', cb = h.nc === 'NC Mayor' ? 'badge-danger' : (h.nc === 'NC Menor' ? 'badge-warning' : 'badge-info');
    if(sac) { 
        es = String(sac.estado || ''); let bs = es.includes('Abierta') ? 'badge-danger' : (es === 'En Seguimiento' ? 'badge-warning' : 'badge-success'); 
        bd = `<span class="badge ${bs}">${es.toUpperCase()}</span><br><small>${sac.sac_num}</small>`; btn = `<button type="button" class="btn btn-primary" style="padding:4px;font-size:10px;" onclick="window.verSAC('${sac.sac_id}')">VER</button>`; 
    } else { 
        bd = `<span class="badge badge-dark">NO CREADA</span>`; 
        if(currentUser.permisos.p_audit_auditor || currentUser.permisos.admin || currentUser.permisos.p_audit_admin || (selectedAuditData && selectedAuditData.auditor && selectedAuditData.auditor.includes(currentUser.nombre))) btn = `<button type="button" class="btn btn-info" style="padding:4px;font-size:10px;" onclick="window.abrirCrearSAC('${h.id}')">CREAR SAC</button>`; 
    }
    ht += `<tr><td><b>Ref. ${idx+1}</b><br><small>${(h.pregunta || "").substring(0,30)}...</small></td><td>${h.comentarios || ""}</td><td><span class="badge ${cb}">${h.nc}</span></td><td>${bd}</td><td>${btn}</td></tr>`;
}); tb.innerHTML = ht;
};

window.getUsersSelectHTML = (selectedValue) => {
    let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
    let op = '<option value="">-- Seleccionar --</option>';
    allUsers.forEach(u => {
        let isAudited = auds.includes(u.nombre) ? '⭐ ' : '';
        op += `<option value="${u.usuario}" ${selectedValue === u.usuario ? 'selected' : ''}>${isAudited}${u.nombre}</option>`;
    });
    return op;
};

window.addPlanRow = (d="", r="", i="", f="") => { 
    const tb = $('tbody-plan-accion'); if(!tb) return;
    let tr = document.createElement('tr'); 
    let selHTML = window.getUsersSelectHTML(r);
    tr.innerHTML = `
    <td style="border:1px solid #ccc; text-align:center;">${tb.children.length+1}</td>
    <td style="padding:0;"><textarea aria-label="plan_d" name="plan_d" class="plan-d" rows="2" style="width:100%;border:none;margin:0;resize:vertical;padding:8px;">${d}</textarea></td>
    <td style="padding:0;"><select aria-label="plan_r" name="plan_r" class="plan-r" style="width:100%;border:none;margin:0;padding:8px;background:transparent;">${selHTML}</select></td>
    <td style="padding:0;"><input aria-label="plan_i" type="date" name="plan_i" class="plan-i" value="${i}" style="width:100%;border:none;margin:0;padding:8px;"></td>
    <td style="padding:0;"><input aria-label="plan_f" type="date" name="plan_f" class="plan-f" value="${f}" style="width:100%;border:none;margin:0;padding:8px;"></td>
    <td style="text-align:center;"><button type="button" class="btn-icon-danger" onclick="this.parentElement.parentElement.remove()"><span class="material-icons-round">delete</span></button></td>`; 
    tb.appendChild(tr); 
};

window.addSeguimientoRow = (res="", r="", f="") => { 
    const tb = $('tbody-seguimiento'); if(!tb) return;
    let tr = document.createElement('tr'); 
    let selHTML = window.getUsersSelectHTML(r);
    tr.innerHTML = `
    <td style="border:1px solid #ccc; text-align:center;">${tb.children.length+1}</td>
    <td style="padding:0;"><textarea aria-label="seg_res" name="seg_res" class="seg-res" rows="2" style="width:100%;border:none;margin:0;resize:vertical;padding:8px;">${res}</textarea></td>
    <td style="padding:0;"><select aria-label="seg_r" name="seg_r" class="seg-r" style="width:100%;border:none;margin:0;padding:8px;background:transparent;">${selHTML}</select></td>
    <td style="padding:0;"><input aria-label="seg_f" type="date" name="seg_f" class="seg-f" value="${f}" style="width:100%;border:none;margin:0;padding:8px;"></td>
    <td style="text-align:center;"><button type="button" class="btn-icon-danger" onclick="this.parentElement.parentElement.remove()"><span class="material-icons-round">delete</span></button></td>`; 
    tb.appendChild(tr); 
};

window.aplicarBloqueosSAC = (isAuditor, isResp) => {
    ['sac-fecha', 'sac-proceso', 'sac-tipo', 'sac-tipo-doc-afectado', 'sac-fuente', 'sac-fuente-otro', 'sac-detalle', 'sac-dueno', 'sac-fecha-aprob-plan', 'sac-fecha-cierre', 'sac-check-cerrar'].forEach(fId => {
        if($(fId)) $(fId).disabled = !isAuditor;
    });

    ['sac-beneficio', 'sac-causa', 'sac-accion'].forEach(fId => {
        if($(fId)) $(fId).disabled = !(isResp || isAuditor);
    });

    $$('#tbody-plan-accion textarea, #tbody-plan-accion select, #tbody-plan-accion input, #tbody-plan-accion button').forEach(el => {
        el.disabled = !(isResp || isAuditor);
    });
    $$('#tbody-seguimiento textarea, #tbody-seguimiento select, #tbody-seguimiento input, #tbody-seguimiento button').forEach(el => {
        el.disabled = !isAuditor;
    });

    window.setDisplay('btn-add-plan', (isResp || isAuditor) ? 'inline-block' : 'none');
    window.setDisplay('btn-add-seguimiento', isAuditor ? 'inline-block' : 'none');
    window.setDisplay('btn-save-sac', (isResp || isAuditor) ? 'inline-block' : 'none');
};

window.abrirCrearSAC = (id) => {
let h = currentAuditF020.find(i => i.id === id); if(!h) return; currentEditingSacId = null; currentEditingF020Ref = h;
window.setTxt('sac-num', "POR ASIGNAR"); 
if($('sac-estado-badge')) { window.setTxt('sac-estado-badge', "NUEVA"); $('sac-estado-badge').className = "badge badge-info"; }
window.setVal('sac-fecha', new Date().toISOString().split('T')[0]);
window.setVal('sac-proceso', h.requisito || ""); 
window.setVal('sac-tipo', h.nc || "");

window.setHtml('sac-tipo-doc-afectado', '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join('')); window.setVal('sac-tipo-doc-afectado', ""); 
window.setVal('sac-fuente', "Auditoría Interna"); window.setVal('sac-fuente-otro', ""); window.setVal('sac-detalle', h.comentarios || h.pregunta || ""); window.setVal('sac-beneficio', ""); window.setVal('sac-causa', ""); 
window.setVal('sac-accion', h.observacion || "");

window.setHtml('tbody-plan-accion', ""); window.setVal('sac-fecha-aprob-plan', ""); window.setHtml('tbody-seguimiento', ""); window.setVal('sac-resp-cierre', ""); window.setVal('sac-fecha-cierre', ""); if($('sac-check-cerrar')) $('sac-check-cerrar').checked = false;

let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
let op = '<option value="">-- Responsable --</option>';
allUsers.forEach(u => { op += `<option value="${u.usuario}">${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
window.setHtml('sac-dueno', op); 

window.aplicarBloqueosSAC(true, true);
window.setDisplay('modal-sac', 'flex');
};

window.abrirCrearSACManual = () => {
currentEditingSacId = null; currentEditingF020Ref = null;
window.setTxt('sac-num', "POR ASIGNAR"); 
if($('sac-estado-badge')) { window.setTxt('sac-estado-badge', "NUEVA"); $('sac-estado-badge').className = "badge badge-info"; }
window.setVal('sac-fecha', new Date().toISOString().split('T')[0]);
window.setVal('sac-proceso', selectedAuditData?.requisitos || ""); 
window.setVal('sac-tipo', "OM");

window.setHtml('sac-tipo-doc-afectado', '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join('')); window.setVal('sac-tipo-doc-afectado', ""); 
window.setVal('sac-fuente', "Auditoría Interna"); window.setVal('sac-fuente-otro', ""); window.setVal('sac-detalle', ""); window.setVal('sac-beneficio', ""); window.setVal('sac-causa', ""); window.setVal('sac-accion', "");
window.setHtml('tbody-plan-accion', ""); window.setVal('sac-fecha-aprob-plan', ""); window.setHtml('tbody-seguimiento', ""); window.setVal('sac-resp-cierre', ""); window.setVal('sac-fecha-cierre', ""); if($('sac-check-cerrar')) $('sac-check-cerrar').checked = false;

let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
let op = '<option value="">-- Responsable --</option>';
allUsers.forEach(u => { op += `<option value="${u.usuario}">${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
window.setHtml('sac-dueno', op); 

window.aplicarBloqueosSAC(true, true);
window.setDisplay('modal-sac', 'flex');
};

// VER MODAL SAC CON PROTECCIÓN ANTI-CRASH
window.verSAC = (id) => {
try {
    let sac = globalAllSacs.find(s => s.sac_id === id); if(!sac) return; currentEditingSacId = id;
    window.setTxt('sac-num', sac.sac_num || ""); 
    let es = String(sac.estado || ""); let bs = es.includes('Abierta') ? 'badge-danger' : (es === 'En Seguimiento' ? 'badge-warning' : 'badge-success'); 
    if($('sac-estado-badge')) { window.setTxt('sac-estado-badge', es.toUpperCase()); $('sac-estado-badge').className = `badge ${bs}`; }

    window.setVal('sac-fecha', sac.fecha_registro || (sac.fecha_apertura ? sac.fecha_apertura.split('T')[0] : "")); 
    window.setVal('sac-proceso', sac.proceso || ""); 
    window.setVal('sac-tipo', sac.tipo_hallazgo || "");

    window.setHtml('sac-tipo-doc-afectado', '<option value="">-- No aplica --</option>' + tiposDocumento.map(t => `<option value="${t}">${t}</option>`).join('')); window.setVal('sac-tipo-doc-afectado', sac.tipo_doc_afectado || ""); 

    window.setVal('sac-fuente', sac.fuente_nc || "Auditoría Interna"); window.setVal('sac-fuente-otro', sac.fuente_otro || ""); window.setVal('sac-detalle', sac.detalle_nc || ""); window.setVal('sac-beneficio', sac.beneficio_esperado || ""); window.setVal('sac-causa', sac.causa_raiz || ""); window.setVal('sac-accion', sac.accion_implementar || "");

    let auds = selectedAuditData?.auditado ? selectedAuditData.auditado.split(', ') : []; 
    let op = '<option value="">-- Responsable --</option>';
    allUsers.forEach(u => { op += `<option value="${u.usuario}" ${sac.dueno_uid === u.usuario ? 'selected' : ''}>${auds.includes(u.nombre) ? '⭐ ' : ''}${u.nombre}</option>`; }); 
    window.setHtml('sac-dueno', op);

    window.setHtml('tbody-plan-accion', ""); if(Array.isArray(sac.plan_accion)) sac.plan_accion.forEach(p => window.addPlanRow(p.detalle, p.resp, p.inicio, p.fin)); 
    window.setVal('sac-fecha-aprob-plan', sac.fecha_aprobacion_plan || "");
    window.setHtml('tbody-seguimiento', ""); if(Array.isArray(sac.seguimiento)) sac.seguimiento.forEach(s => window.addSeguimientoRow(s.resultado, s.resp, s.fecha)); 

    window.setVal('sac-resp-cierre', sac.cerrado_por || ""); 
    window.setVal('sac-fecha-cierre', sac.fecha_cierre ? sac.fecha_cierre.split('T')[0] : ""); 
    if($('sac-check-cerrar')) $('sac-check-cerrar').checked = es === 'Cerrada'; 

    let isAuditor = currentUser.permisos.admin || currentUser.permisos.p_audit_admin || sac.auditor_nombre === currentUser.nombre || (selectedAuditData && selectedAuditData.auditor && selectedAuditData.auditor.includes(currentUser.nombre));
    let isResp = sac.dueno_uid === currentUser.usuario;
    window.aplicarBloqueosSAC(isAuditor, isResp);

    window.setDisplay('modal-sac', 'flex');
} catch (e) {
    console.error("Error al abrir SAC:", e);
    alert("Error procesando SAC: " + e.message);
}
};

window.guardarSAC = async () => {
window.showLoading(); let pA = [], sA = []; 

$$('#tbody-plan-accion tr').forEach(tr => { 
    let d = tr.querySelector('.plan-d').value; let r = tr.querySelector('.plan-r').value;
    let i = tr.querySelector('.plan-i').value; let f = tr.querySelector('.plan-f').value;
    if(d.trim()) pA.push({detalle: d, resp: r, inicio: i, fin: f}); 
});
$$('#tbody-seguimiento tr').forEach(tr => { 
    let res = tr.querySelector('.seg-res').value; let r = tr.querySelector('.seg-r').value; let f = tr.querySelector('.seg-f').value;
    if(res.trim()) sA.push({resultado: res, resp: r, fecha: f}); 
});

let es = "Abierta (En Plan)"; if($('sac-fecha-aprob-plan') && $('sac-fecha-aprob-plan').value) es = "En Seguimiento"; if($('sac-check-cerrar') && $('sac-check-cerrar').checked) es = "Cerrada";
let tipoDocAfectado = $('sac-tipo-doc-afectado') ? $('sac-tipo-doc-afectado').value : "";

let dt = { fecha_registro: getValSafe('sac-fecha'), proceso: getValSafe('sac-proceso'), tipo_doc_afectado: tipoDocAfectado, fuente_nc: getValSafe('sac-fuente'), fuente_otro: getValSafe('sac-fuente-otro'), beneficio_esperado: getValSafe('sac-beneficio'), causa_raiz: getValSafe('sac-causa'), accion_implementar: getValSafe('sac-accion'), dueno_uid: getValSafe('sac-dueno'), plan_accion: pA, fecha_aprobacion_plan: getValSafe('sac-fecha-aprob-plan'), seguimiento: sA, fecha_cierre: getValSafe('sac-fecha-cierre'), cerrado_por: getCheckedSafe('sac-check-cerrar') ? currentUser.nombre : "", estado: es };

try {
    let numSAC = "";
    if(!currentEditingSacId) {
        await runTransaction(db, async(t) => { 
            const sn = await t.get(doc(db,"artifacts",appId,"public","data","Contadores","sacs")); 
            let c = 1; if(sn.exists()) c = sn.data().count + 1; 
            t.set(doc(db,"artifacts",appId,"public","data","Contadores","sacs"), {count: c}); 
            numSAC = `SAC-${new Date().getFullYear()}-${String(c).padStart(3,'0')}`; 
        });
        dt.sac_num = numSAC; dt.audit_id = selectedAuditId || "N/A"; dt.f020_id = currentEditingF020Ref ? currentEditingF020Ref.id : "MANUAL"; dt.tipo_hallazgo = currentEditingF020Ref ? currentEditingF020Ref.nc : getValSafe('sac-tipo'); dt.detalle_nc = getValSafe('sac-detalle'); dt.fecha_apertura = new Date().toISOString(); dt.auditor_nombre = currentUser.nombre;
        await addDoc(collection(db, "artifacts", appId, "public", "data", "AccionesCorrectivas"), dt); 
        alert(`SAC ${numSAC} Generada.`);
    } else { 
        let sacExistente = globalAllSacs.find(s => s.sac_id === currentEditingSacId);
        numSAC = sacExistente ? sacExistente.sac_num : "N/A";
        dt.sac_num = numSAC; dt.auditor_nombre = sacExistente ? sacExistente.auditor_nombre : currentUser.nombre;
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "AccionesCorrectivas", currentEditingSacId), dt); 
        alert("SAC Actualizada."); 
    }

    let uD = allUsers.find(u => u.usuario === dt.dueno_uid);
    let respEmail = uD ? uD.email : '';
    let toEmails = new Set([EMAIL_ADMIN_SGC]);
    if(respEmail) toEmails.add(respEmail);
    if(currentUser.email) toEmails.add(currentUser.email);
    let destSAC = { to: Array.from(toEmails).join(','), cc: '' };

    let actionWord = !currentEditingSacId ? "ASIGNADA" : "ACTUALIZADA";
    let title = `SAC ${dt.sac_num} ${actionWord} - ${dt.estado}`;
    let msgMail = `
    <div style="font-family: sans-serif; color: #1e293b; width: 100%; border: 1px solid #fcd34d; border-radius: 8px; margin: auto;">
        <div style="background: #d97706; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">NOTIFICACIÓN DE ACCIÓN CORRECTIVA (SAC)</h2>
        </div>
        <div style="padding: 20px; line-height: 1.6; background: #fff;">
            <p>La Acción Correctiva <b>${dt.sac_num}</b> ha sido <b>${actionWord.toLowerCase()}</b>.</p>
            <div style="background: #fffbeb; padding: 15px; border-radius: 6px; border: 1px dashed #b45309; margin-bottom: 15px;">
                <b>Estado Actual:</b> <span style="font-weight:bold; color:#b45309;">${dt.estado}</span><br>
                <b>Tipo de Hallazgo:</b> ${dt.tipo_hallazgo || getValSafe('sac-tipo')}<br>
                <b>Requisito Evaluado:</b> ${dt.proceso}<br>
                <b>Responsable Asignado:</b> ${uD ? uD.nombre : dt.dueno_uid}<br>
                <b>Auditor / Creador:</b> ${dt.auditor_nombre}<br><br>
                <b>Detalle del Hallazgo:</b><br><i>${dt.detalle_nc || getValSafe('sac-detalle')}</i>
            </div>
            <p style="margin: 0;">Por favor, ingrese al módulo de Auditoría (F-023) para gestionar los planes de acción o dar seguimiento.</p>
        </div>
    </div>`;
    window.sendNotification(destSAC, title, msgMail);

    window.setDisplay('modal-sac', 'none'); 
    if(selectedAuditId) window.verModalAuditoria(selectedAuditId);
} catch(e) {
    console.error(e); alert("Error al guardar SAC.");
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
    hs += `<tr><td><b>${s.sac_num}</b></td><td>${s.proceso}</td><td><b style="${s.tipo_hallazgo === 'NC Mayor' ? 'color:var(--danger)' : 'color:var(--warning)'}">${s.tipo_hallazgo}</b></td><td>${uD ? uD.nombre : s.dueno_uid}</td><td><div style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${s.detalle_nc}">${s.detalle_nc}</div></td><td>${window.formatearFechaAbreviada(s.fecha_registro || s.fecha_apertura)}</td><td><span class="badge ${bs}">${es}</span></td><td>${s.fecha_cierre ? window.formatearFechaAbreviada(s.fecha_cierre) : '-'}</td><td class="no-export"><button type="button" class="btn btn-primary" style="padding:4px;font-size:10px;" onclick="window.verSACGlobal('${s.sac_id}', '${s.audit_id || 'N/A'}')">Revisar</button></td></tr>`;
}); 
window.setHtml('tbody-noconf', hs);
};

window.setFilterGestNC = () => window.renderF023Global();

window.verSACGlobal = async (sId, aId) => { 
try {
    selectedAuditData = null; selectedAuditId = null; 
    if(aId && aId !== "N/A" && aId !== "undefined") { 
        const sn = await getDoc(doc(db,"artifacts",appId,"public","data","Auditorias",aId)); 
        if(sn.exists()) { selectedAuditData = sn.data(); selectedAuditId = aId; } 
    } 
    window.verSAC(sId); 
} catch(e) {
    console.error("Error abriendo SAC global:", e);
    alert("Error de red abriendo registro SAC");
}
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
    window.hideLoading(); 
    
    if (localStorage.getItem('sgc_dark_mode') === 'true') {
        document.body.classList.add('dark-theme');
        const icon = document.getElementById('dark-mode-icon');
        const text = document.getElementById('dark-mode-text');
        if (icon && text) { icon.innerText = 'light_mode'; text.innerText = 'Claro'; }
    }

    const su = localStorage.getItem('sgc_session_user');
    if (su) {
        window.showLoading();
        try { 
            const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("usuario", "==", su)));
            if (!qs.empty) { currentUser = qs.docs[0].data(); window.completarLoginUI(); } else window.logout();
        } catch(e) { window.logout(); } 
        window.hideLoading();
    } else { window.setDisplay('login-screen', 'flex'); }
};

window.abrirModalDash = (tipo) => {
    if(!globalSolicitudes || globalSolicitudes.length === 0) return;
    
    let ms = globalSolicitudes.filter(s => s.uid === currentUser.usuario || (s.involucrados && currentUser.email && s.involucrados.includes(currentUser.email.toLowerCase())));
    let filtered = [];
    let title = "";
    
    if(tipo === 'mis_tot') { filtered = ms; title = "Mis Solicitudes Totales"; }
    else if(tipo === 'mis_pend') { filtered = ms.filter(s => !String(s.estado||"").includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado'); title = "Mis Solicitudes en Gestión / Pendientes"; }
    else if(tipo === 'mis_ok') { filtered = ms.filter(s => String(s.estado||"").includes('Aprobado Final')); title = "Mis Solicitudes Aprobadas"; }
    else if(tipo === 'mis_rech') { filtered = ms.filter(s => s.estado === 'Anulado' || s.estado === 'Rechazado'); title = "Mis Solicitudes Rechazadas / Anuladas"; }
    else if(tipo === 'glob_tot') { filtered = globalSolicitudes; title = "Total Histórico Global"; }
    else if(tipo === 'glob_pend') { filtered = globalSolicitudes.filter(s => !String(s.estado||"").includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado'); title = "Pendientes Globales"; }
    else if(tipo === 'glob_ok') { filtered = globalSolicitudes.filter(s => String(s.estado||"").includes('Aprobado Final')); title = "Aprobadas Globales"; }
    else if(tipo === 'glob_sla') {
        filtered = globalSolicitudes.filter(s => s.fecha_esperada_cierre || s.sla); 
        title = "Solicitudes con SLA Asignado";
    }

    let tbodyHTML = "";
    if(filtered.length === 0) {
        tbodyHTML = "<tr><td colspan='5' style='text-align:center; padding:20px; color:#64748b;'>No hay datos para mostrar</td></tr>";
    } else {
        filtered.forEach(s => {
            let estadoHTML = `<span class="badge ${s.estado === 'Anulado' || s.estado === 'Rechazado' ? 'badge-danger' : (String(s.estado||'').includes('Aprobado') ? 'badge-success' : 'badge-warning')}">${s.estado || 'En Trámite'}</span>`;
            tbodyHTML += `<tr>
                <td><b>${s.customId || 'N/A'}</b></td>
                <td>${s.tipo_documento || 'N/A'}</td>
                <td>${s.solicitante || 'N/A'}</td>
                <td>${estadoHTML}</td>
                <td class="no-export"><button class="btn btn-primary" style="padding:4px 10px; font-size:11px;" onclick="window.verDetalle('${s.docId}'); window.setDisplay('modal-dash-details', 'none');">Ver Solicitud</button></td>
            </tr>`;
        });
    }

    window.setTxt('m-dash-tit', title);
    window.setHtml('m-dash-tbody', tbodyHTML);
    window.setDisplay('modal-dash-details', 'flex');
};

// ==========================================
// MÓDULO DE FORMULARIOS DINÁMICOS
// ==========================================
let globalForms = [];
let formBuilderCampos = []; // Almacena temporalmente los campos mientras se construye
let formPermLlenarUsers = [];
let formPermVerUsers = [];
let formPermEditarUsers = [];
let editandoFormId = null;

window.renderPermTags = () => {
    let hl = '';
    formPermLlenarUsers.forEach((u, i) => {
        let us = allUsers.find(x => x.usuario === u);
        let name = us ? us.nombre : u;
        hl += `<div style="display:inline-flex; align-items:center; background:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:10px; font-size:11px;"><b>${name}</b> <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:var(--danger); margin-left:5px;" onclick="window.removePermUser('llenar', ${i})">close</span></div>`;
    });
    $('fb-perm-llenar-list').innerHTML = hl || '<span style="font-size:11px; color:var(--text-muted);">Cualquiera puede llenar</span>';

    let hv = '';
    formPermVerUsers.forEach((u, i) => {
        let us = allUsers.find(x => x.usuario === u);
        let name = us ? us.nombre : u;
        hv += `<div style="display:inline-flex; align-items:center; background:#fef3c7; color:#b45309; padding:4px 10px; border-radius:10px; font-size:11px;"><b>${name}</b> <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:var(--danger); margin-left:5px;" onclick="window.removePermUser('ver', ${i})">close</span></div>`;
    });
    $('fb-perm-ver-list').innerHTML = hv || '<span style="font-size:11px; color:var(--text-muted);">Cualquiera puede ver</span>';

    let he = '';
    formPermEditarUsers.forEach((u, i) => {
        let us = allUsers.find(x => x.usuario === u);
        let name = us ? us.nombre : u;
        he += `<div style="display:inline-flex; align-items:center; background:#dcfce7; color:#166534; padding:4px 10px; border-radius:10px; font-size:11px;"><b>${name}</b> <span class="material-icons-round" style="font-size:14px; cursor:pointer; color:var(--danger); margin-left:5px;" onclick="window.removePermUser('editar', ${i})">close</span></div>`;
    });
    $('fb-perm-editar-list').innerHTML = he || '<span style="font-size:11px; color:var(--text-muted);">Solo Creador/Admin</span>';
};

window.addPermUser = (type) => {
    let sel = $(`fb-perm-${type}-sel`).value;
    if(!sel) return;
    if(type === 'llenar') {
        if(!formPermLlenarUsers.includes(sel)) formPermLlenarUsers.push(sel);
    } else if (type === 'ver') {
        if(!formPermVerUsers.includes(sel)) formPermVerUsers.push(sel);
    } else if (type === 'editar') {
        if(!formPermEditarUsers.includes(sel)) formPermEditarUsers.push(sel);
    }
    window.renderPermTags();
};

window.removePermUser = (type, idx) => {
    if(type === 'llenar') formPermLlenarUsers.splice(idx, 1);
    else if(type === 'ver') formPermVerUsers.splice(idx, 1);
    else if(type === 'editar') formPermEditarUsers.splice(idx, 1);
    window.renderPermTags();
};

window.abrirModalNuevoFormulario = (id) => {
    editandoFormId = id || null;
    
    // Poblar selects
    let opt = '<option value="">Seleccionar usuario...</option>';
    allUsers.forEach(u => opt += `<option value="${u.usuario}">${u.nombre} (${u.usuario})</option>`);
    $('fb-perm-llenar-sel').innerHTML = opt;
    $('fb-perm-ver-sel').innerHTML = opt;
    $('fb-perm-editar-sel').innerHTML = opt;

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
            $('fb-is-eval').checked = !!f.is_eval;
            $('fb-is-dynamic').checked = !!f.is_dynamic;
            window.setDisplay('fb-dynamic-options-panel', !!f.is_dynamic ? 'block' : 'none');
            window.setVal('fb-dynamic-options', f.dynamic_options ? f.dynamic_options.join(', ') : '');
            formPermLlenarUsers = f.perm_llenar_users || [];
            formPermVerUsers = f.perm_ver_users || [];
            formPermEditarUsers = f.perm_editar_users || [];
            formBuilderCampos = f.campos ? JSON.parse(JSON.stringify(f.campos)) : [];
        } else {
            formBuilderCampos = [];
            window.setVal('fb-titulo', '');
            window.setVal('fb-desc', '');
            $('fb-is-eval').checked = false;
            $('fb-is-dynamic').checked = false;
            window.setDisplay('fb-dynamic-options-panel', 'none');
            window.setVal('fb-dynamic-options', '');
            formPermLlenarUsers = [];
            formPermVerUsers = [];
            formPermEditarUsers = [];
        }
    } else {
        window.setDisplay('btn-eliminar-form-interno', 'none');
        window.setDisplay('btn-ver-respuestas-interno', 'none');
        formBuilderCampos = [];
        window.setVal('fb-titulo', '');
        window.setVal('fb-desc', '');
        $('fb-is-eval').checked = false;
        formPermLlenarUsers = [];
        formPermVerUsers = [];
        formPermEditarUsers = [];
    }
    
    window.renderPermTags();
    window.setVal('fb-desc', '');
    window.setVal('fb-tipo-campo', 'text');
    window.setVal('fb-label-campo', '');
    window.setVal('fb-opciones-campo', '');
    $('fb-req-campo').checked = false;
    window.renderFormPreview();
    window.setDisplay('modal-form-builder', 'flex');
    
    // Listener para mostrar/ocultar panel de opciones si es select
    let sel = $('fb-tipo-campo');
    if(sel) {
        sel.onchange = (e) => {
            window.setDisplay('fb-opciones-panel', e.target.value === 'select' ? 'block' : 'none');
        };
    }
};

window.agregarCampoBuilder = () => {
    let tipo = getValSafe('fb-tipo-campo');
    let label = getValSafe('fb-label-campo').trim();
    let opciones = getValSafe('fb-opciones-campo').trim();
    let req = $('fb-req-campo') ? $('fb-req-campo').checked : false;

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
    window.setVal('fb-label-campo', '');
    window.setVal('fb-opciones-campo', '');
    $('fb-req-campo').checked = false;
    window.renderFormPreview();
};

window.eliminarCampoBuilder = (idx) => {
    formBuilderCampos.splice(idx, 1);
    window.renderFormPreview();
};

window.moverCampoArriba = (idx) => {
    if(idx > 0) {
        let temp = formBuilderCampos[idx];
        formBuilderCampos[idx] = formBuilderCampos[idx-1];
        formBuilderCampos[idx-1] = temp;
        window.renderFormPreview();
    }
};

window.moverCampoAbajo = (idx) => {
    if(idx < formBuilderCampos.length - 1) {
        let temp = formBuilderCampos[idx];
        formBuilderCampos[idx] = formBuilderCampos[idx+1];
        formBuilderCampos[idx+1] = temp;
        window.renderFormPreview();
    }
};

window.agregarFilaMatriz = (idx) => { 
    if(!formBuilderCampos[idx].matriz_filas) formBuilderCampos[idx].matriz_filas = [];
    formBuilderCampos[idx].matriz_filas.push({id: Date.now().toString(), label: ''}); 
    window.renderFormPreview(); 
};
window.eliminarFilaMatriz = (idx, filaIdx) => { formBuilderCampos[idx].matriz_filas.splice(filaIdx, 1); window.renderFormPreview(); };
window.actualizarFilaMatriz = (idx, filaIdx, val) => { formBuilderCampos[idx].matriz_filas[filaIdx].label = val; };

window.agregarColMatriz = (idx) => { 
    if(!formBuilderCampos[idx].matriz_cols) formBuilderCampos[idx].matriz_cols = [];
    formBuilderCampos[idx].matriz_cols.push({id: Date.now().toString(), label: 'Opc', score: 0, color: '#94a3b8'}); 
    window.renderFormPreview(); 
};
window.eliminarColMatriz = (idx, colIdx) => { formBuilderCampos[idx].matriz_cols.splice(colIdx, 1); window.renderFormPreview(); };
window.actualizarColMatriz = (idx, colIdx, prop, val) => { formBuilderCampos[idx].matriz_cols[colIdx][prop] = (prop==='score'?Number(val):val); };

window.actualizarCategoriaCampo = (idx, val) => {
    formBuilderCampos[idx].categoria = val;
};

window.editarOpcionesCampo = (i) => {
    let c = formBuilderCampos[i];
    let optsArray = c.opciones || [];
    let optsStr = optsArray.join(', ');
    let newOpts = prompt(`Edita las opciones separadas por coma:\n(Campo: ${c.label})`, optsStr);
    if(newOpts !== null) {
        let cleanOpts = newOpts.split(',').map(s => s.trim()).filter(s => s);
        if(cleanOpts.length > 0) {
            c.opciones = cleanOpts;
            window.renderFormPreview();
        } else {
            alert('Debes ingresar al menos una opción válida.');
        }
    }
};

window.renderFormPreview = () => {
    let container = $('fb-preview-area');
    if(!container) return;

    if(formBuilderCampos.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:50px;">El formulario está vacío. Añade campos desde el panel izquierdo.</p>';
        return;
    }

    let isDyn = $('fb-is-dynamic') && $('fb-is-dynamic').checked;
    let dynOptsRaw = getValSafe('fb-dynamic-options').trim();
    let dynOpts = dynOptsRaw ? dynOptsRaw.split(',').map(s => s.trim()).filter(s => s) : [];

    let groups = { '': [] };
    if(isDyn && dynOpts.length > 0) {
        dynOpts.forEach(opt => groups[opt] = []);
        formBuilderCampos.forEach((c, i) => {
            if(c.categoria && groups[c.categoria]) {
                groups[c.categoria].push({c, i});
            } else {
                groups[''].push({c, i});
            }
        });
    } else {
        groups[''] = formBuilderCampos.map((c, i) => ({c, i}));
    }

    const renderField = (c, i) => {
        let reqHTML = c.requerido ? '<span style="color:var(--danger)">*</span>' : '';
        
        let catHtml = '';
        if(isDyn && dynOpts.length > 0) {
            catHtml = `<select id="fb_cat_${i}" name="fb_cat_${i}" aria-label="Categoría del campo" style="margin:0; padding:2px 5px; font-size:11px; max-width:140px; border-radius:4px; border:1px solid var(--border);" onchange="window.actualizarCategoriaCampo(${i}, this.value)">
                <option value="">(Mostrar siempre)</option>`;
            dynOpts.forEach(opt => {
                let sel = (c.categoria === opt) ? 'selected' : '';
                catHtml += `<option value="${opt}" ${sel}>Solo en: ${opt}</option>`;
            });
            catHtml += `</select>`;
        }

        let fh = `<div style="background:white; padding:15px; border-radius:8px; margin-bottom:12px; border:1px solid var(--border); box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                    <div style="display:flex; flex-direction:column; gap:5px; flex:1;">
                        <input type="text" id="fb_fld_lbl_${i}" name="fb_fld_lbl_${i}" aria-label="Título del campo" value="${c.label}" onchange="formBuilderCampos[${i}].label = this.value; window.renderFormPreview();" style="font-size:14px; font-weight:600; color:var(--sidebar); border:1px dashed transparent; background:transparent; padding:2px 5px; margin:0; width:100%; transition:all 0.2s;" onfocus="this.style.border='1px dashed var(--primary)'; this.style.background='#fff';" onblur="this.style.border='1px dashed transparent'; this.style.background='transparent';" title="Clic para editar el título">
                        <div style="display:flex; gap:10px; align-items:center;">
                            <label for="fb_fld_req_${i}" style="font-size:11px; color:var(--text-muted); cursor:pointer; background:#f1f5f9; padding:2px 6px; border-radius:4px;"><input aria-label="fb_fld_req_${i}" type="checkbox" id="fb_fld_req_${i}" name="fb_fld_req_${i}" style="width:auto; margin:0; vertical-align:middle;" ${c.requerido ? 'checked' : ''} onchange="formBuilderCampos[${i}].requerido = this.checked; window.renderFormPreview();"> Obligatorio</label>
                            ${catHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:2px; flex-shrink:0; background:#f8fafc; border-radius:6px; padding:2px;">
                        ${i > 0 ? `<button type="button" onclick="window.moverCampoArriba(${i})" style="background:none; border:none; color:var(--primary); cursor:pointer; padding:4px;" title="Subir"><span class="material-icons-round" style="font-size:16px;">arrow_upward</span></button>` : ''}
                        ${i < formBuilderCampos.length - 1 ? `<button type="button" onclick="window.moverCampoAbajo(${i})" style="background:none; border:none; color:var(--primary); cursor:pointer; padding:4px;" title="Bajar"><span class="material-icons-round" style="font-size:16px;">arrow_downward</span></button>` : ''}
                        ${['select', 'radio', 'checkbox'].includes(c.tipo) ? `<button type="button" onclick="window.editarOpcionesCampo(${i})" style="background:none; border:none; color:var(--info); cursor:pointer; padding:4px;" title="Editar Opciones"><span class="material-icons-round" style="font-size:16px;">edit</span></button>` : ''}
                        <button type="button" onclick="window.eliminarCampoBuilder(${i})" style="background:none; border:none; color:var(--danger); cursor:pointer; padding:4px;" title="Eliminar"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                    </div>
                </div>`;
        
        if(c.tipo === 'text') fh += `<input aria-label="Campo de texto corto" type="text" id="prev_text_${i}" name="prev_text_${i}" disabled placeholder="Campo de texto corto" style="margin-bottom:0; background:#f8fafc;">`;
        else if(c.tipo === 'textarea') fh += `<textarea aria-label="Campo de texto largo" id="prev_textarea_${i}" name="prev_textarea_${i}" disabled placeholder="Campo de texto largo" rows="2" style="margin-bottom:0; background:#f8fafc;"></textarea>`;
        else if(c.tipo === 'number') fh += `<input aria-label="123" type="number" id="prev_num_${i}" name="prev_num_${i}" disabled placeholder="123" style="margin-bottom:0; background:#f8fafc;">`;
        else if(c.tipo === 'date') fh += `<input aria-label="prev_date_${i}" type="date" id="prev_date_${i}" name="prev_date_${i}" disabled style="margin-bottom:0; background:#f8fafc;">`;
        else if(c.tipo === 'checkbox') fh += `<label style="font-size:12px; color:var(--text-muted);" for="prev_chk_${i}"><input aria-label="prev_chk_${i}" type="checkbox" id="prev_chk_${i}" name="prev_chk_${i}" disabled style="margin-bottom:0; width:auto;"> Marcar casilla</label>`;
        else if(c.tipo === 'select') {
            fh += `<select aria-label="prev_sel_${i}" id="prev_sel_${i}" name="prev_sel_${i}" disabled style="margin-bottom:0; background:#f8fafc;">`;
            c.opciones.forEach(op => fh += `<option>${op}</option>`);
            fh += `</select>`;
        }
        else if(c.tipo === 'si_no') {
            fh += `<div style="display:flex; gap:15px; margin-top:5px;">
                    <label style="font-size:12px; color:var(--text-muted);" for="prev_si_${i}"><input aria-label="prev_si_${i}" type="radio" id="prev_si_${i}" name="prev_sino_${i}" disabled style="width:auto; margin-bottom:0;"> Sí</label>
                    <label style="font-size:12px; color:var(--text-muted);" for="prev_no_${i}"><input aria-label="prev_no_${i}" type="radio" id="prev_no_${i}" name="prev_sino_${i}" disabled style="width:auto; margin-bottom:0;"> No</label>
                  </div>`;
        }
        else if(c.tipo === 'archivo') {
            fh += `<input aria-label="prev_file_${i}" type="file" id="prev_file_${i}" name="prev_file_${i}" disabled style="margin-bottom:0; background:#f8fafc; padding:8px; border:1px dashed var(--border); width:100%;">`;
        }
        else if(c.tipo === 'semaforo') {
            fh += `<div style="background:#f1f5f9; padding:10px; border-radius:6px; margin-top:5px; border:1px solid var(--border);">
                    <p style="font-size:12px; font-weight:600; margin:0 0 10px 0; color:var(--text-main);">Configurar Columnas (Opciones y Puntaje)</p>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px;">`;
            if(c.matriz_cols) {
                c.matriz_cols.forEach((col, colIdx) => {
                    fh += `<div style="display:flex; align-items:center; background:white; padding:4px; border-radius:4px; border:1px solid var(--border); gap:5px;">
                            <input type="color" id="mat_col_color_${i}_${colIdx}" name="mat_col_color_${i}_${colIdx}" aria-label="Color" value="${col.color}" onchange="window.actualizarColMatriz(${i}, ${colIdx}, 'color', this.value)" style="width:20px; height:20px; padding:0; border:none;">
                            <input type="text" id="mat_col_label_${i}_${colIdx}" name="mat_col_label_${i}_${colIdx}" aria-label="Etiqueta" value="${col.label}" onchange="window.actualizarColMatriz(${i}, ${colIdx}, 'label', this.value)" style="width:80px; padding:2px 5px; font-size:11px; margin:0;" placeholder="Etiqueta">
                            <input type="number" id="mat_col_score_${i}_${colIdx}" name="mat_col_score_${i}_${colIdx}" aria-label="Puntaje" value="${col.score}" onchange="window.actualizarColMatriz(${i}, ${colIdx}, 'score', this.value)" style="width:50px; padding:2px 5px; font-size:11px; margin:0;" placeholder="Ptos">
                            <button type="button" class="btn-icon-danger" style="padding:2px;" onclick="window.eliminarColMatriz(${i}, ${colIdx})"><span class="material-icons-round" style="font-size:14px;">close</span></button>
                          </div>`;
                });
            }
            fh += `      <button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="window.agregarColMatriz(${i})">+ Columna</button>
                    </div>
                    
                    <p style="font-size:12px; font-weight:600; margin:10px 0 10px 0; color:var(--text-main);">Configurar Filas (Conceptos a evaluar)</p>
                    <div style="display:flex; flex-direction:column; gap:5px;">`;
            if(c.matriz_filas) {
                c.matriz_filas.forEach((fila, filaIdx) => {
                    fh += `<div style="display:flex; gap:5px;">
                            <input type="text" id="mat_fila_label_${i}_${filaIdx}" name="mat_fila_label_${i}_${filaIdx}" aria-label="Concepto a evaluar" value="${fila.label}" onchange="window.actualizarFilaMatriz(${i}, ${filaIdx}, this.value)" style="flex:1; padding:4px 8px; font-size:12px; margin:0;" placeholder="Concepto a evaluar...">
                            <button type="button" class="btn-icon-danger" style="padding:4px 8px;" onclick="window.eliminarFilaMatriz(${i}, ${filaIdx})"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                          </div>`;
                });
            }
            fh += `  </div>
                    <button class="btn btn-primary" style="padding:4px 10px; font-size:11px; margin-top:8px;" onclick="window.agregarFilaMatriz(${i})">+ Añadir Fila</button>
                  </div>`;
        }
        fh += `</div>`;
        return fh;
    };

    let h = '';
    if(isDyn && dynOpts.length > 0) {
        if(groups[''].length > 0) {
            h += `<div style="margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid var(--border);">
                    <h4 style="margin:0 0 15px 0; color:var(--text-main); font-size:14px; border-bottom:2px solid var(--border); padding-bottom:5px;">🌐 Campos Globales (Siempre Visibles)</h4>`;
            groups[''].forEach(item => h += renderField(item.c, item.i));
            h += `</div>`;
        }
        dynOpts.forEach(opt => {
            if(groups[opt].length > 0) {
                h += `<div style="margin-bottom:20px; background:#f0f9ff; padding:15px; border-radius:8px; border:1px solid #bae6fd;">
                        <h4 style="margin:0 0 15px 0; color:#0369a1; font-size:14px; border-bottom:2px solid #bae6fd; padding-bottom:5px;">📂 Categoría: ${opt}</h4>`;
                groups[opt].forEach(item => h += renderField(item.c, item.i));
                h += `</div>`;
            } else {
                 h += `<div style="margin-bottom:20px; opacity:0.6; background:#f8fafc; padding:10px 15px; border-radius:8px; border:1px dashed var(--border);">
                        <h4 style="margin:0; color:var(--text-muted); font-size:13px;">📂 Categoría: ${opt} <span style="font-size:11px; font-weight:normal;">(Sin campos configurados)</span></h4>
                      </div>`;
            }
        });
    } else {
        groups[''].forEach(item => h += renderField(item.c, item.i));
    }

    container.innerHTML = h;
};

// ==========================================
// LLENADO DE FORMULARIOS
// ==========================================
let currentFormLlenar = null;

window.abrirLlenarFormulario = (id) => {
    let f = globalForms.find(x => x.id === id);
    if (!f) return;

    if(f.perm_llenar_users && Array.isArray(f.perm_llenar_users) && f.perm_llenar_users.length > 0) {
        if(!f.perm_llenar_users.includes(currentUser.usuario)) {
            return alert("Acceso denegado: No estás autorizado directamente para llenar este formulario.");
        }
    }
    
    currentFormLlenar = f;
    
    $('fill-form-title').innerText = f.titulo;
    $('fill-form-desc').innerText = f.descripcion || 'Por favor, complete los siguientes campos:';
    
    let container = $('fill-form-container');
    if (!f.campos || f.campos.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Este formulario no tiene campos configurados.</p>';
    } else {
        let h = '';
        
        if(f.is_dynamic && f.dynamic_options && f.dynamic_options.length > 0) {
            h += `<div style="margin-bottom:30px; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid var(--border); box-shadow:0 10px 30px rgba(0,0,0,0.05); text-align:center;">
                    <div style="background:var(--primary); color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto;">
                        <span class="material-icons-round">category</span>
                    </div>
                    <label style="font-weight:700; font-size:16px; color:#0f172a; margin-bottom:15px; display:block;">Seleccione la Categoría a Evaluar</label>
                    <select aria-label="master-dynamic-select" id="master-dynamic-select" style="width:100%; max-width:400px; padding:12px; border-radius:8px; border:2px solid var(--primary); margin:0 auto; font-size:15px; font-weight:600; color:var(--primary); background:white; cursor:pointer; outline:none; display:block;" onchange="window.aplicarLogicaDinamica(this.value)">
                        <option value="">-- Mostrar Todo --</option>`;
            f.dynamic_options.forEach(opt => {
                h += `<option value="${opt}">${opt}</option>`;
            });
            h += `  </select>
                  </div>`;
        }

        f.campos.forEach(c => {
            let reqHTML = c.requerido ? '<span style="color:var(--danger)">*</span>' : '';
            let reqAttr = c.requerido ? 'required' : '';
            h += `<div class="dynamic-field-container" data-category="${c.categoria||''}" style="margin-bottom:25px; background:white; padding:20px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                    <label for="ans_${c.id}" style="font-size:15px; font-weight:600; color:#1e293b; display:block; margin-bottom:12px;">${c.label} ${reqHTML}</label>`;
            
            if(c.tipo === 'text') h += `<input aria-label="ans_${c.id}" type="text" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%; border:1px solid #cbd5e1; padding:10px; border-radius:6px;">`;
            else if(c.tipo === 'textarea') h += `<textarea aria-label="ans_${c.id}" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" rows="3" style="width:100%;"></textarea>`;
            else if(c.tipo === 'number') h += `<input aria-label="ans_${c.id}" type="number" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(c.tipo === 'date') h += `<input aria-label="ans_${c.id}" type="date" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;">`;
            else if(c.tipo === 'checkbox') h += `<label style="display:flex; align-items:center; gap:5px;" for="ans_chk_${c.id}"><input aria-label="ans_chk_${c.id}" type="checkbox" id="ans_chk_${c.id}" name="ans_${c.id}" style="width:auto; margin:0;"> Marcar</label>`;
            else if(c.tipo === 'select') {
                h += `<select aria-label="ans_${c.id}" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} class="search-bar" style="width:100%;"><option value="">-- Seleccione --</option>`;
                c.opciones.forEach(op => h += `<option value="${op}">${op}</option>`);
                h += `</select>`;
            }
            else if(c.tipo === 'si_no') {
                h += `<div style="display:flex; gap:15px; margin-top:5px;">
                        <label style="display:flex; align-items:center; gap:5px;" for="ans_${c.id}_si"><input aria-label="ans_${c.id}_si" type="radio" id="ans_${c.id}_si" name="ans_${c.id}" value="Sí" ${reqAttr} style="width:auto; margin:0;"> Sí</label>
                        <label style="display:flex; align-items:center; gap:5px;" for="ans_${c.id}_no"><input aria-label="ans_${c.id}_no" type="radio" id="ans_${c.id}_no" name="ans_${c.id}" value="No" ${reqAttr} style="width:auto; margin:0;"> No</label>
                      </div>`;
            }
            else if(c.tipo === 'archivo') {
                h += `<input aria-label="ans_${c.id}" type="file" id="ans_${c.id}" name="ans_${c.id}" ${reqAttr} style="margin-bottom:0; background:#f8fafc; padding:8px; border:1px dashed var(--border); width:100%;">`;
            }
            else if(c.tipo === 'semaforo') {
                h += `<div style="border:1px solid var(--border); border-radius:8px; overflow-x:auto;">
                        <table style="width:100%; text-align:left; border-collapse:collapse; min-width:400px;">
                            <thead style="background:#e2e8f0; font-size:12px;"><tr>
                                <th style="padding:10px;">Ítem / Concepto</th>`;
                if(c.matriz_cols) c.matriz_cols.forEach(col => h += `<th style="padding:10px; text-align:center;">${col.label}</th>`);
                h += `          </tr></thead>
                            <tbody id="tb_semaforo_${c.id}">`;
                if(c.matriz_filas) {
                    c.matriz_filas.forEach((fila, filaIdx) => {
                        h += `      <tr>
                                        <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px; font-weight:500;">${fila.label}</td>`;
                        if(c.matriz_cols) {
                            c.matriz_cols.forEach(col => {
                                h += `  <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center;">
                                            <input aria-label="ans_${c.id}_${filaIdx}" type="radio" name="ans_${c.id}_${filaIdx}" value="${col.id}" style="width:18px; height:18px; accent-color:${col.color}; cursor:pointer;" ${reqAttr}>
                                        </td>`;
                            });
                        }
                        h += `      </tr>`;
                    });
                }
                h += `          </tbody>
                        </table>
                      </div>`;
            }
            h += `</div>`;
        });
        container.innerHTML = h;
    }
    window.setDisplay('modal-fill-form', 'flex');
};

window.addFilaSemaforo = (cId) => {
    let tb = document.getElementById(`tb_semaforo_${cId}`);
    if(!tb) return;
    let tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="padding:8px;"><input type="text" class="sem-item search-bar" id="sem_item_${cId}_${Date.now()}" name="sem_item_${cId}" aria-label="Descripción del Semáforo" placeholder="Descripción..." style="width:100%; margin:0;" required></td>
        <td style="padding:8px;"><select class="sem-val search-bar" id="sem_val_${cId}_${Date.now()}" name="sem_val_${cId}" aria-label="Valor del Semáforo" style="width:100%; margin:0;" required onchange="this.style.backgroundColor = this.value==='Verde'?'#dcfce7':(this.value==='Amarillo'?'#fef3c7':(this.value==='Rojo'?'#fee2e2':'#fff'));"><option value="">--</option><option value="Verde">Verde (Ok)</option><option value="Amarillo">Amarillo (Alerta)</option><option value="Rojo">Rojo (Crítico)</option></select></td>
        <td style="padding:8px; text-align:center;"><button class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="this.parentElement.parentElement.remove()"><span class="material-icons-round" style="font-size:14px;">delete</span></button></td>
    `;
    tb.appendChild(tr);
};

window.aplicarLogicaDinamica = (cat) => {
    let containers = document.querySelectorAll('.dynamic-field-container');
    containers.forEach(div => {
        let fieldCat = div.getAttribute('data-category');
        if(!fieldCat || fieldCat === cat) {
            div.style.display = 'block';
            let inputs = div.querySelectorAll('input, select, textarea');
            inputs.forEach(i => i.disabled = false);
        } else {
            div.style.display = 'none';
            let inputs = div.querySelectorAll('input, select, textarea');
            inputs.forEach(i => i.disabled = true);
        }
    });
};

window.guardarFormularioLleno = async () => {
    if(!currentFormLlenar) return;
    
    // Validate inputs
    let respuestas = [];
    let isValid = true;

    window.showLoading();

    let masterCat = '';
    let masterSel = $('master-dynamic-select');
    if(currentFormLlenar.is_dynamic && masterSel) {
        masterCat = masterSel.value;
    }

    for (let c of currentFormLlenar.campos) {
        if(masterCat && c.categoria && c.categoria !== masterCat) {
             continue; // Skip conditionally hidden fields
        }

        let val = null;
        if(c.tipo === 'checkbox') {
            val = $(`ans_${c.id}`).checked;
        } else if(c.tipo === 'si_no') {
            let selected = document.querySelector(`input[name="ans_${c.id}"]:checked`);
            if (selected) val = selected.value;
            if (c.requerido && !val) isValid = false;
        } else if(c.tipo === 'semaforo') {
            val = [];
            if(c.matriz_filas) {
                c.matriz_filas.forEach((fila, filaIdx) => {
                    let selected = document.querySelector(`input[name="ans_${c.id}_${filaIdx}"]:checked`);
                    if(selected && c.matriz_cols) {
                        let colConfig = c.matriz_cols.find(col => col.id === selected.value);
                        if(colConfig) val.push({ fila: fila.label, col: colConfig.label, score: colConfig.score, color: colConfig.color });
                    }
                });
                if(c.requerido && val.length < c.matriz_filas.length) isValid = false;
            }
        } else if(c.tipo === 'archivo') {
            let fileInput = $(`ans_${c.id}`);
            if (fileInput.files.length > 0) {
                let fileUrl = await window.uploadToCloudinary(fileInput.files[0]);
                if(fileUrl) {
                    val = fileUrl;
                } else {
                    alert("Error subiendo el archivo de la pregunta: " + c.label);
                    isValid = false;
                }
            } else if (c.requerido) {
                isValid = false;
            }
        } else {
            val = getValSafe(`ans_${c.id}`);
            if (c.requerido && !val) isValid = false;
        }
        
        respuestas.push({ id_campo: c.id, label: c.label, tipo: c.tipo, respuesta: val });
    }

    if (!isValid) {
        window.hideLoading();
        alert("Por favor, complete todos los campos obligatorios (*) y espere a que los archivos suban.");
        return;
    }

    try {
        window.showLoading();
        let catSelect = $('master-dynamic-select');
        let catElegida = catSelect ? catSelect.value : null;
        const docRef = await addDoc(collection(db, "artifacts", appId, "public", "data", "FormulariosRespuestas"), {
            id_formulario: currentFormLlenar.id,
            titulo_formulario: currentFormLlenar.titulo,
            categoria_evaluada: catElegida,
            respuestas: respuestas,
            fecha_llenado: new Date().toISOString(),
            usuario: currentUser.nombre || currentUser.email || 'Anónimo',
            uid: currentUser.usuario || 'N/A'
        });
        window.hideLoading();
        alert("¡Formulario guardado exitosamente!");
        window.setDisplay('modal-fill-form', 'none');
    } catch (e) {
        window.hideLoading();
        console.error("Error al guardar respuesta:", e);
        alert("Ocurrió un error al enviar el formulario.");
    }
};

window.guardarFormulario = async () => {
    let titulo = getValSafe('fb-titulo').trim();
    let desc = getValSafe('fb-desc').trim();
    if(!titulo) return alert("El título del formulario es obligatorio.");
    if(formBuilderCampos.length === 0) return alert("Añade al menos un campo al formulario.");

    window.showLoading();
    try {
        let dynOptsRaw = getValSafe('fb-dynamic-options').trim();
        let formData = {
            titulo: titulo,
            descripcion: desc,
            campos: formBuilderCampos,
            is_eval: $('fb-is-eval').checked,
            is_dynamic: $('fb-is-dynamic').checked,
            dynamic_options: $('fb-is-dynamic').checked && dynOptsRaw ? dynOptsRaw.split(',').map(s => s.trim()).filter(s => s) : [],
            perm_llenar_users: formPermLlenarUsers,
            perm_ver_users: formPermVerUsers,
            perm_editar_users: formPermEditarUsers,
            estado: 'Activo',
            creado_por: currentUser.usuario,
            ultima_modificacion: new Date().toISOString()
        };
        
        if(editandoFormId) {
            await updateDoc(doc(db, "artifacts", appId, "public", "data", "Formularios", editandoFormId), formData);
            alert("Formulario actualizado con éxito.");
        } else {
            formData.fecha_creacion = new Date().toISOString();
            await addDoc(collection(db, "artifacts", appId, "public", "data", "Formularios"), formData);
            alert("Formulario guardado con éxito.");
        }
        window.setDisplay('modal-form-builder', 'none');
    } catch(e) {
        console.error(e);
        alert("Error al guardar el formulario.");
    } finally {
        window.hideLoading();
    }
};

window.eliminarFormularioInterno = () => {
    if(!editandoFormId) return;
    window.del('Formularios', editandoFormId);
    window.setDisplay('modal-form-builder', 'none');
};

window.verRespuestasFormularioInterno = () => {
    if(!editandoFormId) return;
    window.verRespuestasFormulario(editandoFormId);
    window.setDisplay('modal-form-builder', 'none');
};

window.renderTablaForms = () => {
    let tb = $('tbody-forms');
    if(!tb) return;
    if(globalForms.length === 0) {
        tb.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No hay formularios creados.</td></tr>';
        return;
    }

    let h = '';
    globalForms.sort((a,b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).forEach(f => {
        let bEst = f.estado === 'Activo' ? 'badge-success' : 'badge-danger';
        h += `<tr>
                <td><b>${f.titulo}</b></td>
                <td><small>${f.descripcion || '-'}</small></td>
                <td style="text-align:center;"><span class="badge badge-info">${f.campos ? f.campos.length : 0}</span></td>
                <td>${window.formatearFechaAbreviada(f.fecha_creacion)}</td>
                <td><span class="badge ${bEst}">${f.estado}</span></td>
                <td style="text-align:center;">
                    <button class="btn btn-primary" style="padding:6px 12px; font-size:12px; font-weight:600; box-shadow:0 2px 5px rgba(30,64,175,0.2);" onclick="window.abrirLlenarFormulario('${f.id}')" title="Llenar Formulario"><span class="material-icons-round" style="font-size:16px; vertical-align:middle; margin-right:4px;">assignment</span> Llenar</button>
                    ${(currentUser.permisos && currentUser.permisos.admin) || f.creado_por === currentUser.usuario || (f.perm_editar_users && f.perm_editar_users.includes(currentUser.usuario)) ? `<button class="btn btn-warning" style="padding:6px 12px; font-size:12px;" onclick="window.abrirModalNuevoFormulario('${f.id}')" title="Editar Formulario"><span class="material-icons-round" style="font-size:16px; vertical-align:middle;">edit</span></button>` : ''}
                </td>
              </tr>`;
    });
    tb.innerHTML = h;
};

// ==========================================

window.verDetalleDashboard = (tipo) => {
    let excludeAnuladas = false;
    let checkbox = document.getElementById('dash-exclude-anuladas');
    if (checkbox) excludeAnuladas = checkbox.checked;

    let solicitudesFiltered = globalSolicitudes || [];
    if (excludeAnuladas) {
        solicitudesFiltered = solicitudesFiltered.filter(s => s.estado !== 'Anulado' && s.estado !== 'Rechazado');
    }

    let titulo = '';
    let data = [];

    if (tipo === 'tot') {
        titulo = 'Total Solicitudes';
        data = solicitudesFiltered;
    } else if (tipo === 'pend') {
        titulo = 'Solicitudes Pendientes / En Curso';
        data = solicitudesFiltered.filter(s => !String(s.estado).includes('Aprobado Final') && s.estado !== 'Anulado' && s.estado !== 'Rechazado');
    } else if (tipo === 'ok') {
        titulo = 'Solicitudes Aprobadas Oficiales';
        data = solicitudesFiltered.filter(s => String(s.estado).includes('Aprobado Final'));
    } else if (tipo === 'sla') {
        titulo = 'Cumplimiento SLA (Aprobadas a tiempo)';
        data = solicitudesFiltered.filter(s => {
            let f_sla = s.sla || s.fecha_esperada_cierre;
            return String(s.estado).includes('Aprobado Final') && f_sla && s.fecha_final && s.fecha_final <= f_sla;
        });
    }

    if($('m-dash-tit')) $('m-dash-tit').innerHTML = `<span class="material-icons-round" style="vertical-align:middle; color:var(--primary); margin-right:8px;">insights</span> ${titulo} (${data.length})`;

    let html = '';
    data.forEach(s => {
        let f_sla = s.sla || s.fecha_esperada_cierre;
        let slaVisual = f_sla ? window.formatearFechaAbreviada(f_sla) : '-';
        html += `<tr>
            <td style="padding:12px; border-bottom:1px solid var(--border);"><b>${s.customId || s.id}</b><br><small style="color:var(--sidebar);">${window.formatearFechaAbreviada(s.fecha)}</small></td>
            <td style="padding:12px; border-bottom:1px solid var(--border);">${s.titulo}</td>
            <td style="padding:12px; border-bottom:1px solid var(--border);">${s.solicitante}</td>
            <td style="padding:12px; border-bottom:1px solid var(--border);"><span class="badge ${String(s.estado).includes('Aprobado') ? 'badge-success' : 'badge-warning'}">${s.estado || 'Pendiente'}</span><br><small>SLA: ${slaVisual}</small></td>
            <td class="no-export" style="padding:12px; border-bottom:1px solid var(--border);"><button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="window.setDisplay('modal-dash-details','none'); window.verDetalle('${s.docId || s.id}')">Ver Documento</button></td>
        </tr>`;
    });

    if(data.length === 0) {
        html = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--sidebar);">No hay datos para mostrar en esta categoría</td></tr>`;
    }

    if($('m-dash-tbody')) $('m-dash-tbody').innerHTML = html;
    window.setDisplay('modal-dash-details', 'flex');
};

window.extraerTodaInformacion = () => {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Librería de Excel no encontrada. Por favor recarga la página.');
            return;
        }
        
        let wb = XLSX.utils.book_new();

        const formatearDiferencia = (ini, fin) => { if(!ini || !fin) return "N/A"; const ms = new Date(fin) - new Date(ini); if(ms < 0) return "N/A"; const d = Math.floor(ms / 86400000); const h = Math.floor((ms % 86400000) / 3600000); const m = Math.floor((ms % 3600000) / 60000); if (d > 0) return `${d}d ${h}h ${m}m`; if (h > 0) return `${h}h ${m}m`; return `${m}m`; };

        // 1. Solicitudes
        let dataSolicitudes = [
            ["ID / Código", "Fecha Creada", "Solicitante", "Título", "Gerencia", "Prioridad", "Estado", "SLA / Esperada", "Fecha Cierre", "Autorizado Por", "Tiempo Fase 1 (Documentado)", "Tiempo Fase 2 (Verificado)", "Tiempo Fase 3 (Gerencia)", "Tiempo Fase 4 (SGC)", "Tiempo Total Flujo"]
        ];
        if (globalSolicitudes) {
            globalSolicitudes.forEach(s => {
                let isCanceled = (s.estado === 'Anulado' || s.estado === 'Rechazado');
                let t1 = isCanceled ? 'N/A' : formatearDiferencia(s.fase_0_ini, s.fase_0_fin);
                let t2 = isCanceled ? 'N/A' : formatearDiferencia(s.fase_1_ini, s.fase_1_fin);
                let t3 = isCanceled ? 'N/A' : formatearDiferencia(s.fase_2_ini, s.fase_2_fin);
                let t4 = isCanceled ? 'N/A' : formatearDiferencia(s.fase_3_ini, s.fase_3_fin);
                let tTot = isCanceled ? 'N/A' : formatearDiferencia(s.fase_0_ini, s.fecha_final || s.fase_3_fin || s.fase_2_fin || s.fase_1_fin || s.fase_0_fin);

                dataSolicitudes.push([
                    s.customId || s.id || '', s.fecha || '', s.solicitante || '', s.titulo || '', 
                    s.gerencia || '', s.prioridad || '', s.estado || '', 
                    s.sla || s.fecha_esperada_cierre || '', s.fecha_final || '', s.autorizado_por || '',
                    t1, t2, t3, t4, tTot
                ]);
            });
        }
        let wsSol = XLSX.utils.aoa_to_sheet(dataSolicitudes);
        XLSX.utils.book_append_sheet(wb, wsSol, "Solicitudes");

        // 2. Auditorías
        let dataAud = [
            ["ID Auditoría", "Lugar / Proceso", "Fecha", "Requisitos", "Líder", "Equipo Auditor", "Estado", "Puntaje Promedio"]
        ];
        if (globalAllAuditorias) {
            globalAllAuditorias.forEach(a => {
                dataAud.push([
                    a.id || '', a.lugar || '', a.fecha || '', a.requisitos || '', 
                    a.lider || '', a.auditores || '', a.estado || '', a.puntaje_global || ''
                ]);
            });
        }
        let wsAud = XLSX.utils.aoa_to_sheet(dataAud);
        XLSX.utils.book_append_sheet(wb, wsAud, "Auditorías");

        // 3. No Conformidades (SAC)
        let dataNC = [
            ["SAC N°", "Fecha de Emisión", "Tipo", "Requisito Evaluado", "Responsable", "Descripción", "Acción Inmediata", "Estado", "Fecha Cierre"]
        ];
        if (globalAllSacs) {
            globalAllSacs.forEach(n => {
                dataNC.push([
                    n.sac_n || '', n.fecha || '', n.tipo_sac || '', n.requisito_evaluado || '', 
                    n.responsable || '', n.descripcion || '', n.accion_inmediata || '', n.estado || '', n.fecha_cierre || ''
                ]);
            });
        }
        let wsNC = XLSX.utils.aoa_to_sheet(dataNC);
        XLSX.utils.book_append_sheet(wb, wsNC, "No Conformidades");

        // 4. Proveedores
        if (typeof globalProveedores !== 'undefined') {
            let dataProv = [
                ["RUC", "Razón Social", "Servicio", "Certificaciones", "Ev. Física", "Ev. TI", "Ev. RRHH", "Riesgo Global", "Estado", "Próxima Evaluación"]
            ];
            globalProveedores.forEach(p => {
                let f = parseFloat(p.ev_fisica) || 0; let t = parseFloat(p.ev_ti) || 0; let r = parseFloat(p.ev_rrhh) || 0;
                let prom = ((f+t+r)/3).toFixed(1);
                dataProv.push([
                    p.ruc || '', p.razon_social || '', p.servicio || '', p.certificaciones || '', 
                    f, t, r, prom, p.estado || '', p.fecha_proxima || ''
                ]);
            });
            let wsProv = XLSX.utils.aoa_to_sheet(dataProv);
            XLSX.utils.book_append_sheet(wb, wsProv, "Proveedores OEA");
        }

        // 5. Riesgos
        if (typeof globalRiesgos !== 'undefined') {
            let dataRiesgo = [
                ["ID Riesgo", "Proceso Afectado", "Amenaza", "Vulnerabilidad", "Probabilidad", "Impacto", "Severidad", "Acción Mitigación", "Responsable", "Estado"]
            ];
            globalRiesgos.forEach(r => {
                let sev = (parseInt(r.probabilidad) || 0) * (parseInt(r.impacto) || 0);
                dataRiesgo.push([
                    r.rsk_id || '', r.proceso || '', r.amenaza || '', r.vulnerabilidad || '', 
                    r.probabilidad || '', r.impacto || '', sev, r.accion_mitigacion || '', r.responsable || '', r.estado || ''
                ]);
            });
            let wsRiesgo = XLSX.utils.aoa_to_sheet(dataRiesgo);
            XLSX.utils.book_append_sheet(wb, wsRiesgo, "Matriz Riesgos OEA");
        }

        // Generar y Descargar Archivo Excel
        XLSX.writeFile(wb, `Backup_Sistema_Global_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
        console.error("Error al exportar a Excel:", error);
        alert("Ocurrió un error al generar el archivo Excel.");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    inicializarApp();
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js').then(registration => {
                console.log('SW Registrado con éxito: ', registration.scope);
            }).catch(err => {
                console.log('Fallo el registro de SW: ', err);
            });
        });
    }
});
