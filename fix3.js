const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const anchor1 = `                        <div class="custom-label" style="margin-top:10px;">Observaciones / Enfoque</div><p id="ma-obs"></p>\r\n                    </div>`;
const anchor2 = `                    <div id="chat-box-audit"`;

const replacement = `
                    <div style="background:#eff6ff; padding:20px; border-radius:12px; border: 1px dashed var(--accent); margin-bottom:20px;">
                        <h4 style="color:var(--primary); margin-bottom:15px;">Ejecución y Tiempos Reales</h4>
                        <div class="resp-grid" style="margin-bottom:15px;">
                            <div><div class="custom-label">Estado</div><span id="ma-estado-badge" class="badge"></span></div>
                            <div><div class="custom-label">Inicio Real</div><p id="ma-inicio-real" style="font-weight:bold;">---</p></div>
                            <div><div class="custom-label">Fin Real</div><p id="ma-fin-real" style="font-weight:bold;">---</p></div>
                        </div>
                        <div><div class="custom-label">Duración Total</div><p id="ma-duracion" style="color:var(--success); font-weight:800; font-size:16px;">---</p></div>
                        <div id="ma-controles-tiempo" style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap; align-items:center;">
                            <button type="button" id="btn-comenzar-auditoria" class="btn btn-primary" onclick="window.comenzarAuditoria()" style="display:none; padding:15px;"></button>
                            <button type="button" id="btn-pausar-auditoria" class="btn btn-warning" onclick="window.pausarAuditoria()" style="display:none; padding:15px;">⏸️ PAUSAR (NUEVA RONDA)</button>
                            <button type="button" id="btn-finalizar-auditoria" class="btn btn-success" onclick="window.finalizarAuditoria()" style="display:none; padding:15px;">⏹️ FINALIZAR AUDITORÍA</button>
                            <button type="button" id="btn-eliminar-auditoria" class="btn btn-danger" onclick="window.eliminarAuditoriaDetalle()" style="display:none; padding:15px; margin-left:auto;"><span class="material-icons-round" style="font-size:18px; vertical-align:middle; margin-right:5px;">delete</span> Eliminar Auditoría</button>
                        </div>
                    </div>

                    <h4 style="border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-top:30px;">Bitácora de Auditoría</h4>
`;

let startIdx = content.indexOf(anchor1);
if (startIdx === -1) {
    const anchor1n = `                        <div class="custom-label" style="margin-top:10px;">Observaciones / Enfoque</div><p id="ma-obs"></p>\n                    </div>`;
    startIdx = content.indexOf(anchor1n);
}
let endIdx = content.indexOf(anchor2);

if (startIdx !== -1 && endIdx !== -1) {
    const strMatch = content.indexOf(anchor1) !== -1 ? anchor1 : `                        <div class="custom-label" style="margin-top:10px;">Observaciones / Enfoque</div><p id="ma-obs"></p>\n                    </div>`;
    const fixedContent = content.substring(0, startIdx + strMatch.length) + '\n' + replacement + content.substring(endIdx);
    fs.writeFileSync('index.html', fixedContent);
    console.log('Fixed! Anchors found.');
} else {
    console.log('Could not find anchors: startIdx=', startIdx, 'endIdx=', endIdx);
}
