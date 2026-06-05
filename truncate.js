const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const endTag = "</html>";
const endIdx = html.indexOf(endTag);
if (endIdx !== -1) {
    html = html.substring(0, endIdx + endTag.length) + "\n";
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Truncated trailing garbage after </html>");
} else {
    console.log("</html> not found!");
}
