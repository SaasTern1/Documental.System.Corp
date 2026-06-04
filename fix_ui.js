const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// TASK 1: Make audit-header-view collapsible
const planTarget = `<div id="audit-header-view" class="card" style="margin-bottom:25px; border-top: 4px solid var(--primary); display:none;">
               <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">
                   <h3 style="color:var(--sidebar); margin:0; font-size:18px;">Plan Anual de Auditorías <span id="view-year-label" style="color:var(--primary);"></span></h3>
                   <div style="text-align:right; background:#f8fafc; padding:8px 15px; border-radius:8px;"><span style="font-size:10px; color:#64748b; font-weight:800; text-transform:uppercase;">Última Modificación</span><p id="view-ah-mod-info" style="font-size:11px; margin:0; color:var(--primary); font-weight:600;"></p></div>
               </div>
               <div class="resp-grid" style="margin-bottom:15px;"><div class="audit-info-box"><div class="custom-label">Objetivo</div><p id="view-ah-obj" style="font-size:13px;"></p></div><div class="audit-info-box"><div class="custom-label">Alcance</div><p id="view-ah-alcance" style="font-size:13px;"></p></div></div>`;

const planRepl = `<div id="audit-header-view" class="card" style="margin-bottom:25px; border-top: 4px solid var(--primary); display:none; padding: 0;">
               <div style="display:flex; justify-content:space-between; align-items:flex-start; padding: 20px; cursor: pointer; transition: 0.2s; background: var(--bg);" onclick="let b = document.getElementById('audit-plan-body'); b.style.display = b.style.display === 'none' ? 'block' : 'none';" onmouseover="this.style.background='#e2e8f0';" onmouseout="this.style.background='var(--bg)';">
                   <h3 style="color:var(--sidebar); margin:0; font-size:18px; display:flex; align-items:center; gap:8px;">Plan Anual de Auditorías <span id="view-year-label" style="color:var(--primary);"></span><span class="material-icons-round">expand_more</span></h3>
                   <div style="text-align:right; background:#f8fafc; padding:8px 15px; border-radius:8px; border:1px solid var(--border);"><span style="font-size:10px; color:#64748b; font-weight:800; text-transform:uppercase;">Última Modificación</span><p id="view-ah-mod-info" style="font-size:11px; margin:0; color:var(--primary); font-weight:600;"></p></div>
               </div>
               <div id="audit-plan-body" style="padding: 20px; display: none; border-top:1px solid var(--border);">
               <div class="resp-grid" style="margin-bottom:15px;"><div class="audit-info-box"><div class="custom-label">Objetivo</div><p id="view-ah-obj" style="font-size:13px;"></p></div><div class="audit-info-box"><div class="custom-label">Alcance</div><p id="view-ah-alcance" style="font-size:13px;"></p></div></div>`;

// Add closing div for audit-plan-body right before the table container
const tableTarget = `               <div class="table-responsive">`;
const tableRepl = `               </div> <!-- end audit-plan-body -->
               <div class="table-responsive">`;

content = content.replace(planTarget, planRepl).replace(planTarget.replace(/\r\n/g, '\n'), planRepl);
if (content.indexOf(tableRepl) === -1) {
    let tIdx = content.indexOf(tableTarget);
    if(tIdx > -1) {
        content = content.substring(0, tIdx) + tableRepl + content.substring(tIdx + tableTarget.length);
    }
}

// TASK 2: Enlarge modal-dash-details
const dashModalTarget = `<div class="modal-overlay" id="modal-dash-details">
        <div class="modal-content" style="max-width:800px; display:block; width:100%; height:auto; padding:20px;">`;
const dashModalRepl = `<div class="modal-overlay" id="modal-dash-details">
        <div class="modal-content" style="max-width:1100px; display:block; width:95%; max-height:85vh; padding:30px; overflow-y:hidden; display:flex; flex-direction:column;">`;
content = content.replace(dashModalTarget, dashModalRepl).replace(dashModalTarget.replace(/\r\n/g, '\n'), dashModalRepl);

// Update max-height inside dash modal
const dashTbodyTarget = `<div class="table-responsive" style="max-height:400px; overflow-y:auto; border-radius:8px; border:1px solid var(--border);">`;
const dashTbodyRepl = `<div class="table-responsive" style="flex:1; overflow-y:auto; border-radius:8px; border:1px solid var(--border);">`;
content = content.replace(dashTbodyTarget, dashTbodyRepl).replace(dashTbodyTarget.replace(/\r\n/g, '\n'), dashTbodyRepl);


// TASK 3: Add modal for heatmap details
const heatmapModal = `
    <!-- MODAL HEATMAP RIESGOS -->
    <div class="modal-overlay" id="modal-heatmap-details" style="display:none; z-index:3000;">
        <div class="modal-content" style="max-width:900px; width:95%; max-height:85vh; padding:30px; display:flex; flex-direction:column; background:var(--card-bg);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">
                <h2 id="heatmap-details-title" style="margin:0; font-size:20px; display:flex; align-items:center; gap:10px;"></h2>
                <button class="btn btn-dark" onclick="window.setDisplay('modal-heatmap-details', 'none')" style="padding:6px 12px;"><span class="material-icons-round" style="font-size:16px;">close</span></button>
            </div>
            <div class="table-responsive" style="flex:1; overflow-y:auto; border-radius:8px; border:1px solid var(--border);">
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                    <thead style="background:var(--table-header); position:sticky; top:0; z-index:5;">
                        <tr><th style="padding:12px; font-weight:700; color:var(--sidebar);">ID Riesgo</th><th style="padding:12px; font-weight:700; color:var(--sidebar);">Proceso / Área</th><th style="padding:12px; font-weight:700; color:var(--sidebar);">Amenaza / Riesgo</th><th style="padding:12px; font-weight:700; color:var(--sidebar);">Acción de Mitigación</th></tr>
                    </thead>
                    <tbody id="tbody-heatmap-details"></tbody>
                </table>
            </div>
        </div>
    </div>
`;

if (content.indexOf('modal-heatmap-details') === -1) {
    content = content.replace('</body>', heatmapModal + '\n</body>');
}

fs.writeFileSync('index.html', content);
console.log('Fixed index.html ui requests');
