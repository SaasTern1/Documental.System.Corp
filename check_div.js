const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startIndex = html.indexOf('<div class="modal-overlay" id="modal">');
if (startIndex === -1) {
    console.log("Could not find modal");
    process.exit(1);
}

let divCount = 0;
let pos = startIndex;

while (pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div', pos);

    if (nextOpen === -1 && nextClose === -1) break;

    if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
        divCount++;
        pos = nextOpen + 4;
    } else {
        divCount--;
        pos = nextClose + 5;
    }

    if (divCount === 0) {
        console.log("Modal closes at index:", pos);
        // let's see what line this is
        const linesBefore = html.substring(0, pos).split('\n').length;
        console.log("Modal closes at line:", linesBefore);
        break;
    }
}
