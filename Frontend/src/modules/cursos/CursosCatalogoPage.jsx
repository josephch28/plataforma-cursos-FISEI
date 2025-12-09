// Frontend/src/modules/cursos/CursosCatalogoPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineSearch, HiOutlineFilter, HiOutlineBookOpen,
  HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCurrencyDollar,
  HiOutlineCheckCircle, HiOutlineXCircle
} from 'react-icons/hi';

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

  const [q, setQ] = useState('');
  const [horasFiltro, setHorasFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [publicoFiltro, setPublicoFiltro] = useState('');

  const buildParams = () => {
    const params = { q, inactivo: false };
    if (tipoFiltro) params.tipo = tipoFiltro;
    if (publicoFiltro) params.publico_objetivo = publicoFiltro;

    if (horasFiltro === 'lt10') params.horas_max = 9;
    else if (horasFiltro === 'b10_20') { params.horas_min = 10; params.horas_max = 20; }
    else if (horasFiltro === 'b20_30') { params.horas_min = 20; params.horas_max = 30; }
    else if (horasFiltro === 'gt30') params.horas_min = 31;

    return params;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [cursosData, cursosUsuario] = await Promise.all([
        API.listCursos(params).catch(() => []),
        API.getUserCourses().catch(() => [])
      ]);

      setCursos(cursosData);
      const inscritos = (cursosUsuario || [])
        .filter(c => c.rol === 'estudiante')
        .map(c => c.id_curso);
      setMisCursosEstudiante(inscritos);

    } catch (e) {
      console.error('Error loading catalog data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [q, horasFiltro, tipoFiltro, publicoFiltro, user]);

  const openModal = (curso) => {
    if (user.rol !== 'usuario' && user.rol !== 'estudiante') {
      setFeedback({
        type: 'error',
        title: 'Acceso restringido',
        message: 'Solo los estudiantes pueden inscribirse desde el catálogo.'
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

      let datesOk = true;
      let dateReason = null;
      const now = new Date();

      if (curso.fecha_inicio_inscripcion) {
        const start = new Date(curso.fecha_inicio_inscripcion);
        if (now < start) {
          datesOk = false;
          dateReason = `Comienza el ${start.toLocaleDateString()}`;
        }
      }

      if (datesOk && curso.fecha_fin_inscripcion) {
        const end = new Date(curso.fecha_fin_inscripcion);
        if (now > end) {
          datesOk = false;
          dateReason = `Cerrado el ${end.toLocaleDateString()}`;
        }
      }

      const canEnroll = usuarioCumplePublico && cumplePrerrequisito && !esResponsable && !esDocente && !esEncargado && datesOk;

      const data = {
        ...curso,
        publicoTexto,
        canEnroll,
        razonBloqueo: esResponsable || esDocente || esEncargado
          ? 'Ya eres docente/responsable'
          : !usuarioCumplePublico
            ? 'No cumples el perfil'
            : !cumplePrerrequisito
              ? 'Prerrequisito faltante'
              : !datesOk
                ? dateReason
                : null
      };

      if (inscritosIds.has(curso.id_curso)) return;

      if (data.canEnroll) disponibles.push(data);
      else restringidos.push(data);
    });

    return { cursosDisponibles: disponibles, cursosRestringidos: restringidos };
  }, [cursos, user, misCursosEstudiante]);

  const renderCard = (curso, disabled = false) => (
    <div
      key={curso.id_curso}
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col ${disabled ? 'opacity-75 grayscale-[0.5]' : ''
        }`}
    >
      {/* Cover Image Placeholder with Gradient */}
      <div className={`h-32 bg-gradient-to-r flex items-center justify-center relative overflow-hidden ${disabled ? 'from-gray-200 to-gray-300' : 'from-blue-600 to-indigo-600'
        }`}>
        <div className="absolute inset-0 bg-white/10 pattern-dots"></div>
        <HiOutlineAcademicCap className="w-16 h-16 text-white/20 transform group-hover:scale-110 transition-transform duration-500" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {curso.es_pagado ? (
            <span className="bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <HiOutlineCurrencyDollar className="w-3 h-3" />
              ${Number(curso.costo || 0).toFixed(2)}
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Gratuito
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${curso.tipo === 'Curso' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                curso.tipo === 'Taller' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
              {curso.tipo}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <HiOutlineCalendar className="w-3 h-3" />
              {curso.horas} hrs
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">
            {curso.nombre}
          </h2>
          <p className="text-gray-500 text-sm line-clamp-3 mb-4">
            {curso.descripcion}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <div className="mt-0.5 min-w-[16px]"><HiOutlineFilter className="w-4 h-4 text-gray-400" /></div>
            <span>Dirigido a: <span className="font-medium text-gray-700">{curso.publicoTexto}</span></span>
          </div>

          {curso.prerequisito && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              <div className="mt-0.5 min-w-[16px]"><HiOutlineBookOpen className="w-4 h-4" /></div>
              <span>Requiere: <span className="font-semibold">{curso.prerequisito_nombre || `Curso ${curso.prerequisito}`}</span></span>
            </div>
          )}

          {disabled && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              <div className="mt-0.5 min-w-[16px]"><HiOutlineXCircle className="w-4 h-4" /></div>
              <span className="font-semibold">{curso.razonBloqueo || 'No disponible para tu perfil'}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          {curso.es_pagado && !disabled && (
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1 ml-1">Método de pago</label>
              <select
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                value={metodosSeleccionados[curso.id_curso] || 'transferencia'}
                onChange={e => setMetodosSeleccionados(prev => ({ ...prev, [curso.id_curso]: e.target.value }))}
              >
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="deposito">Depósito Bancario</option>
              </select>
            </div>
          )}

          <button
            disabled={disabled}
            onClick={() => openModal(curso)}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-0.5'
              }`}
          >
            {disabled ? 'No Disponible' : 'Inscribirse Ahora'}
            {!disabled && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-blue-900 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Catálogo de Cursos</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
            Explora nuestra oferta académica y potencia tu carrera profesional con cursos, talleres y webinars diseñados para ti.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`mb-8 mx-auto max-w-4xl rounded-xl p-4 border flex items-start gap-4 shadow-sm ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          <div className={`p-2 rounded-full shrink-0 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {feedback.type === 'success' ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-lg">{feedback.title}</h3>
            <p className="mb-3 text-sm opacity-90">{feedback.message}</p>
            {feedback.actions && (
              <div className="flex gap-3">
                {feedback.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="bg-white/50 hover:bg-white border border-transparent px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <HiOutlineFilter className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg">Filtros</h2>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Duración</label>
                <select
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={horasFiltro}
                  onChange={(e) => setHorasFiltro(e.target.value)}
                >
                  <option value="">Cualquier duración</option>
                  <option value="lt10">&lt; 10 horas</option>
                  <option value="b10_20">10 - 20 horas</option>
                  <option value="b20_30">20 - 30 horas</option>
                  <option value="gt30">&gt; 30 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de Evento</label>
                <div className="space-y-2">
                  {['', 'Curso', 'Webinar', 'Taller'].map(opt => (
                    <label key={opt} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="tipo"
                        className="hidden"
                        checked={tipoFiltro === opt}
                        onChange={() => setTipoFiltro(opt)}
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 transition-colors ${tipoFiltro === opt ? 'border-blue-600 bg-white' : 'border-gray-300 bg-gray-50 group-hover:border-blue-400'
                        }`}>
                        {tipoFiltro === opt && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                      </div>
                      <span className={`text-sm ${tipoFiltro === opt ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                        {opt || 'Todos'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dirigido a</label>
                <select
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={publicoFiltro}
                  onChange={(e) => setPublicoFiltro(e.target.value)}
                >
                  <option value="">Todo público</option>
                  <option value="Estudiantes UTA">Estudiantes UTA</option>
                  <option value="Personal UTA">Personal UTA</option>
                  <option value="Público General">Público General</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Cargando cursos disponibles...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Disponibles para ti</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{cursosDisponibles.length} cursos</span>
                </div>

                {cursosDisponibles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cursosDisponibles.map(c => renderCard(c))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No encontramos cursos disponibles con estos filtros.</p>
                    <button onClick={() => { setQ(''); setHorasFiltro(''); setTipoFiltro(''); setPublicoFiltro(''); }} className="text-blue-600 font-semibold hover:underline">
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </section>

              {cursosRestringidos.length > 0 && (
                <section className="opacity-80">
                  <div className="flex items-center gap-3 mb-6 border-t border-gray-200 pt-8">
                    <h2 className="text-xl font-bold text-gray-600">Otros cursos (Restringidos)</h2>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{cursosRestringidos.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cursosRestringidos.map(c => renderCard(c, true))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Confirmar Inscripción</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-1">{modalCurso.nombre}</h4>
                <p className="text-sm text-blue-600 font-medium">{modalCurso.tipo} | {modalCurso.horas} horas</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costo:</span>
                  <span className={`font-bold ${modalCurso.es_pagado ? 'text-gray-900' : 'text-green-600'}`}>
                    {modalCurso.es_pagado ? `$${Number(modalCurso.costo).toFixed(2)}` : 'GRATUITO'}
                  </span>
                </div>
                {modalCurso.es_pagado && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Método de pago:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {metodosSeleccionados[modalCurso.id_curso] || 'transferencia'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Público:</span>
                  <span className="font-medium text-gray-900">{modalCurso.publicoTexto}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mb-6">
                ¿Estás seguro que deseas inscribirte en este evento académico?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmInscripcion}
                  disabled={!!confirmingId}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                  {confirmingId ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}