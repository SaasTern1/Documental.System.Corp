const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const modalHtml = `
    <!-- MODAL CALENDARIO ANUAL -->
    <div class="modal-overlay" id="modal-calendario-anual" style="display:none; z-index:3000;">
        <div class="modal-content" style="max-width:1000px; width:95%; max-height:90vh; padding:30px; display:flex; flex-direction:column; background:var(--card-bg);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px; flex-wrap:wrap; gap:15px;">
                <h2 style="margin:0; font-size:22px; display:flex; align-items:center; gap:10px; color:var(--primary);">
                    <span class="material-icons-round">calendar_month</span> Calendario Anual de Auditorías <span id="cal-year-title"></span>
                </h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div style="display:flex; align-items:center; gap:5px; font-size:12px; margin-right:15px; background:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid var(--border);">
                        <div style="width:12px; height:12px; background:var(--primary); border-radius:3px;"></div> Día de Auditoría
                        <div style="width:12px; height:12px; border:2px solid var(--danger); border-radius:3px; margin-left:10px;"></div> Hoy
                    </div>
                    <button class="btn btn-dark" onclick="window.setDisplay('modal-calendario-anual', 'none')" style="padding:6px 12px;"><span class="material-icons-round" style="font-size:16px;">close</span></button>
                </div>
            </div>
            <div style="flex:1; overflow-y:auto; padding-right:10px;">
                <div id="calendar-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:20px;">
                    <!-- Months will be generated here by JS -->
                </div>
            </div>
        </div>
    </div>
</body>`;

html = html.replace('</body>', modalHtml);
fs.writeFileSync('index.html', html, 'utf8');
console.log("Appended modal");
