const fs = require('fs');

// ============================================================
// COMPREHENSIVE FIX FOR ALL REMAINING MOJIBAKE IN index.html
// ============================================================
let html = fs.readFileSync('index.html', 'utf8');

// Box-drawing chars used as decorative dashes in comments: â"€ = ─ (U+2500)
// These are fine as decorative, but let's normalize to regular dashes
html = html.replace(/â"€â"€/g, '--');
html = html.replace(/â"€/g, '-');

// AUDITORÁA → AUDITORÍA
html = html.replace(/AUDITOR\u00C1A\b/g, 'AUDITORÍA');
html = html.replace(/Auditor\u00C1a\b/g, 'Auditoría');
html = html.replace(/auditor\u00C1a\b/g, 'auditoría');

// FÁSICA → FÍSICA  (Á should be Í here? No: FÍSICA = F+Í+S+I+C+A)
// FÁSICA: Á in position of Í means it's also a mojibake: Í (U+00CD) C3 8D → ?
// Actually: FÍSICA correct. Á here is wrong. Should be Í.
// But let's check: FÁSICA vs FÍSICA - the Á should be Í
html = html.replace(/F\u00C1SICA/g, 'FÍSICA');
html = html.replace(/F\u00C1sica/g, 'Física');
html = html.replace(/f\u00C1sica/g, 'física');

// NÂ° → N° (degree sign)
html = html.replace(/N\u00C2\u00B0/g, 'N°');
html = html.replace(/N\u00C2°/g, 'N°');
html = html.replace(/Â°/g, '°');   // any standalone degree sign
html = html.replace(/\u00C2°/g, '°');

// LÁMITE → LÍMITE  (Á should be Í)
html = html.replace(/L\u00C1MITE/g, 'LÍMITE');
html = html.replace(/L\u00C1mite/g, 'Límite');

// Área Afectadía → Área Afectada (just a typo)
html = html.replace(/Afectad\u00EDa/g, 'Afectada');
html = html.replace(/afectad\u00EDa/g, 'afectada');

// guardarAuditoría, finalizarAuditoría in onclick attrs - these are function names in JS
// They should match what's in app.js exactly, so leave them for now (handled in app.js fix)

// AÁ'ADIR → AÑADIR  (Á' = Ñ: Ñ UTF-8 = C3 91; in Win-1252 0x91 = U+2018 left single quote)
html = html.replace(/A\u00C1\u2018ADIR/g, 'AÑADIR');
html = html.replace(/a\u00C1\u2018adir/g, 'añadir');
html = html.replace(/\u00C1\u2018/g, 'Ñ');  // general fix: Á+ left single quote → Ñ

// Añadir Átem → Añadir Ítem  (Á should be Í for Ítem)
html = html.replace(/A\u00C1tem/g, 'Ítem');
html = html.replace(/a\u00C1tem/g, 'ítem');

// Átem Ref → Ítem Ref
html = html.replace(/\u00C1tem/g, 'Ítem');
html = html.replace(/\u00C1TEM/g, 'ÍTEM');

// Â¿ → ¿ (inverted question mark mojibake: ¿ = C2 BF; Â=C2, ¿=BF)
html = html.replace(/\u00C2\u00BF/g, '¿');
html = html.replace(/Â¿/g, '¿');

// Â¡ → ¡ (inverted exclamation)
html = html.replace(/\u00C2\u00A1/g, '¡');

// DinÁƒÂ¡micos → Dinámicos (heavy double corruption)
// Á = U+00C1, ƒ = U+0192, Â = U+00C2, ¡ = U+00A1
// This is a triple-encoding issue. The correct letter is á.
html = html.replace(/\u00C1\u0192\u00C2\u00A1/g, 'á');
// AquÁƒÂ­ → Aquí (Á+ƒ+Â+soft-hyphen/­ = í)
html = html.replace(/\u00C1\u0192\u00C2\u00AD/g, 'í');
html = html.replace(/\u00C1\u0192\u00C2[\u00A1-\u00BF]/g, (m) => {
  const last = m.charCodeAt(3);
  // Map common: 0xA1=¡→á (not right), 0xAD=­→í
  if (last === 0xAD) return 'í';
  if (last === 0xA1) return 'á'; 
  return m;
});

// ESCÁNER → ESCÁNER is actually correct Spanish! Leave it.
// Wait: ESCÁNER is correct (scanner in Spanish). Keep as is.

// Fix comment with AUDITORÁA → AUDITORÍA already done above
// Also in onclick attributes: guardarAuditoría → guardarAuditoria (function name must match JS)
// We'll fix the JS side to match whatever is in HTML

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html: comprehensive fix done');

// Verify key fixes
const lines = html.split('\n');
const checkLines = [158, 189, 659, 730, 859, 1071, 1260, 1469, 1519, 1528, 1542, 1575, 1734, 1738, 1742, 1841, 1887, 1934];
checkLines.forEach(n => {
  const l = (lines[n-1] || '').trim().slice(0,120);
  if (l) console.log('L' + n + ': ' + l);
});
