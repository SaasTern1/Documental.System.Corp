const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const counts = {};
lines.forEach((line, i) => {
    const match = line.match(/id="([^"]+)"/g);
    if(match) {
        match.forEach(m => {
            const id = m.split('"')[1];
            if(!counts[id]) counts[id] = [];
            counts[id].push(i + 1);
        });
    }
});
for(const id in counts) {
    if(counts[id].length > 1) {
        console.log('ID:', id, 'Lines:', counts[id].join(', '));
    }
}
