// src/validators/evaluaciones.js

const isTenDigits = v => typeof v === 'string' && /^[0-9]{10}$/.test(v);

exports.createEvaluacion = (req) => {
  const b = req.body;
  const errs = [];

  // Validaciones básicas
  if (!b.cedula_usuario || !isTenDigits(b.cedula_usuario)) errs.push('cedula_usuario debe tener 10 dígitos');
  if (!b.id_curso || isNaN(Number(b.id_curso))) errs.push('id_curso es requerido y debe ser numérico');
  if (b.nota_final != null && (isNaN(Number(b.nota_final)) || b.nota_final < 0 || b.nota_final > 10)) errs.push('nota_final debe ser un número entre 0 y 10');
  if (b.asistencia != null && (isNaN(Number(b.asistencia)) || b.asistencia < 0 || b.asistencia > 100)) errs.push('asistencia debe ser un número entre 0 y 100');
  if (!b.estado || !['pendiente', 'aprobado', 'reprobado'].includes(b.estado)) errs.push('estado inválido');

  return errs.length ? { error: errs } : { value: b };
};