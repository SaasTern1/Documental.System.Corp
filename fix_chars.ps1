$file = 'index.html'
$c = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Fix malformed ID p-gestX-sgc (corrupted character in ID)
$c = $c -replace 'p-gest[^"a-z\-]*-sgc', 'p-gest-sgc'

# Fix common mojibake patterns
$replacements = @{
    'Ã³' = 'ó'
    'Ã¡' = 'á'
    'Ã±' = 'ñ'
    'Ã­' = 'í'
    'Ã©' = 'é'
    'Ãº' = 'ú'
    'Ã"' = 'Ó'
    'Ã‰' = 'É'
    'Ã€' = 'À'
    'TÃ©cnica' = 'Técnica'
    'AuditorÃ­a' = 'Auditoría'
    'LÃ­der' = 'Líder'
    'TecnolÃ³gicos' = 'Tecnológicos'
    'CriteriosÃ­' = 'Criteriosí'
}

foreach ($key in $replacements.Keys) {
    $c = $c.Replace($key, $replacements[$key])
}

# Special case: corrupted "Gestión" that appears as GestXi&#243;n or similar
# Replace any "Gest" followed by non-ASCII then "i" then "&#243;n" or "&#243;n" or "i&amp;#243;n"
$c = [System.Text.RegularExpressions.Regex]::Replace($c, 'Gest[^a-z<>"]{1,3}i(&#243;|&amp;#243;)n', 'Gestión')

# Also fix "Visualizaci" + mojibake + "n"
$c = [System.Text.RegularExpressions.Regex]::Replace($c, 'Visualizaci[^a-z<>"]{1,3}n', 'Visualización')

# Fix "Gesti" + mojibake + "n"  
$c = [System.Text.RegularExpressions.Regex]::Replace($c, 'Gesti[^a-z<>"]{1,3}n\b', 'Gestión')

# Fix "Contrase" + mojibake + "a"
$c = [System.Text.RegularExpressions.Regex]::Replace($c, 'Contrase[^a-z<>"]{1,3}a', 'Contraseña')

# Fix "M" + mojibake + "dulo"
$c = [System.Text.RegularExpressions.Regex]::Replace($c, 'M[^a-z<>"]{1,3}dulo', 'Módulo')

[System.IO.File]::WriteAllText($file, $c, [System.Text.Encoding]::UTF8)
Write-Host "Caracteres corregidos en $file"
