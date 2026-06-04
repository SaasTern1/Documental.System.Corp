const fs = require('fs');

// 1. UPDATE styles.css
let css = fs.readFileSync('styles.css', 'utf8');

const targetCSS1 = `.modal-content {
    background: var(--card-bg);
    width: 100%;
    max-width: 1100px;
    height: 90vh;
    border-radius: var(--radius-lg);
    display: grid;
    grid-template-columns: 1fr 340px;`;

const replCSS1 = `.modal-content {
    background: var(--card-bg);
    width: 98%;
    max-width: 1400px;
    height: 90vh;
    border-radius: var(--radius-lg);
    display: grid;
    grid-template-columns: 1fr 380px;`;

css = css.replace(targetCSS1, replCSS1).replace(targetCSS1.replace(/\r\n/g, '\n'), replCSS1);

// Also check if there's any other max-width: 1100px in the base class just in case
css = css.replace(/max-width:\s*1100px;/g, "max-width: 1400px;");

fs.writeFileSync('styles.css', css);

// 2. UPDATE index.html INLINE STYLES
let html = fs.readFileSync('index.html', 'utf8');

// Replace standard inline widths
html = html.replace(/max-width:\s*800px;/g, "max-width:1100px;");
html = html.replace(/max-width:800px;/g, "max-width:1100px;");

html = html.replace(/max-width:\s*850px;/g, "max-width:1200px;");
html = html.replace(/max-width:850px;/g, "max-width:1200px;");

html = html.replace(/max-width:\s*900px;/g, "max-width:1200px;");
html = html.replace(/max-width:900px;/g, "max-width:1200px;");

html = html.replace(/max-width:\s*1000px;/g, "max-width:1200px;");
html = html.replace(/max-width:1000px;/g, "max-width:1200px;");

// Excepcion para modal-eval-sol que era 500px, la subimos un poco a 650px
html = html.replace(/<div class="modal-content" style="max-width: 500px;/g, '<div class="modal-content" style="max-width: 700px;');

// Let's also make sure the grid inside 'Responsables Asignados' is spaced nicely
// Right now it's class="resp-grid" which uses repeat(auto-fit, minmax(200px, 1fr)) from styles.css

fs.writeFileSync('index.html', html);

console.log('Fixed widths in CSS and HTML');
