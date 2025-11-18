// Backend/src/validators/inscripciones.js

const isNumericId = (value) => !isNaN(Number(value)) && Number(value) > 0;
const allowedMethods = ['transferencia', 'deposito'];

exports.createInscripcion = (req) => {
  const body = req.body || {};
  const errors = [];

  if (!isNumericId(body.id_curso)) {
    errors.push('id_curso es requerido y debe ser numérico');
  }

  if (body.metodo_pago && !allowedMethods.includes(body.metodo_pago)) {
    errors.push('metodo_pago inválido');
  }

  return errors.length ? { error: errors } : { value: body };
};

exports.updateInscripcion = (req) => {
  const body = req.body || {};
  const errors = [];

  const allowedEstados = ['pendiente', 'pagado', 'aprobado', 'reprobado'];

  if ('nota_final' in body) {
    const nota = Number(body.nota_final);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      errors.push('nota_final debe estar entre 0 y 10');
    }
  }

  if ('asistencia' in body) {
    const asistencia = Number(body.asistencia);
    if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
      errors.push('asistencia debe estar entre 0 y 100');
    }
  }

  if ('estado' in body && !allowedEstados.includes(body.estado)) {
    errors.push('estado inválido');
  }

  if (!Object.keys(body).length) {
    errors.push('Nada para actualizar');
  }

  return errors.length ? { error: errors } : { value: body };
};

