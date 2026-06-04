const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const anchor1 = `<div style="padding:8px; border-right:1px solid #ccc; font-weight:bold; background:#fef3c7;">Responsable de la AC</div><div style="padding:0; display:flex; align-items:center;"><select aria-label="sac-dueno" id="sac-dueno" style="border:none; margin:0; width:100%; border-radius:0; height:100%; padding:8px; font-weight:bold; color:var(--primary);"></select></div>`;
const anchor2 = `    <!-- MODAL CONSTRUCTOR DE FORMULARIOS -->`;

const replacement = `
                </div>
                
                <h4 style="color:var(--primary); margin-bottom:10px; font-size:14px;">PLAN DE ACCIÓN</h4>
                <div class="table-responsive" style="margin-bottom:10px;">
                    <table style="width:100%; border:1px solid #ccc; font-size:12px; text-align:left;">
                        <thead style="background:#f1f5f9;"><tr><th style="border:1px solid #ccc; width:30px; padding:8px;">#</th><th style="border:1px solid #ccc; padding:8px;">Detalle</th><th style="border:1px solid #ccc; width:200px; padding:8px;">Responsable</th><th style="border:1px solid #ccc; width:130px; padding:8px;">Fecha Inicio</th><th style="border:1px solid #ccc; width:130px; padding:8px;">Fecha Cierre</th><th style="border:1px solid #ccc; width:40px;"></th></tr></thead>
                        <tbody id="tbody-plan-accion"></tbody>
                    </table>
                </div>
                <button type="button" class="btn btn-info" id="btn-add-plan" onclick="window.addPlanRow()" style="font-size:11px; padding:6px 12px; margin-bottom:20px;">+ Añadir Fila al Plan</button>

                <div style="display:flex; gap:20px; align-items:center; border:1px dashed #d97706; padding:15px; background:#fffbeb; border-radius:8px; margin-bottom:20px; font-size:13px;"><b style="color:#b45309;">Aprobación del Plan de Acción (SGC/Auditor):</b><input aria-label="sac-fecha-aprob-plan" type="date" id="sac-fecha-aprob-plan" style="margin:0; width:200px; padding:8px;"></div>

                <h4 style="color:var(--primary); margin-bottom:10px; font-size:14px;">ACTIVIDADES DE SEGUIMIENTO</h4>
                <div class="table-responsive" style="margin-bottom:10px;">
                    <table style="width:100%; border:1px solid #ccc; font-size:12px; text-align:left;">
                        <thead style="background:#f1f5f9;"><tr><th style="border:1px solid #ccc; width:30px; padding:8px;">#</th><th style="border:1px solid #ccc; padding:8px;">Resultado Seguimiento</th><th style="border:1px solid #ccc; width:200px; padding:8px;">Responsable</th><th style="border:1px solid #ccc; width:130px; padding:8px;">Fecha</th><th style="border:1px solid #ccc; width:40px;"></th></tr></thead>
                        <tbody id="tbody-seguimiento"></tbody>
                    </table>
                </div>
                <button type="button" class="btn btn-dark" id="btn-add-seguimiento" onclick="window.addSeguimientoRow()" style="font-size:11px; padding:6px 12px; margin-bottom:20px;">+ Añadir Fila de Seguimiento</button>

                <div id="sac-panel-cierre" style="border:2px dashed var(--success); padding:20px; border-radius:8px; margin-bottom:20px; background:#f0fdf4;"><h4 style="color:var(--success); margin-bottom:10px; font-size:14px;">Aprobación de Cierre</h4><div class="grid-2"><div><label for="sac-resp-cierre">Responsable</label><input aria-label="sac-resp-cierre" type="text" id="sac-resp-cierre" disabled style="background:#e2e8f0;"></div><div><label for="sac-fecha-cierre">Fecha de Cierre</label><input aria-label="sac-fecha-cierre" type="date" id="sac-fecha-cierre" style="background:#fff;"></div></div><div style="display:flex; align-items:center; gap:10px; margin-top:10px;"><input aria-label="sac-check-cerrar" type="checkbox" id="sac-check-cerrar" style="width:20px; height:20px; cursor:pointer; margin:0;"> <label for="sac-check-cerrar" style="margin:0; font-size:14px; color:var(--success); cursor:pointer;"><b>CERRAR ACCIÓN CORRECTIVA DEFINITIVAMENTE</b></label></div></div>
                
                <div style="display:flex; gap:10px; margin-top:20px;"><button type="button" class="btn btn-primary" id="btn-save-sac" onclick="window.guardarSAC()" style="flex:1; padding:15px; font-size:16px;">Guardar Avances de la SAC</button><button type="button" class="btn btn-ghost" onclick="window.setDisplay('modal-sac', 'none')" style="padding:15px; width:150px; background:#e2e8f0;">Cancelar</button></div>
            </div>
        </div>
    </div>

    <script type="module" src="app.js"></script>
    <div class="modal-overlay" id="modal-eval-sol" style="display:none;">
        <div class="modal-content" style="max-width: 500px; display:block; width:100%; height:auto; padding:30px;">
            <h3 style="color:var(--primary); margin-top:0; display:flex; align-items:center; gap:8px;"><span class="material-icons-round">gavel</span> Evaluación Inicial (SGC)</h3>
            <p style="font-size:13px; color:var(--text-muted);">Verifica la viabilidad de la solicitud antes de asignarla y activar el SLA.</p>
            
            <div style="margin-bottom:15px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid var(--border);">
                <label style="font-weight:800; font-size:13px; margin-bottom:10px; display:block;">Decisión de SGC:</label>
                <div style="display:flex; gap:20px;">
                    <label style="display:flex; align-items:center; gap:5px; cursor:pointer;"><input aria-label="eval_decision" type="radio" name="eval_decision" value="valida" checked onchange="window.toggleEvalDecision()"> <span style="color:var(--success); font-weight:700;">✅ Aprobar (Válida)</span></label>
                    <label style="display:flex; align-items:center; gap:5px; cursor:pointer;"><input aria-label="eval_decision" type="radio" name="eval_decision" value="invalida" onchange="window.toggleEvalDecision()"> <span style="color:var(--danger); font-weight:700;">❌ Rechazar / Anular</span></label>
                </div>
            </div>

            <div id="eval-valida-panel">
                <h4 style="font-size:12px; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px; color:var(--primary);">Asignar Responsables Específicos</h4>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px; font-weight:700; color:var(--primary);">Paso 1: ¿Quién debe documentar?</label>
                    <select aria-label="eval-asig-p1" id="eval-asig-p1" style="margin-bottom:0;"></select>
                </div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px; font-weight:700; color:var(--primary);">Paso 2: ¿Quién debe verificar?</label>
                    <select aria-label="eval-asig-p2" id="eval-asig-p2" style="margin-bottom:0;"></select>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px; font-weight:700; color:var(--primary);">Paso 4: ¿Quién debe publicar?</label>
                    <select aria-label="eval-asig-p4" id="eval-asig-p4" style="margin-bottom:0;"></select>
                </div>
                <div style="background:#fffbeb; padding:15px; border-radius:8px; border:1px solid #fcd34d;">
                    <label style="font-size:12px; color:#92400e; font-weight:800; margin-bottom:5px; display:block;"><span class="material-icons-round" style="font-size:14px; vertical-align:middle;">event_available</span> Días de SLA (Calculado por Prioridad)</label>
                    <input aria-label="eval-sla-dias" type="number" id="eval-sla-dias" style="margin-bottom:0;">
                    <p style="font-size:10px; margin:5px 0 0; color:#b45309;">Puedes ajustar manualmente los días si es un caso especial. Se sumarán a partir de hoy.</p>
                </div>
            </div>

            <div id="eval-invalida-panel" style="display:none;">
                <label style="font-weight:700; color:var(--danger); font-size:13px;">Motivo de Rechazo / Anulación:</label>
                <textarea aria-label="Explique por qué no procede esta solicitud..." id="eval-motivo" rows="4" placeholder="Explique por qué no procede esta solicitud..."></textarea>
            </div>

            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                <button class="btn btn-dark" onclick="window.setDisplay('modal-eval-sol', 'none')">Cancelar</button>
                <button class="btn btn-primary" onclick="window.guardarEvaluacion()">Guardar Evaluación</button>
            </div>
        </div>
    </div>
`;

let startIdx = content.indexOf(anchor1);
let endIdx = content.indexOf(anchor2);

if (startIdx !== -1 && endIdx !== -1) {
    const fixedContent = content.substring(0, startIdx + anchor1.length) + '\n' + replacement + '\n    ' + content.substring(endIdx);
    fs.writeFileSync('index.html', fixedContent);
    console.log('Fixed! Anchors found.');
} else {
    console.log('Could not find anchors: startIdx=', startIdx, 'endIdx=', endIdx);
}
