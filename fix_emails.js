const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// 1. In guardarEvaluacion
const targetGuardar = `        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { idx: 0, estado: PASOS_NOMBRES[0], fase_eval_fin: now, fase_0_ini: now, sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1: p1, asig_paso2: p2, asig_paso4: p4, chat: arrayUnion({u: currentUser.nombre, m: \`✅ EVALUACIÓN APROBADA. SLA Fijado para: \${fSLA}. <br><br><b>Asignados SGC:</b><br>- Paso 1: \${p1Name}<br>- Paso 2: \${p2Name}<br>- Paso 4: \${p4Name}\`, t: new Date().toLocaleString()}) });
    }`;

const replGuardar = `        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), { idx: 0, estado: PASOS_NOMBRES[0], fase_eval_fin: now, fase_0_ini: now, sla: fSLA, fecha_esperada_cierre: fSLA, asig_paso1: p1, asig_paso2: p2, asig_paso4: p4, chat: arrayUnion({u: currentUser.nombre, m: \`✅ EVALUACIÓN APROBADA. SLA Fijado para: \${fSLA}. <br><br><b>Asignados SGC:</b><br>- Paso 1: \${p1Name}<br>- Paso 2: \${p2Name}<br>- Paso 4: \${p4Name}\`, t: new Date().toLocaleString()}) });
        
        let reqTitle = selectedDocData ? selectedDocData.titulo : "";
        let reqCode = selectedDocData ? selectedDocData.customId : "";
        if(p1) window.sendNotification({to: p1}, \`Asignación SGC: \${reqCode} - \${reqTitle}\`, \`<div style="font-family:sans-serif;">Has sido asignado para ejecutar el <b>Paso 1 (Documentar)</b> de esta solicitud.<br>Ingresa al Sistema de Gestión para proceder.</div>\`);
        if(p2) window.sendNotification({to: p2}, \`Asignación SGC: \${reqCode} - \${reqTitle}\`, \`<div style="font-family:sans-serif;">Has sido asignado para ejecutar el <b>Paso 2 (Verificar)</b> de esta solicitud.<br>Ingresa al Sistema de Gestión para proceder.</div>\`);
        if(p4) window.sendNotification({to: p4}, \`Asignación SGC: \${reqCode} - \${reqTitle}\`, \`<div style="font-family:sans-serif;">Has sido asignado para ejecutar el <b>Paso 4 (Publicar)</b> de esta solicitud.<br>Ingresa al Sistema de Gestión para proceder.</div>\`);
    }`;
content = content.replace(targetGuardar, replGuardar).replace(targetGuardar.replace(/\r\n/g, '\n'), replGuardar);


// 2. In cambiarAsignado
const targetCambiar = `        let stepName = campo === 'asig_paso1' ? 'Paso 1 (Documentar)' : (campo === 'asig_paso2' ? 'Paso 2 (Verificar)' : 'Paso 4 (Publicar)');
        updates.chat = arrayUnion({u: currentUser.nombre, m: \`✏️ <b>ASIGNACIÓN ACTUALIZADA:</b><br>\${stepName} asignado a: \${pName}\`, t: new Date().toLocaleString()});
        
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), updates);
        selectedDocData[campo] = email;
        window.hideLoading();
    } catch(e) {`;

const replCambiar = `        let stepName = campo === 'asig_paso1' ? 'Paso 1 (Documentar)' : (campo === 'asig_paso2' ? 'Paso 2 (Verificar)' : 'Paso 4 (Publicar)');
        updates.chat = arrayUnion({u: currentUser.nombre, m: \`✏️ <b>ASIGNACIÓN ACTUALIZADA:</b><br>\${stepName} asignado a: \${pName}\`, t: new Date().toLocaleString()});
        
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "Solicitudes", selectedId), updates);
        selectedDocData[campo] = email;
        window.hideLoading();
        
        if(email) {
            let reqTitle = selectedDocData ? selectedDocData.titulo : "";
            let reqCode = selectedDocData ? selectedDocData.customId : "";
            window.sendNotification({to: email}, \`Asignación SGC: \${reqCode} - \${reqTitle}\`, \`<div style="font-family:sans-serif;">Has sido asignado para ejecutar el <b>\${stepName}</b> de esta solicitud.<br>Ingresa al Sistema de Gestión para proceder.</div>\`);
        }
    } catch(e) {`;
content = content.replace(targetCambiar, replCambiar).replace(targetCambiar.replace(/\r\n/g, '\n'), replCambiar);


// 3. Update generic sendNotification titles
content = content.replace(/\`Nueva Solicitud Creada: \$\{fci\}\`/g, "\`Nueva Solicitud Creada: ${fci} - ${s.titulo}\`");
content = content.replace(/\`Avance SGC: \$\{s.customId\}\`/g, "\`Avance SGC: ${s.customId} - ${s.titulo}\`");
content = content.replace(/\`Solicitud Reabierta: \$\{selectedDocData.customId\}\`/g, "\`Solicitud Reabierta: ${selectedDocData.customId} - ${selectedDocData.titulo}\`");
content = content.replace(/\`✅ Documento Publicado: \$\{codFinal\} \(Ver. \$\{ver\}\)\`/g, "\`✅ Documento Publicado: ${codFinal} (Ver. ${ver}) - ${s.titulo}\`");
content = content.replace(/\`❌ Cancelación SGC: \$\{selectedDocData.customId\}\`/g, "\`❌ Cancelación SGC: ${selectedDocData.customId} - ${selectedDocData.titulo}\`");
content = content.replace(/\`Nuevo Comentario: \$\{selectedDocData.customId\}\`/g, "\`Nuevo Comentario: ${selectedDocData.customId} - ${selectedDocData.titulo}\`");

// In resolverAsignacion function (m-input-area handler)
content = content.replace(/let emTitle = tempAction === 'Resolver' \? \`Solución a: \$\{selectedDocData\.customId\}\` : \`Respuesta SGC: \$\{selectedDocData\.customId\}\`;/g, 
"let emTitle = tempAction === 'Resolver' ? `Solución a: ${selectedDocData.customId} - ${selectedDocData.titulo}` : `Respuesta SGC: ${selectedDocData.customId} - ${selectedDocData.titulo}`;");

fs.writeFileSync('app.js', content);
console.log('Fixed email notifications');
