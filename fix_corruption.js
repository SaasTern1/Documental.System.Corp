const fs = require('fs');

// This script fixes the damage caused by the previous fix_words.js script.
// That script blindly replaced short letter patterns like "or" -> "ó" style replacements
// inside words that should NOT have been modified (e.g., "firestore" -> "firestáore",
// "manifest" -> "manifestá", "data:" -> "díata:", "items" -> "itemás", etc.)

let files = ['index.html', 'app.js'];

files.forEach(fileName => {
    if (!fs.existsSync(fileName)) return;
    let code = fs.readFileSync(fileName, 'utf8');
    let original = code;
    
    // Fix the specific corruptions introduced by the bad regex replacements.
    // The old script replaced substrings that happened to match accent patterns
    // inside English/technical words. We reverse those specific corruptions.
    
    // Pattern: "á" inserted where plain "a" should be (in English/code words)
    // manifestá -> manifest
    code = code.replace(/manifestá/g, 'manifest');
    // díata -> data  
    code = code.replace(/díata/g, 'data');
    // Gestáión -> Gestión
    code = code.replace(/Gestáión/g, 'Gestión');
    // Seguridíad -> Seguridad
    code = code.replace(/Seguridíad/g, 'Seguridad');
    // itemás -> items
    code = code.replace(/itemás/g, 'items');
    // firestáore -> firestore
    code = code.replace(/firestáore/g, 'firestore');
    
    // Fix all remaining corrupted technical terms systematically
    // The pattern seems to be: an accent was inserted into common English words
    
    // Fix "á" corruption (a -> á in wrong places)
    code = code.replace(/aligná/g, 'align');
    code = code.replace(/displayá/g, 'display');
    code = code.replace(/containá/g, 'contain');
    code = code.replace(/calendaráio/g, 'calendario');
    code = code.replace(/calendaráy/g, 'calendar');
    code = code.replace(/calendaráio/g, 'calendario');
    code = code.replace(/calendário/g, 'calendario');
    
    // Fix "í" corruption
    code = code.replace(/classíi/g, 'classi');
    
    // Fix "ó" corruption (in non-Spanish words)
    code = code.replace(/storóe/g, 'store');
    code = code.replace(/beforóe/g, 'before');
    
    // General: scan for known-bad patterns where accented chars appear in script URLs
    // Fix Content-Security-Policy
    code = code.replace(/díata:/g, 'data:');
    
    // Fix align-items pattern  
    code = code.replace(/align-itemás/g, 'align-items');
    
    // Fix firestáore in all contexts
    code = code.replace(/firest%C3%A1ore/g, 'firestore');

    if (code !== original) {
        fs.writeFileSync(fileName, code, 'utf8');
        console.log(`Fixed corrupted patterns in ${fileName}`);
    } else {
        console.log(`No corruptions found in ${fileName}`);
    }
});

// Now verify by searching for remaining suspicious accent characters in technical contexts
files.forEach(fileName => {
    if (!fs.existsSync(fileName)) return;
    let code = fs.readFileSync(fileName, 'utf8');
    
    // Find any remaining lines with 'á' inside what looks like English/code words
    let lines = code.split('\n');
    let suspicious = [];
    lines.forEach((line, i) => {
        // Check for accented chars inside script src attributes
        if (line.match(/src="[^"]*[áéíóú][^"]*"/i)) {
            suspicious.push(`${fileName}:${i+1}: ${line.trim().substring(0, 120)}`);
        }
        // Check for accented chars in href for manifest/css 
        if (line.match(/href="[^"]*[áéíóú][^"]*\.(json|js|css)"/i)) {
            suspicious.push(`${fileName}:${i+1}: ${line.trim().substring(0, 120)}`);
        }
        // Check for accented chars in Content-Security-Policy
        if (line.includes('Content-Security-Policy') && line.match(/[áéíóú]/)) {
            suspicious.push(`${fileName}:${i+1}: CSP LINE HAS ACCENTS`);
        }
    });
    
    if (suspicious.length > 0) {
        console.log(`\nWARNING - Remaining suspicious lines in ${fileName}:`);
        suspicious.forEach(s => console.log(`  ${s}`));
    } else {
        console.log(`\n${fileName}: All clear - no suspicious accents in code/URLs`);
    }
});
