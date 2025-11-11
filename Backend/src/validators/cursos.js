// src/validators/cursos.js
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isTenDigits = (v) => typeof v === 'string' && /^[0-9]{10}$/.test(v);

exports.createCurso = (req) => {
  const b = req.body;
  const errs = [];

  if (!b.cedula_admin || !isTenDigits(b.cedula_admin)) errs.push('cedula_admin debe tener 10 dígitos');
  if (!b.cedula_responsable || !isTenDigits(b.cedula_responsable)) errs.push('cedula_responsable debe tener 10 dígitos');
  if (!b.nombre || b.nombre.length < 3) errs.push('nombre es requerido (>=3)');
  if (b.horas != null && (!Number.isInteger(b.horas) || b.horas <= 0)) errs.push('horas debe ser entero positivo');
  if (b.nota_aprobacion != null && (b.nota_aprobacion < 0 || b.nota_aprobacion > 10)) errs.push('nota_aprobacion 0..10');
  if (b.requiere_asistencia != null && typeof b.requiere_asistencia !== 'boolean' && b.requiere_asistencia !== 'true' && b.requiere_asistencia !== 'false') errs.push('requiere_asistencia booleano');
  if (b.fecha_inicio && b.fecha_fin && new Date(b.fecha_inicio) > new Date(b.fecha_fin)) errs.push('fecha_inicio <= fecha_fin');
  return errs.length ? { error: errs } : { value: b };
};
