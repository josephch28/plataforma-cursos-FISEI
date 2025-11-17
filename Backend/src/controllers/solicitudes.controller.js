// src/controllers/solicitudes.controller.js
const pool = require('../db');

// Listar todas las solicitudes con filtros
exports.list = async (req, res) => {
  try {
    const { 
      tipo_formulario, 
      prioridad, 
      estado, 
      encargado,
      fecha_desde,
      fecha_hasta,
      q 
    } = req.query;
    
    const filters = [];
    const params = [];
    
    if (tipo_formulario) {
      filters.push('tipo_formulario = ?');
      params.push(tipo_formulario);
    }
    
    if (prioridad) {
      filters.push('prioridad = ?');
      params.push(prioridad);
    }
    
    if (estado) {
      filters.push('estado = ?');
      params.push(estado);
    }
    
    if (encargado) {
      filters.push('(encargado1 LIKE ? OR encargado2 LIKE ? OR encargado3 LIKE ? OR encargado4 LIKE ?)');
      const searchTerm = `%${encargado}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (req.query.tipo_cambio) {
      filters.push('tipo_cambio = ?');
      params.push(req.query.tipo_cambio);
    }
    
    if (fecha_desde) {
      filters.push('fecha_solicitud >= ?');
      params.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      filters.push('fecha_solicitud <= ?');
      params.push(fecha_hasta);
    }
    
    if (q) {
      filters.push('(nombre_solicitante LIKE ? OR apellido_solicitante LIKE ? OR descripcion LIKE ? OR razon LIKE ?)');
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    
    const [rows] = await pool.query(
      `SELECT * FROM solicitudes_cambio ${where} ORDER BY fecha_solicitud DESC`,
      params
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar solicitudes' });
  }
};

// Obtener estadísticas del dashboard
exports.stats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_cambio');
    const [pendientes] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_cambio WHERE estado = "pendiente"');
    const [realizadas] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_cambio WHERE estado = "realizado"');
    const [porTipo] = await pool.query('SELECT tipo_formulario, COUNT(*) as total FROM solicitudes_cambio GROUP BY tipo_formulario');
    const [porPrioridad] = await pool.query('SELECT prioridad, COUNT(*) as total FROM solicitudes_cambio GROUP BY prioridad');
    
    res.json({
      total: total[0].total,
      pendientes: pendientes[0].total,
      realizadas: realizadas[0].total,
      porTipo,
      porPrioridad
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Obtener una solicitud por ID
exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener solicitud' });
  }
};

// Crear nueva solicitud
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
    
    const [result] = await pool.query(
      `INSERT INTO solicitudes_cambio (
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
        fecha_solicitud, encargado1, encargado2, encargado3, encargado4,
        descripcion, razon, fecha_deseada, contacto, tipo_cambio, impacto,
        entorno_back, entorno_front, entorno_bd, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
        fecha_solicitud, encargado1, encargado2 || null, encargado3 || null, encargado4 || null,
        descripcion, razon, fecha_deseada || null, contacto, tipo_cambio || null, impacto || null,
        !!entorno_back, !!entorno_front, !!entorno_bd
      ]
    );
    
    const [row] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear solicitud' });
  }
};

// Actualizar solicitud
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
    
    // Si se cambia el estado a 'realizado', establecer fecha_termino
    let query = `UPDATE solicitudes_cambio SET
      tipo_formulario = ?, nombre_solicitante = ?, apellido_solicitante = ?,
      prioridad = ?, fecha_solicitud = ?, encargado1 = ?, encargado2 = ?,
      encargado3 = ?, encargado4 = ?, descripcion = ?, razon = ?,
      fecha_deseada = ?, contacto = ?, tipo_cambio = ?, impacto = ?,
      entorno_back = ?, entorno_front = ?, entorno_bd = ?, estado = ?`;
    
    const params = [
      tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
      fecha_solicitud, encargado1, encargado2 || null, encargado3 || null, encargado4 || null,
      descripcion, razon, fecha_deseada || null, contacto, tipo_cambio || null, impacto || null,
      !!entorno_back, !!entorno_front, !!entorno_bd, estado
    ];
    
    // Verificar si el estado cambió a 'realizado'
    const [current] = await pool.query('SELECT estado FROM solicitudes_cambio WHERE id = ?', [id]);
    if (current.length && current[0].estado !== 'realizado' && estado === 'realizado') {
      query += ', fecha_termino = NOW()';
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    
    const [row] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [id]);
    res.json(row[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
};

// Eliminar solicitud
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM solicitudes_cambio WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
};
