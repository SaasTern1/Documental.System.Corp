const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

const modalSide = doc.querySelector('.modal-side');
let el = modalSide;
let path = [];
while (el && el.tagName) {
    let idStr = el.id ? `#${el.id}` : '';
    let classStr = el.className ? `.${el.className.split(' ').join('.')}` : '';
    path.unshift(`${el.tagName.toLowerCase()}${idStr}${classStr}`);
    el = el.parentElement;
}
console.log(".modal-side path: ", path.join(' > '));

const chatBox = doc.getElementById('chat-box');
el = chatBox;
path = [];
while (el && el.tagName) {
    let idStr = el.id ? `#${el.id}` : '';
    let classStr = el.className ? `.${el.className.split(' ').join('.')}` : '';
    path.unshift(`${el.tagName.toLowerCase()}${idStr}${classStr}`);
    el = el.parentElement;
}
console.log("chat-box path: ", path.join(' > '));
