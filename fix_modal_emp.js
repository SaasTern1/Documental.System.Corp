const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find where to inject the modal - before </body>
const modalHtml = `
    <!-- MODAL DE EMPRESA -->
    <div id="modal-empresa" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:10001; align-items:center; justify-content:center; padding:20px;">
        <div style="background:var(--card-bg); border-radius:20px; padding:30px; width:100%; max-width:560px; border:1px solid var(--border); box-shadow:0 25px 50px rgba(0,0,0,0.4);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border);">
                <h2 style="font-size:18px; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:10px;">
                    <span class="material-icons-round" style="color:#7c3aed;">business</span> Empresa
                </h2>
                <button onclick="window.cerrarModalEmpresa()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:22px;">&#10005;</button>
            </div>
            <div style="display:grid; gap:14px;">
                <div>
                    <label for="emp-nombre" style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Nombre Comercial *</label>
                    <input aria-label="emp-nombre" type="text" id="emp-nombre" placeholder="Ej: FCI Logistic" style="margin-top:4px;">
                </div>
                <div>
                    <label for="emp-razon" style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Razón Social</label>
                    <input aria-label="emp-razon" type="text" id="emp-razon" placeholder="Ej: FCI Logistic S.A." style="margin-top:4px;">
                </div>
                <div>
                    <label for="emp-ruc" style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">RUC / Identificación Fiscal *</label>
                    <input aria-label="emp-ruc" type="text" id="emp-ruc" placeholder="Ej: 40371-0093-279247 DV. 14" style="margin-top:4px;">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label for="emp-estado" style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Estado</label>
                        <select aria-label="emp-estado" id="emp-estado" style="margin-top:4px;">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div>
                        <label for="emp-logo-url" style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">URL del Logo</label>
                        <input aria-label="emp-logo-url" type="text" id="emp-logo-url" placeholder="https://..." style="margin-top:4px;">
                        <p style="font-size:10px; color:#64748b; margin-top:2px;">Pega aquí la URL de tu logo (Cloudinary, Drive, etc.)</p>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:24px; padding-top:16px; border-top:1px solid var(--border);">
                <button class="btn" onclick="window.cerrarModalEmpresa()" style="background:var(--bg); border:1px solid var(--border);">Cancelar</button>
                <button id="btn-save-empresa" class="btn btn-primary" onclick="window.guardarEmpresa()" style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                    <span class="material-icons-round" style="font-size:16px;">save</span> Guardar Empresa
                </button>
            </div>
        </div>
    </div>
`;

if (!html.includes('modal-empresa')) {
    html = html.replace('</body>', modalHtml + '\n</body>');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Added modal-empresa to index.html");
} else {
    console.log("modal-empresa already exists");
}
