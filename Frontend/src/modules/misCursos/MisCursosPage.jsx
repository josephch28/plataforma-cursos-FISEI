// Frontend/src/modules/misCursos/MisCursosPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineUpload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock,
    HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineCurrencyDollar,
    HiOutlineFilter
} from 'react-icons/hi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

// Función auxiliar para obtener la información de estado (Inscripción)
const getStatusInfo = (estado, es_pagado, hasOrder) => {
    if (estado === 'aprobado') {
        return { text: 'Inscripción Aprobada', color: 'bg-green-100 text-green-700 border-green-200', icon: HiOutlineCheckCircle };
    }
    if (estado === 'pagado') {
        return { text: 'Pagado - Verificando', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: HiOutlineCheckCircle };
    }
    // Si es pagado, esta pendiente, pero NO tiene orden de pago generada -> Es porque está validando requisitos
    if (estado === 'pendiente' && es_pagado === 1 && !hasOrder) {
        return { text: 'Validando Requisitos', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: HiOutlineClock };
    }
    if (estado === 'pendiente' && es_pagado === 1) {
        return { text: 'Pago Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: HiOutlineCurrencyDollar };
    }
    if (estado === 'pendiente') {
        return { text: 'En Revisión', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HiOutlineClock };
    }
    if (estado === 'pendiente') {
        return { text: 'En Revisión', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HiOutlineClock };
    }
    if (estado === 'rechazado') {
        return { text: 'Rechazado', color: 'bg-red-100 text-red-700 border-red-200', icon: HiOutlineXCircle };
    }
    return { text: 'Desconocido', color: 'bg-gray-100 text-gray-500', icon: HiOutlineClock };
};

// Función auxiliar para obtener la información de estado (Responsable)
const getCourseStatusInfo = (estado, _activo) => {
    // activo (verde), inactivo (rojo), finalizado (amarillo)
    if (estado === 'finalizado') {
        return { text: 'Finalizado', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', badgeColor: 'bg-yellow-500' };
    }
    if (estado === 'activo') {
        return { text: 'Activo', color: 'bg-green-50 text-green-700 border-green-200', badgeColor: 'bg-green-500' };
    }
    // Asumimos 'creado' o 'borrador' como 'Inactivo' (por completar info)
    return { text: 'Inactivo', color: 'bg-red-50 text-red-700 border-red-200', badgeColor: 'bg-red-500' };
};

export default function MisCursosPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);

    // Estado para la sección de Docencia
    const [activeTab, setActiveTab] = useState('activos'); // 'activos' | 'archivados'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'activo', 'inactivo', 'finalizado'

    // Correction Modal State
    const [correctionModal, setCorrectionModal] = useState(null); // { curso, docs: [] }
    const [uploadingCorrection, setUploadingCorrection] = useState(false);

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            try {
                const data = await API.getUserCourses();
                setCourses(data);
                setError('');
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error al cargar tus cursos.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadCourses();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-red-500 text-xl font-semibold mb-4">Sesión no iniciada</div>
                <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Ir al Login</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p>Cargando tu perfil académico...</p>
            </div>
        );
    }

    const studentCourses = courses.filter(c => c.rol === 'estudiante');
    let instructorCourses = courses.filter(c => c.rol !== 'estudiante');

    // --- Lógica de Filtrado y Ordenamiento para Docentes ---

    // 1. Filtrar por Tab
    instructorCourses = instructorCourses.filter(c => {
        if (activeTab === 'archivados') {
            return c.curso_estado === 'finalizado'; // Simplificación: Archivados = Finalizados
        } else {
            // Activos/Todos = Excluye finalizados (o inactivos si así se desea, pero 'Todos' suele implicar no archivados)
            return c.curso_estado !== 'finalizado';
        }
    });

    // 2. Filtrar por Dropdown (statusFilter)
    if (statusFilter !== 'all') {
        instructorCourses = instructorCourses.filter(c => {
            if (statusFilter === 'inactivo') return ['creado', 'borrador'].includes(c.curso_estado);
            return c.curso_estado === statusFilter;
        });
    }

    // 3. Ordenar Cronológicamente (Recientes primero)
    // Usamos id_curso como proxy de tiempo si fecha_inicio no está disponible o es igual
    instructorCourses.sort((a, b) => {
        const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
        const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
        return dateB - dateA || b.id_curso - a.id_curso;
    });


    const renderStudentCard = (course) => {
        const { text, color, icon: StatusIcon } = getStatusInfo(course.estado, course.es_pagado, course.numero_orden);
        const isPagado = Boolean(Number(course.es_pagado));

        // Check for rejected docs
        const hasRejectedDocs = !!course.rejected_docs;

        const requiresUpload = isPagado && course.estado === 'pendiente' && course.pago_aprobado === 0;

        return (
            <div key={course.id_inscripcion} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                {/* ... (Icon Column) ... */}
                <div className="hidden md:flex flex-col items-center justify-center w-24 bg-blue-50 rounded-lg p-2 text-blue-600">
                    <HiOutlineBookOpen className="w-10 h-10" />
                </div>

                {/* Content Column */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{course.curso_nombre}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <FaUserGraduate className="text-gray-400" />
                                <span>Inscripción #{course.id_inscripcion}</span>
                            </p>
                        </div>
                        {hasRejectedDocs ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit bg-red-100 text-red-700 border-red-200">
                                <HiOutlineXCircle className="w-4 h-4" />
                                Documentos Rechazados
                            </span>
                        ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {text}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
                        {/* ... (existing grids) ... */}
                        {isPagado && (
                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="block text-gray-500 text-xs">Monto</span>
                                <span className="font-semibold text-gray-900">${Number(course.monto_pago ?? course.costo ?? 0).toFixed(2)}</span>
                            </div>
                        )}
                        {course.numero_orden && (
                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="block text-gray-500 text-xs">Orden #</span>
                                <span className="font-semibold text-gray-900">{course.numero_orden}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 gap-3 min-w-[200px]">
                    {hasRejectedDocs && (
                        <button
                            onClick={() => handleOpenCorrection(course)}
                            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                        >
                            <HiOutlineUpload />
                            Corregir Documentos
                        </button>
                    )}

                    {!hasRejectedDocs && isPagado && course.estado !== 'pagado' && (
                        <Link
                            to={`/pago/${course.id_inscripcion}/subir`}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${requiresUpload
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <HiOutlineUpload className={requiresUpload ? 'animate-bounce' : ''} />
                            {requiresUpload ? 'Subir Comprobante' : 'Ver Comprobante'}
                        </Link>
                    )}
                    {/* ... (other buttons) ... */}
                    {course.estado === 'aprobado' && (
                        <button className="w-full px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                            Ver Detalles
                        </button>
                    )}
                </div>
                {/* FEEDBACK MODAL */}
                {feedback && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border-l-4 ${feedback.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full shrink-0 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {feedback.type === 'success' ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feedback.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{feedback.message}</p>
                                    <button
                                        onClick={() => {
                                            setFeedback(null);
                                            if (feedback.onClose) feedback.onClose();
                                        }}
                                        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
                                    >
                                        Entendido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };



    const renderInstructorCard = (course) => {
        const { text, color, badgeColor } = getCourseStatusInfo(course.curso_estado, course.activo);

        return (
            <div key={course.id_curso} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-all hover:shadow-md h-full">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg bg-indigo-50 text-indigo-600`}>
                            <FaChalkboardTeacher className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                            {text}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.nombre}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.descripcion}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-semibold text-gray-700">Inicio</span>
                            {course.fecha_inicio ? new Date(course.fecha_inicio).toLocaleDateString() : 'Por definir'}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-semibold text-gray-700">Costo</span>
                            {course.costo > 0 ? `$${course.costo}` : 'Gratis'}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 mt-auto">
                    <Link
                        to={`/cursos/${course.id_curso}/gestion`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                        Gestionar Curso
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6">
            {/* ... (Header, Error) ... */}
            <header className="mb-10 py-6 border-b border-gray-100">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mis Cursos</h1>
                <p className="text-lg text-gray-500 mt-2">Gestiona tus inscripciones y actividades académicas.</p>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <HiOutlineXCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="space-y-12">
                {/* ... (Sections) ... */}
                {(courses.some(c => c.rol !== 'estudiante') || user.rol !== 'estudiante') && (
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaChalkboardTeacher className="text-indigo-600" />
                                Docencia y Gestión
                            </h2>
                            {/* ... (Filters) ... */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                                    <button
                                        onClick={() => setActiveTab('activos')}
                                        className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'activos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Activos/Todos
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('archivados')}
                                        className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'archivados' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Archivados
                                    </button>
                                </div>

                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <HiOutlineFilter className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {instructorCourses.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No se encontraron cursos en esta sección.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {instructorCourses.map(renderInstructorCard)}
                            </div>
                        )}
                    </section>
                )}

                {/* Sección Estudiante */}
                <section>
                    {(courses.some(c => c.rol !== 'estudiante') || user.rol !== 'estudiante') && <hr className="border-gray-200 my-10" />}

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <HiOutlineAcademicCap className="text-blue-600" />
                            Aprendizaje
                        </h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">{studentCourses.length}</span>
                    </div>

                    {studentCourses.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <HiOutlineBookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No estás inscrito en cursos</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Explora nuestro catálogo para encontrar cursos, talleres y webinars que impulsen tu carrera.</p>
                            <Link to="/catalogo" className="nav-link inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1">
                                Explorar Catálogo
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {studentCourses.map(renderStudentCard)}
                        </div>
                    )}
                </section>
            </div>

            {/* CORRECTION MODAL */}
            {correctionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                            <HiOutlineXCircle /> Corrección de Documentos
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Los siguientes documentos para <strong>{correctionModal.curso.curso_nombre}</strong> fueron rechazados. Por favor, súbelos nuevamente.
                        </p>

                        <ul className="space-y-3 mb-6">
                            {correctionModal.docs.map(docName => (
                                <li key={docName} className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-red-800 capitalize">{docName}</span>
                                    </div>
                                    <input
                                        type="file"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer"
                                        onChange={(e) => handleUploadCorrection(docName, e.target.files[0])}
                                        disabled={uploadingCorrection}
                                    />
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setCorrectionModal(null)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEEDBACK MODAL */}
            {feedback && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border-l-4 ${feedback.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full shrink-0 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {feedback.type === 'success' ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{feedback.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{feedback.message}</p>
                                <button
                                    onClick={() => {
                                        setFeedback(null);
                                        if (feedback.onClose) feedback.onClose();
                                    }}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}