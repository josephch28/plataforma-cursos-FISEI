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

// Listar inscripciones de cursos donde el usuario es docente (encargado)
exports.listByDocente = async (req, res) => {
  const cedula = req.user?.cedula;
  if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT 
          i.*, 
          c.nombre AS curso_nombre,
          u.nombre AS usuario_nombre,
          u.apellido AS usuario_apellido
       FROM inscripcion i
       JOIN curso c ON i.id_curso = c.id_curso
       JOIN usuario u ON u.cedula = i.cedula_usuario
       JOIN curso_encargado ce ON ce.id_curso = c.id_curso
       WHERE ce.cedula_encargado = ?`,
      [cedula]
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
      'SELECT id_curso, es_pagado, costo, publico_objetivo, prerequisito, cedula_responsable, cedula_docente FROM curso WHERE id_curso = ? AND activo = 1',
      [id_curso]
    );
    if (!cursos.length) {
      return res.status(404).json({ message: 'Curso no encontrado o inactivo' });
    }
    const curso = cursos[0];
    
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
    const initialEstado = curso.es_pagado === 1 ? 'pendiente' : 'pagado';
    
    const [result] = await pool.query(
      'INSERT INTO inscripcion (cedula_usuario, id_curso, estado) VALUES (?, ?, ?)',
      [cedulaUsuario, id_curso, initialEstado]
    );

    const inscripcionId = result.insertId;

    // 7. Generar registro de pago si aplica
    let pagoInfo = null;
    if (curso.es_pagado === 1) {
      const monto = Number(curso.costo ?? 0);
      const metodo = metodo_pago && ['transferencia','deposito'].includes(metodo_pago)
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
  const { nota_final, asistencia, estado } = req.validated || req.body;
  try {
    const cedula = req.user?.cedula;
    const rol = req.user?.rol;

    if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

    // Solo admin o docentes (encargados) pueden actualizar
    if (rol !== 'admin') {
      const [rows] = await pool.query(
        `SELECT 1
           FROM inscripcion i
           JOIN curso_encargado ce ON ce.id_curso = i.id_curso
          WHERE i.id_inscripcion = ? AND ce.cedula_encargado = ?`,
        [id, cedula]
      );

      if (!rows.length) {
        return res.status(403).json({ message: 'No autorizado para calificar este curso' });
      }
    }

    await pool.query(
      'UPDATE inscripcion SET nota_final=?, asistencia=?, estado=? WHERE id_inscripcion=?',
      [nota_final, asistencia, estado, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar inscripción' });
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
        'SELECT cedula_responsable FROM curso WHERE id_curso = ?',
        [inscripcion.id_curso]
      );
      const esResponsable = curso && curso.cedula_responsable === cedula;

      const [docenteRows] = await pool.query(
        'SELECT 1 FROM curso_encargado WHERE id_curso = ? AND cedula_encargado = ?',
        [inscripcion.id_curso, cedula]
      );
      const esDocente = docenteRows.length > 0;

      if (!esPropietario && !esResponsable && !esDocente) {
        return res.status(403).json({ message: 'No autorizado para ver esta inscripción' });
      }
    }

    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripción' });
  }
};