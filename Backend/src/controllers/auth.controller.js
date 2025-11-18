// Backend/src/controllers/auth.controller.js
const pool = require('../db');
const bcrypt = require('bcrypt'); // ¡NUEVO! Importar bcrypt
const jwt = require('jsonwebtoken'); // ¡NUEVO! Importar jsonwebtoken

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
      // Usamos un mensaje genérico por seguridad
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    
    // 2. ¡NUEVO! Comparar contraseña con bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // 3. ¡NUEVO! Crear el "payload" del token
    const payload = {
      cedula: user.cedula,
      rol: user.rol,
      nombre: user.nombre
    };
    
    // 4. ¡NUEVO! Firmar el token
    // Asegúrate de tener JWT_SECRET en tu archivo .env
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'tu_secreto_por_defecto_MUY_SEGURO', {
      expiresIn: '1d' // El token expira en 1 día
    });

    // 5. Enviar el token y los datos del usuario al frontend
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