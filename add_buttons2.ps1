$path = "c:\Users\junio\Documents\proyecto\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Instead of replacing the whole button, let's just append the edit button after it.
$content = $content -replace 'onclick="window\.abrirModalVisitante\(\)">(.*?)</button>', 'onclick="window.abrirModalVisitante()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Bitácora de Visitantes y Contratistas'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

$content = $content -replace 'onclick="window\.abrirModalContenedor\(\)">(.*?)</button>', 'onclick="window.abrirModalContenedor()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Inspección de Contenedores (17 Puntos OEA)'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

$content = $content -replace 'onclick="window\.abrirModalAmbiental\(\)">(.*?)</button>', 'onclick="window.abrirModalAmbiental()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Gestión Ambiental'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

$content = $content -replace 'onclick="window\.abrirModalSimulacro\(\)">(.*?)</button>', 'onclick="window.abrirModalSimulacro()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Simulacros y BCP'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

$content = $content -replace 'onclick="window\.abrirModalRRHH\(\)">(.*?)</button>', 'onclick="window.abrirModalRRHH()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Control de Confiabilidad RRHH'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

$content = $content -replace 'onclick="window\.abrirModalIT\(\)">(.*?)</button>', 'onclick="window.abrirModalIT()">$1</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Controles de Seguridad IT'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Success"
