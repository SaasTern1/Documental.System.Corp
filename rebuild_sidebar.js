const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldSidebar = `    <aside class="sidebar" id="sidebar">\r
        <div style="padding: 12px 0 20px; display:flex; align-items:center; gap:12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 18px;">\r
            <div style="width:42px; height:42px; background:linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(59,130,246,0.3); flex-shrink:0;">\r
                <span class="material-icons-round" style="color:#fff; font-size:22px;">verified_user</span>\r
            </div>\r
            <div>\r
                <h2 style="font-weight: 800; font-size: 13px; line-height: 1.3; color: #f1f5f9; letter-spacing: 0.3px;">Sistema de Gesti&#243;n</h2>\r
                <p style="font-size:10px; color:#64748b; margin-top:2px; letter-spacing:0.5px;">Certificación OEA</p>\r
            </div>\r
        </div>\r
        \r
        <nav style="flex:1">\r
            <p style="font-size:10px; color:#475569; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:5px;">MÓDULO DOCUMENTAL</p>\r
            <button class="nav-link" id="nav-hist" onclick="window.cambiarVista('sec-hist', this)"><span class="material-icons-round">history</span> Mis Solicitudes</button>\r
            <button class="nav-link" id="nav-all" onclick="window.cambiarVista('sec-all', this)" style="display:none;"><span class="material-icons-round">all_inbox</span> Todas las Solicitudes</button>\r
            <button class="nav-link" id="nav-dash" onclick="window.cambiarVista('sec-dash', this)"><span class="material-icons-round">dashboard</span> Panel Analítico</button>\r
            <button class="nav-link" id="nav-forms" onclick="window.cambiarVista('sec-forms', this)"><span class="material-icons-round">dynamic_form</span> Formularios</button>\r
            <button class="nav-link" id="nav-crear" onclick="window.cambiarVista('sec-crear', this)"><span class="material-icons-round">add_box</span> Crear Solicitud</button>\r
            <button class="nav-link" id="nav-gest" onclick="window.cambiarVista('sec-gest', this)" style="display:none;"><span class="material-icons-round">fact_check</span> Bandeja de Gestión</button>\r
            <button class="nav-link" id="nav-listado" onclick="window.cambiarVista('sec-listado', this)" style="display:none;"><span class="material-icons-round">library_books</span> Listado Maestro</button>\n
            <button class="nav-link" id="nav-drive" onclick="window.cambiarVista('sec-drive', this)"><span class="material-icons-round">cloud_circle</span> Repositorio</button>\r
\r
            <div id="nav-audit-group" style="display:none;">\r
                <p style="font-size:10px; color:#475569; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:20px;">MÓDULO DE AUDITORÍA</p>\r
                <button class="nav-link" id="nav-norma" onclick="window.cambiarVista('sec-norma', this)"><span class="material-icons-round">menu_book</span> Manual y Norma OEA</button>\r
                <button class="nav-link" id="nav-audit" onclick="window.cambiarVista('sec-audit', this)"><span class="material-icons-round">calendar_month</span> Calendario &amp; Ejecución</button>\r
                <button class="nav-link" id="nav-noconf" onclick="window.cambiarVista('sec-noconf', this)" style="display:none;"><span class="material-icons-round">warning</span> NC y Mejoras (F-023)</button>\r
            </div>\r
\r
            <div id="nav-oea-group" style="display:none;">\r
                <p style="font-size:10px; color:#475569; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:20px;">CUMPLIMIENTO OEA</p>\r
                        <button class="nav-link" id="nav-proveedores" onclick="window.cambiarVista('sec-proveedores', this)"><span class="material-icons-round">local_shipping</span> Evaluación Proveedores</button>\n
                <button class="nav-link" id="nav-riesgos" onclick="window.cambiarVista('sec-riesgos', this)"><span class="material-icons-round">query_stats</span> Matriz de Riesgos</button>\n
            </div>\n
\n
            <div id="nav-admin-group" style="display:none;">\n
                <p style="font-size:10px; color:#475569; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:20px;">SISTEMA</p>\n
                <div class="nav-accordion">\n
                    <button class="nav-link" onclick="let sub = document.getElementById('nav-admin-sub'); sub.style.display = sub.style.display === 'none' ? 'block' : 'none';" style="justify-content:space-between; width:100%;">\n
                        <div style="display:flex; align-items:center;"><span class="material-icons-round">settings</span> Configuración</div>\n
                        <span class="material-icons-round" style="font-size:18px; margin-right:0;">expand_more</span>\n
                    </button>\n
                    <div id="nav-admin-sub" style="display:none; background:rgba(0,0,0,0.1); border-radius:8px; margin: 0 10px 10px 10px; padding:5px 0;">\n
                        <button class="nav-link" id="nav-users" onclick="window.setDisplay('sec-usuarios', 'flex')" style="padding-left:35px; font-size:12px; height:auto; padding-top:8px; padding-bottom:8px;">\n
                            <span class="material-icons-round" style="font-size:16px;">people</span> Usuarios y Permisos\n
                        </button>\n
                        <button class="nav-link" id="nav-struct" onclick="window.abrirConfigSistema()" style="padding-left:35px; font-size:12px; height:auto; padding-top:8px; padding-bottom:8px;">\n
                            <span class="material-icons-round" style="font-size:16px;">account_tree</span> Config. Sistema\n
                        </button>\n
                    </div><!-- nav-admin-sub -->\n
                    </div><!-- nav-accordion -->\n
                </div><!-- nav-admin-group -->\n
        </nav>\n
\n
            <!-- GRUPO SUPER ADMIN (oculto por defecto) -->\n
            <div id="nav-superadmin-group" style="display:none;">\n
                <p style="font-size:10px; color:#7c3aed; font-weight:800; margin-left:16px; margin-bottom:8px; margin-top:20px; text-transform:uppercase; letter-spacing:0.1em;">&#127760; Plataforma</p>\n
                <button class="nav-link" id="nav-empresas" onclick="window.cambiarVista('sec-empresas', this)" style="color:#a78bfa;">\n
                    <span class="material-icons-round">business</span> Gesti&#243;n de Empresas\n
                </button>\n
                <!-- Selector de empresa activa -->\n
                <div style="padding: 8px 12px; margin-bottom:4px;">\n
                    <p style="font-size:9px; color:#7c3aed; font-weight:800; margin-bottom:6px; text-transform:uppercase;">Empresa Activa</p>\n
                    <select aria-label="empresa-selector" id="empresa-selector" onchange="window.cambiarEmpresaActiva(this.value)" style="width:100%; border-radius:8px; padding:6px 8px; font-size:11px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); color:#e2e8f0; cursor:pointer; font-weight:600;">\n
                    </select>\n
                </div>\n
            </div>\n
\n
        <!-- Badge de empresa activa (visible para Super Admin) -->\n
        <div id="empresa-badge" style="display:none; margin: 8px 12px 0 12px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); border-radius:8px; padding:7px 12px;">\n
            <p style="font-size:9px; color:#a78bfa; font-weight:800; text-transform:uppercase; margin-bottom:2px;">&#127760; Viendo empresa</p>\n
            <p id="empresa-badge-nombre" style="font-size:11px; color:#e2e8f0; font-weight:700;">FCI Logistic</p>\n
        </div>\n
\n
        <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 12px; margin-top:10px; border: 1px solid rgba(255,255,255,0.06);">\r
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">\r
                <div style="width:36px; height:36px; background:linear-gradient(135deg, #059669, #10b981); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">\r
                    <span class="material-icons-round" style="color:#fff; font-size:18px;">person</span>\r
                </div>\r
                <div style="overflow:hidden;">\r
                    <p id="curr-name" style="font-weight: 700; font-size: 12px; color:#f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>\r
                    <p id="curr-ger" style="font-size: 10px; color: #64748b; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>\r
                </div>\r
            </div>\r
            <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">\r
                <button onclick="window.toggleDarkMode()" style="background:rgba(56,189,248,0.1); border:none; color:#38bdf8; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; padding:6px 10px; border-radius:6px; transition:0.2s;" title="Modo Oscuro"><span class="material-icons-round" id="dark-mode-icon" style="font-size:15px;">dark_mode</span></button>\r
                <button onclick="window.logout()" style="background:rgba(239,68,68,0.1); border:none; color:#ef4444; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; padding:6px 10px; border-radius:6px; transition:0.2s;" title="Cerrar Sesión"><span class="material-icons-round" style="font-size:15px;">logout</span> Salir</button>\r
            </div>\r
        </div>\r
    </aside>`;

