import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, updateDoc, setDoc, query, where, getDocs, arrayUnion, runTransaction, deleteDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// CONFIGURACIÓN FIREBASE
const firebaseConfig = { apiKey: "AIzaSyDdzCiachuhbE9jATz-TesPI2vUVIJrHjM", authDomain: "sistemadegestion-7400d.firebaseapp.com", projectId: "sistemadegestion-7400d", storageBucket: "sistemadegestion-7400d.firebasestorage.app", messagingSenderId: "709030283072", appId: "1:709030283072:web:5997837b36a448e9515ca5" };
const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const db = getFirestore(app); 
const appId = 'sgc-final-v6';

// CONFIGURACIÓN EXTERNA (EMAILJS / CLOUDINARY)
const EMAIL_SERVICE_ID = "service_vumxptj", EMAIL_TEMPLATE_ID = "template_z27y5yk", EMAIL_PUBLIC_KEY = "kWsovOfdi7dBqLMw2", EMAIL_ADMIN_SGC = "sistemadegestion@fcipty.com"; 
(function() { emailjs.init(EMAIL_PUBLIC_KEY); })();

const CLOUD_NAME = "df79cjklp", UPLOAD_PRESET = "fci_documentos";
const PASOS_NOMBRES = ["Pendiente Documentado", "Pendiente Verificado", "Pendiente Aprobación Gerencia", "Pendiente Aprobación SGC"];

// HELPERS DOM
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const setDisplay = (id, val) => { if($(id)) $(id).style.display = val; };
const setTxt = (id, txt) => { if($(id)) $(id).innerText = txt; };
const setVal = (id, val) => { if($(id)) $(id).value = val; };
const setHtml = (id, html) => { if($(id)) $(id).innerHTML = html; };

// ESTADO GLOBAL
let currentUser = null, selectedId = null, selectedDocData = null, tempAction = "";
let allUsers = [], allDepartamentos = [], tiposDocumento = [], columnasMaestro = [], estatusMaestro = [], dataMaestro = [], editandoMaestroId = null;
let globalSolicitudes = [], globalAuditPlan = null, globalAllAuditorias = [], globalAuditorias = [], selectedAuditId = null, selectedAuditData = null, editandoAuditoriaId = null;
let currentAuditF020 = [], globalAllSacs = [];
let requisitosOEA = []; let manualOEA = { url: "", nombre: "" };

// ==========================================
// FUNCIONES GLOBALES DE INTERFAZ
// ==========================================

window.showLoading = () => setDisplay('loading-overlay', 'flex'); 
window.hideLoading = () => setDisplay('loading-overlay', 'none');
window.closeModal = () => setDisplay('modal', 'none'); 
window.cerrarModalAuditoria = () => setDisplay('modal-auditoria', 'none');
window.cerrarModalUsuario = () => setDisplay('modal-usuario', 'none');
window.abrirModalUsuario = () => { window.resetUserForm(); setDisplay('modal-usuario', 'flex'); };
window.toggleModPanel = v => setDisplay('panel-mod', v === 'Creación' ? 'none' : 'grid');

window.cambiarVista = (id, btn) => {
  $$('.section').forEach(s => s.classList.remove('active')); $$('.nav-link').forEach(l => l.classList.remove('active'));
  if($(id)) $(id).classList.add('active'); if(btn) btn.classList.add('active');
  if(window.innerWidth <= 768) { if($('sidebar')) $('sidebar').classList.remove('open'); if($('sidebar-overlay')) $('sidebar-overlay').classList.remove('active'); }
};

window.toggleMenu = () => { if($('sidebar')) $('sidebar').classList.toggle('open'); if($('sidebar-overlay')) $('sidebar-overlay').classList.toggle('active'); };

// ==========================================
// LÓGICA DE DESCANSO VISUAL (MODO OSCURO)
// ==========================================
window.toggleDarkMode = () => {
    const body = document.body;
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('sgc_dark_mode', isDark);
    
    const icon = document.getElementById('dark-mode-icon');
    const text = document.getElementById('dark-mode-text');
    if (icon && text) {
        icon.innerText = isDark ? 'light_mode' : 'dark_mode';
        text.innerText = isDark ? 'Claro' : 'Descanso';
    }
};

