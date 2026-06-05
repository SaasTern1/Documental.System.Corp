const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The login-screen div is now broken. Find the broken area and replace it entirely.
// The current broken state starts at <div id="login-screen" and ends at </div> right before <aside

const brokenLogin = `    <div id="login-screen" style="align-items:stretch; flex-direction:row; justify-content:stretch;">
        <!-- Left Side: Login Form -->
            <!-- The background of the right side will actually be the existing login-screen ::before / ::after gradients from CSS -->
            <div style="z-index:10;">
                <span class="material-icons-round" style="font-size:70px; color:#60a5fa; margin-bottom:20px; text-shadow:0 10px 30px rgba(0,0,0,0.3);">local_police</span>
                <h2 style="font-size:36px; font-weight:800; margin-bottom:15px; letter-spacing:-1px; line-height:1.2;">Protegiendo la Cadena<br>de Suministro Global</h2>
                <p style="font-size:16px; line-height:1.6; max-width:450px; margin:0 auto; color:rgba(255,255,255,0.85);">
                    Plataforma corporativa centralizada para el control documental, auditorías integrales, acciones correctivas y evaluación de riesgos de socios comerciales según los estándares de la certificación OEA.
                </p>
                
                <div style="display:flex; justify-content:center; gap:20px; margin-top:40px;">
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">description</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Control<br>Documental</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">security</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Matriz de<br>Riesgos</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">fact_check</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Gestión de<br>Auditorías</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

const correctLogin = `    <div id="login-screen" style="align-items:stretch; flex-direction:row; justify-content:stretch;">
        <!-- Left Side: Login Form -->
        <div class="login-left-panel" style="flex:1; display:flex; align-items:center; justify-content:center; background:#ffffff; position:relative; z-index:10;">
            <div class="login-box" style="box-shadow:none; background:transparent; max-width:400px; width:100%; border:none; padding:20px;">
                <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom: 8px;">
                    <span class="material-icons-round" style="font-size:40px; color:var(--accent);">verified_user</span>
                </div>
                <h1 style="color:var(--primary); margin-bottom: 6px; font-weight: 800; font-size:22px; letter-spacing:-0.3px;">SISTEMA DE GESTIÓN</h1>
                <h2 style="color:var(--accent); margin-bottom: 6px; font-weight: 700; font-size:13px; text-transform:uppercase; letter-spacing:2px;">DE SEGURIDAD</h2>
                <p style="color:#64748b; font-size:12px; margin-bottom:28px;">Plataforma Multiempresa &mdash; Ingresa el n&#250;mero de tu empresa</p>
                <div style="text-align: left;">
                    <!-- Campo: Número de Empresa -->
                    <label for="login-empresa-id" style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">N&#250;mero de Empresa</label>
                    <div style="position:relative; margin-bottom:14px;">
                        <span class="material-icons-round" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:18px; color:var(--text-muted); pointer-events:none; margin-top:-7px;">business</span>
                        <input aria-label="N&#250;mero de empresa (ej: 1)" type="text" id="login-empresa-id" name="login-empresa-id" placeholder="Ej: 1" maxlength="20" style="padding-left:42px; border:1px solid #e2e8f0; background:#f8fafc;" onkeydown="if(event.key==='Enter') document.getElementById('login-user').focus();">
                    </div>
                    <label for="login-user">Usuario ID</label>
                    <div style="position:relative;">
                        <span class="material-icons-round" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:18px; color:var(--text-muted); pointer-events:none; margin-top:-7px;">person</span>
                        <input aria-label="Ingrese su usuario" type="text" id="login-user" name="login-user" placeholder="Ingrese su usuario" style="padding-left:42px; border:1px solid #e2e8f0; background:#f8fafc;" onkeydown="if(event.key==='Enter') document.getElementById('login-pass').focus();">
                    </div>
                    <label for="login-pass">Contrase&#241;a</label>
                    <div style="position:relative;">
                        <span class="material-icons-round" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:18px; color:var(--text-muted); pointer-events:none; margin-top:-7px;">lock</span>
                        <input aria-label="Contrase&#241;a" type="password" id="login-pass" name="login-pass" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" style="padding-left:42px; border:1px solid #e2e8f0; background:#f8fafc;" onkeydown="if(event.key==='Enter') window.iniciarSesion();">
                    </div>
                </div>
                <button class="btn btn-primary" id="btnLogin" onclick="window.iniciarSesion()" style="width: 100%; padding: 14px; margin-top: 15px; font-size: 14px; letter-spacing:0.5px; box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);"><span class="material-icons-round" style="font-size:18px;">login</span> INICIAR SESI&#211;N</button>
                <p style="color:#94a3b8; font-size:10px; margin-top:20px;">SGS v35 &bull; Plataforma SaaS &copy; 2026</p>
            </div>
        </div>

        <!-- Right Side: System Info -->
        <div class="login-right-panel" style="flex:1.3; background: transparent; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; padding:40px; text-align:center; position:relative; z-index:5;">
            <!-- The background of the right side will actually be the existing login-screen ::before / ::after gradients from CSS -->
            <div style="z-index:10;">
                <span class="material-icons-round" style="font-size:70px; color:#60a5fa; margin-bottom:20px; text-shadow:0 10px 30px rgba(0,0,0,0.3);">local_police</span>
                <h2 style="font-size:36px; font-weight:800; margin-bottom:15px; letter-spacing:-1px; line-height:1.2;">Protegiendo la Cadena<br>de Suministro Global</h2>
                <p style="font-size:16px; line-height:1.6; max-width:450px; margin:0 auto; color:rgba(255,255,255,0.85);">
                    Plataforma corporativa centralizada para el control documental, auditor&#237;as integrales, acciones correctivas y evaluaci&#243;n de riesgos de socios comerciales seg&#250;n los est&#225;ndares de la certificaci&#243;n OEA.
                </p>
                
                <div style="display:flex; justify-content:center; gap:20px; margin-top:40px;">
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">description</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Control<br>Documental</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">security</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Matriz de<br>Riesgos</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);">
                        <span class="material-icons-round" style="font-size:24px; color:#93c5fd;">fact_check</span>
                        <p style="font-size:11px; margin-top:5px; font-weight:600;">Gesti&#243;n de<br>Auditor&#237;as</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

if (html.includes(brokenLogin)) {
    html = html.replace(brokenLogin, correctLogin);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("✅ Login screen restored correctly with empresa field.");
} else {
    // Try a simpler search approach
    const startMarker = '    <div id="login-screen"';
    const endMarker = '</div>\n\n    <aside';
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);
    if (startIdx !== -1 && endIdx !== -1) {
        html = html.substring(0, startIdx) + correctLogin + '\n\n    <aside' + html.substring(endIdx + endMarker.length);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log("✅ Login screen replaced using index approach.");
    } else {
        console.log("❌ Could not find login-screen boundaries.");
        console.log("startIdx:", startIdx, "endIdx:", endIdx);
    }
}
