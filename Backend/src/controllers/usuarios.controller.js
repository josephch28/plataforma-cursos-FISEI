// src/controllers/usuarios.controller.js
exports.list = async (req, res) => {
  try {
    const [rows] = await require('../db').query('SELECT cedula, nombre, apellido FROM usuario');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};