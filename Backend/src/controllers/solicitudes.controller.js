// src/controllers/solicitudes.controller.js
import pool from '../db.js';

// Listar todas las solicitudes con filtros
export const list = async (req, res) => {
  try {
    const {
      tipo_formulario,
      prioridad,
      estado,
      encargado,
      fecha_desde,
      fecha_hasta,
      q,
      asignado_a
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
      const states = estado.split(',').map(s => s.trim());
      if (states.length > 1) {
        filters.push(`estado IN (${states.map(() => '?').join(',')})`);
        params.push(...states);
      } else {
        filters.push('estado = ?');
        params.push(states[0]);
      }
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

    if (asignado_a) {
      filters.push('asignado_a = ?');
      params.push(asignado_a);
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

// Obtener estadísticas del dashboard (Lógica corregida)
export const stats = async (req, res) => {
  try {
    const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM solicitudes_cambio');
    const total = totalResult[0].count;

    // Pendientes: Incluye 'pendiente' (esperando comité) y 'aprobado' (esperando dev)
    const [pendientesResult] = await pool.query(
      "SELECT COUNT(*) as count FROM solicitudes_cambio WHERE estado IN ('pendiente', 'aprobado')"
    );

    // Realizadas: Incluye 'realizado' (terminó dev) Y 'verificado' (se cerró el ciclo)
    const [realizadasResult] = await pool.query(
      "SELECT COUNT(*) as count FROM solicitudes_cambio WHERE estado IN ('realizado', 'verificado')"
    );

    const [porTipo] = await pool.query('SELECT tipo_formulario, COUNT(*) as total FROM solicitudes_cambio GROUP BY tipo_formulario');
    const [porPrioridad] = await pool.query('SELECT prioridad, COUNT(*) as total FROM solicitudes_cambio GROUP BY prioridad');

    res.json({
      total,
      pendientes: pendientesResult[0].count,
      realizadas: realizadasResult[0].count,
      porTipo,
      porPrioridad
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Obtener estadísticas (Alias para mantener compatibilidad si se usa con otro nombre)
export const getSolicitudesStats = stats;

// Obtener una solicitud por ID
export const get = async (req, res) => {
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
export const create = async (req, res) => {
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
      categoria,
      impacto,
      entornos,
      entorno_back,
      entorno_front,
      entorno_bd
    } = req.body;

    const enc1 = encargado1 || 'Sistema';

    const [result] = await pool.query(
      `INSERT INTO solicitudes_cambio (
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
        fecha_solicitud, encargado1, encargado2, encargado3, encargado4,
        descripcion, razon, fecha_deseada, contacto, tipo_cambio, categoria, impacto, entornos,
        entorno_back, entorno_front, entorno_bd, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
        fecha_solicitud, enc1, encargado2 || null, encargado3 || null, encargado4 || null,
        descripcion, razon, fecha_deseada || null, contacto, tipo_cambio || null, categoria || null, impacto || null, entornos || null,
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
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
      fecha_solicitud, encargado1, encargado2, encargado3, encargado4,
      descripcion, razon, fecha_deseada, contacto, tipo_cambio, categoria, impacto, entornos,
      entorno_back, entorno_front, entorno_bd, estado
    } = req.body;

    let query = `UPDATE solicitudes_cambio SET
      tipo_formulario = ?, nombre_solicitante = ?, apellido_solicitante = ?,
      prioridad = ?, fecha_solicitud = ?, encargado1 = ?, encargado2 = ?,
      encargado3 = ?, encargado4 = ?, descripcion = ?, razon = ?,
      fecha_deseada = ?, contacto = ?, tipo_cambio = ?, categoria = ?, impacto = ?, entornos = ?,
      entorno_back = ?, entorno_front = ?, entorno_bd = ?, estado = ?`;

    const params = [
      tipo_formulario, nombre_solicitante, apellido_solicitante, prioridad,
      fecha_solicitud, encargado1, encargado2 || null, encargado3 || null, encargado4 || null,
      descripcion, razon, fecha_deseada || null, contacto, tipo_cambio || null, categoria || null, impacto || null, entornos || null,
      !!entorno_back, !!entorno_front, !!entorno_bd, estado
    ];

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
export const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM solicitudes_cambio WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
};

// Aprobar solicitud (Comité) -> Asignar a Developer
export const aprobar = async (req, res) => {
  try {
    const { id } = req.params;
    const { developer_id } = req.body;

    if (!developer_id) return res.status(400).json({ message: 'Se requiere asignar un desarrollador' });

    await pool.query('UPDATE solicitudes_cambio SET estado="aprobado", asignado_a=? WHERE id=?', [developer_id, id]);

    // Integración GitHub
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
      try {
        const [solRows] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [id]);
        if (solRows.length) {
          const sol = solRows[0];
          const issueTitle = `Solicitud de Cambio #${sol.id}: ${sol.descripcion.substring(0, 50)}...`;
          const issueBody = `
### Detalles de la Solicitud
**ID:** ${sol.id}
**Solicitante:** ${sol.nombre_solicitante} ${sol.apellido_solicitante}
**Asignado a:** (Dev ID: ${developer_id})
**Prioridad:** ${sol.prioridad}
**Categoría:** ${sol.categoria || 'N/A'}

### Descripción
${sol.descripcion}

### Razón
${sol.razon}

### Entornos
${sol.entornos || 'N/A'}

**Contacto:** ${sol.contacto}
          `;

          // Usamos el fetch global (Node 18+ y v24 lo soportan nativamente)
          const ghRes = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`, {
            method: 'POST',
            headers: {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'NodeBackend'
            },
            body: JSON.stringify({ title: issueTitle, body: issueBody })
          });

          if (!ghRes.ok) {
            console.error('Error creando issue en GitHub:', await ghRes.text());
          } else {
            console.log('Issue creado en GitHub tras aprobación.');
          }
        }
      } catch (ghErr) {
        console.error('Error conectando con GitHub:', ghErr);
      }
    }

    res.json({ message: 'Solicitud aprobada, asignada e issue creado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aprobar solicitud' });
  }
};

// Rechazar solicitud (Comité)
export const rechazar = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE solicitudes_cambio SET estado="rechazado" WHERE id=?', [id]);
    res.json({ message: 'Solicitud rechazada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al rechazar solicitud' });
  }
};

// Realizar cambio (Developer)
export const realizar = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE solicitudes_cambio SET estado="realizado", fecha_termino=NOW() WHERE id=?', [id]);
    res.json({ message: 'Cambio marcado como realizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al realizar cambio' });
  }
};

// Verificar cambio (Comité) -> Finalizar
export const verificar = async (req, res) => {
  try {
    const { id } = req.params;
    // Asumimos cierre exitoso 'verificado'
    await pool.query('UPDATE solicitudes_cambio SET estado="verificado" WHERE id=?', [id]);
    res.json({ message: 'Cambio verificado y cerrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar cambio' });
  }
};