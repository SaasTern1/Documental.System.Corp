const fs = require('fs');

// Comprehensive fix for index.html
// Strategy: Replace ALL known corrupted patterns precisely
// These are English/code words that should NEVER contain accent characters

let code = fs.readFileSync('index.html', 'utf8');
let original = code;

// ==============================
// FIX "á" corruptions in code/English words 
// ==============================
const fixA = [
    // HTML/CSS attributes and values
    ['align-itemás', 'align-items'],
    ['manifestá', 'manifest'],
    ['díata:', 'data:'],
    ['displayá', 'display'],
    
    // UI words where 'est' was replaced with 'está' inside English words
    ['Estáado', 'Estado'],
    ['estáado', 'estado'],
    ['Estáatus', 'Estatus'],
    ['estáatus', 'estatus'],
    ['Estáructura', 'Estructura'],
    ['estáructura', 'estructura'],
    ['Estáructural', 'Estructural'],
    ['estáructural', 'estructural'],
    ['Estáablecido', 'Establecido'],
    ['estáablecido', 'establecido'],
    ['Estáablecidos', 'Establecidos'],
    ['estáablecidos', 'establecidos'],
    ['Estáilos', 'Estilos'],
    ['estáilos', 'estilos'],
    ['Estáimad', 'Estimad'],
    ['estáimad', 'estimad'],
    ['Estáand', 'Estand'],
    ['estáand', 'estand'],
    ['están', 'están'], // This is correct Spanish, keep it
    
    // 'stor' -> 'stáor' 
    ['Maestáro', 'Maestro'],
    ['maestáro', 'maestro'],
    ['Restáaurar', 'Restaurar'],
    ['restáaurar', 'restaurar'],
    ['Gestáion', 'Gestion'],
    ['gestáion', 'gestion'],
    ['Gestáionar', 'Gestionar'],
    ['gestáionar', 'gestionar'],
    ['GestáionarSGC', 'GestionarSGC'],
    ['GestáionarGerente', 'GestionarGerente'],
    ['Gestáor', 'Gestor'],
    ['gestáor', 'gestor'],
    ['destároy', 'destroy'],
    ['destáSAC', 'destSAC'],
    ['Respuestáas', 'Respuestas'],
    ['respuestáas', 'respuestas'],
    ['Respuestáa', 'Respuesta'],
    ['respuestáa', 'respuesta'],
    ['Bitácora', 'Bitácora'], // Keep - this is correct Spanish
    ['BITÁCORA', 'BITÁCORA'], // Keep
    ['investáigaci', 'investigaci'],
    ['FilterGestáNC', 'FilterGestNC'],
    ['MaestároSettings', 'MaestroSettings'],
    ['estáatusMaestáro', 'estatusMaestro'],
    
    // 'ms' -> 'más' corruption in code words
    ['másjChat', 'msjChat'],
    ['másgMail', 'msgMail'],
    ['másgAuditoria', 'msgAuditoria'],
    ['switchFormásTab', 'switchFormsTab'],
    ['FormásTab', 'FormsTab'],
    
    // 'or' pattern corruptions  
    ['timestáamp', 'timestamp'],
    
    // Other patterns
    ['Díatos', 'Datos'],
    ['díatos', 'datos'],
    ['estáadoFormat', 'estadoFormat'],
    ['estáadoHTML', 'estadoHTML'],
    ['estáadoBadge', 'estadoBadge'],
    ['EstáadoEmpresa', 'EstadoEmpresa'],
    ['estáadoEmpresa', 'estadoEmpresa'],
    ['estáadoActual', 'estadoActual'],
    ['IMÁGENES', 'IMÁGENES'], // Keep - correct Spanish
];

