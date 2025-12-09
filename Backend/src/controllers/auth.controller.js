// Backend/src/controllers/auth.controller.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    // 1. Buscar usuario SOLO por email
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE email = ? AND activo = 1',
      [email]
    );
    
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    
    // 2. Comparar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // 3. Crear payload
    const payload = {
      cedula: user.cedula,
      rol: user.rol,
      nombre: user.nombre
    };
    
    // 4. Firmar token
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d'
    });

    res.json({
      token: token,
      user: {
        cedula: user.cedula,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        es_estudiante_uta: !!user.es_estudiante_uta,
        es_personal_uta: !!user.es_personal_uta
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// 👇 CAMBIO IMPORTANTE: Usar exports.register en lugar de export const register
exports.register = async (req, res) => {
  const { 
    cedula, nombre, apellido, email, password, 
    es_estudiante_uta, es_personal_uta 
  } = req.body;

  try {
    // 1. Verificar si ya existe
    const [userFound] = await pool.query('SELECT * FROM usuario WHERE email = ? OR cedula = ?', [email, cedula]);
    if (userFound.length > 0) {
      return res.status(400).json({ message: 'El correo o la cédula ya están registrados' });
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar en BD
    // CORRECCIÓN: Cambiamos 'estado' por 'activo' y el valor 'activo' por 1
    const [result] = await pool.query(
      'INSERT INTO usuario (cedula, nombre, apellido, email, password, rol, es_estudiante_uta, es_personal_uta, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [cedula, nombre, apellido, email, passwordHash, 'estudiante', es_estudiante_uta ? 1 : 0, es_personal_uta ? 1 : 0, 1]
    );

    res.status(201).json({
      id: result.insertId,
      cedula,
      nombre,
      apellido,
      email,
      rol: 'estudiante',
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al registrar' });
  }
};