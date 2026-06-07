import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate the place where <label for="fb-tipo-campo">Tipo de Campo</label> is.
# Then we will replace the corrupted section.
start_idx = content.find('<label for="fb-tipo-campo">Tipo de Campo</label>')
if start_idx != -1:
    end_idx = content.find('<!-- Modal for Viewing Form Responses -->')
    if end_idx != -1:
        # Reconstruct the correct HTML block
        correct_block = """<label for="fb-tipo-campo">Tipo de Campo</label>
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

    """
        
        new_content = content[:start_idx] + correct_block + content[end_idx:]
        
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Fixed index.html!")
    else:
        print("End tag not found")
else:
    print("Start tag not found")
