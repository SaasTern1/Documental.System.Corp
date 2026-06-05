const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

let missingLabels = [];
doc.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => {
    let id = el.id;
    if (!id) {
        missingLabels.push(el.outerHTML);
        return;
    }
    // Check if there is a <label for="id">
    let label = doc.querySelector(`label[for="${id}"]`);
    if (!label) {
        // check if nested
        let parent = el.parentElement;
        let nested = false;
        while(parent) {
            if (parent.tagName === 'LABEL') { nested = true; break; }
            parent = parent.parentElement;
        }
        if (!nested) {
            missingLabels.push(id + " - " + el.outerHTML);
        }
    }
});

console.log(`Found ${missingLabels.length} missing explicit labels.`);
missingLabels.forEach(l => console.log(l.substring(0, 80)));
