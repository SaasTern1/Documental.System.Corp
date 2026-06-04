const fs = require('fs');

function fixHtml(file) {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<(input|select|textarea)([^>]+)>/g, (match, tag, attrs) => {
        if (attrs.includes('aria-label') || attrs.includes('type="hidden"') || attrs.includes("type='hidden'")) {
            return match;
        }
        
        let placeholderMatch = attrs.match(/placeholder=['"]([^'"]+)['"]/);
        let idMatch = attrs.match(/id=['"]([^'"]+)['"]/);
        let nameMatch = attrs.match(/name=['"]([^'"]+)['"]/);
        
        let label = '';
        if (placeholderMatch && placeholderMatch[1]) {
            label = placeholderMatch[1].replace(/🔍/g, '').trim();
        } else if (idMatch && idMatch[1]) {
            label = idMatch[1];
        } else if (nameMatch && nameMatch[1]) {
            label = nameMatch[1];
        } else {
            label = 'campo';
        }
        
        return '<' + tag + ' aria-label="' + label + '"' + attrs + '>';
    });
    fs.writeFileSync(file, html);
}

fixHtml('index.html');
fixHtml('app.js');
console.log("Fixed!");
