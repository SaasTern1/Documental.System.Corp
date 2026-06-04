const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const targetAppsScript = `window.sendNotification = async (dest, sub, msg) => { 
    console.log("[AppsScript] Iniciando envío de notificación...");
    
    // CONFIGURA AQUÍ LA URL DE TU SCRIPT DE GOOGLE APP SCRIPT
    const APPS_SCRIPT_URL = "https://script.google.com/a/macros/fcipty.com/s/AKfycbymKD51rjtWCH5qFhm21TBLBgJXWMNfnDOYGI128HtGVNGnuWG5i68lE9PNb_1CLVbz/exec";
    
    if (APPS_SCRIPT_URL === "REEMPLAZA_ESTA_URL_CON_LA_TUYA") {
        console.warn("[AppsScript] Cancelado: Aún no has configurado la URL del Google Script en app.js.");
        return false;
    }

    if (!dest || (!dest.to && !dest.cc)) {
        console.warn("[AppsScript] Cancelado: No hay destinatarios válidos (to / cc).");
        return false;
    }

    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    let cleanTo = dest.to ? dest.to.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";
    let cleanCc = dest.cc ? dest.cc.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";

    if (!cleanTo && !cleanCc) {
        console.warn("[AppsScript] Cancelado: Los correos no tienen formato válido.");
        return false;
    }

    let senderName = "Sistema SGC";
    if (typeof currentUser !== "undefined" && currentUser && currentUser.nombre) {
        senderName = currentUser.nombre;
    }

    let payload = {
        to: cleanTo || "",
        cc: cleanCc || "",
        subject: sub || "Notificación SGC",
        body: msg || "",
        senderName: senderName
    };

    console.log("[AppsScript] Parámetros a enviar:", payload);

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        
        console.log("[AppsScript] Petición enviada exitosamente al script.");
        return true;
    } catch (e) {
        console.error("[AppsScript] FAILED. Error al enviar la petición:", e);
        return false;
    }
};`;

const replEmailJS = `window.sendNotification = async (dest, sub, msg) => { 
    console.log("[EmailJS] Iniciando envío de notificación...");
    
    if (typeof emailjs === "undefined") {
        console.error("[EmailJS] Error: La librería emailjs no está cargada o inicializada.");
        return false;
    }

    if (!dest || (!dest.to && !dest.cc)) {
        console.warn("[EmailJS] Cancelado: No hay destinatarios válidos (to / cc).");
        return false;
    }

    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    let cleanTo = dest.to ? dest.to.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";
    let cleanCc = dest.cc ? dest.cc.split(',').map(e => e.trim()).filter(e => regex.test(e)).join(',') : "";

    if (!cleanTo && !cleanCc) {
        console.warn("[EmailJS] Cancelado: Los correos proporcionados no tienen un formato válido.");
        return false;
    }

    let senderName = "Sistema SGC";
    if (typeof currentUser !== "undefined" && currentUser && currentUser.nombre) {
        senderName = currentUser.nombre;
    }

    let params = { 
        subject: sub || "Notificación SGC", 
        message: msg || "",
        name: senderName,
        to_email: cleanTo || "",
        cc_email: cleanCc || ""
    }; 
    
    console.log("[EmailJS] Parámetros a enviar:", params);

    try {
        const response = await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, params);
        console.log("[EmailJS] Éxito:", response.status, response.text);
        return true;
    } catch (e) {
        console.error("[EmailJS] FAILED. Error al enviar el correo:", e);
        return false;
    }
};`;

// Also check if the previous URL string was there just in case
const targetAppsScriptAlt = targetAppsScript.replace('"https://script.google.com/a/macros/fcipty.com/s/AKfycbymKD51rjtWCH5qFhm21TBLBgJXWMNfnDOYGI128HtGVNGnuWG5i68lE9PNb_1CLVbz/exec"', '"REEMPLAZA_ESTA_URL_CON_LA_TUYA"');

if (content.includes(targetAppsScript)) {
    content = content.replace(targetAppsScript, replEmailJS).replace(targetAppsScript.replace(/\r\n/g, '\n'), replEmailJS);
} else if (content.includes(targetAppsScriptAlt)) {
    content = content.replace(targetAppsScriptAlt, replEmailJS).replace(targetAppsScriptAlt.replace(/\r\n/g, '\n'), replEmailJS);
}

fs.writeFileSync('app.js', content);
console.log('Reverted to EmailJS');
