const fs = require('fs');

// Scan for potentially corrupted patterns where accent chars appear
// between two regular ASCII letters (likely a corruption, not a real Spanish word)
let files = ['app.js', 'index.html'];

files.forEach(fileName => {
    if (!fs.existsSync(fileName)) return;
    let code = fs.readFileSync(fileName, 'utf8');
    
    // Find á between ASCII letters in code contexts
    let matches_a = code.match(/[a-z]á[a-z]{2,}/gi) || [];
    let unique_a = [...new Set(matches_a)];
    // Filter out legitimate Spanish words
    let spanishWithA = ['ción','ráct','gráf','párr','cámr','fábr','máqu','área','sábe','cáma','hábil','ánge','lári','ári','mátic','álog','tári','váli','ábor','mári','pári','cári'];
    let suspicious_a = unique_a.filter(x => {
        for (let sp of spanishWithA) { if (x.includes(sp)) return false; }
        return true;
    });
    
    if (suspicious_a.length > 0) {
        console.log(`\n${fileName} - Potential 'á' corruptions (${suspicious_a.length}):`);
        suspicious_a.forEach(s => {
            let idx = code.indexOf(s);
            let context = code.substring(Math.max(0, idx-20), Math.min(code.length, idx+s.length+20));
            context = context.replace(/\n/g, ' ').replace(/\r/g, '');
            console.log(`  "${s}" in: ...${context}...`);
        });
    } else {
        console.log(`${fileName}: No suspicious 'á' patterns found`);
    }
    
    // Find í between ASCII letters
    let matches_i = code.match(/[a-z]í[a-z]{2,}/gi) || [];
    let unique_i = [...new Set(matches_i)];
    let spanishWithI = ['ción','tícu','títu','príor','códig','límit','índic','línea','mínimo','número','vísit','búsqu','únic','píxel','sígui','públi','dígit','típic','prínt','órdín','áplic','ístic','crít','polít','logíst','analít','bítác','admíni','autíst','capítu','revísió','ofícíal','servícío'];
    let suspicious_i = unique_i.filter(x => {
        for (let sp of spanishWithI) { if (x.includes(sp)) return false; }
        // Also allow legitimate í in common patterns
        if (x.match(/ción|sión|tíón/)) return false;
        return true;
    });
    
    if (suspicious_i.length > 0) {
        console.log(`\n${fileName} - Potential 'í' corruptions (${suspicious_i.length}):`);
        suspicious_i.slice(0, 20).forEach(s => {
            let idx = code.indexOf(s);
            let context = code.substring(Math.max(0, idx-20), Math.min(code.length, idx+s.length+20));
            context = context.replace(/\n/g, ' ').replace(/\r/g, '');
            console.log(`  "${s}" in: ...${context}...`);
        });
    } else {
        console.log(`${fileName}: No suspicious 'í' patterns found`);
    }
});
