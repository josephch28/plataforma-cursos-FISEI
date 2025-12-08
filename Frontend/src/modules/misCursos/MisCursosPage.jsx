// Frontend/src/modules/misCursos/MisCursosPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineUpload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock,
    HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineCurrencyDollar
} from 'react-icons/hi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

// Función auxiliar para obtener la información de estado
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

export default function MisCursosPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
    const instructorCourses = courses.filter(c => c.rol !== 'estudiante');

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

    const renderInstructorCard = (course) => (
        <div key={course.id_curso} className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <h3 className="text-xl font-bold text-gray-900">{course.curso_nombre}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                        {course.rol === 'responsable' ? 'Responsable' : course.rol === 'docente_principal' ? 'Docente' : 'Encargado'}
                    </span>
                    <span className="text-sm text-gray-500">Gestión Académica</span>
                </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full">
                <FaChalkboardTeacher className="w-6 h-6" />
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mis Cursos</h1>
                <p className="text-lg text-gray-500 mt-2">Gestiona tus inscripciones y actividades académicas.</p>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <HiOutlineXCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="space-y-12">
                {/* Sección Estudiante */}
                <section>
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

                {/* Sección Docente (Solo si tiene cursos) */}
                {instructorCourses.length > 0 && (
                    <section>
                        <hr className="border-gray-200 mb-10" />
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaChalkboardTeacher className="text-indigo-600" />
                                Docencia y Gestión
                            </h2>
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">{instructorCourses.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {instructorCourses.map(renderInstructorCard)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}