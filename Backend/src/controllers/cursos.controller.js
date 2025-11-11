// Backend/src/controllers/cursos.controller.js - ACTUALIZADO
const pool = require('../db');


exports.list = async (req, res) => {
  try {
    const { q, tipo, pag = 1, size = 10, inactivo } = req.query;
    const offset = (parseInt(pag) - 1) * parseInt(size);
    const filters = [];
    const params = [];
    
    // Filtrar por activo/inactivo
    if (inactivo === 'true') {
      filters.push('c.activo = FALSE');
    } else {
      filters.push('c.activo = TRUE');
    }
    
    if (q) {
      filters.push('(c.nombre LIKE ? OR c.descripcion LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (tipo) {
      filters.push('c.tipo = ?');
      params.push(tipo);
    }
    
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT c.* FROM curso c ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(size), offset]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar cursos' });
  }
};

exports.get = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener curso' });
  }
};

exports.create = async (req, res) => {
  try {
    const b = req.validated;
    
    const [uAdmin] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [b.cedula_admin]);
    const [uResp] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [b.cedula_responsable]);
    
    if (!uAdmin.length || uAdmin[0].rol !== 'admin') {
      return res.status(400).json({ message: 'cedula_admin inválida o no es admin' });
    }
    if (!uResp.length || uResp[0].rol !== 'responsable') {
      return res.status(400).json({ message: 'cedula_responsable debe tener rol responsable' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO curso (cedula_admin, cedula_responsable, nombre, descripcion, tipo, horas, es_pagado, prerequisito, publico_objetivo, nota_aprobacion, requiere_asistencia, fecha_inicio, fecha_fin, activo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,TRUE)`,
      [
        b.cedula_admin, b.cedula_responsable, b.nombre, b.descripcion || null, b.tipo || null,
        b.horas || null, !!b.es_pagado, b.prerequisito || null, b.publico_objetivo || null,
        b.nota_aprobacion ?? 7.0, b.requiere_asistencia ?? true, b.fecha_inicio || null, b.fecha_fin || null
      ]
    );
    
    const [row] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear curso' });
  }
};

exports.update = async (req, res) => {
  try {
    const b = req.validated;
    
    if (b.cedula_responsable) {
      const [uResp] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [b.cedula_responsable]);
      if (!uResp.length || uResp[0].rol !== 'responsable') {
        return res.status(400).json({ message: 'cedula_responsable debe tener rol responsable' });
      }
    }
    
    const fields = [];
    const params = [];
    const allowed = ['cedula_responsable','nombre','descripcion','tipo','horas','es_pagado','prerequisito','publico_objetivo','nota_aprobacion','requiere_asistencia','fecha_inicio','fecha_fin'];
    
    for (const k of allowed) {
      if (k in b) {
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    }
    
    if (!fields.length) return res.status(400).json({ message: 'Nada para actualizar' });
    
    params.push(req.params.id);
    await pool.query(`UPDATE curso SET ${fields.join(', ')} WHERE id_curso = ?`, params);
    
    const [row] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [req.params.id]);
    res.json(row[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar curso' });
  }
};

exports.remove = async (req, res) => {
  try {
    // Desactivación lógica en lugar de DELETE
    await pool.query('UPDATE curso SET activo = FALSE WHERE id_curso = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al desactivar curso' });
  }
};
exports.activate = async (req, res) => {
  try {
    await pool.query('UPDATE curso SET activo = TRUE WHERE id_curso = ?', [req.params.id]);
    res.status(200).json({ message: 'Curso activado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al activar curso' });
  }
};
