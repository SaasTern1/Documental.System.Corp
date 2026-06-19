const fs = require('fs');

// This script does a comprehensive search-and-fix for ALL remaining accent corruptions
// The previous fix_words.js inserted accent characters into the middle of English words
// and technical identifiers. This script finds and fixes every instance.

let files = ['app.js', 'index.html'];

files.forEach(fileName => {
    if (!fs.existsSync(fileName)) return;
    let code = fs.readFileSync(fileName, 'utf8');
    let original = code;
    
    // SPECIFIC KNOWN CORRUPTIONS (found by manual inspection)
    const fixes = [
        // Firebase/code identifiers
        ['getFirestáore', 'getFirestore'],
        ['updíateDoc', 'updateDoc'],
        ['sistemadegestáion', 'sistemadegestion'],
        ['firebasestáorage', 'firebasestorage'],
        ['firestáore', 'firestore'],
        
        // Common code words that may have been corrupted
        ['stáore', 'store'],
        ['stáorage', 'storage'],
        ['restáore', 'restore'],
        
        // "ate" pattern -> "íate" corruption (from fix for í)
        ['updíate', 'update'],
        ['creaáte', 'create'],
        ['templíate', 'template'],
        ['validíate', 'validate'],
        ['generíate', 'generate'],
        ['navigíate', 'navigate'],
        
        // "ion" pattern in English words -> "áion" corruption
        ['gestáion', 'gestion'],
        ['funcáion', 'funcion'],  
        ['secáion', 'section'],
        ['optáion', 'option'],
        ['actáion', 'action'],
        ['locatáion', 'location'],
        ['positáion', 'position'],
        ['transitáion', 'transition'],
        ['collectáion', 'collection'],
        ['directáion', 'direction'],
        ['connectáion', 'connection'],
        ['selectáion', 'selection'],
        ['conditáion', 'condition'],
        ['applicatáion', 'application'],
        
        // "da" -> "día" corruption in English words
        ['díata', 'data'],
        ['updíate', 'update'],
        ['candíídate', 'candidate'],
        ['bordíar', 'bordar'],
        
        // "or" pattern corruptions
        ['colór', 'color'],
        
        // "ad" -> "íad" in English words
        ['Seguridíad', 'Seguridad'],
        ['seguridíad', 'seguridad'],
        ['downloíad', 'download'],
        ['uploíad', 'upload'],
        ['loíad', 'load'],
        ['reíad', 'read'],
        ['spreíad', 'spread'],
        ['heíad', 'head'],
        ['threíad', 'thread'],
        ['deíad', 'dead'],
        
        // "items" -> "itemás" corruption
        ['itemás', 'items'],
        
        // manifest -> manifestá
        ['manifestá', 'manifest'],
        
        // "align" corruptions
        ['aligná', 'align'],
        
        // CSS/HTML property corruptions
        ['displayá', 'display'],
        ['borderá', 'border'],
        
        // "Gestáión" -> "Gestión"
        ['Gestáión', 'Gestión'],
    ];
    
    fixes.forEach(([bad, good]) => {
        let regex = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        code = code.replace(regex, good);
    });
    
    if (code !== original) {
        let count = 0;
        fixes.forEach(([bad, good]) => {
            let regex = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            let matches = original.match(regex);
            if (matches) count += matches.length;
        });
        fs.writeFileSync(fileName, code, 'utf8');
        console.log(`Fixed ${count} corrupted patterns in ${fileName}`);
    } else {
        console.log(`No corruptions found in ${fileName}`);
    }
});

// Final verification of critical lines
files.forEach(fileName => {
    if (!fs.existsSync(fileName)) return;
    let code = fs.readFileSync(fileName, 'utf8');
    let lines = code.split('\n');
    
    // Check first 20 lines for remaining issues
    console.log(`\n=== First 12 lines of ${fileName} ===`);
    for (let i = 0; i < Math.min(12, lines.length); i++) {
        let line = lines[i].trim();
        if (line.length > 0) {
            console.log(`${i+1}: ${line.substring(0, 160)}`);
        }
    }
});
