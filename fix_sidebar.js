const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The sidebar got damaged: the closing tags of nav-admin-sub and its parents were cut.
// Find the broken area and fix it.

const broken = `                        </button>
                <div style="overflow:hidden;">`;

const fixed = `                        </button>
                        </div><!-- nav-admin-sub -->
                    </div><!-- nav-accordion -->
                </div><!-- nav-admin-group -->
        </nav>

            <!-- GRUPO SUPER ADMIN (oculto por defecto) -->
            <div id="nav-superadmin-group" style="display:none;">
                <p style="font-size:10px; color:#7c3aed; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:20px; text-transform:uppercase; letter-spacing:0.1em;">&#127760; Plataforma</p>
                <button class="nav-link" id="nav-empresas" onclick="window.cambiarVista('sec-empresas', this)" style="color:#a78bfa;">
                    <span class="material-icons-round">business</span> Gesti&#243;n de Empresas
                </button>
                <!-- Selector de empresa activa -->
                <div style="padding: 8px 12px; margin-bottom:4px;">
                    <p style="font-size:9px; color:#7c3aed; font-weight:800; margin-bottom:6px; text-transform:uppercase;">Empresa Activa</p>
                    <select aria-label="empresa-selector" id="empresa-selector" onchange="window.cambiarEmpresaActiva(this.value)" style="width:100%; border-radius:8px; padding:6px 8px; font-size:11px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); color:#e2e8f0; cursor:pointer; font-weight:600;">
                    </select>
                </div>
            </div>

        <!-- Badge de empresa activa (visible para Super Admin) -->
        <div id="empresa-badge" style="display:none; margin: 8px 12px 0 12px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); border-radius:8px; padding:7px 12px;">
            <p style="font-size:9px; color:#a78bfa; font-weight:800; text-transform:uppercase; margin-bottom:2px;">&#127760; Viendo empresa</p>
            <p id="empresa-badge-nombre" style="font-size:11px; color:#e2e8f0; font-weight:700;">FCI Logistic</p>
        </div>

        <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 12px; margin-top:10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                <div style="width:36px; height:36px; background:linear-gradient(135deg, #059669, #10b981); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <span class="material-icons-round" style="color:#fff; font-size:18px;">person</span>
                </div>
                <div style="overflow:hidden;">`;

if (html.includes(broken)) {
    html = html.replace(broken, fixed);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Fixed sidebar structure!");
} else {
    console.log("Pattern not found");
    // Try to show what's near line 145
    const lines = html.split('\n');
    console.log("Lines 143-150:", lines.slice(143,150).join('\n'));
}
