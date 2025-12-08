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
const getStatusInfo = (estado, es_pagado) => {
    if (estado === 'aprobado') {
        return { text: 'Inscripción Aprobada', color: 'bg-green-100 text-green-700 border-green-200', icon: HiOutlineCheckCircle };
    }
    if (estado === 'pagado') {
        return { text: 'Pagado - Verificando', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: HiOutlineCheckCircle };
    }
    if (estado === 'pendiente' && es_pagado === 1) {
        return { text: 'Pago Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: HiOutlineCurrencyDollar };
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

    // Estado para la sección de Docencia
    const [activeTab, setActiveTab] = useState('activos'); // 'activos' | 'archivados'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'activo', 'inactivo', 'finalizado'

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
        const { text, color, icon: StatusIcon } = getStatusInfo(course.estado, course.es_pagado);
        const isPagado = Boolean(Number(course.es_pagado));
        const requiresUpload = isPagado && course.estado === 'pendiente' && course.pago_aprobado === 0;

        return (
            <div key={course.id_inscripcion} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                {/* Icon Column */}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {text}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
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
                    {isPagado && (
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
                    {/* Placeholder for future actions like "Ver Certificado" or "Ir al Curso" */}
                    {course.estado === 'aprobado' && (
                        <button className="w-full px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                            Ver Detalles
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderInstructorCard = (course) => {
        const { text, color, badgeColor } = getCourseStatusInfo(course.curso_estado, course.activo);

        return (
            <div key={course.id_curso} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${badgeColor}`}></div>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badgeColor.replace('bg-', 'bg-')}`}></div>
                            {text}
                        </span>
                    </div>
                    {/* Dropdown de acciones si fuera necesario, o link */}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {course.curso_nombre}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                        <FaChalkboardTeacher />
                        {course.rol === 'responsable' ? 'Responsable' : course.rol === 'docente_principal' ? 'Docente' : 'Encargado'}
                    </span>
                    {course.fecha_inicio && (
                        <span className="flex items-center gap-1">
                            <HiOutlineClock />
                            {new Date(course.fecha_inicio).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    {course.rol === 'docente_principal' ? (
                        <button
                            onClick={() => navigate(`/evaluaciones`, { state: { cursoId: course.id_curso } })}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Subir Notas &rarr;
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/cursos`, { state: { highlightedCursoId: course.id_curso } })} // Navegar a la lista gral o a detalle
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Gestionar Curso &rarr;
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6">
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
                {/* Sección Docencia (Prioridad si tiene cursos como docente) */}
                {(courses.some(c => c.rol !== 'estudiante') || user.rol !== 'estudiante') && (
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaChalkboardTeacher className="text-indigo-600" />
                                Docencia y Gestión
                            </h2>

                            {/* Filtros y Tabs */}
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
                    {/* Solo mostrar header si también se mostró la sección docente, para separar visualmente */}
                    {(courses.some(c => c.rol !== 'estudiante') || user.rol !== 'estudiante') && <hr className="border-gray-200 my-10" />}

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <HiOutlineAcademicCap className="text-blue-600" />
                            Aprendizaje
                        </h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">{studentCourses.length}</span>
                    </div>

                    {studentCourses.length === 0 ? (
                        // ... (Mismo contenido empty state)
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
        </div>
    );
}