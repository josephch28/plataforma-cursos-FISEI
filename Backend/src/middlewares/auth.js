// src/middlewares/auth.js
// Middleware temporal hasta que conecten el login.
// Lee cabeceras x-user-cedula y x-user-rol para autorización.
module.exports = function auth(requiredRole) {
  return (req, res, next) => {
    const rol = req.header('x-user-rol');
    const cedula = req.header('x-user-cedula');
    if (!rol || !cedula) return res.status(401).json({ message: 'No autenticado' });
    req.user = { rol, cedula };
    if (requiredRole && rol !== requiredRole) return res.status(403).json({ message: 'No autorizado' });
    next();
  };
};
