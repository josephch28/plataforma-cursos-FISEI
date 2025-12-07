// Backend/src/controllers/cursos.controller.js
const pool = require('../db');

exports.list = async (req, res) => {
  try {
    const { q, tipo, pag = 1, size = 10, inactivo, horas_min, horas_max, publico_objetivo, costo_min, costo_max } = req.query;

    const offset = (parseInt(pag) - 1) * parseInt(size);
    const filters = [];
    const params = [];
    const pubs = (publico_objetivo || '').split(',').map(s => s.trim()).filter(Boolean);

    if (inactivo === 'true') filters.push('c.activo = FALSE');
    else filters.push('c.activo = TRUE');

    if (q) {
      filters.push('(c.nombre LIKE ? OR c.descripcion LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    if (tipo) {
      filters.push('c.tipo = ?');
      params.push(tipo);
    }

    if (pubs.length) {
      const ors = pubs.map(() => `CONCAT(',', c.publico_objetivo, ',') LIKE ?`);
      filters.push(`(${ors.join(' OR ')})`);
      params.push(...pubs.map(p => `%,${p},%`));
    } else if (publico_objetivo) {
      filters.push(`CONCAT(',', c.publico_objetivo, ',') LIKE ?`);
      params.push(`%,${publico_objetivo},%`);
    }

    if (horas_min) { filters.push('c.horas >= ?'); params.push(parseInt(horas_min)); }
    if (horas_max) { filters.push('c.horas <= ?'); params.push(parseInt(horas_max)); }
    if (costo_min) { filters.push('c.costo >= ?'); params.push(parseFloat(costo_min)); }
    if (costo_max) { filters.push('c.costo <= ?'); params.push(parseFloat(costo_max)); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT c.*,
              cp.nombre AS prerequisito_nombre
         FROM curso c
         LEFT JOIN curso cp ON c.prerequisito = cp.id_curso
        ${where}
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?`,
      [...params, parseInt(size), offset]
    );
    res.json(rows);
  } catch (error) {
    console.error('LIST error:', error);
    res.status(500).json({ message: 'Error al listar cursos', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('GET error:', error);
    res.status(500).json({ message: 'Error al obtener curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.create = async (req, res) => {
  try {
    const b = req.validated || req.body;
    console.log('CREATE payload:', b);

    // 1) Identidad del creador desde sesión (token/headers)
    const cedulaAdmin = (req.user && req.user.cedula) || req.headers['x-user-cedula'] || null;
    if (!cedulaAdmin || !/^[0-9]{10}$/.test(String(cedulaAdmin))) {
      return res.status(400).json({ message: 'Validación fallida', errors: ['No hay sesión válida (cedula_admin)'] });
    }

    // 2) Normalizar público a CSV
    let publicoCSV = b.publico_objetivo;
    if (Array.isArray(publicoCSV)) publicoCSV = publicoCSV.join(',');
    else if (typeof publicoCSV === 'object' && publicoCSV !== null) publicoCSV = Object.values(publicoCSV).join(',');

    // 3) Validar roles desde BD
    const [uAdmin] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [cedulaAdmin]);
    if (!uAdmin.length || uAdmin[0].rol !== 'admin') {
      return res.status(403).json({ message: 'No autorizado (Admin requerido)' });
    }
    const [uResp] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [b.cedula_responsable]);
    if (!uResp.length || uResp[0].rol !== 'responsable') {
      return res.status(400).json({ message: 'Validación fallida', errors: ['cedula_responsable debe tener rol responsable'] });
    }

    let cedulaDocente = b.cedula_docente || null;
    if (cedulaDocente) {
      const [uDoc] = await pool.query('SELECT cedula FROM usuario WHERE cedula = ?', [cedulaDocente]);
      if (!uDoc.length) {
        return res.status(400).json({ message: 'Validación fallida', errors: ['cedula_docente no corresponde a un usuario válido'] });
      }
    }

    // 4) INSERT usando cedulaAdmin del token
    const [result] = await pool.query(
      `INSERT INTO curso
       (cedula_admin, cedula_responsable, cedula_docente, nombre, descripcion, tipo, horas, es_pagado, costo, prerequisito, publico_objetivo, nota_aprobacion, requiere_asistencia, fecha_inicio, fecha_fin, fecha_inicio_inscripcion, fecha_fin_inscripcion, activo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,FALSE)`,
      [
        cedulaAdmin,
        b.cedula_responsable,
        cedulaDocente,
        b.nombre,
        b.descripcion || null,
        b.tipo || null,
        b.horas ?? null,
        !!b.es_pagado,
        b.costo ?? 0,
        b.prerequisito ?? null,
        publicoCSV ?? null,
        b.nota_aprobacion ?? 7.0,
        b.requiere_asistencia ?? true,
        b.fecha_inicio || null,
        b.fecha_fin || null,
        b.fecha_inicio_inscripcion || null,
        b.fecha_fin_inscripcion || null
      ]
    );

    const [row] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (error) {
    console.error('CREATE error:', error);
    return res.status(500).json({ message: 'Error al crear curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.update = async (req, res) => {
  try {
    const b = req.validated || req.body;
    console.log('UPDATE payload:', b, 'id:', req.params.id);

    const cedula = req.user?.cedula;
    const rol = req.user?.rol;
    if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

    // Admin puede actualizar cualquier curso, otros sólo si son responsables del curso
    if (rol !== 'admin') {
      const [[curso]] = await pool.query(
        'SELECT cedula_responsable FROM curso WHERE id_curso = ?',
        [req.params.id]
      );

      if (!curso || curso.cedula_responsable !== cedula) {
        return res.status(403).json({ message: 'No autorizado para editar este curso' });
      }
    }

    let publicoCSV = b.publico_objetivo;
    if (Array.isArray(publicoCSV)) publicoCSV = publicoCSV.join(',');
    else if (typeof publicoCSV === 'object' && publicoCSV !== null) publicoCSV = Object.values(publicoCSV).join(',');

    if (b.cedula_responsable) {
      const [uResp] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [b.cedula_responsable]);
      if (!uResp.length || uResp[0].rol !== 'responsable') {
        return res.status(400).json({ message: 'Validación fallida', errors: ['cedula_responsable debe tener rol responsable'] });
      }
    }

    if (b.cedula_docente) {
      const [uDoc] = await pool.query('SELECT cedula FROM usuario WHERE cedula = ?', [b.cedula_docente]);
      if (!uDoc.length) {
        return res.status(400).json({ message: 'Validación fallida', errors: ['cedula_docente no corresponde a un usuario válido'] });
      }
    }

    const fields = [];
    const params = [];
    const allowed = [
      'cedula_responsable', 'cedula_docente', 'nombre', 'descripcion', 'tipo', 'horas', 'es_pagado', 'costo',
      'prerequisito', 'publico_objetivo', 'nota_aprobacion', 'requiere_asistencia', 'fecha_inicio', 'fecha_fin',
      'fecha_inicio_inscripcion', 'fecha_fin_inscripcion'
    ];

    for (const k of allowed) {
      if (k in b) {
        fields.push(`${k} = ?`);
        params.push(k === 'publico_objetivo' ? (publicoCSV ?? null) : (b[k] ?? null));
      }
    }

    if (!fields.length) return res.status(400).json({ message: 'Nada para actualizar' });

    params.push(req.params.id);
    await pool.query(`UPDATE curso SET ${fields.join(', ')} WHERE id_curso = ?`, params);

    const [row] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [req.params.id]);
    res.json(row[0]);
  } catch (error) {
    console.error('UPDATE error:', error);
    return res.status(500).json({ message: 'Error al actualizar curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('UPDATE curso SET activo = FALSE WHERE id_curso = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('REMOVE error:', error);
    res.status(500).json({ message: 'Error al desactivar curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.activate = async (req, res) => {
  try {
    const cedula = req.user?.cedula;
    const rol = req.user?.rol;
    if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

    if (rol !== 'admin') {
      const [[curso]] = await pool.query(
        'SELECT cedula_responsable FROM curso WHERE id_curso = ?',
        [req.params.id]
      );

      if (!curso || curso.cedula_responsable !== cedula) {
        return res.status(403).json({ message: 'No autorizado para activar este curso' });
      }
    }

    await pool.query('UPDATE curso SET activo = TRUE, estado = "activo" WHERE id_curso = ?', [req.params.id]);
    res.status(200).json({ message: 'Curso activado' });
  } catch (error) {
    console.error('ACTIVATE error:', error);
    res.status(500).json({ message: 'Error al activar curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

exports.finalize = async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const cedula = req.user?.cedula;
    const rol = req.user?.rol;
    if (!cedula) return res.status(401).json({ message: 'Sesión inválida' });

    // 1. Verificar Permisos (Responsable o Admin)
    if (rol !== 'admin') {
      const [[curso]] = await pool.query(
        'SELECT cedula_responsable FROM curso WHERE id_curso = ?',
        [req.params.id]
      );
      if (!curso || curso.cedula_responsable !== cedula) {
        return res.status(403).json({ message: 'No autorizado para finalizar este curso' });
      }
    }

    // 2. Actualizar Estado del Curso
    // Se "cierra" el curso (estado='finalizado'), y se desactiva para inscripciones (activo=FALSE)
    await pool.query(
      "UPDATE curso SET estado = 'finalizado', activo = FALSE WHERE id_curso = ?",
      [req.params.id]
    );

    // 3. Obtener estudiantes aprobados sin certificado previo
    // (Asumimos que si ya tienen certificado, no generamos otro, o regeneramos? Mejor ignorar duplicados)
    const [inscripciones] = await pool.query(`
        SELECT i.id_inscripcion, u.nombre, u.apellido
        FROM inscripcion i
        JOIN usuario u ON i.cedula_estudiante = u.cedula
        WHERE i.id_curso = ? 
          AND i.estado = 'aprobado'
          AND NOT EXISTS (SELECT 1 FROM certificados c WHERE c.id_inscripcion = i.id_inscripcion)
    `, [req.params.id]);

    // 4. Generar registros de Certificados
    let generated = 0;
    for (const insc of inscripciones) {
      const code = uuidv4();
      await pool.query(
        'INSERT INTO certificados (id_inscripcion, codigo_verificacion) VALUES (?, ?)',
        [insc.id_inscripcion, code]
      );
      generated++;
    }

    res.json({
      message: 'Curso finalizado correctamente',
      generated_certificates: generated,
      total_students: inscripciones.length
    });

  } catch (error) {
    console.error('FINALIZE error:', error);
    res.status(500).json({ message: 'Error al finalizar curso', error: String(error?.sqlMessage || error?.message || error) });
  }
};

