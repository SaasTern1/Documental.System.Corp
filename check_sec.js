const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startIndex = html.indexOf('<section id="sec-usuarios" class="section">');
if (startIndex === -1) {
    console.log("Could not find sec-usuarios");
    process.exit(1);
}

let sectionCount = 0;
let pos = startIndex;

while (pos < html.length) {
    const nextOpen = html.indexOf('<section', pos);
    const nextClose = html.indexOf('</section', pos);

    if (nextOpen === -1 && nextClose === -1) break;

    if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
        sectionCount++;
        pos = nextOpen + 8;
    } else {
        sectionCount--;
        pos = nextClose + 10;
    }

    if (sectionCount === 0) {
        console.log("sec-usuarios closes at index:", pos);
        const linesBefore = html.substring(0, pos).split('\n').length;
        console.log("sec-usuarios closes at line:", linesBefore);
        break;
    }
}
