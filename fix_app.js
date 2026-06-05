const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// 1. Extract and remove the injected block
const startMarker = "// ==========================================\n// NUEVO: TOGGLE PLAN Y CALENDARIO ANUAL";
const startIdx = js.indexOf(startMarker);
if (startIdx === -1) {
    console.log("Marker not found!");
    process.exit(1);
}

const endStr = "    window.setDisplay('modal-calendario-anual', 'flex');\n};\n";
const endIdx = js.indexOf(endStr, startIdx);
if (endIdx === -1) {
    console.log("End marker not found");
    process.exit(1);
}

const injectedBlock = js.substring(startIdx, endIdx + endStr.length);

// Remove the injected block
js = js.substring(0, startIdx) + js.substring(endIdx + endStr.length);

// 2. Fix the broken prompt string
// It looks like:
// let newOpts = prompt(`Edita las opciones separadas por coma:\n
// \n(Campo: ${c.label})`, optsStr);
// We need to fix it back to:
// let newOpts = prompt(`Edita las opciones separadas por coma:\n(Campo: ${c.label})`, optsStr);

js = js.replace("let newOpts = prompt(`Edita las opciones separadas por coma:\\n\\n(Campo: ${c.label})`, optsStr);", "let newOpts = prompt(`Edita las opciones separadas por coma:\\n(Campo: ${c.label})`, optsStr);");

// Let's use a regex just in case there are varying spaces or newlines
js = js.replace(/let newOpts = prompt\(\`Edita las opciones separadas por coma:\\n[\s\S]*?\\n\(Campo: \$\{c\.label\}\)\`,\s*optsStr\);/, "let newOpts = prompt(`Edita las opciones separadas por coma:\\n(Campo: ${c.label})`, optsStr);");

// 3. Append the block at the end of the file safely
js += "\n" + injectedBlock;

fs.writeFileSync('app.js', js, 'utf8');
console.log("Fixed app.js");
