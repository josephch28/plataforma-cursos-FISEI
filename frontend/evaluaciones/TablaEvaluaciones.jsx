import React, { useState } from 'react';

// Datos simulados del curso y reglas
const reglasCurso = {
  nota_aprobacion: 7.0,
  requiere_asistencia: true,
  asistencia_minima: 75 // Porcentaje mínimo requerido
};

// Datos simulados de estudiantes inscritos
const estudiantesMock = [
  {
    id_inscripcion: 1,
    cedula_usuario: '0303030303',
    nombre: 'Jonathan',
    apellido: 'Guamán',
    nota_final: '',
    asistencia: '',
    estado: 'pendiente'
  },
  {
    id_inscripcion: 2,
    cedula_usuario: '0404040404',
    nombre: 'Ana',
    apellido: 'Paredes',
    nota_final: '',
    asistencia: '',
    estado: 'pendiente'
  }
];

function calcularEstado(nota, asistencia) {
  if (nota === '' || asistencia === '') return 'pendiente';
  if (
    parseFloat(nota) >= reglasCurso.nota_aprobacion &&
    (!reglasCurso.requiere_asistencia || parseFloat(asistencia) >= reglasCurso.asistencia_minima)
  ) {
    return 'aprobado';
  }
  return 'reprobado';
}

const TablaEvaluaciones = () => {
  const [estudiantes, setEstudiantes] = useState(estudiantesMock);
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (index, field, value) => {
    const nuevos = [...estudiantes];
    nuevos[index][field] = value;
    // Validar estado automáticamente
    nuevos[index].estado = calcularEstado(nuevos[index].nota_final, nuevos[index].asistencia);
    setEstudiantes(nuevos);
  };

  // Callback para certificados: retorna los estudiantes aprobados
  const getAprobadosParaCertificado = () => {
    return estudiantes.filter(e => e.estado === 'aprobado');
  };

  // Simulación de guardar datos (preparado para integración con API)
  const handleGuardar = async () => {
    setMensaje(null);
    // Validación: no guardar si hay campos vacíos o estado pendiente
    const incompletos = estudiantes.filter(e =>
      e.nota_final === '' || e.asistencia === '' || e.estado === 'pendiente'
    );
    if (incompletos.length > 0) {
      setMensaje({ tipo: 'error', texto: `No se puede guardar: hay ${incompletos.length} estudiante(s) con datos incompletos o estado pendiente.` });
      return;
    }
    setGuardando(true);
    try {
      // Simulación de integración: mostrar el JSON que se enviaría al backend
      const payload = estudiantes.map(e => ({
        id_inscripcion: e.id_inscripcion,
        nota_final: e.nota_final,
        asistencia: e.asistencia,
        estado: e.estado
      }));
      console.log('Simulación de envío a API (POST /api/evaluaciones):', JSON.stringify(payload, null, 2));
      // Aquí iría la llamada real, por ejemplo:
      // await fetch('/api/evaluaciones', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      await new Promise(res => setTimeout(res, 1000));
      setMensaje({ tipo: 'exito', texto: 'Calificaciones guardadas correctamente (simulado).' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar. Intenta nuevamente.' });
    }
    setGuardando(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Evaluaciones y Asistencia</h2>
      {mensaje && (
        <div className={`mb-2 p-2 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{mensaje.texto}</div>
      )}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Cédula</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Nota Final</th>
            <th className="border px-2 py-1">Asistencia (%)</th>
            <th className="border px-2 py-1">Estado</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((est, idx) => (
            <tr key={est.id_inscripcion}>
              <td className="border px-2 py-1">{est.cedula_usuario}</td>
              <td className="border px-2 py-1">{est.nombre} {est.apellido}</td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={est.nota_final}
                  onChange={e => handleChange(idx, 'nota_final', e.target.value)}
                  className="w-20 border rounded px-1"
                  disabled={guardando}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={est.asistencia}
                  onChange={e => handleChange(idx, 'asistencia', e.target.value)}
                  className="w-20 border rounded px-1"
                  disabled={guardando}
                />
              </td>
              <td className={`border px-2 py-1 font-semibold ${est.estado === 'aprobado' ? 'text-green-600' : est.estado === 'reprobado' ? 'text-red-600' : 'text-gray-600'}`}>{est.estado}
                {est.estado === 'aprobado' && (
                  <span title="Listo para certificado" className="ml-2 text-green-500">
                    &#x1F4C3; {/* Icono de certificado */}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-700">
        <strong>Reglas del curso:</strong> Nota mínima: {reglasCurso.nota_aprobacion}, Asistencia mínima: {reglasCurso.asistencia_minima}%
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleGuardar}
        disabled={guardando}
      >
        {guardando ? 'Guardando...' : 'Guardar calificaciones'}
      </button>
    </div>
  );
};

export default TablaEvaluaciones;
