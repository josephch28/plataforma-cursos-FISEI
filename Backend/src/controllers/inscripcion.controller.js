// src/controllers/inscripcion.controller.js
const db = require('../db'); // O usa tu conexión como en cursos
// const Inscripcion = require('../../models/Inscripcion'); // Si quieres usar Sequelize

// Listar inscripciones
exports.list = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inscripcion');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// Crear inscripción
exports.create = async (req, res) => {
  const { cedula_usuario, id_curso, nota_final, asistencia, estado } = req.body;
  try {
    await db.query(
      'INSERT INTO inscripcion (cedula_usuario, id_curso, nota_final, asistencia, estado) VALUES (?, ?, ?, ?, ?)',
      [cedula_usuario, id_curso, nota_final, asistencia, estado]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear inscripción' });
  }
};

// Actualizar inscripción
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nota_final, asistencia, estado } = req.body;
  try {
    await db.query(
      'UPDATE inscripcion SET nota_final=?, asistencia=?, estado=? WHERE id_inscripcion=?',
      [nota_final, asistencia, estado, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar inscripción' });
  }
};

// Eliminar inscripción
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM inscripcion WHERE id_inscripcion=?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
};

// Obtener una inscripción por id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM inscripcion WHERE id_inscripcion=?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripción' });
  }
};