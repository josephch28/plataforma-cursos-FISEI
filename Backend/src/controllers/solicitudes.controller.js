const pool = require('../db');

// Listar todas las solicitudes de cambio
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM solicitudes_cambio ORDER BY fecha_guardado DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

// Estadísticas agregadas para dashboard
exports.stats = async (req, res) => {
  try {
    // Total
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM solicitudes_cambio');

    // Por estado
    const [byEstado] = await pool.query('SELECT estado, COUNT(*) AS count FROM solicitudes_cambio GROUP BY estado');

    // Por tipo de cambio
    const [byTipo] = await pool.query('SELECT COALESCE(tipo_cambio, "no_aplica") AS tipo_cambio, COUNT(*) AS count FROM solicitudes_cambio GROUP BY tipo_cambio');

    // Por prioridad
    const [byPrioridad] = await pool.query('SELECT prioridad, COUNT(*) AS count FROM solicitudes_cambio GROUP BY prioridad');

    // Por día (últimos 30 días)
    const [byDia] = await pool.query(
      `SELECT fecha_solicitud AS fecha, COUNT(*) AS count
       FROM solicitudes_cambio
       WHERE fecha_solicitud >= DATE_SUB(CURRENT_DATE, INTERVAL 29 DAY)
       GROUP BY fecha_solicitud
       ORDER BY fecha_solicitud`
    );

    res.json({ total, byEstado, byTipo, byPrioridad, byDia });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Obtener una solicitud por ID
exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener solicitud' });
  }
};

// Crear una nueva solicitud de cambio
exports.create = async (req, res) => {
  try {
    const {
      tipo_formulario,
      nombre_solicitante,
      apellido_solicitante,
      prioridad,
      fecha_solicitud,
      encargado1,
      encargado2,
      encargado3,
      encargado4,
      descripcion,
      razon,
      fecha_deseada,
      contacto,
      tipo_cambio,
      impacto,
      entorno_back,
      entorno_front,
      entorno_bd
    } = req.body;

    // Validaciones mínimas
    if (!tipo_formulario || !nombre_solicitante || !apellido_solicitante || !prioridad || !fecha_solicitud || !encargado1 || !descripcion || !razon || !contacto) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const [result] = await pool.query(
      `INSERT INTO solicitudes_cambio (
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad, fecha_solicitud,
        encargado1, encargado2, encargado3, encargado4, descripcion, razon, fecha_deseada, contacto,
        tipo_cambio, impacto, entorno_back, entorno_front, entorno_bd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad, fecha_solicitud,
        encargado1, encargado2 || null, encargado3 || null, encargado4 || null,
        descripcion, razon, fecha_deseada || null, contacto,
        tipo_cambio || null, impacto || null,
        entorno_back ? 1 : 0, entorno_front ? 1 : 0, entorno_bd ? 1 : 0
      ]
    );

    const [row] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear solicitud' });
  }
};

// Actualizar una solicitud
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_formulario,
      nombre_solicitante,
      apellido_solicitante,
      prioridad,
      fecha_solicitud,
      encargado1,
      encargado2,
      encargado3,
      encargado4,
      descripcion,
      razon,
      fecha_deseada,
      contacto,
      tipo_cambio,
      impacto,
      entorno_back,
      entorno_front,
      entorno_bd,
      estado
    } = req.body;

    const fields = [];
    const params = [];
    const allowed = [
      'tipo_formulario', 'nombre_solicitante', 'apellido_solicitante', 'prioridad', 'fecha_solicitud',
      'encargado1', 'encargado2', 'encargado3', 'encargado4', 'descripcion', 'razon',
      'fecha_deseada', 'contacto', 'tipo_cambio', 'impacto', 'entorno_back', 'entorno_front', 'entorno_bd', 'estado'
    ];

    for (const k of allowed) {
      if (k in req.body) {
        fields.push(`${k} = ?`);
        params.push(req.body[k]);
      }
    }

    if (!fields.length) return res.status(400).json({ message: 'Nada para actualizar' });

    params.push(id);
    await pool.query(`UPDATE solicitudes_cambio SET ${fields.join(', ')} WHERE id = ?`, params);

    const [row] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [id]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
};

// Eliminar una solicitud
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM solicitudes_cambio WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
};

