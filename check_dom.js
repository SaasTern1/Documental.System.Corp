const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

const modalUsuario = doc.getElementById('modal-usuario');
if (!modalUsuario) {
    console.log("Not found");
    process.exit(0);
}

let el = modalUsuario;
let path = [];
while (el && el.tagName) {
    let idStr = el.id ? `#${el.id}` : '';
    let classStr = el.className ? `.${el.className.split(' ').join('.')}` : '';
    path.unshift(`${el.tagName.toLowerCase()}${idStr}${classStr}`);
    el = el.parentElement;
}
console.log(path.join(' > '));
