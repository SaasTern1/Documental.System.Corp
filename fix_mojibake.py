#!/usr/bin/env python3
"""
Detecta y corrige casos comunes de mojibake donde bytes UTF-8 fueron interpretados
como Latin-1 (p. ej. secuencias como 'Ã©', 'â€™', 'ðŸ') y devuelve una versión corregida.

Uso:
  python fix_mojibake.py --dry-run   # lista archivos y muestras propuestas
  python fix_mojibake.py --apply     # aplica correcciones (hace backup .bak)

El script procesa extensiones comunes (.html, .js, .css, .json, .txt, .md).
"""
import argparse
import os
import re
from pathlib import Path

COMMON_EXT = {'.html', '.htm', '.js', '.css', '.json', '.txt', '.md'}

SUSPICIOUS_PATTERNS = re.compile(r'(Ã|Â|â|ðŸ|�)')

def looks_better(original: str, corrected: str) -> bool:
    # Heurística sencilla: más caracteres acentuados y menos replacement chars
    accents = 'áéíóúÁÉÍÓÚñÑüÜ¿¡'
    orig_acc = sum(original.count(c) for c in accents)
    corr_acc = sum(corrected.count(c) for c in accents)
    orig_repl = original.count('�')
    corr_repl = corrected.count('�')
    return (corr_repl <= orig_repl) and (corr_acc >= orig_acc)

def try_fix_bytes(raw_bytes: bytes) -> str | None:
    # Interpreta los bytes como latin1->utf8 (fix común de mojibake)
    try:
        as_latin1 = raw_bytes.decode('latin1')
        corrected = as_latin1.encode('latin1').decode('utf8')
    except Exception:
        return None
    return corrected

def analyze_file(path: Path, apply: bool=False) -> dict | None:
    try:
        raw = path.read_bytes()
    except Exception as e:
        return None

    try:
        utf8_text = raw.decode('utf8')
    except Exception:
        # If file fails utf-8 decode, try best-effort replacement
        utf8_text = raw.decode('utf8', errors='replace')

    # Quick heuristic: if utf8_text contains suspicious sequences
    if not SUSPICIOUS_PATTERNS.search(utf8_text):
        return None

    corrected = try_fix_bytes(raw)
    if not corrected:
        return None

    if not looks_better(utf8_text, corrected):
        return None

    result = {
        'file': str(path),
        'sample_original': utf8_text[:200],
        'sample_corrected': corrected[:200],
    }

    if apply:
        bak = path.with_suffix(path.suffix + '.bak')
        path.replace(bak)
        # write corrected as utf-8
        path.write_text(corrected, encoding='utf8')
        result['fixed'] = True
        result['backup'] = str(bak)
    else:
        result['fixed'] = False

    return result

def walk_and_fix(root: Path, apply: bool=False, extensions=None):
    if extensions is None:
        extensions = COMMON_EXT
    findings = []
    for p in root.rglob('*'):
        if p.is_file() and p.suffix.lower() in extensions:
            res = analyze_file(p, apply=apply)
            if res:
                findings.append(res)
    return findings

def main():
    parser = argparse.ArgumentParser(description='Detecta/corrige mojibake UTF-8<->Latin1')
    parser.add_argument('--apply', action='store_true', help='Escribe correcciones (hace backup .bak)')
    parser.add_argument('--dry-run', action='store_true', help='Solo lista propuestas (por defecto)')
    parser.add_argument('--root', default='.', help='Directorio raíz a escanear')
    args = parser.parse_args()

    root = Path(args.root)
    apply = args.apply
    findings = walk_and_fix(root, apply=apply)

    if not findings:
        print('No se detectaron casos obvios de mojibake en', root)
        return

    for f in findings:
        print('\n---')
        print('Archivo:', f['file'])
        print('Backup:' if f.get('backup') else 'Preview:')
        if f.get('backup'):
            print('  backup creado en', f['backup'])
        print('\n-- ORIGINAL (muestra) --')
        print(f['sample_original'])
        print('\n-- CORREGIDO (muestra) --')
        print(f['sample_corrected'])

    print('\nTotal encontrados:', len(findings))

if __name__ == '__main__':
    main()