// ==========================================
// AUTENTICACIÓN (USUARIO Y CONTRASEÑA)
// ==========================================

window.iniciarSesion = async () => {
  const u = $('login-user').value.toLowerCase().trim(); 
  const p = $('login-pass').value.trim();
  if (!u || !p) return alert("Por favor, ingresa tu usuario e ID."); 
  window.showLoading();
  try {
    const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("usuario", "==", u), where("pass", "==", p)));
    if(!qs.empty) { 
        localStorage.setItem('sgc_session_user', u); 
        currentUser = qs.docs[0].data(); 
        window.completarLoginUI(); 
    } else {
        alert("Credenciales incorrectas.");
    }
  } catch (error) { 
      alert("Error de conexión con el servidor."); 
  } finally { 
      window.hideLoading(); 
  }
};

window.logout = () => { 
    localStorage.removeItem('sgc_session_user'); 
    currentUser = null; 
    setDisplay('sidebar', 'none'); 
    setDisplay('main', 'none'); 
    setDisplay('login-screen', 'flex'); 
    setVal('login-user', ''); 
    setVal('login-pass', ''); 
};

window.completarLoginUI = () => {
  setDisplay('login-screen', 'none'); setDisplay('sidebar', 'flex'); setDisplay('main', 'block');
  setTxt('curr-name', currentUser.nombre || 'Usuario'); 
  setTxt('curr-ger', currentUser.gerencias ? currentUser.gerencias.join(', ') : (currentUser.gerencia || 'Sin Gerencia'));

  const p = currentUser.permisos || {}; const isAdm = p.admin || false;
  const canDash = isAdm || p.p_gest_sgc || p.p_paso1 || p.p_paso2 || p.p_paso4;
  
  setDisplay('nav-dash', canDash ? 'flex' : 'none'); 
  setDisplay('nav-hist', (p.p_ver_propias || isAdm) ? 'flex' : 'none'); 
  setDisplay('nav-all', (p.p_ver_todas || p.p_ver_ger || isAdm) ? 'flex' : 'none'); 
  setDisplay('nav-crear', (p.can_solicit || isAdm) ? 'flex' : 'none'); 
  setDisplay('nav-gest', (p.p_gest_sgc || p.p_ger_apr || p.p_paso1 || p.p_paso2 || p.p_paso4 || isAdm) ? 'flex' : 'none'); 
  setDisplay('nav-listado', (p.p_ver_listado || isAdm) ? 'flex' : 'none');
  
  const canAud = p.p_audit_ver || p.p_audit_admin || p.p_audit_auditor || p.p_audit_dueno || isAdm; 
  setDisplay('nav-audit-group', canAud ? 'block' : 'none'); 
  setDisplay('nav-noconf', (p.p_audit_admin || p.p_gest_sgc || isAdm) ? 'flex' : 'none');
  
  const canRoot = p.p_users || p.p_struct || isAdm; 
  setDisplay('admin-only', canRoot ? 'block' : 'none'); 
  
  window.cargarDatosCentrales();
  window.cambiarVista('sec-dash', $('nav-dash'));
};

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

window.resetUserForm = () => {
  setHtml('user-form-title', `<span class="material-icons-round">person_add</span> Registrar / Editar Usuario`);
  setVal('u-nom', ''); setVal('u-usr', ''); if($('u-usr')) $('u-usr').disabled = false; setVal('u-pas', '123'); setVal('u-rol', ''); setVal('u-email', '');
  $$('#u-ger-list input[type="checkbox"]').forEach(cb => cb.checked = false);
  ['p-solicitar','p-ver-propias','p-ver-ger','p-ver-todas','p-paso1','p-paso2','p-paso4','p-gest-sgc','p-ger-apr','p-users','p-struct','p-ver-listado','p-audit-ver','p-audit-admin','p-audit-auditor','p-audit-dueno','p-admin'].forEach(i => { if($(i)) $(i).checked=false; });
  if($('btnSaveUser')) $('btnSaveUser').innerText = "GUARDAR USUARIO"; 
};