const newSidebar = `    <aside class="sidebar" id="sidebar">
        <!-- LOGO / HEADER -->
        <div style="padding:12px 0 14px; display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.07); margin-bottom:8px;">
            <div style="width:38px; height:38px; background:linear-gradient(135deg,#3b82f6,#1d4ed8); border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(59,130,246,0.3); flex-shrink:0;">
                <span class="material-icons-round" style="color:#fff; font-size:20px;">verified_user</span>
            </div>
            <div>
                <h2 style="font-weight:800; font-size:12px; line-height:1.2; color:#f1f5f9;">Sistema de Gesti&#243;n</h2>
                <p style="font-size:9px; color:#475569; margin-top:1px;">Certificaci&#243;n OEA</p>
            </div>
        </div>

        <!-- NAV SCROLLABLE -->
        <nav style="flex:1; overflow-y:auto; overflow-x:hidden; padding-bottom:8px;">

            <!-- ── MÓDULO DOCUMENTAL (colapsable) ── -->
            <div class="nav-group">
                <button class="nav-group-header" onclick="window.toggleNavGroup('ng-documental')" id="ng-documental-btn">
                    <div style="display:flex;align-items:center;gap:7px;">
                        <span class="material-icons-round" style="font-size:15px;color:#60a5fa;">description</span>
                        <span>Documental</span>
                    </div>
                    <span class="material-icons-round ng-arrow" style="font-size:16px;transition:0.2s;">expand_more</span>
                </button>
                <div class="nav-group-body" id="ng-documental">
                    <button class="nav-link nav-sub" id="nav-hist" onclick="window.cambiarVista('sec-hist', this)"><span class="material-icons-round">history</span> Mis Solicitudes</button>
                    <button class="nav-link nav-sub" id="nav-all" onclick="window.cambiarVista('sec-all', this)" style="display:none;"><span class="material-icons-round">all_inbox</span> Todas las Solicitudes</button>
                    <button class="nav-link nav-sub" id="nav-crear" onclick="window.cambiarVista('sec-crear', this)"><span class="material-icons-round">add_box</span> Crear Solicitud</button>
                    <button class="nav-link nav-sub" id="nav-gest" onclick="window.cambiarVista('sec-gest', this)" style="display:none;"><span class="material-icons-round">fact_check</span> Bandeja de Gesti&#243;n</button>
                    <button class="nav-link nav-sub" id="nav-listado" onclick="window.cambiarVista('sec-listado', this)" style="display:none;"><span class="material-icons-round">library_books</span> Listado Maestro</button>
                    <button class="nav-link nav-sub" id="nav-forms" onclick="window.cambiarVista('sec-forms', this)"><span class="material-icons-round">dynamic_form</span> Formularios</button>
                    <button class="nav-link nav-sub" id="nav-dash" onclick="window.cambiarVista('sec-dash', this)"><span class="material-icons-round">dashboard</span> Panel Anal&#237;tico</button>
                    <button class="nav-link nav-sub" id="nav-drive" onclick="window.cambiarVista('sec-drive', this)"><span class="material-icons-round">cloud_circle</span> Repositorio</button>
                </div>
            </div>

            <!-- ── MÓDULO AUDITORÍA (colapsable, oculto hasta permisos) ── -->
            <div class="nav-group" id="nav-audit-group" style="display:none;">
                <button class="nav-group-header" onclick="window.toggleNavGroup('ng-auditoria')" id="ng-auditoria-btn">
                    <div style="display:flex;align-items:center;gap:7px;">
                        <span class="material-icons-round" style="font-size:15px;color:#34d399;">fact_check</span>
                        <span>Auditor&#237;a</span>
                    </div>
                    <span class="material-icons-round ng-arrow" style="font-size:16px;transition:0.2s;">expand_more</span>
                </button>
                <div class="nav-group-body" id="ng-auditoria">
                    <button class="nav-link nav-sub" id="nav-norma" onclick="window.cambiarVista('sec-norma', this)"><span class="material-icons-round">menu_book</span> Manual y Norma OEA</button>
                    <button class="nav-link nav-sub" id="nav-audit" onclick="window.cambiarVista('sec-audit', this)"><span class="material-icons-round">calendar_month</span> Calendario &amp; Ejecuci&#243;n</button>
                    <button class="nav-link nav-sub" id="nav-noconf" onclick="window.cambiarVista('sec-noconf', this)" style="display:none;"><span class="material-icons-round">warning</span> NC y Mejoras (F-023)</button>
                </div>
            </div>

            <!-- ── CUMPLIMIENTO OEA (colapsable, oculto hasta permisos) ── -->
            <div class="nav-group" id="nav-oea-group" style="display:none;">
                <button class="nav-group-header" onclick="window.toggleNavGroup('ng-oea')" id="ng-oea-btn">
                    <div style="display:flex;align-items:center;gap:7px;">
                        <span class="material-icons-round" style="font-size:15px;color:#fb923c;">gpp_good</span>
                        <span>Cumplimiento OEA</span>
                    </div>
                    <span class="material-icons-round ng-arrow" style="font-size:16px;transition:0.2s;">expand_more</span>
                </button>
                <div class="nav-group-body" id="ng-oea">
                    <button class="nav-link nav-sub" id="nav-proveedores" onclick="window.cambiarVista('sec-proveedores', this)"><span class="material-icons-round">local_shipping</span> Evaluaci&#243;n Proveedores</button>
                    <button class="nav-link nav-sub" id="nav-riesgos" onclick="window.cambiarVista('sec-riesgos', this)"><span class="material-icons-round">query_stats</span> Matriz de Riesgos</button>
                </div>
            </div>

            <!-- ── SISTEMA / ADMIN (colapsable, oculto hasta permisos) ── -->
            <div class="nav-group" id="nav-admin-group" style="display:none;">
                <button class="nav-group-header" onclick="window.toggleNavGroup('ng-sistema')" id="ng-sistema-btn">
                    <div style="display:flex;align-items:center;gap:7px;">
                        <span class="material-icons-round" style="font-size:15px;color:#a78bfa;">settings</span>
                        <span>Configuraci&#243;n</span>
                    </div>
                    <span class="material-icons-round ng-arrow" style="font-size:16px;transition:0.2s;">expand_more</span>
                </button>
                <div class="nav-group-body" id="ng-sistema" style="display:none;">
                    <button class="nav-link nav-sub" id="nav-users" onclick="window.setDisplay('sec-usuarios','flex')"><span class="material-icons-round">people</span> Usuarios y Permisos</button>
                    <button class="nav-link nav-sub" id="nav-struct" onclick="window.abrirConfigSistema()"><span class="material-icons-round">account_tree</span> Config. Sistema</button>
                </div>
            </div>

            <!-- ── PLATAFORMA / SUPER ADMIN ── -->
            <div class="nav-group" id="nav-superadmin-group" style="display:none;">
                <button class="nav-group-header" onclick="window.toggleNavGroup('ng-plataforma')" id="ng-plataforma-btn" style="border-color:rgba(124,58,237,0.3);">
                    <div style="display:flex;align-items:center;gap:7px;">
                        <span class="material-icons-round" style="font-size:15px;color:#a78bfa;">language</span>
                        <span style="color:#a78bfa;">Plataforma</span>
                    </div>
                    <span class="material-icons-round ng-arrow" style="font-size:16px;color:#a78bfa;transition:0.2s;">expand_more</span>
                </button>
                <div class="nav-group-body" id="ng-plataforma" style="display:none;">
                    <button class="nav-link nav-sub" id="nav-empresas" onclick="window.cambiarVista('sec-empresas', this)" style="color:#a78bfa;"><span class="material-icons-round">business</span> Gesti&#243;n de Empresas</button>
                    <div style="padding:6px 10px 2px;">
                        <p style="font-size:9px; color:#7c3aed; font-weight:800; margin-bottom:4px; text-transform:uppercase;">Empresa Activa</p>
                        <select aria-label="empresa-selector" id="empresa-selector" onchange="window.cambiarEmpresaActiva(this.value)" style="width:100%; border-radius:6px; padding:5px 8px; font-size:11px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); color:#e2e8f0; font-weight:600;"></select>
                    </div>
                </div>
            </div>

        </nav>

        <!-- BADGE EMPRESA ACTIVA -->
        <div id="empresa-badge" style="display:none; margin:6px 10px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); border-radius:8px; padding:6px 10px;">
            <p style="font-size:9px; color:#a78bfa; font-weight:800; text-transform:uppercase; margin-bottom:1px;">&#127760; Viendo empresa</p>
            <p id="empresa-badge-nombre" style="font-size:11px; color:#e2e8f0; font-weight:700;">FCI Logistic</p>
        </div>

        <!-- USUARIO / FOOTER -->
        <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); margin-top:6px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <div style="width:32px; height:32px; background:linear-gradient(135deg,#059669,#10b981); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <span class="material-icons-round" style="color:#fff; font-size:16px;">person</span>
                </div>
                <div style="overflow:hidden; flex:1;">
                    <p id="curr-name" style="font-weight:700; font-size:11px; color:#f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>
                    <p id="curr-ger" style="font-size:9px; color:#64748b; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>
                </div>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">
                <button onclick="window.toggleDarkMode()" style="background:rgba(56,189,248,0.1); border:none; color:#38bdf8; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; padding:5px 8px; border-radius:6px;" title="Modo Oscuro"><span class="material-icons-round" id="dark-mode-icon" style="font-size:14px;">dark_mode</span></button>
                <button onclick="window.logout()" style="background:rgba(239,68,68,0.1); border:none; color:#ef4444; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; padding:5px 8px; border-radius:6px;"><span class="material-icons-round" style="font-size:14px;">logout</span> Salir</button>
            </div>
        </div>
    </aside>`;

if (html.includes(oldSidebar)) {
    html = html.replace(oldSidebar, newSidebar);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('✅ Sidebar reemplazado correctamente');
} else {
    console.log('❌ Sidebar no encontrado con patron exacto. Intentando por secciones...');
    
    // Find by unique markers
    const startMarker = '    <aside class="sidebar" id="sidebar">\r\n';
    const endMarker = '    </aside>\r\n\r\n    <main';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf('    </aside>');
    
    console.log('startIdx:', startIdx, 'endIdx:', endIdx);
    if (startIdx !== -1 && endIdx !== -1) {
        html = html.substring(0, startIdx) + newSidebar + '\n\n' + html.substring(endIdx + '    </aside>'.length);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log('✅ Sidebar reemplazado via índices');
    }
}
