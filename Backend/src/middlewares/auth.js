// src/middlewares/auth.js (REESCRITO Y CORREGIDO)
const jwt = require('jsonwebtoken');

module.exports = function (requiredRole) {
  return (req, res, next) => {
    // 1. Obtener token del header 'Authorization'
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    // El token viene como "Bearer <token>"
    const token = authHeader.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'Token mal formado' });
    }

    try {
      // 2. Verificar el token usando el SECRETO
      // Asegúrate de tener JWT_SECRET en tu archivo .env
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_por_defecto_MUY_SEGURO');
      
      req.user = payload; // Adjunta { cedula, rol, nombre } a la request

      // 3. Verificar rol (si se requiere uno)
      if (requiredRole && req.user.rol !== requiredRole) {
         // Si el rol requerido es 'admin' y el usuario no lo es
         if (requiredRole === 'admin' && req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No autorizado (Admin requerido)' });
         }
         // (Aquí puedes agregar más lógicas si tienes más roles)
      }
      
      next(); // ¡Éxito! Pasa al siguiente controlador

    } catch (e) {
      res.status(401).json({ message: 'Token no es válido o ha expirado' });
    }
  };
};