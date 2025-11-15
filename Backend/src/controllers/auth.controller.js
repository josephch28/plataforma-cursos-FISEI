// Backend/src/controllers/auth.controller.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens. ¡Debería estar en tu .env!
const JWT_SECRET = process.env.JWT_SECRET || 'esta-es-una-clave-secreta-temporal';

exports.login = async (req, res) => {
  try {
    const { cedula, password } = req.body;
    if (!cedula || !password) {
      return res.status(400).json({ message: 'Cédula y contraseña son requeridas' });
    }

    // 1. Buscar al usuario en la BD
    const [rows] = await pool.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const usuario = rows[0];

    // 2. Comparar la contraseña del body con la hasheada en la BD
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Crear el "payload" del token (la info que guardaremos)
    const payload = {
      cedula: usuario.cedula,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    // 4. Firmar el token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1d' // El token expirará en 1 día
    });

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

exports.register = async (req, res) => {
  try {
    const { cedula, nombre, apellido, email, password, rol = 'usuario' } = req.body;

    // 1. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Guardar en la base de datos
    await pool.query(
      'INSERT INTO usuario (cedula, nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [cedula, nombre, apellido, email, passwordHash, rol]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error(error);
    // Manejar error de email duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'La cédula o el email ya están registrados' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
};