// Frontend/src/modules/cursos/CursosCatalogoPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PUBLICO_LABELS = {
  'Estudiantes UTA': 'Estudiantes UTA',
  'Personal UTA': 'Personal UTA',
  'Público General': 'Público General'
};

export default function CursosCatalogoPage() {
  const [cursos, setCursos] = useState([]);
  const [misCursosEstudiante, setMisCursosEstudiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [modalCurso, setModalCurso] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([
      API.listCursos({ inactivo: false }).catch(() => []),
      API.getUserCourses().catch(() => [])
    ])
      .then(([cursosData, cursosUsuario]) => {
        setCursos(cursosData);
        const inscritos = (cursosUsuario || [])
          .filter(c => c.rol === 'estudiante')
          .map(c => c.id_curso);
        setMisCursosEstudiante(inscritos);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const openModal = (curso) => {
    if (user.rol !== 'usuario') {
      setFeedback({
        type: 'error',
        title: 'Acceso restringido',
        message: 'Solo los usuarios con rol "usuario" pueden inscribirse desde el catálogo.'
      });
      return;
    }
    setModalCurso(curso);
    setFeedback(null);
  };

  const closeModal = () => {
    if (confirmingId) return;
    setModalCurso(null);
  };

  const handleConfirmInscripcion = async () => {
    if (!modalCurso) return;
    const id_curso = modalCurso.id_curso;
    const metodoSeleccionado = metodosSeleccionados[id_curso] || 'transferencia';

    try {
      setConfirmingId(id_curso);
      const result = await API.createInscripcion({
        cedula_usuario: user.cedula,
        id_curso,
        metodo_pago: metodoSeleccionado
      });

      const successMessage = result.requires_payment
        ? `Tu inscripción al curso "${modalCurso.nombre}" fue registrada. Debes completar el pago para finalizar.`
        : `¡Listo! Estás inscrito en "${modalCurso.nombre}".`;

      const actions = result.requires_payment && result.id_inscripcion
        ? [
            {
              label: 'Subir comprobante',
              action: () => nav(`/pago/${result.id_inscripcion}/subir`)
            },
            {
              label: 'Ir a Mis cursos',
              action: () => nav('/mis-cursos')
            }
          ]
        : [
            {
              label: 'Ver mis cursos',
              action: () => nav('/mis-cursos')
            }
          ];

      setFeedback({
        type: 'success',
        title: 'Inscripción registrada',
        message: successMessage,
        actions
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'No se pudo inscribir',
        message: error.message || 'Ocurrió un error al procesar la inscripción.'
      });
    } finally {
      setConfirmingId(null);
      setModalCurso(null);
    }
  };

  const { cursosDisponibles, cursosRestringidos } = useMemo(() => {
    const inscritosIds = new Set(misCursosEstudiante);
    const disponibles = [];
    const restringidos = [];

    cursos.forEach(curso => {
      const publico = (curso.publico_objetivo || '').split(',').map(s => s.trim()).filter(Boolean);
      const publicoTexto = publico.length ? publico.map(p => PUBLICO_LABELS[p] || p).join(', ') : 'Público General';
      const usuarioCumplePublico =
        publico.length === 0 ||
        publico.includes('Público General') ||
        (publico.includes('Estudiantes UTA') && user?.es_estudiante_uta) ||
        (publico.includes('Personal UTA') && user?.es_personal_uta);

      const cumplePrerrequisito = !curso.prerequisito || curso.prerequisito_aprobado === true;

      const esResponsable = curso.cedula_responsable === user?.cedula;
      const esDocente = curso.cedula_docente === user?.cedula;
      const esEncargado = Array.isArray(curso.docentes_extra)
        ? curso.docentes_extra.includes(user?.cedula)
        : false;

      const data = {
        ...curso,
        publicoTexto,
        canEnroll: usuarioCumplePublico && cumplePrerrequisito && !esResponsable && !esDocente && !esEncargado,
        razonBloqueo: esResponsable || esDocente || esEncargado
          ? 'Eres responsable/docente de este curso'
          : !usuarioCumplePublico
          ? 'No cumples el público objetivo'
          : !cumplePrerrequisito
            ? 'Prerrequisito no aprobado'
            : null
      };

      if (inscritosIds.has(curso.id_curso)) {
        return;
      }

      if (data.canEnroll) disponibles.push(data);
      else restringidos.push(data);
    });

    return { cursosDisponibles: disponibles, cursosRestringidos: restringidos };
  }, [cursos, user, misCursosEstudiante]);

  const renderCard = (curso, disabled = false) => (
    <div
      key={curso.id_curso}
      className={`bg-white p-6 rounded-lg shadow transition-shadow border-t-4 ${
        disabled ? 'border-red-500 opacity-70' : 'border-blue-600 hover:shadow-lg'
      }`}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">{curso.nombre}</h2>
      <p className="text-sm text-blue-600 font-medium capitalize mb-4">
        {curso.tipo} | {curso.horas} horas
      </p>
      <p className="text-gray-600 text-sm line-clamp-3">{curso.descripcion}</p>

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        <p>Público: <span className="font-medium">{curso.publicoTexto}</span></p>
        {curso.prerequisito && (
          <p className="text-red-500 font-semibold">
            Requiere Prerrequisito: {curso.prerequisito_nombre || `Curso ${curso.prerequisito}`}
          </p>
        )}
        {disabled && (
          <p className="text-red-600 font-semibold">
            Tu perfil no cumple el público objetivo o los requisitos de inscripción.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${curso.es_pagado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {curso.es_pagado ? `Pagado ($${Number(curso.costo || 0).toFixed(2)})` : 'Gratuito'}
          </span>
          {curso.es_pagado && !disabled && (
            <select
              className="text-sm border rounded-lg px-2 py-1"
              value={metodosSeleccionados[curso.id_curso] || 'transferencia'}
              onChange={e => setMetodosSeleccionados(prev => ({ ...prev, [curso.id_curso]: e.target.value }))}
            >
              <option value="transferencia">Transferencia</option>
              <option value="deposito">Depósito</option>
            </select>
          )}
        </div>
        <button
          disabled={disabled}
          onClick={() => openModal(curso)}
          className={`px-4 py-2 text-sm rounded-lg font-semibold ${
            disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {disabled ? 'No disponible' : 'Inscribirse'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando catálogo de cursos...</div>;
  }

  return (
    <div className="space-y-10">
      {feedback && (
        <div
          className={`rounded-xl border px-5 py-4 flex flex-col gap-2 ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="text-lg font-semibold">{feedback.title}</div>
          <p className="text-sm">{feedback.message}</p>
          {feedback.actions && (
            <div className="flex flex-wrap gap-3">
              {feedback.actions.map((action, idx) => (
                <button
                  key={`${action.label}-${idx}`}
                  onClick={action.action}
                  className="px-4 py-2 rounded-lg bg-white/70 text-sm font-semibold text-blue-700 border border-blue-200 hover:bg-white"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section>
        <h1 className="text-3xl font-bold text-gray-900">Cursos disponibles para ti</h1>
        <p className="text-gray-600">Cumples los requisitos y puedes inscribirte en los siguientes eventos.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {cursosDisponibles.length ? (
            cursosDisponibles.map(curso => renderCard(curso))
          ) : (
            <div className="md:col-span-3 text-center py-10 text-gray-500">
              No hay cursos disponibles para tu perfil en este momento.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Otros cursos (no habilitados)</h2>
        <p className="text-gray-600">Tu perfil actual no cumple los requisitos de estas ofertas.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {cursosRestringidos.length ? (
            cursosRestringidos.map(curso => renderCard(curso, true))
          ) : (
            <div className="md:col-span-3 text-center py-10 text-gray-500">
              ¡Excelente! No hay cursos restringidos para ti.
            </div>
          )}
        </div>
      </section>

      {modalCurso && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Confirmar inscripción</p>
              <h3 className="text-2xl font-bold text-gray-900">{modalCurso.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">{modalCurso.tipo} · {modalCurso.horas} horas</p>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-semibold">Público objetivo:</span> {modalCurso.publicoTexto}</p>
              {modalCurso.es_pagado
                ? <p><span className="font-semibold">Costo:</span> ${Number(modalCurso.costo || 0).toFixed(2)}</p>
                : <p className="font-semibold text-green-600">Este curso es gratuito.</p>}
              {modalCurso.prerequisito && (
                <p className="text-red-600 font-medium">
                  Requiere haber aprobado: {modalCurso.prerequisito_nombre || `Curso ${modalCurso.prerequisito}`}
                </p>
              )}
            </div>

            {modalCurso.es_pagado && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Selecciona el método de pago</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={metodosSeleccionados[modalCurso.id_curso] || 'transferencia'}
                  onChange={(e) =>
                    setMetodosSeleccionados(prev => ({ ...prev, [modalCurso.id_curso]: e.target.value }))
                  }
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmInscripcion}
                disabled={!!confirmingId}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {confirmingId ? 'Procesando...' : 'Confirmar inscripción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}