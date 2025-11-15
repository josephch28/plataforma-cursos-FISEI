// Backend/src/validators/usuarios.js

const isTenDigits = v => typeof v === 'string' && /^[0-9]{10}$/.test(v);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validRoles = ['admin', 'responsable', 'usuario'];

exports.createUsuario = (req) => {
  const b = req.body;
  const errs = [];

  if (!b.cedula || !isTenDigits(b.cedula)) errs.push('cedula: exactamente 10 dígitos requeridos');
  if (!b.nombre || b.nombre.length < 3) errs.push('nombre: mínimo 3 caracteres');
  if (!b.apellido || b.apellido.length < 3) errs.push('apellido: mínimo 3 caracteres');
  if (!b.email || !emailRegex.test(b.email)) errs.push('email: formato inválido');
  if (!b.rol || !validRoles.includes(b.rol)) errs.push('rol: inválido. Debe ser admin, responsable o usuario');
  if (!b.password || b.password.length < 6) errs.push('password: mínimo 6 caracteres');

  return errs.length ? { error: errs } : { value: b };
};

exports.updateUsuario = (req) => {
    const b = req.body;
    const errs = [];
    const fields = {};
    let hasFieldToUpdate = false;

    // Se asume que en update la cédula no se cambia, y el password es opcional.
    if ('nombre' in b) {
      if (b.nombre.length < 3) errs.push('nombre: mínimo 3 caracteres');
      fields.nombre = b.nombre; hasFieldToUpdate = true;
    }
    if ('apellido' in b) {
      if (b.apellido.length < 3) errs.push('apellido: mínimo 3 caracteres');
      fields.apellido = b.apellido; hasFieldToUpdate = true;
    }
    if ('email' in b) {
      if (!emailRegex.test(b.email)) errs.push('email: formato inválido');
      fields.email = b.email; hasFieldToUpdate = true;
    }
    if ('rol' in b) {
      if (!validRoles.includes(b.rol)) errs.push('rol: inválido');
      fields.rol = b.rol; hasFieldToUpdate = true;
    }
    if ('password' in b) {
      if (b.password.length < 6) errs.push('password: si se proporciona, mínimo 6 caracteres');
      fields.password = b.password; hasFieldToUpdate = true;
    }
    
    if (!hasFieldToUpdate) errs.push('Nada para actualizar');

    return errs.length ? { error: errs } : { value: fields };
};