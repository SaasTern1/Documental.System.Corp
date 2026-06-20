// Utilidades para normalizar y consultar permisos (compatible con flags legacy)
(function(window){
  window.PERMISSION_KEYS = null;

  // Cargar catálogo desde permissions.json si está disponible (fetch sincrónico no permitido, así que intentar fetch)
  async function loadCatalog() {
    try {
      const r = await fetch('permissions.json');
      if(!r.ok) return;
      const j = await r.json();
      window.PERMISSION_KEYS = Object.keys(j.permissions || {});
    } catch(e) { console.warn('No se pudo cargar permissions.json', e); }
  }
  loadCatalog();

  // Mapear flags legacy a claves canónicas
  function mapLegacyToCanonical(p) {
    p = p || {};
    return {
      // Solicitudes
      'solicitudes.view.own': !!(p.p_ver_propias || p.p_ver_propias_solicitudes || false),
      'solicitudes.view.gerencia': !!(p.p_ver_ger || p.p_ver_gerencia || false),
      'solicitudes.view.all': !!(p.p_ver_todas || p.p_ver_todas_solicitudes || false),
      'solicitudes.create': !!(p.can_solicit || p.p_solicitar || false),
      'solicitudes.manage.inbox': !!(p.p_gest_sgc || p.p_gestion_solicitudes || false),
      'solicitudes.approve.paso0': !!(p.p_eval_solicitud || p.p_paso0 || false),
      'solicitudes.approve.paso1': !!(p.p_paso1 || p.p_paso_1 || false),
      'solicitudes.approve.paso2': !!(p.p_paso2 || p.p_paso_2 || false),
      'solicitudes.approve.paso3': !!(p.p_ger_apr || p.p_apr_gerente || false),
      'solicitudes.approve.paso4': !!(p.p_paso4 || p.p_paso_4 || false),
      'solicitudes.admin': !!(p.admin || p.p_admin_solicitudes || false),

      // Auditorias
      'auditorias.view.assigned': !!(p.p_audit_ver || p.p_audit_ver_asignadas || false),
      'auditorias.manage': !!(p.p_audit_admin || p.p_audit_gestion || false),
      'auditorias.role.internal_auditor': !!(p.p_audit_auditor || false),
      'auditorias.role.process_owner': !!(p.p_audit_dueno || p.p_audit_dueno_proceso || false),
      'auditorias.sac.view': !!(p.p_audit_sac_ver || p.p_audit_ver_sac || false),
      'auditorias.sac.manage': !!(p.p_audit_sac_admin || false),
      'auditorias.checklist.view': !!(p.p_audit_check_ver || false),
      'auditorias.checklist.manage': !!(p.p_audit_check_admin || false),

      // Formularios
      'formularios.view_module': !!(p.p_ver_formularios || false),
      'formularios.create': !!(p.p_gest_formularios || false),
      'formularios.fill': !!(p.p_fill_formularios || false),
      'formularios.edit': !!(p.p_edit_formularios || false),
      'formularios.view_response': !!(p.p_ver_respuestas || false),

      // Otros módulos
      'seguridad_fisica.view': !!(p.p_segfisica_ver || p.p_ver_seguridad_fisica || false),
      'seguridad_fisica.fill': !!(p.p_segfisica_fill || false),

      'cadena_suministro.access': !!(p.p_cadena || p.p_cadena_suministro || false),
      'hsqe.access': !!(p.p_hsqe || false),
      'recursos_humanos.access': !!(p.p_rrhh || p.p_recursos_humanos || false),
      'tecnologia.access': !!(p.p_it || p.p_tecnologia || false),
      'modules.view_all': !!(p.p_ver_modulos || false),

      'listado_maestro.view': !!(p.p_ver_listado || false),
      'listado_maestro.manage': !!(p.p_gest_listado || false),
      'listado_maestro.scan_qr': !!(p.p_scan_qr || false),
      'listado_maestro.generate_qr': !!(p.p_gen_qr || false),

      'manual_oea.view': !!(p.p_ver_manual_oea || p.p_manual_oea || false),
      'manual_oea.manage': !!(p.p_gest_manual_oea || false),

      'evaluacion_proveedor.view': !!(p.p_eval_proveedor || false),
      'evaluacion_proveedor.edit': !!(p.p_eval_proveedor_edit || false),

      'matriz_riesgo.view': !!(p.p_riesgos || p.p_ver_matriz || false),
      'matriz_riesgo.edit': !!(p.p_riesgos_edit || false),

      'users.manage': !!(p.p_users || p.p_gest_users || false),
      'structure.configure': !!(p.p_struct || p.p_config_structure || false),

      'admin.full': !!(p.admin || false),
      'admin.limited': !!(p.admin_limited || false)
    };
  }

  // Normalizar un usuario: añade campo permisos_canon con claves booleanas
  function normalizeUserPermisos(user) {
    if(!user) return null;
    const raw = user.permisos || {};
    const canon = mapLegacyToCanonical(raw);
    // Añadir shortcuts: allow isAdmin
    canon._isAdmin = !!(raw.admin || raw.p_admin || false);
    // Attach to user
    user.permisos_canon = canon;
    return canon;
  }

  // Consulta simple
  function hasPermission(user, key) {
    if(!user) return false;
    if(user.permisos_canon && typeof user.permisos_canon[key] !== 'undefined') return !!user.permisos_canon[key];
    const canon = normalizeUserPermisos(user);
    return !!(canon && canon[key]);
  }

  window.normalizeUserPermisos = normalizeUserPermisos;
  window.hasPermission = hasPermission;
  window.mapLegacyToCanonical = mapLegacyToCanonical;

})(window);
