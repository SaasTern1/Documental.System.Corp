const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

const modal = doc.getElementById('modal');
if (!modal) {
    console.log("Not found modal");
    process.exit(1);
}

const overlays = modal.querySelectorAll('.modal-overlay');
let ids = [];
overlays.forEach(o => ids.push(o.id));
console.log("Modals inside 'modal':", ids.join(', '));
