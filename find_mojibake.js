const fs = require('fs');

// Read the file as a raw buffer to see actual bytes
let buf = fs.readFileSync('app.js');
let code = buf.toString('utf8');

// Find all instances of mojibake emoji patterns and corrupted Spanish chars
// These are UTF-8 bytes that were double-encoded or stored with wrong encoding

// Common mojibake patterns for emojis (UTF-8 bytes read as Windows-1252/Latin-1)
const emojiFixMap = [
    // 💬 U+1F4AC = F0 9F 92 AC in UTF-8 -> Ã°Å¸â€™Â¬ or ðŸ'¬ or similar mojibake
    ['ð\x9F\x92\xAC', '💬'],
    ['ðŸ\'¬', '💬'],
    // 📄 U+1F4C4 = F0 9F 93 84 -> various mojibake
    ['ð\x9F\x93\x84', '📄'],
    // 📅 U+1F4C5
    ['ð\x9F\x93\x85', '📅'],
    // ✏️ U+270F = E2 9C 8F + FE0F
    ['â\x9C\x8F', '✏'],
    // ✅ U+2705 = E2 9C 85
    ['â\x9C\x85', '✅'],
    // ❌ U+274C
    ['â\x9D\x8C', '❌'],
    // ⚠️ U+26A0
    ['â\x9A\xA0', '⚠'],
    // 🚫 U+1F6AB
    ['ð\x9F\x9A\xAB', '🚫'],
    // ⏪ U+23EA
    ['â\x8F\xAA', '⏪'],
    // ⚖️ U+2696
    ['â\x9A\x96', '⚖'],
];

// Common mojibake for Spanish accented characters (UTF-8 read as Latin-1)
// Ã¡ = á, Ã© = é, Ã­ = í, Ã³ = ó, Ã± = ñ, Ãº = ú
const accentFixMap = [
    ['Ã¡', 'á'],
    ['Ã©', 'é'],
    ['Ã­', 'í'],
    ['Ã³', 'ó'],
    ['Ã±', 'ñ'],
    ['Ãº', 'ú'],
    ['Ã\x81', 'Á'],
    ['Ã\x89', 'É'],
    ['Ã\x8D', 'Í'],
    ['Ã\x93', 'Ó'],
    ['Ã\x91', 'Ñ'],
    ['Ã\x9A', 'Ú'],
    ['Ã\xB3', 'ó'],
    ['Ã\xA1', 'á'],
    ['Ã\xA9', 'é'],
    ['Ã\xAD', 'í'],
    ['Ã\xB1', 'ñ'],
    ['Ã\xBA', 'ú'],
];

// First let me find what the actual problematic bytes are
// Search for the ? ? pattern shown in Select-String output
let lines = code.split('\n');
let line2292 = lines[2291]; // 0-indexed
console.log("=== Line 2292 raw bytes (hex) around 'msjChat' ===");
let msjIdx = line2292.indexOf('msjChat');
if (msjIdx >= 0) {
    // Show bytes after msjChat = `
    let start = line2292.indexOf('`', msjIdx);
    if (start >= 0) {
        let snippet = line2292.substring(start, start + 30);
        console.log("Snippet:", JSON.stringify(snippet));
        console.log("Char codes:", [...snippet].map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' '));
    }
}

// Search for all lines containing potential mojibake emojis
console.log("\n=== Lines with potential mojibake ===");
let mojibakePatterns = ['â', 'ð', 'Ã', 'Â'];
let found = new Map();

lines.forEach((line, i) => {
    for (let p of mojibakePatterns) {
        if (line.includes(p)) {
            // Get context around the pattern
            let idx = line.indexOf(p);
            let ctx = line.substring(Math.max(0, idx-5), Math.min(line.length, idx+15));
            let key = [...ctx].map(c => {
                let code = c.charCodeAt(0);
                if (code < 0x80) return c;
                return '\\u' + code.toString(16).padStart(4, '0');
            }).join('');
            if (!found.has(key)) {
                found.set(key, i+1);
                console.log(`Line ${i+1}: ${key}`);
            }
        }
    }
});
