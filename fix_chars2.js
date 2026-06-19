const fs = require('fs');

// ============================================================
// 1. FIX REMAINING CORRUPTED CHARACTERS IN BOTH FILES
// ============================================================
function fixChars(content) {
  // Fix Á" → Ó  (Á=U+00C1, "=U+201D right double quote / U+0022 straight)
  // This happened because our previous fix turned Ã into Á, but Ã" (mojibake for Ó) 
  // had the " as Windows-1252 0x93 (right double quote U+201D)
  content = content.replace(/Á\u201D/g, 'Ó');
  content = content.replace(/Á"/g,  'Ó');   // straight quote fallback
  // Same issue: É with left/right quotes, etc.
  content = content.replace(/Á\u2019/g, 'Ó'); // right single quote (0x92 in Win-1252 → U+2019)
  
  // Fix Á‰ → É  (É in UTF-8 = C3 89; 89 in Win-1252 = ‰)
  content = content.replace(/Á‰/g, 'É');
  
  // Fix Á• → Õ (not common in Spanish, skip)
  
  // Fix remaining HTML numeric entities in visible text (Spanish words)
  // These should already be plain chars but some weren't touched
  content = content.replace(/&#243;/g, 'ó');   // ó
  content = content.replace(/&#233;/g, 'é');   // é
  content = content.replace(/&#225;/g, 'á');   // á
  content = content.replace(/&#237;/g, 'í');   // í
  content = content.replace(/&#250;/g, 'ú');   // ú
  content = content.replace(/&#241;/g, 'ñ');   // ñ
  content = content.replace(/&#211;/g, 'Ó');   // Ó
  content = content.replace(/&#205;/g, 'Í');   // Í
  content = content.replace(/&#201;/g, 'É');   // É
  content = content.replace(/&#193;/g, 'Á');   // Á
  content = content.replace(/&#218;/g, 'Ú');   // Ú
  content = content.replace(/&#209;/g, 'Ñ');   // Ñ
  content = content.replace(/&#8220;/g, '"');  // left double quote
  content = content.replace(/&#8221;/g, '"');  // right double quote
  
  // Fix &amp; followed by #xxx; (double-encoded entities)
  content = content.replace(/&amp;#243;/g, 'ó');
  content = content.replace(/&amp;#233;/g, 'é');
  content = content.replace(/&amp;#225;/g, 'á');
  content = content.replace(/&amp;#237;/g, 'í');
  content = content.replace(/&amp;#250;/g, 'ú');
  content = content.replace(/&amp;#241;/g, 'ñ');
  content = content.replace(/&amp;#211;/g, 'Ó');
  content = content.replace(/&amp;#205;/g, 'Í');
  content = content.replace(/&amp;#201;/g, 'É');
  content = content.replace(/&amp;#193;/g, 'Á');
  content = content.replace(/&amp;aacute;/g, 'á');
  content = content.replace(/&amp;#218;/g, 'Ú');
  content = content.replace(/&amp;#209;/g, 'Ñ');
  
  // Fix specific Spanish typos from corruption
  content = content.replace(/Oportunid[íi]ades/g, 'Oportunidades');
  content = content.replace(/Evaluad[íi]as/g, 'Evaluadas');
  content = content.replace(/Auditor[íi]as/g, 'Auditorías');  // keep accent
  content = content.replace(/Auditor[íi]a\b/g, 'Auditoría');  // keep accent
  // Note: Auditoría IS correct Spanish, so keep the í
  content = content.replace(/Oportunidades de Mejora/g, 'Oportunidades de Mejora'); // just normalize
  
  return content;
}

// Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
html = fixChars(html);
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html: fixed');

// Fix app.js
let js = fs.readFileSync('app.js', 'utf8');
js = fixChars(js);
fs.writeFileSync('app.js', js, 'utf8');
console.log('app.js: fixed');

// Verify
const lines1585 = html.split('\n')[1584] || '';
console.log('\nLine ~1585 check:', lines1585.trim().slice(0,120));

// Check for remaining Á" patterns
const remaining = (html.match(/Á"/g) || []).length + (html.match(/Á\u201D/g) || []).length;
console.log('Remaining Á" patterns in HTML:', remaining);
