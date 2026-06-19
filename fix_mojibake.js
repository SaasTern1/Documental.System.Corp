#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || '.';
const exts = new Set(['.html','.htm','.js','.css','.json','.txt','.md']);
const suspicious = /(Ã|Â|â|ðŸ|�)/;

function readFileSyncSafe(p){
  try{ return fs.readFileSync(p); }catch(e){ return null; }
}

function tryFix(buffer){
  // Buffer -> interpret as latin1 then decode utf8
  try{
    const latin = buffer.toString('latin1');
    const corrected = Buffer.from(latin, 'latin1').toString('utf8');
    return corrected;
  }catch(e){ return null; }
}

function looksBetter(orig, corr){
  const accents = /[áéíóúÁÉÍÓÚñÑüÜ¿¡]/g;
  const origAcc = (orig.match(accents)||[]).length;
  const corrAcc = (corr.match(accents)||[]).length;
  const origRepl = (orig.match(/�/g)||[]).length;
  const corrRepl = (corr.match(/�/g)||[]).length;
  return (corrRepl <= origRepl) && (corrAcc >= origAcc);
}

function walk(dir){
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for(const it of items){
    const p = path.join(dir, it.name);
    if(it.isDirectory()) out.push(...walk(p));
    else {
      if(exts.has(path.extname(it.name).toLowerCase())) out.push(p);
    }
  }
  return out;
}

const files = walk(ROOT);
const findings = [];
for(const f of files){
  const buf = readFileSyncSafe(f);
  if(!buf) continue;
  let utf8;
  try{ utf8 = buf.toString('utf8'); }catch(e){ utf8 = buf.toString('utf8'); }
  if(!suspicious.test(utf8)) continue;
  const corr = tryFix(buf);
  if(!corr) continue;
  if(!looksBetter(utf8, corr)) continue;
  findings.push({file:f, original: utf8.slice(0,200), corrected: corr.slice(0,200)});
}

if(findings.length===0){
  console.log('No se detectaron casos obvios de mojibake.');
  process.exit(0);
}

for(const r of findings){
  console.log('\n---');
  console.log('Archivo:', r.file);
  console.log('\n-- ORIGINAL --\n', r.original);
  console.log('\n-- CORREGIDO --\n', r.corrected);
}
console.log('\nTotal encontrados:', findings.length);

