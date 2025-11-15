// Backend/src/controllers/auth.controller.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ¡Asegúrate de agregar JWT_SECRET en tu archivo .env!
const JWT_SECRET = process.env.JWT_SECRET || 'esta-es-una-clave-secreta-temporal';

exports.login = async (req, res) => {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) {
      return res.status(400).json({ message: 'Cédula y contraseña son requeridas' });
    }

    // 1. Buscar al usuario
    const [rows] = await pool.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const usuario = rows[0];

    // 2. Comparar la contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Crear el payload del token
    const payload = {
      cedula: usuario.cedula,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    // 4. Firmar el token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login exitoso',
      token: token,
      usuario: payload
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};