// ==============================
// FIX "í" corruptions in code/English words
// ==============================
const fixI = [
    // Code identifiers
    ['selectedDocDíata', 'selectedDocData'],
    ['closeModíal', 'closeModal'],
    ['cerrarModíal', 'cerrarModal'],
    ['abrirModíal', 'abrirModal'],
    ['Modíal', 'Modal'],
    ['modíal', 'modal'],
    ['díash', 'dash'],
    ['Díash', 'Dash'],
    ['DíashboardCharts', 'DashboardCharts'],
    ['Díashboard', 'Dashboard'],
    ['díashboard', 'dashboard'],
    ['DíarkMode', 'DarkMode'],
    ['díark', 'dark'],
    ['Díark', 'Dark'],
    ['Díate', 'Date'],
    ['díate', 'date'],
    ['DíatosEnvio', 'DatosEnvio'],
    ['DíailyAlerts', 'DailyAlerts'],
    ['díaily', 'daily'],
    ['todíay', 'today'],
    ['DíatasetsDraw', 'DatasetsDraw'],
    ['DíatasetMeta', 'DatasetMeta'],
    ['Díataset', 'Dataset'],
    ['díataset', 'dataset'],
    ['díaInformacion', 'daInformacion'],
    ['extraerTodíaInformacion', 'extraerTodaInformacion'],
    ['Secundíarias', 'Secundarias'],
    ['secundíarias', 'secundarias'],
    ['probabilidíad', 'probabilidad'],
    ['Trazabilidíad', 'Trazabilidad'],
    ['trazabilidíad', 'trazabilidad'],
    ['guardíar', 'guardar'],
    ['Guardíar', 'Guardar'],
    ['guardíarGestáion', 'guardarGestion'],
    ['Prioridíad', 'Prioridad'],
    ['prioridíad', 'prioridad'],
    ['Conformidíades', 'Conformidades'],
    ['conformidíades', 'conformidades'],
    ['Novedíades', 'Novedades'],
    ['novedíades', 'novedades'],
    ['recoleccíion', 'recoleccion'],
    ['Calendíario', 'Calendario'],
    ['calendíario', 'calendario'],
    ['Díario', 'Diario'],
    ['díario', 'diario'],
    ['díanger', 'danger'],
    ['btn-díanger', 'btn-danger'],
    ['btn-icon-díanger', 'btn-icon-danger'],
    ['var(--díanger)', 'var(--danger)'],
    ['analítico', 'analítico'], // Keep - correct Spanish
    ['díares', 'dares'],
    ['díalogo', 'dialogo'],
    ['Díalogo', 'Dialogo'],
    ['Estáimadía', 'Estimada'],
    ['Válidía', 'Valida'],
    ['díark-theme', 'dark-theme'],
    ['isDíark', 'isDark'],
    ['isDí', 'isD'],
    ['guardíarEmpresa', 'guardarEmpresa'],
    // Fix mdash HTML entity
    ['mdíash', 'mdash'],
    ['descargarRespuestáaIndividual', 'descargarRespuestaIndividual'],
    ['descargarRespuestáasExcel', 'descargarRespuestasExcel'],
    ['descargarRespuestáasPDF', 'descargarRespuestasPDF'],
    ['verRespuestáasFormulario', 'verRespuestasFormulario'],
    ['verRespuestáasFormularioInterno', 'verRespuestasFormularioInterno'],
    ['currentRespuestáasDocs', 'currentRespuestasDocs'],
    ['currentRespuestáasFormId', 'currentRespuestasFormId'],
    ['RespuestáasExcel', 'RespuestasExcel'],
    ['RespuestáasPDF', 'RespuestasPDF'],
    ['slaDíate', 'slaDate'],
    ['stándíares', 'stándares'],
    ['Díatos', 'Datos'],
    ['díatos', 'datos'],
    ['Básicos', 'Básicos'], // Keep - correct Spanish
    ['FÍSICA', 'FÍSICA'], // Keep
    ['Dinámicas', 'Dinámicas'], // Keep
];

// Apply all fixes
let allFixes = [...fixA, ...fixI];
let changeCount = 0;

allFixes.forEach(([bad, good]) => {
    if (bad === good) return; // Skip identity replacements
    let escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex = new RegExp(escaped, 'g');
    let matches = code.match(regex);
    if (matches) {
        changeCount += matches.length;
        code = code.replace(regex, good);
    }
});

if (code !== original) {
    fs.writeFileSync('index.html', code, 'utf8');
    console.log(`Fixed ${changeCount} corrupted patterns in index.html`);
} else {
    console.log('No changes needed');
}

// Verify the head section
let lines = code.split('\n');
console.log('\n=== Verification (first 12 lines) ===');
for (let i = 0; i < Math.min(12, lines.length); i++) {
    console.log(`${i+1}: ${lines[i].trim().substring(0, 150)}`);
}
