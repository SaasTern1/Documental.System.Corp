$path = "c:\Users\junio\Documents\proyecto\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Contenedores
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalContenedor\(\)"><span class="material-icons-round">add</span> Nueva Inspección</button>', '<button class="btn btn-primary" onclick="window.abrirModalContenedor()"><span class="material-icons-round">add</span> Nueva Inspección</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Inspección de Contenedores (17 Puntos OEA)'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Visitantes
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalVisitante\(\)"><span class="material-icons-round">add</span> Registrar Ingreso</button>', '<button class="btn btn-primary" onclick="window.abrirModalVisitante()"><span class="material-icons-round">add</span> Registrar Ingreso</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Bitácora de Visitantes y Contratistas'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Mantenimiento
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalMantenimiento\(\)"><span class="material-icons-round">add</span> Registrar Mantenimiento</button>', '<button class="btn btn-primary" onclick="window.abrirModalMantenimiento()"><span class="material-icons-round">add</span> Registrar Mantenimiento</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Mantenimiento de CCTV y Alarmas'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Rondas
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalRonda\(\)"><span class="material-icons-round">add</span> Registrar Ronda</button>', '<button class="btn btn-primary" onclick="window.abrirModalRonda()"><span class="material-icons-round">add</span> Registrar Ronda</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Reporte de Rondas de Seguridad'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Sellos
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalSello\(\)"><span class="material-icons-round">add</span> Asignar Sello</button>', '<button class="btn btn-primary" onclick="window.abrirModalSello()"><span class="material-icons-round">add</span> Asignar Sello</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Trazabilidad y Control de Sellos'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Incidentes
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalIncidente\(\)"><span class="material-icons-round">add</span> Reportar Incidente</button>', '<button class="btn btn-primary" onclick="window.abrirModalIncidente()"><span class="material-icons-round">add</span> Reportar Incidente</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Reporte de Incidentes de Seguridad'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Ambiental
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalAmbiental\(\)"><span class="material-icons-round">add</span> Registrar Aspecto</button>', '<button class="btn btn-primary" onclick="window.abrirModalAmbiental()"><span class="material-icons-round">add</span> Registrar Aspecto</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Gestión Ambiental'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# Simulacro
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalSimulacro\(\)"><span class="material-icons-round">add</span> Nuevo Simulacro</button>', '<button class="btn btn-primary" onclick="window.abrirModalSimulacro()"><span class="material-icons-round">add</span> Nuevo Simulacro</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Simulacros y BCP'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# RRHH
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalRRHH\(\)"><span class="material-icons-round">add</span> Registrar Evaluación</button>', '<button class="btn btn-primary" onclick="window.abrirModalRRHH()"><span class="material-icons-round">add</span> Registrar Evaluación</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Control de Confiabilidad RRHH'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

# IT
$content = $content -replace '<button class="btn btn-primary" onclick="window.abrirModalIT\(\)"><span class="material-icons-round">add</span> Revisión IT</button>', '<button class="btn btn-primary" onclick="window.abrirModalIT()"><span class="material-icons-round">add</span> Revisión IT</button><button class="btn btn-warning" onclick="window.editarPlantillaFormulario(''Controles de Seguridad IT'')" style="padding:6px 12px; margin-left:10px;" title="Editar Plantilla"><span class="material-icons-round">edit</span> Editar Formulario</button>'

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
