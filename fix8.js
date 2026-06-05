const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<h3 style="color:var\(--primary\); margin-bottom:15px; font-size:16px;">Requisitos \/ Puntos de Control<\/h3>\s*<div id="oea-req-upload-box"[^>]*>\s*<\/div>\s*<\/section>/s;

const correctBlock = `<h3 style="color:var(--primary); margin-bottom:15px; font-size:16px;">Requisitos / Puntos de Control</h3>
                    <div id="oea-req-upload-box" style="display:none; flex-direction:column; gap:10px; margin-bottom:15px; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid var(--border);">
                        <input aria-label="Nombre del Punto (Ej: 1.1 Seguridad)" type="text" id="oea-req-input" placeholder="Nombre del Punto (Ej: 1.1 Seguridad)" style="margin:0;">
                        <textarea aria-label="Descripción detallada o guía para el auditor..." id="oea-req-desc" placeholder="Descripción detallada o guía para el auditor..." rows="3" style="margin:0;"></textarea>
                        <input aria-label="Página del manual (Ej: 15) o enlace URL externo" type="text" id="oea-req-link" placeholder="Página del manual (Ej: 15) o enlace URL externo" style="margin:0;">
                        <button class="btn btn-success" onclick="window.agregarRequisitoOEA()" style="width:100%;"><span class="material-icons-round" style="font-size:16px;">add</span> Guardar Punto de Control</button>
                    </div>
                    <div id="oea-req-list-container" class="settings-list" style="max-height:350px;"></div>
                </div>
            </div>
        </section>

        <section id="sec-audit" class="section">
            <div class="section-header">
                <div class="section-header-info">
                    <div class="section-header-icon" style="background: linear-gradient(135deg, #059669, #10b981);"><span class="material-icons-round">calendar_month</span></div>
                    <div><h1>Calendario de Auditoría</h1><p>Planificación, ejecución y seguimiento de auditorías internas</p></div>
                </div>
                <div style="display:flex; gap:10px; align-items:center; background:white; padding:8px 15px; border-radius:12px; border:1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <label for="aud-year-select" style="margin:0; font-size:12px;">Año:</label>
                    <select aria-label="aud-year-select" id="aud-year-select" style="margin:0; width:100px; padding:8px; border:none; font-weight:bold; color:var(--primary); background:transparent; cursor:pointer; font-size:14px;" onchange="window.cambiarAnioAuditoria(this.value)"></select>
                    <div style="width:1px; height:20px; background:var(--border); margin:0 5px;"></div>
                    <button class="btn btn-warning" onclick="window.abrirModalCalendarioMensual()" style="padding:8px 12px; font-size:12px; background:#d97706; color:white; border:none;"><span class="material-icons-round" style="font-size:16px;">calendar_month</span> Ver Calendario</button>
                    <button class="btn btn-info" id="btn-config-plan" style="display:none; padding:8px 12px; font-size:12px;" onclick="window.abrirModalPlan()"><span class="material-icons-round" style="font-size:16px;">settings</span> Configurar Plan</button>
                    <button class="btn btn-primary" id="btn-nueva-aud" style="display:none; padding:8px 12px; font-size:12px;" onclick="window.abrirNuevaAuditoria()"><span class="material-icons-round" style="font-size:16px;">add</span> Nueva Auditoría</button>
                    <button class="btn btn-success" onclick="window.exportarExcelAuditoria()" style="padding:8px 12px; font-size:12px;"><span class="material-icons-round" style="font-size:16px;">download</span> Exportar</button>
                </div>
            </div>

            <div id="audit-header-view" class="card" style="margin-bottom:25px; border-top: 4px solid var(--primary); display:none;">
               <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px; cursor:pointer;" onclick="window.toggleAuditPlanDetails()">
                   <h3 style="color:var(--sidebar); margin:0; font-size:18px; display:flex; align-items:center; gap:8px;">
                       <span class="material-icons-round" id="icon-toggle-audit-plan" style="transition: transform 0.3s;">expand_less</span>
                       Plan Anual de Auditorías <span id="view-year-label" style="color:var(--primary);"></span>
                   </h3>
                   <div style="text-align:right; background:#f8fafc; padding:8px 15px; border-radius:8px;"><span style="font-size:10px; color:#64748b; font-weight:800; text-transform:uppercase;">Última Modificación</span><p id="view-ah-mod-info" style="font-size:11px; margin:0; color:var(--primary); font-weight:600;"></p></div>
               </div>
               <div id="audit-plan-details" style="margin-top:20px; display:block;">
                   <div class="resp-grid" style="margin-bottom:15px;"><div class="audit-info-box"><div class="custom-label">Objetivo</div><p id="view-ah-obj" style="font-size:13px;"></p></div><div class="audit-info-box"><div class="custom-label">Alcance</div><p id="view-ah-alcance" style="font-size:13px;"></p></div></div>
                   <div class="resp-grid" style="margin-bottom:15px;"><div class="audit-info-box"><div class="custom-label">Técnica</div><p id="view-ah-tecnica" style="font-size:13px;"></p></div><div class="audit-info-box"><div class="custom-label">Criterios</div><p id="view-ah-criterios" style="font-size:13px;"></p></div><div class="audit-info-box"><div class="custom-label">Doc. Referencia / Fecha Elab.</div><p style="font-size:13px;"><span id="view-ah-ref" style="font-weight:600;"></span> <br><small style="color:#94a3b8" id="view-ah-fecha"></small></p></div></div>
                   <div class="resp-grid">
                       <div class="audit-info-box" style="background:#eff6ff; border-color:#bfdbfe; padding:15px; border-radius:8px;"><div class="custom-label" style="color:#1d4ed8;"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">groups</span> Equipo Auditor Global</div><p style="font-size:13px;"><b>Líder:</b> <span id="view-ah-lider"></span></p><p style="margin-top:5px; font-size:13px;"><b>Auditores:</b> <span id="view-ah-auditor"></span></p></div>
                       <div class="audit-info-box" style="background:#f0fdf4; border-color:#bbf7d0; padding:15px; border-radius:8px;"><div class="custom-label" style="color:#15803d;"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">build</span> Recursos Generales</div><p style="font-size:13px;"><b>Tecnológicos:</b> <span id="view-ah-tec"></span></p><p style="margin-top:5px; font-size:13px;"><b>Humanos:</b> <span id="view-ah-rrhh"></span></p></div>
                   </div>
               </div>
            </div>
            <div class="card" style="padding:0; overflow:hidden;">
                <div class="table-responsive"><table id="tabla-auditorias" style="white-space:nowrap;"><thead><tr><th>N° Auditoría</th><th>Fecha / Hora</th><th>Requisitos OEA</th><th>Auditado(s)</th><th>Auditor(es)</th><th>Estado</th><th class="no-export">Acción</th></tr></thead><tbody id="tbody-auditorias"></tbody></table></div>
            </div>
        </section>

        <section id="sec-noconf" class="section">
            <div class="section-header">
                <div class="section-header-info">
                    <div class="section-header-icon" style="background: linear-gradient(135deg, #dc2626, #ef4444);"><span class="material-icons-round">warning</span></div>
                    <div><h1>Control de NC y Mejoras (F-023)</h1><p>Gestión de no conformidades, acciones correctivas y oportunidades de mejora</p></div>
                </div>
                <div class="section-header-actions"><button class="btn btn-success" onclick="window.exportarExcelNoConf()"><span class="material-icons-round" style="font-size:18px;">download</span> Exportar F-023</button></div>
            </div>
            <div class="card" style="padding:0; margin-top:20px; overflow:hidden; border-top:4px solid var(--danger);">
                <div style="padding: 20px; border-bottom: 1px solid var(--border); background:#f8fafc; display:flex; gap:15px; flex-wrap:wrap;">
                    <input aria-label="Buscar por Requisito, NC, o Estado..." type="text" id="search-noconf" class="search-bar" placeholder="🔍 Buscar por Requisito, NC, o Estado..." onkeyup="window.filtrarTabla('search-noconf', 'tbody-noconf')" style="flex:1;">
                    <select aria-label="filter-noconf-estado" id="filter-noconf-estado" class="search-bar" style="width:220px;" onchange="window.setFilterGestNC(this.value)"><option value="">Todos los Estados</option><option value="Abierta (En Plan)">Abierta (En Plan)</option><option value="En Seguimiento">En Seguimiento</option><option value="Cerrada">Cerrada</option></select>
                </div>
                <div class="table-responsive"><table id="tabla-noconf" style="white-space:nowrap;"><thead><tr><th>SAC N°</th><th>Requisito Evaluado</th><th>Tipo</th><th>Responsable</th><th>Detalle</th><th>Apertura</th><th>Estado</th><th>Cierre</th><th class="no-export">Acción</th></tr></thead><tbody id="tbody-noconf"></tbody></table></div>
            </div>
        </section>`;

if (regex.test(html)) {
    html = html.replace(regex, correctBlock);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Fixed via regex!");
} else {
    console.log("Regex not matched.");
}
