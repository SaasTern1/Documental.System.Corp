$path = "c:\Users\junio\Documents\proyecto\index.html"
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# The bad block is currently between lines 1797 and 1813.
# Line 1797 is:             <div class="grid-2" style="gap:20px;">
# Line 1814 is: 
# Line 1815 is:     <!-- MODAL HEATMAP RIESGOS -->

$newLines = new-object System.Collections.ArrayList

for ($i = 0; $i -lt 1797; $i++) {
    $newLines.Add($lines[$i]) > $null
}

$replacement = @"
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

    <!-- Modal for Filling Forms -->
    <div class="modal-overlay" id="modal-fill-form">
        <div class="modal-content" style="max-width:800px; display:block; width:95%; height:auto; padding:30px; border-radius:16px; box-shadow:0 15px 35px rgba(0,0,0,0.2);">
            <div class="modal-main" style="padding:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; border-bottom:1px solid var(--border); padding-bottom:15px;">
                    <div>
                        <h2 id="fill-form-title" style="margin:0; font-size:24px; color:var(--text-main); font-weight:800; letter-spacing:-0.02em;">Llenar Formulario</h2>
                        <p id="fill-form-desc" style="margin:5px 0 0 0; color:var(--text-muted); font-size:14px; line-height:1.4;"></p>
                    </div>
                    <button class="btn btn-dark" onclick="window.setDisplay('modal-fill-form', 'none')" style="padding:8px 12px; border-radius:8px;"><span class="material-icons-round" style="font-size:18px;">close</span></button>
                </div>
                <div id="fill-form-container" style="background:#fff; padding:5px; max-height:65vh; overflow-y:auto; margin-bottom:20px; padding-right:10px;">
                    <!-- Campos Dinámicos Aquí -->
                </div>
                <div style="text-align:right; border-top:1px solid var(--border); padding-top:20px; display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap;">
                    <button class="btn btn-ghost" onclick="window.setDisplay('modal-fill-form', 'none')" style="width:auto; flex-grow:0;">Cancelar</button>
                    <button class="btn btn-primary" onclick="window.guardarFormularioLleno()" style="width:auto; flex-grow:0; box-shadow:0 4px 12px rgba(30,64,175,0.3);"><span class="material-icons-round" style="font-size:18px;">send</span> Enviar Respuestas</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for Viewing Form Responses -->
    <div class="modal-overlay" id="modal-ver-respuestas" style="display:none; z-index:4000;">
        <div class="modal-content" style="max-width:1100px; display:block; width:100%; height:auto; padding:20px; max-height:90vh; overflow-y:auto; background:#fff;">
            <div class="modal-main">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">
                    <div>
                        <h2 id="vr-tit" style="margin:0; font-size:22px; color:var(--text-main); font-weight:800;">Respuestas del Formulario</h2>
                        <span id="vr-subtit" style="font-size:12px; color:var(--text-muted);"></span>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="btn btn-success" onclick="window.descargarRespuestasExcel()" style="padding:6px 12px; display:flex; align-items:center; gap:5px;"><span class="material-icons-round" style="font-size:16px;">table_view</span> Excel</button>
                        <button class="btn btn-primary" onclick="window.descargarRespuestasPDF()" style="padding:6px 12px; display:flex; align-items:center; gap:5px;"><span class="material-icons-round" style="font-size:16px;">picture_as_pdf</span> PDF</button>
                        <button class="btn btn-dark" onclick="window.setDisplay('modal-ver-respuestas', 'none')" style="padding:6px 12px;"><span class="material-icons-round" style="font-size:16px;">close</span></button>
                    </div>
                </div>
                <div id="vr-chart-container" style="display:none; height:250px; margin-bottom:20px; border:1px solid var(--border); border-radius:8px; padding:15px; gap:15px;">
                    <div style="flex:1; position:relative; min-width:0;"><canvas id="vr-chart"></canvas></div>
                    <div id="vr-chart-eval-container" style="flex:1; position:relative; min-width:0; display:none;"><canvas id="vr-chart-eval"></canvas></div>
                </div>
                <div id="vr-stats-container" style="display:none; margin-bottom:20px; gap:20px; flex-wrap:wrap;"></div>
                <div class="table-responsive" style="border-radius:8px; border:1px solid var(--border);">
                    <table style="width:100%; text-align:left; font-size:12px; white-space:nowrap;">
                        <thead id="vr-thead" style="background:#f8fafc; position:sticky; top:0; z-index:10;">
                        </thead>
                        <tbody id="vr-tbody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
"@

$newLines.Add($replacement) > $null

for ($i = 1813; $i -lt $lines.Length; $i++) {
    $newLines.Add($lines[$i]) > $null
}

[System.IO.File]::WriteAllLines($path, $newLines, [System.Text.Encoding]::UTF8)
Write-Host "Success!"
