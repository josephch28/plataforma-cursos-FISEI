// src/controllers/inscripcion.controller.js
const pool = require('../db'); // Cambiado a 'pool' ya que db.js exporta pool

// Listar inscripciones (solo admin, con nombres de curso y usuario)
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         i.*,
         c.nombre AS curso_nombre,
         u.nombre AS usuario_nombre,
         u.apellido AS usuario_apellido
       FROM inscripcion i
       JOIN curso c ON i.id_curso = c.id_curso
       JOIN usuario u ON u.cedula = i.cedula_usuario`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// Listar inscripciones de cursos donde el usuario es docente (encargado, responsable o docente principal)
exports.listByDocente = async (req, res) => {
  const cedula = req.user?.cedula;
  if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

  try {
    const [rows] = await pool.query(
      `SELECT 
          i.*, 
          c.nombre AS curso_nombre,
          u.nombre AS usuario_nombre,
          u.apellido AS usuario_apellido,
          CASE 
              WHEN c.cedula_docente = ? THEN 'docente_principal'
              WHEN c.cedula_responsable = ? THEN 'responsable'
              -- Verificamos si es encargado usando la existencia de la fila en el LEFT JOIN
              WHEN ce.cedula_encargado IS NOT NULL THEN 'encargado' 
              ELSE NULL 
          END AS usuario_rol_en_curso
       FROM inscripcion i
       JOIN curso c ON i.id_curso = c.id_curso
       JOIN usuario u ON u.cedula = i.cedula_usuario
       -- Hacemos un LEFT JOIN para saber si el usuario es un encargado en ESE curso
       LEFT JOIN curso_encargado ce ON ce.id_curso = c.id_curso AND ce.cedula_encargado = ?
       WHERE 
         -- Filtrar cursos en los que tiene CUALQUIERA de los roles
         c.cedula_docente = ? OR
         c.cedula_responsable = ? OR 
         ce.cedula_encargado IS NOT NULL`,
      // Pasamos la cédula para el CASE, y luego para las condiciones del WHERE
      [cedula, cedula, cedula, cedula, cedula, cedula]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener inscripciones por docente:', err);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// Crear inscripción (con validaciones de negocio)
exports.create = async (req, res) => {
  const { id_curso, metodo_pago } = req.validated || req.body;
  const cedulaUsuario = req.user?.cedula;

  if (!cedulaUsuario) {
    return res.status(401).json({ message: 'Sesión inválida' });
  }

  try {
    // 1. Obtener curso y requisitos
    const [cursos] = await pool.query(
      'SELECT id_curso, es_pagado, costo, publico_objetivo, prerequisito, cedula_responsable, cedula_docente, fecha_inicio_inscripcion, fecha_fin_inscripcion FROM curso WHERE id_curso = ? AND activo = 1',
      [id_curso]
    );
    if (!cursos.length) {
      return res.status(404).json({ message: 'Curso no encontrado o inactivo' });
    }
    const curso = cursos[0];

    // 1.1 VALIDACIÓN DE FECHAS DE INSCRIPCIÓN
    const now = new Date();

    if (curso.fecha_inicio_inscripcion) {
      const inicio = new Date(curso.fecha_inicio_inscripcion);
      if (now < inicio) {
        return res.status(403).json({ message: `Las inscripciones inician el ${inicio.toLocaleDateString()}` });
      }
    }

    if (curso.fecha_fin_inscripcion) {
      const fin = new Date(curso.fecha_fin_inscripcion);
      if (now > fin) {
        return res.status(403).json({ message: `Las inscripciones finalizaron el ${fin.toLocaleDateString()}` });
      }
    }

    // 2. Obtener perfil de usuario (membresía)
    const [usuarios] = await pool.query(
      'SELECT es_estudiante_uta, es_personal_uta, activo FROM usuario WHERE cedula = ? LIMIT 1',
      [cedulaUsuario]
    );
    if (!usuarios.length || usuarios[0].activo !== 1) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }
    const usuario = usuarios[0];

    // 3. VALIDACIÓN DE PRERREQUISITO
    if (curso.prerequisito) {
      const [prereqInscripcion] = await pool.query(
        'SELECT estado FROM inscripcion WHERE cedula_usuario = ? AND id_curso = ?',
        [cedulaUsuario, curso.prerequisito]
      );

      if (!prereqInscripcion.length || prereqInscripcion[0].estado !== 'aprobado') {
        return res.status(403).json({ message: `Rechazado: El prerrequisito (Curso ID ${curso.prerequisito}) no ha sido aprobado.` });
      }
    }

    // 4. Verificar que no sea responsable/docente del curso
    if (curso.cedula_responsable === cedulaUsuario || curso.cedula_docente === cedulaUsuario) {
      return res.status(403).json({ message: 'No puedes inscribirte en un curso donde eres responsable o docente.' });
    }

    // 5. Verificar que no sea docente/encargado del curso
    const [docentesCurso] = await pool.query(
      'SELECT cedula_encargado FROM curso_encargado WHERE id_curso = ? AND cedula_encargado = ?',
      [id_curso, cedulaUsuario]
    );
    if (docentesCurso.length) {
      return res.status(403).json({ message: 'No puedes inscribirte en un curso donde eres docente.' });
    }

    // --- NUEVO: VALIDACIÓN DE REQUISITOS ---
    const [requisitos] = await pool.query('SELECT * FROM curso_requisito WHERE id_curso = ? AND obligatorio = 1', [id_curso]);
    let hasPendingSpecificReqs = false; // Flag to force 'pendiente' state if specific docs are not approved yet

    if (requisitos.length > 0) {
      // Obtener documentos del usuario (Generales y Específicos de este curso)
      const [userDocs] = await pool.query(
        `SELECT tipo_documento, id_curso, estado FROM usuario_documento 
             WHERE cedula_usuario = ? AND (id_curso IS NULL OR id_curso = ?)`,
        [cedulaUsuario, id_curso]
      );

      const missing = [];

      // Helper for robust string matching
      const normalize = (str) => (str || '').toString().trim().toLowerCase().normalize("NFC");

      // MAPA DE COMPATIBILIDAD (Legacy vs Nuevos)
      const REQ_MAP = {
        'cédula de identidad': 'cedula',
        'cedula de identidad': 'cedula',
        'cedula': 'cedula',
        'papeleta de votación': 'papeleta',
        'papeleta de votacion': 'papeleta',
        'papeleta': 'papeleta',
        'carta de motivación': 'carta de motivacion',
        'carta de motivacion': 'carta de motivacion',
        'carnet estudiantil': 'carnet',
        'carnet': 'carnet',
        'título de tercer nivel': 'titulo',
        'titulo de tercer nivel': 'titulo',
        'titulo': 'titulo',
        'título de bachiller/universitario': 'titulo',
        'titulo de bachiller/universitario': 'titulo'
      };

      console.log('--- BACKEND VALIDATION DEBUG ---');
      console.log('Curso ID:', id_curso);
      console.log('User Docs:', userDocs.map(d => `${d.tipo_documento} (${d.id_curso}) [${d.estado}]`));

      for (const req of requisitos) {
        const reqName = normalize(req.nombre_requisito);
        const targetType = REQ_MAP[reqName] || reqName;

        console.log(`Checking Req: "${req.nombre_requisito}" -> Normalized: "${reqName}" -> Mapped: "${targetType}"`);

        // Robust find
        const doc = userDocs.find(d => {
          const docName = normalize(d.tipo_documento);
          // Match if docName equals the Requirement Name OR the Mapped Target
          const nameMatch = (docName === reqName || docName === targetType);

          if (req.tipo === 'GENERAL') {
            // General must have NULL id_curso
            return nameMatch && !d.id_curso;
          } else {
            // Specific must match id_curso
            return nameMatch && Number(d.id_curso) === Number(id_curso);
          }
        });

        if (doc) {
          console.log(`   -> Found Match: "${doc.tipo_documento}" [${doc.estado}]`);
        } else {
          console.log(`   -> NO MATCH FOUND`);
        }

        if (req.tipo === 'GENERAL') {
          if (!doc || (doc.estado || '').toLowerCase() !== 'aprobado') {
            missing.push(`${req.nombre_requisito} (General - Debe estar Aprobado en Perfil)`);
          }
        } else { // ESPECIFICO
          if (!doc) {
            missing.push(`${req.nombre_requisito} (Específico - Debe subir el documento)`);
          } else if ((doc.estado || '').toLowerCase() !== 'aprobado') {
            // Doc exists but is not approved. Allow, but set pending flag.
            hasPendingSpecificReqs = true;
          }
        }
      }

      if (missing.length > 0) {
        return res.status(400).json({
          message: 'Faltan requisitos obligatorios o no están aprobados.',
          missing_requirements: missing
        });
      }
    }
    // ---------------------------------------

    // 6. VALIDACIÓN DEL PÚBLICO OBJETIVO
    const publicoObjetivo = (curso.publico_objetivo || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let isAuthorized = (publicoObjetivo.length === 0 || publicoObjetivo.includes('Público General'));

    if (publicoObjetivo.includes('Estudiantes UTA') && usuario.es_estudiante_uta === 1) isAuthorized = true;
    if (publicoObjetivo.includes('Personal UTA') && usuario.es_personal_uta === 1) isAuthorized = true;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'El usuario no cumple con el público objetivo del curso.' });
    }

    // 7. Verificar si ya está inscrito
    const [inscripcionExistente] = await pool.query(
      'SELECT id_inscripcion FROM inscripcion WHERE cedula_usuario = ? AND id_curso = ?',
      [cedulaUsuario, id_curso]
    );
    if (inscripcionExistente.length) {
      return res.status(409).json({ message: 'El usuario ya está inscrito en este curso.' });
    }

    // 8. Determinar estado e inscripción
    // Si es pagado -> 'pendiente' (pago)
    // Si es gratis pero tiene requisitos específicos pendientes -> 'pendiente' (validacion)
    // Si es gratis y todo aprobado -> 'pagado' (equivale a inscrito/activo)
    let initialEstado = curso.es_pagado === 1 ? 'pendiente' : 'pagado';

    if (hasPendingSpecificReqs && initialEstado === 'pagado') {
      initialEstado = 'pendiente';
    }

    const [result] = await pool.query(
      'INSERT INTO inscripcion (cedula_usuario, id_curso, estado) VALUES (?, ?, ?)',
      [cedulaUsuario, id_curso, initialEstado]
    );

    const inscripcionId = result.insertId;

    // 7. Generar registro de pago si aplica
    // Solo si NO hay requisitos pendientes de validación
    let pagoInfo = null;
    if (curso.es_pagado === 1 && !hasPendingSpecificReqs) {
      const monto = Number(curso.costo ?? 0);
      const metodo = metodo_pago && ['transferencia', 'deposito'].includes(metodo_pago)
        ? metodo_pago
        : 'transferencia';
      const numeroOrden = `ORD-${inscripcionId}-${Date.now()}`;

      await pool.query(
        'INSERT INTO pago (id_inscripcion, monto, metodo_pago, numero_orden, aprobado) VALUES (?, ?, ?, ?, 0)',
        [inscripcionId, monto, metodo, numeroOrden]
      );
      pagoInfo = { monto, metodo_pago: metodo, numero_orden: numeroOrden };
    }

    res.status(201).json({
      message: 'Inscripción registrada',
      id_inscripcion: inscripcionId,
      estado: initialEstado,
      requires_payment: curso.es_pagado === 1,
      orden_pago: pagoInfo
    });

  } catch (err) {
    console.error('Error al crear inscripción:', err);
    res.status(500).json({ error: 'Error al crear inscripción' });
  }
};

// Actualizar inscripción (docente/responsable/admin)
exports.update = async (req, res) => {
  const { id } = req.params;
  const b = req.validated || req.body;
  try {
    const crypto = require('crypto');
    const cedula = req.user?.cedula;
    const rol = req.user?.rol;

    const notaFinal = b.nota_final === '' ? null : Number(b.nota_final);
    const asistencia = b.asistencia === '' ? null : Number(b.asistencia);
    let estado = b.estado;

    if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

    // 1. Obtener datos del curso e inscripción para validar reglas y permisos
    const [rows] = await pool.query(
      `SELECT i.id_curso, c.cedula_docente, c.cedula_responsable, 
              c.nota_aprobacion, c.min_asistencia, c.estado,
              (SELECT 1 FROM curso_encargado ce WHERE ce.id_curso = c.id_curso AND ce.cedula_encargado = ?) as is_encargado
       FROM inscripcion i
       JOIN curso c ON c.id_curso = i.id_curso
       WHERE i.id_inscripcion = ?`,
      [cedula, id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Inscripción no encontrada' });
    const cursoData = rows[0];

    if (cursoData.estado === 'finalizado') {
      return res.status(400).json({ message: 'El curso está finalizado. No se puede modificar.' });
    }

    // 2. Verificar Permisos
    if (rol !== 'admin') {
      const isDocente = cursoData.cedula_docente === cedula;
      const isEncargado = !!cursoData.is_encargado;

      if (!isDocente && !isEncargado) {
        return res.status(403).json({ message: 'No autorizado para calificar este curso' });
      }
    }

    // 3. Automate Status
    const minNota = cursoData.nota_aprobacion ?? 7.0;
    const minAsis = cursoData.min_asistencia ?? 75;

    if (notaFinal !== null && asistencia !== null && !estado) { // Only override if estado not explicitly sent (or always?)
      // Usually update request sends { nota, asistencia }.
      if (notaFinal >= minNota && asistencia >= minAsis) {
        estado = 'aprobado';
      } else {
        estado = 'reprobado';
      }
    } else if (notaFinal !== null && asistencia !== null && estado) {
      // If user sent state manually, respect it? Or force rules?
      // User said "automáticamente". 
      // If I force rules, they can't override.
      // I'll force rules for consistency with the request.
      if (notaFinal >= minNota && asistencia >= minAsis) {
        estado = 'aprobado';
      } else {
        estado = 'reprobado';
      }
    }

    // 4. Update
    await pool.query(
      'UPDATE inscripcion SET nota_final=?, asistencia=?, estado=? WHERE id_inscripcion=?',
      [notaFinal, asistencia, estado || 'inscrito', id]
    );

    // 5. Generate Certificate (Moved to Finalize Course)

    res.json({ message: 'Evaluación actualizada correctamente.' });

  } catch (err) {
    console.error('Error FATAL al actualizar inscripción:', err);
    res.status(500).json({
      error: 'Error al actualizar inscripción',
      details: err.sqlMessage || err.message
    });
  }
};

// Actualización masiva de calificaciones (Docente/Responsable)
exports.batchUpdate = async (req, res) => {
  const { actualizaciones } = req.body; // Array de { id_inscripcion, nota_final, asistencia }
  const cedula = req.user?.cedula;
  const rol = req.user?.rol;

  if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });
  if (!Array.isArray(actualizaciones) || actualizaciones.length === 0) {
    return res.status(400).json({ message: 'No hay datos para actualizar.' });
  }
  try {
    // 1. Verificar Permisos
    const firstId = actualizaciones[0].id_inscripcion;
    const [rows] = await pool.query('SELECT id_curso FROM inscripcion WHERE id_inscripcion = ?', [firstId]);

    if (!rows.length) return res.status(404).json({ message: 'Inscripción no encontrada' });
    const id_curso = rows[0].id_curso;

    // Check course status 
    const [c] = await pool.query('SELECT estado FROM curso WHERE id_curso = ?', [id_curso]);
    if (c[0]?.estado === 'finalizado') {
      return res.status(400).json({ message: 'El curso está finalizado. No se pueden modificar notas.' });
    }

    if (rol !== 'admin') {
      const [auth] = await pool.query(
        `SELECT 1 FROM curso c 
             LEFT JOIN curso_encargado ce ON ce.id_curso = c.id_curso
             WHERE c.id_curso = ? 
               AND (c.cedula_docente = ? OR ce.cedula_encargado = ?)`,
        [id_curso, cedula, cedula]
      );
      if (!auth.length) {
        return res.status(403).json({ message: 'No autorizado para calificar este curso.' });
      }
    }

    // 2. Perform Updates
    const crypto = require('crypto');
    const [cursoData] = await pool.query('SELECT nota_aprobacion, min_asistencia FROM curso WHERE id_curso = ?', [id_curso]);
    const minNota = cursoData[0]?.nota_aprobacion ?? 7.0;
    const minAsis = cursoData[0]?.min_asistencia ?? 75;

    await Promise.all(actualizaciones.map(async (item) => {
      const nota = item.nota_final === '' || item.nota_final === undefined ? null : Number(item.nota_final);
      const asistencia = item.asistencia === '' || item.asistencia === undefined ? null : Number(item.asistencia);

      let nuevoEstado = item.estado; // Default to incoming or current
      // If we don't have item.estado passed (it's undefined from frontend usually? table doesn't edit state directly), fetch current?
      // Actually batchUpdate usually receives just grades.
      // So we should decide state here. 'aprobado' vs 'reprobado' vs 'inscrito'.

      // Automatic Status Logic
      if (nota !== null && asistencia !== null) {
        if (nota >= minNota && asistencia >= minAsis) {
          nuevoEstado = 'aprobado';
        } else {
          nuevoEstado = 'reprobado';
        }
      }

      await pool.query(
        'UPDATE inscripcion SET nota_final = ?, asistencia = ?, estado = ? WHERE id_inscripcion = ?',
        [nota, asistencia, nuevoEstado || 'inscrito', item.id_inscripcion]
      );

      // Certificate Generation moved to Course Finalization (user request)
    }));

    res.json({ message: 'Calificaciones guardadas exitosamente.' });

  } catch (err) {
    console.error('Error en batchUpdate:', err);
    res.status(500).json({ error: 'Error al guardar calificaciones.', details: err.message });
  }
};

// Eliminar inscripción (Función restaurada)
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM inscripcion WHERE id_inscripcion=?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM inscripcion WHERE id_inscripcion=?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });

    const inscripcion = rows[0];
    const cedula = req.user?.cedula;
    const rol = req.user?.rol;

    if (rol !== 'admin') {
      const esPropietario = inscripcion.cedula_usuario === cedula;

      const [[curso]] = await pool.query(
        // 🟢 Incluir cedula_docente en la consulta a la tabla curso
        'SELECT cedula_responsable, cedula_docente FROM curso WHERE id_curso = ?',
        [inscripcion.id_curso]
      );

      const esResponsable = curso && curso.cedula_responsable === cedula;

      // 🟢 NUEVA VERIFICACIÓN: Es el Docente Principal?
      const esDocentePrincipal = curso && curso.cedula_docente === cedula;

      const [docenteRows] = await pool.query(
        'SELECT 1 FROM curso_encargado WHERE id_curso = ? AND cedula_encargado = ?',
        [inscripcion.id_curso, cedula]
      );
      // Renombrar para mayor claridad
      const esDocenteEncargado = docenteRows.length > 0;

      // 🟢 AÑADIR esDocentePrincipal a la condición OR
      if (!esPropietario && !esResponsable && !esDocentePrincipal && !esDocenteEncargado) {
        return res.status(403).json({ message: 'No autorizado para ver esta inscripción' });
      }
    }

    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripción' });
  }
};