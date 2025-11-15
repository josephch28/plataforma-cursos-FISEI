// Backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'esta-es-una-clave-secreta-temporal';

// Este middleware ahora valida el token JWT
module.exports = function auth(requiredRole) {
  return (req, res, next) => {
    // 1. Obtener el token de la cabecera 'Authorization'
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No autenticado. Token no proporcionado.' });
    }

    // El token usualmente viene como "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autenticado. Formato de token inválido.' });
    }

    try {
      // 2. Verificar el token
      const payload = jwt.verify(token, JWT_SECRET);

      // 3. Guardar el payload (info del usuario) en req.user
      req.user = payload; // payload contiene { cedula, rol, nombre }

      // 4. (Opcional) Verificar si tiene el rol requerido por la ruta
      if (requiredRole && payload.rol !== requiredRole) {
        return res.status(403).json({ message: 'No autorizado. Rol insuficiente.' });
      }

      next();
    } catch (error) {
      // Si el token es inválido o expiró
      res.status(401).json({ message: 'Token inválido o expirado.' });
    }
  };
};