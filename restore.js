const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

// Find the FIRST line with `id="sla-media"`
let slaMediaIndex = -1;
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('id="sla-media"')) {
        slaMediaIndex = i;
        break; // BREAK ON FIRST
    }
}

// Find where modal-dash-details actually begins AFTER the duplicate
// We want to skip the duplicate part completely.
// Since the duplicate ends at </main>, let's find the FIRST <div class="modal-overlay" id="modal-dash-details">
let modalDashIndex = -1;
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('id="modal-dash-details"')) {
        modalDashIndex = i;
        break;
    }
}

console.log('FIRST slaMediaIndex:', slaMediaIndex);
console.log('FIRST modalDashIndex:', modalDashIndex);

if(slaMediaIndex !== -1 && modalDashIndex !== -1) {
    // Delete everything in between and replace with the correct string
    const before = lines.slice(0, slaMediaIndex + 1).join('\n');
    const after = lines.slice(modalDashIndex).join('\n');
    
    const correctMiddle = `                        </div>
                        <div>
                            <label style="font-size:11px; color:#1e40af; font-weight:700;">Baja</label>
                            <input aria-label="Ej: 15" type="number" id="sla-baja" placeholder="Ej: 15" style="margin-bottom:0;">
                        </div>
                        <button class="btn btn-primary" onclick="window.guardarConfigSLA()" style="margin-top:10px; width:100%;">Guardar SLA Mínimos</button>
                    </div>
                </div>
            </div>
        </div></div>
    </main>

`;

    const newHtml = before + '\n' + correctMiddle + after;
    fs.writeFileSync('index.html', newHtml);
    console.log('Restored correctly!');
} else {
    console.log('Could not find boundaries.');
}
