// src/controllers/encargados.controller.js
const pool = require('../db');

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT ce.*, u.nombre, u.apellido, u.email FROM curso_encargado ce JOIN usuario u ON u.cedula = ce.cedula_encargado WHERE ce.id_curso = ?',
    [req.params.id]
  );
  res.json(rows);
};

exports.add = async (req, res) => {
  const { cedula_encargado } = req.body;
  if (!cedula_encargado || !/^[0-9]{10}$/.test(cedula_encargado)) return res.status(400).json({ message: 'cedula_encargado 10 dígitos' });
  const [u] = await pool.query('SELECT rol FROM usuario WHERE cedula = ?', [cedula_encargado]);
  if (!u.length) return res.status(404).json({ message: 'Usuario no existe' });
  // Puede ser encargado cualquier rol distinto a admin si así lo deciden; aquí se permite responsable/usuario
  await pool.query('INSERT INTO curso_encargado (id_curso, cedula_encargado) VALUES (?,?)', [req.params.id, cedula_encargado])
    .catch(e => {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Encargado ya asignado a este curso' });
      throw e;
    });
  res.status(201).json({ message: 'Encargado asignado' });
};

exports.remove = async (req, res) => {
  await pool.query('DELETE FROM curso_encargado WHERE id_curso = ? AND cedula_encargado = ?', [req.params.id, req.params.cedula]);
  res.status(204).send();
};
