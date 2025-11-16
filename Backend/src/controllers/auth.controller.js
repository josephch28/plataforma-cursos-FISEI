const pool = require('../db');

// Login simple: buscar por email y validar contraseña (modo desarrollo)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'email requerido' });
    const [rows] = await pool.query('SELECT cedula, nombre, apellido, email, rol, password FROM usuario WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'credenciales inválidas' });
    const user = rows[0];

    // En desarrollo: si no hay password almacenada, permitimos login para el usuario de ejemplo
    if (user.password) {
      if (password !== user.password) return res.status(401).json({ message: 'credenciales inválidas' });
    }

    // Respuesta mínima con información de usuario y rol
    return res.json({ cedula: user.cedula, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error interno' });
  }
};
