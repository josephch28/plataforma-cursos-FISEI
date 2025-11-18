// Frontend/src/modules/misCursos/MisCursosPage.jsx (CONTENIDO COMPLETO)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUpload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

// Función auxiliar para obtener la información de estado
const getStatusInfo = (estado, es_pagado) => {
  if (estado === 'aprobado') {
    return { text: 'Aprobado', color: 'text-green-700', icon: HiOutlineCheckCircle };
  }
  if (estado === 'pagado') {
    return { text: 'Pagado/Inscrito', color: 'text-green-600', icon: HiOutlineCheckCircle };
  }
  if (estado === 'pendiente' && es_pagado === 1) {
    return { text: 'Pago Pendiente', color: 'text-yellow-600', icon: HiOutlineClock };
  }
  if (estado === 'pendiente') {
    return { text: 'Revisión (Inscripción)', color: 'text-yellow-600', icon: HiOutlineClock };
  }
  if (estado === 'rechazado') {
    return { text: 'Rechazado', color: 'text-red-600', icon: HiOutlineXCircle };
  }
  return { text: 'Desconocido', color: 'text-gray-500', icon: HiOutlineClock };
};

export default function MisCursosPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            try {
                // Llama al nuevo endpoint del Backend
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
        return <div className="text-center py-8 text-red-500">Debes iniciar sesión para ver tus cursos.</div>;
    }

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Cargando tus cursos y responsabilidades...</div>;
    }

    const studentCourses = courses.filter(c => c.rol === 'estudiante');
    const instructorCourses = courses.filter(c => c.rol !== 'estudiante');

    const renderCourseCard = (course) => {
        // Lógica de visualización para cursos de estudiante
        if (course.rol === 'estudiante') {
            const { text, color, icon: StatusIcon } = getStatusInfo(course.estado, course.es_pagado);
            
            // Requisitos para mostrar el botón "Subir Pago":
            // 1. Es de pago (es_pagado = 1)
            // 2. El estado de la inscripción es 'pendiente'
            // 3. Existe un registro de pago (id_pago > 0)
            // 4. El pago aún NO está aprobado (pago_aprobado = 0)
            const isPagado = Boolean(Number(course.es_pagado));
            const requiresUpload = isPagado && course.estado === 'pendiente' && course.pago_aprobado === 0;

            return (
                <div key={course.id_inscripcion} className="p-4 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    
                    <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                        <h3 className="text-xl font-semibold text-gray-800">{course.curso_nombre}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                            <FaUserGraduate className="inline mr-1 w-4 h-4" />
                            Rol: Estudiante - Inscripción **#{course.id_inscripcion}**
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end space-y-2">
                        <div className="flex flex-col items-start sm:items-end text-sm text-gray-600">
                            {course.es_pagado === 1 && (
                                <>
                                    <span>Monto: <strong>${Number(course.monto_pago ?? course.costo ?? 0).toFixed(2)}</strong></span>
                                    {course.numero_orden && <span>Orden: <strong>{course.numero_orden}</strong></span>}
                                </>
                            )}
                            <span className={`text-md font-bold flex items-center ${color}`}>
                                <StatusIcon className="w-5 h-5 mr-1" />
                                {text}
                            </span>
                        </div>
                        
                        {isPagado && (
                            <Link 
                                to={`/pago/${course.id_inscripcion}/subir`}
                                className={`px-4 py-2 text-sm rounded-lg font-medium transition flex items-center whitespace-nowrap ${
                                  requiresUpload ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <HiOutlineUpload className="w-5 h-5 mr-1" />
                                {requiresUpload ? 'Ver orden / Subir pago' : 'Ver orden de pago'}
                            </Link>
                        )}
                    </div>
                </div>
            );
        }

        // Lógica de visualización para cursos de instructor/responsable
        return (
            <div key={course.id_curso} className="p-4 border rounded-lg shadow-sm bg-indigo-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-800">{course.curso_nombre}</h3>
                    <p className="text-sm text-indigo-700 flex items-center">
                        <FaChalkboardTeacher className="inline mr-1 w-4 h-4" />
                        Rol: <span className="font-medium capitalize">
                            {course.rol === 'responsable' 
                              ? 'Responsable Principal' 
                              : course.rol === 'docente_principal' // 🟢 Asegurarse que esta condición exista
                              ? 'Docente Principal'
                              : 'Encargado'}
                        </span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-2">
                Mis Cursos
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            )}
            
            {/* Cursos del Usuario como Estudiante */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-700">Cursos Inscritos ({studentCourses.length})</h2>
                {studentCourses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-white border rounded-lg">
                        Aún no estás inscrito en ningún curso. Visita el <Link to="/catalogo" className="text-blue-600 hover:underline">Catálogo</Link>.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {studentCourses.map(renderCourseCard)}
                    </div>
                )}
            </section>
            
            <hr className="border-gray-200" />

            {/* Cursos del Usuario como Profesor/Responsable */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-700">Cursos como Docente/Responsable ({instructorCourses.length})</h2>
                {instructorCourses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-white border rounded-lg">
                        No eres responsable ni encargado de ningún curso.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {instructorCourses.map(renderCourseCard)}
                    </div>
                )}
            </section>
        </div>
    );
}