window.cargarUsuarioParaEditar = (uid) => {
  const u = allUsers.find(x => x.usuario === uid); if(!u) return;
  setHtml('user-form-title', `<span class="material-icons-round">edit</span> Editando: ${u.usuario}`);
  setVal('u-nom', u.nombre || ''); setVal('u-usr', u.usuario || ''); if($('u-usr')) $('u-usr').disabled = true; 
  setVal('u-pas', u.pass || ''); setVal('u-rol', u.role || ''); setVal('u-email', u.email || '');
  
  let gs = u.gerencias || []; 
  $$('#u-ger-list input[type="checkbox"]').forEach(cb => { cb.checked = gs.includes(cb.value); });
  
  const p = u.permisos || {};
  const map = { 'p-solicitar':'can_solicit', 'p-ver-propias':'p_ver_propias', 'p-ver-ger':'p_ver_ger', 'p-ver-todas':'p_ver_todas', 'p-paso1':'p_paso1', 'p-paso2':'p_paso2', 'p-paso4':'p_paso4', 'p-gest-sgc':'p_gest_sgc', 'p-ger-apr':'p_ger_apr', 'p-users':'p_users', 'p-struct':'p_struct', 'p-ver-listado':'p_ver_listado', 'p-audit-ver':'p_audit_ver', 'p-audit-admin':'p_audit_admin', 'p-audit-auditor':'p_audit_auditor', 'p-audit-dueno':'p_audit_dueno', 'p-admin':'admin' };
  
  for(let id in map) { if($(id)) $(id).checked = p[map[id]] || false; }
  setTxt('btnSaveUser', "ACTUALIZAR USUARIO"); 
  setDisplay('modal-usuario', 'flex');
};

window.guardarUsuario = async () => {
  const n = $('u-nom').value.trim(), u = $('u-usr').value.toLowerCase().trim(), p = $('u-pas').value.trim(), e = $('u-email').value.trim().toLowerCase(), gs = []; 
  $$('#u-ger-list input:checked').forEach(cb => gs.push(cb.value));
  
  if(!n || !u || !p || gs.length === 0) return alert("Nombre, Usuario, ID y al menos 1 Gerencia son obligatorios.");
  
  window.showLoading();
  const pm = { 
      can_solicit: $('p-solicitar').checked, p_ver_propias: $('p-ver-propias').checked, p_ver_ger: $('p-ver-ger').checked, 
      p_ver_todas: $('p-ver-todas').checked, p_paso1: $('p-paso1').checked, p_paso2: $('p-paso2').checked, 
      p_paso4: $('p-paso4').checked, p_gest_sgc: $('p-gest-sgc').checked, p_ger_apr: $('p-ger-apr').checked, 
      p_users: $('p-users').checked, p_struct: $('p-struct').checked, p_ver_listado: $('p-ver-listado').checked, 
      p_audit_ver: $('p-audit-ver').checked, p_audit_admin: $('p-audit-admin').checked, p_audit_auditor: $('p-audit-auditor').checked, 
      p_audit_dueno: $('p-audit-dueno').checked, admin: $('p-admin').checked 
  };

  try {
      await setDoc(doc(db, "artifacts", appId, "public", "data", "Usuarios", u), { 
          nombre: n, usuario: u, pass: p, email: e, gerencias: gs, gerencia: gs[0], role: $('u-rol').value, permisos: pm 
      }, { merge: true });
      window.cerrarModalUsuario();
      alert("Usuario guardado correctamente.");
  } catch(err) {
      alert("Error al guardar usuario.");
  } finally {
      window.hideLoading();
  }
};

window.eliminarUsuario = async (uid) => {
    if(!confirm(`¿Eliminar permanentemente al usuario ${uid}?`)) return;
    window.showLoading();
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "Usuarios", uid));
    window.hideLoading();
};

