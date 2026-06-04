const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const targetFunc = `window.eliminarAuditoriaDetalle = async () => {
    if(!selectedAuditId) return;
    if(!confirm("¿Está seguro de eliminar definitivamente esta auditoría? Esto no se puede deshacer.")) return;
    window.showLoading();
    try {
        await window.del('Auditorias', selectedAuditId, true); // true to skip inner confirm
        window.setDisplay('modal-aud-detalles', 'none');
        window.hideLoading();
    } catch(e) {
        console.error(e);
        window.hideLoading();
    }
};`;

const newFunc = `window.eliminarAuditoriaDetalle = async () => {
    if(!selectedAuditId) return;
    if(!confirm("¿Está seguro de eliminar definitivamente esta auditoría? Esto no se puede deshacer.")) return;
    window.showLoading();
    try {
        await deleteDoc(doc(db, "artifacts", appId, "public", "data", "Auditorias", selectedAuditId));
        window.setDisplay('modal-aud-detalles', 'none');
        window.hideLoading();
    } catch(e) {
        console.error(e);
        window.hideLoading();
    }
};`;

const updatedContent = content.replace(targetFunc, newFunc).replace(targetFunc.replace(/\r\n/g, '\n'), newFunc);
fs.writeFileSync('app.js', updatedContent);
console.log('Fixed app.js delete double confirmation');
