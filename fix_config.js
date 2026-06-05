const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The sec-estructura modal is broken - the opening div and gerencias/departamentos cards were removed.
// Line 621 has an orphaned </div> followed by h3 "Configuración Dinámica de Documentos".
// We need to:
// 1. Remove the orphaned </div> at line 621
// 2. Insert the full modal before the fragment at line 621

// Find the orphaned fragment that starts the damaged modal content
const orphan = `\r\n            </div>\r\n            <h3 style="margin:35px 0 20px; color:var(--primary); border-bottom:2px solid var(--border); padding-bottom:10px; font-size:20px;">Configuración Dinámica de Documentos</h3>`;

const fullModal = `

        <!-- MODAL CONFIGURACION SISTEMA -->
        <div id="sec-estructura" class="modal-overlay" style="display:none; z-index:2000;">
            <div class="modal-content" style="max-width:1200px; max-height: 90vh; overflow-y: auto; position:relative; display:block; padding:30px; height:auto;">
                <button type="button" class="btn-icon-danger" onclick="window.cerrarConfigSistema()" style="position:absolute; top:15px; right:15px; z-index:10;"><span class="material-icons-round">close</span></button>
            <div class="section-header">
                <div class="section-header-info">
                    <div class="section-header-icon" style="background: linear-gradient(135deg, #475569, #64748b);"><span class="material-icons-round">account_tree</span></div>
                    <div><h1>Configuraci&#243;n Estructural</h1><p id="config-empresa-subtitle">Gerencias, departamentos, tipos de documento y configuraci&#243;n din&#225;mica del sistema</p></div>
                </div>
            </div>
            <div class="resp-grid">
                <div class="card" style="border-top: 4px solid var(--accent);"><h3>Gerencias</h3><div style="display:flex; gap:0; margin-bottom:15px;"><input aria-label="g-nom" type="text" id="g-nom" placeholder="Ej: Gerencia de Log&#237;stica" style="margin:0; border-radius: 10px 0 0 10px;"><button class="btn btn-success" onclick="window.agregarGerencia()" style="border-radius: 0 10px 10px 0; padding:12px 15px;"><span class="material-icons-round">add</span></button></div><div id="list-ger" class="settings-list"></div></div>
                <div class="card" style="border-top: 4px solid var(--info);"><h3>Departamentos</h3><div style="display:flex; gap:0; margin-bottom:15px;"><select aria-label="d-ger-sel" id="d-ger-sel" style="margin:0; width:40%; border-radius: 10px 0 0 10px;"></select><input aria-label="d-nom" type="text" id="d-nom" placeholder="Nombre departamento" style="margin:0; border-radius: 0; width:60%;"><button class="btn btn-success" onclick="window.agregarDepartamento()" style="border-radius: 0 10px 10px 0; padding:12px 15px;"><span class="material-icons-round">add</span></button></div><div id="list-dep" class="settings-list"></div></div>
            </div>
            <h3 style="margin:35px 0 20px; color:var(--primary); border-bottom:2px solid var(--border); padding-bottom:10px; font-size:20px;">Configuraci&#243;n Din&#225;mica de Documentos</h3>`;

if (html.includes(orphan)) {
    html = html.replace(orphan, fullModal);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("✅ sec-estructura modal rebuilt");
} else {
    // Try alternative (LF only)
    const orphanLF = orphan.replace(/\r\n/g, '\n');
    if (html.includes(orphanLF)) {
        html = html.replace(orphanLF, fullModal);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log("✅ sec-estructura modal rebuilt (LF)");
    } else {
        console.log("Pattern not found - trying index-based approach");
        // Search for the h3 Config Dinámica line  
        const idx1 = html.indexOf('Configuración Dinámica de Documentos');
        console.log("Config Dinámica at idx:", idx1);
        // Find the </div> before it
        const before = html.substring(Math.max(0, idx1-200), idx1);
        console.log("Before:", JSON.stringify(before));
    }
}
