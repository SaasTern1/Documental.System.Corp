$path = "c:\Users\junio\Documents\proyecto\index.html"
$c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$startStr = '<label style="font-size:12px;">Personas permitidas para EDITAR (Vacío = Solo Creador)</label>'
$endStr = '<!-- Modal for Filling Forms -->'

$i1 = $c.IndexOf($startStr)
$i2 = $c.IndexOf($endStr)

if ($i1 -ge 0 -and $i2 -gt $i1) {
    $before = $c.Substring(0, $i1)
    $after = $c.Substring($i2)

    $replacement = @"
<label style="font-size:12px;">Personas permitidas para EDITAR (Vacío = Solo Creador)</label>
                <div style="display:flex; gap:5px; margin-bottom:5px;">
                    <select aria-label="fb-perm-editar-sel" id="fb-perm-editar-sel" style="flex:1; margin:0;" class="search-bar"><option value="">Cargando usuarios...</option></select>
                    <button type="button" class="btn btn-primary" onclick="window.addPermUser('editar')">Añadir</button>
                </div>
                <div id="fb-perm-editar-list" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:5px; min-height:10px;"></div>
            </div>
            
            <div class="grid-2" style="gap:20px;">
                <!-- Panel Izquierdo: Datos Básicos y Controles -->
                <div>
                    <label for="fb-titulo" style="font-size:12px;">Título del Formulario</label>
                    <input aria-label="Ej: Encuesta de Satisfacción" type="text" id="fb-titulo" name="fb-titulo" placeholder="Ej: Encuesta de Satisfacción" style="margin-bottom:10px;">
                    <label for="fb-desc" style="font-size:12px;">Descripción Corta</label>
                    <textarea aria-label="Opcional..." id="fb-desc" name="fb-desc" rows="2" placeholder="Opcional..." style="margin-bottom:10px;"></textarea>

                    <label style="display:flex; align-items:center; gap:8px; font-weight:600; color:var(--text-main); margin-bottom:10px; background:#f8fafc; padding:8px 10px; border-radius:6px; border:1px solid var(--border); font-size:12px;">
                        <input aria-label="fb-is-eval" type="checkbox" id="fb-is-eval" style="margin:0; width:auto;"> Este formulario es una Evaluación Calificada (Score Auto)
                    </label>

                    <label style="display:flex; align-items:center; gap:8px; font-weight:600; color:var(--text-main); margin-bottom:10px; background:#f8fafc; padding:8px 10px; border-radius:6px; border:1px solid var(--border); font-size:12px;">
                        <input aria-label="fb-is-dynamic" type="checkbox" id="fb-is-dynamic" style="margin:0; width:auto;" onchange="document.getElementById('fb-dynamic-options-panel').style.display = this.checked ? 'block' : 'none'; window.renderFormPreview();"> Activar Categorías Dinámicas (Selector Maestro)
                    </label>
                    <div id="fb-dynamic-options-panel" style="display:none; background:#f1f5f9; padding:10px; border-radius:6px; margin-bottom:15px; border:1px solid var(--border);">
                        <label style="font-size:11px;">Opciones del Selector (separadas por coma)</label>
                        <input aria-label="Ej: Auto, Moto, Camión" type="text" id="fb-dynamic-options" class="search-bar" placeholder="Ej: Auto, Moto, Camión" style="width:100%; margin-bottom:0;" onchange="window.renderFormPreview()">
                    </div>
                    
                    <h4 style="font-size:13px; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;">Añadir Nuevo Campo</h4>
                    <label for="fb-tipo-campo">Tipo de Campo</label>
                    <select aria-label="fb-tipo-campo" id="fb-tipo-campo" name="fb-tipo-campo" style="margin-bottom:10px;">
                        <option value="text">Texto Corto</option>
                        <option value="textarea">Texto Largo (Párrafo)</option>
                        <option value="number">Número</option>
                        <option value="date">Fecha</option>
                        <option value="select">Lista Desplegable</option>
                        <option value="checkbox">Casilla de Verificación (Check)</option>
                        <option value="si_no">Sí / No</option>
                        <option value="semaforo">Tabla de Evaluación (Semáforo Dinámico)</option>
                        <option value="archivo">Archivo Adjunto</option>
                    </select>
                    <label for="fb-label-campo">Etiqueta (Pregunta)</label>
                    <input aria-label="Ej: ¿Cuál es su nombre?" type="text" id="fb-label-campo" name="fb-label-campo" placeholder="Ej: ¿Cuál es su nombre?">
                    
                    <!-- Opciones para Select -->
                    <div id="fb-opciones-panel" style="display:none; background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:15px;">
                        <label for="fb-opciones-campo" style="font-size:11px;">Opciones (separadas por coma)</label>
                        <input aria-label="Opción 1, Opción 2, Opción 3" type="text" id="fb-opciones-campo" name="fb-opciones-campo" placeholder="Opción 1, Opción 2, Opción 3" style="margin-bottom:0;">
                    </div>
                    
                    <label for="fb-req-campo" style="display:flex; align-items:center; gap:5px; font-size:12px; margin-bottom:15px; cursor:pointer;">
                        <input aria-label="fb-req-campo" type="checkbox" id="fb-req-campo" name="fb-req-campo" style="margin:0; width:auto;"> Campo Obligatorio
                    </label>

                    <button class="btn btn-info" onclick="window.agregarCampoBuilder()" style="width:100%;"><span class="material-icons-round" style="font-size:16px;">add_circle</span> Añadir Campo a la Vista Previa</button>
                </div>
                
                <!-- Panel Derecho: Vista Previa -->
                <div style="background:#f8fafc; border:1px solid var(--border); border-radius:12px; padding:20px;">
                    <h4 style="font-size:13px; color:var(--primary); margin-bottom:15px; text-align:center;">Vista Previa del Formulario</h4>
                    <div id="fb-preview-area" style="min-height:300px; max-height:450px; overflow-y:auto; padding-right:5px;">
                        <p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:50px;">El formulario está vacío. Añade campos desde el panel izquierdo.</p>
                    </div>
                </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:20px; border-top:1px solid var(--border); padding-top:15px;">
                <button class="btn btn-danger" id="btn-eliminar-form-interno" style="display:none;" onclick="window.eliminarFormularioInterno()"><span class="material-icons-round" style="font-size:18px;">delete</span> Eliminar</button>
                <button class="btn btn-info" id="btn-ver-respuestas-interno" style="display:none;" onclick="window.verRespuestasFormularioInterno()"><span class="material-icons-round" style="font-size:18px;">list</span> Ver Respuestas</button>
                <div style="flex:1;"></div>
                <button class="btn btn-dark" onclick="window.setDisplay('modal-form-builder', 'none')">Cancelar</button>
                <button class="btn btn-primary" onclick="window.guardarFormulario()"><span class="material-icons-round" style="font-size:18px;">save</span> Guardar Formulario</button>
            </div>
        </div>
    </div>

    
"@

    $newContent = $before + $replacement + $after
    [System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Success!"
} else {
    Write-Host "Start/End markers not found"
}
