const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

let missingLabels = [];
doc.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => {
    let id = el.id;
    let ariaLabel = el.getAttribute('aria-label');
    let ariaLabelledBy = el.getAttribute('aria-labelledby');
    let title = el.getAttribute('title');

    // If it has aria-label or aria-labelledby or title, it MIGHT be accessible, 
    // BUT Lighthouse often specifically wants 'aria-label' or a real <label>.
    // Let's check for ANY of these.
    
    let hasRealLabel = false;
    if (id) {
        let label = doc.querySelector(`label[for="${id}"]`);
        if (label) hasRealLabel = true;
    }
    
    let parent = el.parentElement;
    while(parent) {
        if (parent.tagName === 'LABEL') { hasRealLabel = true; break; }
        parent = parent.parentElement;
    }

    if (!hasRealLabel && !ariaLabel && !ariaLabelledBy) {
        missingLabels.push(el.outerHTML);
    }
});

console.log(`Found ${missingLabels.length} missing labels (no real label and no aria-label).`);
missingLabels.forEach(l => console.log(l.substring(0, 80)));
