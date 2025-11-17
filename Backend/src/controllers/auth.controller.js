// src/controllers/auth.controller.js
const pool = require('../db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    // Buscar usuario por email
    const [rows] = await pool.query(
      'SELECT cedula, nombre, apellido, email, rol, activo FROM usuario WHERE email = ? AND password = ? AND activo = 1',
      [email, password]
    );
    
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    
    // Retornar datos del usuario (sin password)
    res.json({
      cedula: user.cedula,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};
