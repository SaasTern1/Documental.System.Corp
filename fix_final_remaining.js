const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');
let original = code;

const finalFixes = [
    ['Todías', 'Todas'],
    ['todías', 'todas'],
    ['calendíar_month', 'calendar_month'],
    ['calendíar', 'calendar'],
    ['confiabilidíad', 'confiabilidad'],
    ['Recomendíado', 'Recomendado'],
    ['recomendíado', 'recomendado'],
    ['oportunidíades', 'oportunidades'],
    ['Recomendíaciones', 'Recomendaciones'],
    ['recomendíaciones', 'recomendaciones'],
    ['Registrar Díato', 'Registrar Dato'],
    ['Díato', 'Dato'],
    ['díato', 'dato'],
    ['correctivías', 'correctivas'],
    ['Díatos', 'Datos'],
    ['díatos', 'datos'],
];

let count = 0;
finalFixes.forEach(([bad, good]) => {
    let escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex = new RegExp(escaped, 'g');
    let matches = code.match(regex);
    if (matches) {
        count += matches.length;
        code = code.replace(regex, good);
    }
});

if (code !== original) {
    fs.writeFileSync('index.html', code, 'utf8');
    console.log(`Fixed ${count} remaining corruptions in index.html`);
} else {
    console.log('index.html: No changes needed');
}