// ==========================================
// GESTIÓN DOCUMENTAL (FILTROS Y TABLAS)
// ==========================================

window.filtrarTabla = (inputId, tbodyId) => {
  const filter = $(inputId).value.toLowerCase();
  const rows = $(tbodyId).getElementsByTagName('tr');
  for (let row of rows) {
    row.style.display = row.innerText.toLowerCase().includes(filter) ? '' : 'none';
  }
};

// ... (Aquí iría el resto de la lógica de crearSolicitud, verDetalle, etc.)
// Para brevedad y funcionalidad, asumo que las funciones de app (4).js son correctas 
// y solo necesitan ser integradas con el nuevo flujo de inicialización.

// ==========================================
// INICIALIZACIÓN DE LA APP
// ==========================================

window.cargarDatosCentrales = () => {
    // Escuchar Usuarios
    onSnapshot(collection(db, "artifacts", appId, "public", "data", "Usuarios"), (sn) => {
        allUsers = []; let hU = "";
        sn.forEach(d => { 
            let u = d.data(); allUsers.push(u);
            hU += `<tr><td>${u.nombre} (<b>${u.usuario}</b>)</td><td>${u.email||''}</td><td>${u.permisos.admin?'Admin':(u.role||'Usuario')}</td><td class="no-export"><button class="btn btn-info" style="padding:4px 8px; font-size:10px;" onclick="window.cargarUsuarioParaEditar('${u.usuario}')">Editar</button> <button class="btn btn-danger" style="padding:4px 8px; font-size:10px;" onclick="window.eliminarUsuario('${u.usuario}')">X</button></td></tr>`;
        });
        setHtml('tbody-users', hU);
    });

    // Escuchar Estructura (Gerencias/Deptos)
    onSnapshot(doc(db, "artifacts", appId, "public", "data", "Configuracion", "Estructura"), (sn) => {
        if(!sn.exists()) return;
        const d = sn.data(); allDepartamentos = d.departamentos || [];
        let gH = d.gerencias.map(g => `<option value="${g}">${g}</option>`).join('');
        setHtml('sol-ger', '<option value="">-- Seleccionar Gerencia --</option>' + gH);
        setHtml('u-ger-list', d.gerencias.map(g => `<label style="display:flex; gap:8px; font-size:13px; margin-bottom:6px;"><input type="checkbox" value="${g}" style="margin:0; width:16px;"> ${g}</label>`).join(''));
    });

    // Escuchar Solicitudes
    onSnapshot(collection(db, "artifacts", appId, "public", "data", "Solicitudes"), (sn) => {
        globalSolicitudes = []; sn.forEach(d => { let obj = d.data(); obj.docId = d.id; globalSolicitudes.push(obj); });
        // Aquí llamarías a renderTablasSolicitudes() que ya tienes en tu código previo
    });
};

const inicializarApp = async () => {
    window.hideLoading(); 
    
    // 1. Cargar preferencia de Modo Oscuro
    if (localStorage.getItem('sgc_dark_mode') === 'true') {
        document.body.classList.add('dark-theme');
        const icon = document.getElementById('dark-mode-icon');
        const text = document.getElementById('dark-mode-text');
        if (icon && text) { icon.innerText = 'light_mode'; text.innerText = 'Claro'; }
    }

    // 2. Verificar Sesión
    const su = localStorage.getItem('sgc_session_user');
    if (su) {
        window.showLoading();
        try { 
            const qs = await getDocs(query(collection(db, "artifacts", appId, "public", "data", "Usuarios"), where("usuario", "==", su)));
            if (!qs.empty) { 
                currentUser = qs.docs[0].data(); 
                window.completarLoginUI(); 
            } else {
                window.logout();
            }
        } catch(e) { 
            window.logout(); 
        } 
        window.hideLoading();
    } else { 
        setDisplay('login-screen', 'flex'); 
    }
};

document.addEventListener("DOMContentLoaded", inicializarApp);
