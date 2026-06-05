const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

const modalMain = doc.querySelector('.modal-main');

// Get all unclosed tags or path for general-comment-area
const generalComment = doc.getElementById('general-comment-area');
let el = generalComment;
let path = [];
while (el && el.tagName) {
    let idStr = el.id ? `#${el.id}` : '';
    let classStr = el.className ? `.${el.className.split(' ').join('.')}` : '';
    path.unshift(`${el.tagName.toLowerCase()}${idStr}${classStr}`);
    el = el.parentElement;
}
console.log("general-comment-area path: ", path.join(' > '));

const reqDetails = doc.getElementById('m-req-details');
if(reqDetails) {
    el = reqDetails;
    path = [];
    while (el && el.tagName) {
        let idStr = el.id ? `#${el.id}` : '';
        let classStr = el.className ? `.${el.className.split(' ').join('.')}` : '';
        path.unshift(`${el.tagName.toLowerCase()}${idStr}${classStr}`);
        el = el.parentElement;
    }
    console.log("m-req-details path: ", path.join(' > '));
}

