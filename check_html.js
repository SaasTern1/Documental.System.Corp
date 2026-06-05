const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

// 1. Missing ID or name
const inputs = doc.querySelectorAll('input, select, textarea');
let missingIdName = [];
inputs.forEach((input, index) => {
    if (!input.id && !input.name) {
        missingIdName.push(input.outerHTML);
    }
});
console.log("Missing ID or Name:", missingIdName.length, missingIdName);

// 2. Duplicate IDs
let ids = new Set();
let duplicates = new Set();
const allEls = doc.querySelectorAll('[id]');
allEls.forEach(el => {
    if (ids.has(el.id)) {
        duplicates.add(el.id);
    } else {
        ids.add(el.id);
    }
});
console.log("Duplicate IDs:", Array.from(duplicates));

// 3. No label associated
let missingLabels = [];
inputs.forEach(input => {
    if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
    
    // has aria-label?
    if (input.hasAttribute('aria-label')) return;
    
    // is wrapped in label?
    let parent = input.parentElement;
    let hasWrapperLabel = false;
    while (parent) {
        if (parent.tagName.toLowerCase() === 'label') {
            hasWrapperLabel = true;
            break;
        }
        parent = parent.parentElement;
    }
    
    // is linked by for?
    let hasForLabel = false;
    if (input.id) {
        const labels = doc.querySelectorAll(`label[for="${input.id}"]`);
        if (labels.length > 0) hasForLabel = true;
    }
    
    if (!hasWrapperLabel && !hasForLabel) {
        missingLabels.push(input.outerHTML.substring(0, 100));
    }
});
console.log("Missing Labels (no aria-label, no wrapper, no for):", missingLabels.length, missingLabels);
