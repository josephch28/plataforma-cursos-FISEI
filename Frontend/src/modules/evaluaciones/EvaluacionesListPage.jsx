import React, { useState, useEffect, useMemo } from 'react';
import { API } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import TablaEvaluaciones from './TablaEvaluaciones';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineDocumentReport,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi';
import { FaChalkboardTeacher } from 'react-icons/fa';

export default function EvaluacionesListPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // Mode: 'list' (Courses) or 'details' (Students)
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Data
  const [courses, setCourses] = useState([]);
  const [allInscripciones, setAllInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bulk Edit State
  const [editedData, setEditedData] = useState({});
  const [isEditing, setIsEditing] = useState(false); // Default to true when entering course?
  const [feedback, setFeedback] = useState(null);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Location State (Navigation from MisCursos)
  useEffect(() => {
    if (location.state?.cursoId && courses.length > 0) {
      const target = courses.find(c => c.id_curso === Number(location.state.cursoId));
      if (target) {
        selectCourse(target);
        // Clear state to avoid sticky navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, courses]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User's Teaching Courses
      // If admin, maybe fetch all courses? For now, admin sees "All Inscriptions".
      // But user asked for a hierarchical view.
      // Let's assume Admin also wants to select a course.

      let myCourses = [];
      if (user?.rol === 'admin') {
        // Admin might want all active courses. 
        const allC = await API.listCursos({ pag: 1, size: 100 }); // Pagination limit?
        myCourses = Array.isArray(allC) ? allC : [];
      } else {
        const userCs = await API.getUserCourses();
        // Filter: only where I am NOT just a student
        myCourses = userCs.filter(c => c.rol !== 'estudiante');
      }
      setCourses(myCourses);

      // 2. Fetch All Inscriptions (we filter client-side for now)
      const isAdmin = user?.rol === 'admin';
      const inscr = await API.listInscripciones(isAdmin ? {} : { misCursos: true });
      setAllInscripciones(inscr);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setIsEditing(true); // Auto-enable edit mode
    setEditedData({});
  };

  const clearSelection = () => {
    setSelectedCourse(null);
    setIsEditing(false);
    setEditedData({});
  };

  // Filtered Rows for Selected Course
  const courseRows = useMemo(() => {
    if (!selectedCourse) return [];
    return allInscripciones.filter(r => r.id_curso === selectedCourse.id_curso);
  }, [selectedCourse, allInscripciones]);

  // --- Handlers ---

  const handleRowChange = (id, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = courseRows.map(r => {
        const changes = editedData[r.id_inscripcion] || {};

        const notaVal = changes.nota_final !== undefined ? changes.nota_final : r.nota_final;
        const asistenciaVal = changes.asistencia !== undefined ? changes.asistencia : r.asistencia;

        return {
          id_inscripcion: r.id_inscripcion,
          // User Requirement: Blank fields = 0
          nota_final: notaVal === '' || notaVal === null || notaVal === undefined ? 0 : notaVal,
          asistencia: asistenciaVal === '' || asistenciaVal === null || asistenciaVal === undefined ? 0 : asistenciaVal
        };
      });

      if (payload.length === 0) {
        setFeedback({
          type: 'error',
          title: 'Sin cambios',
          message: 'No hay cambios para guardar.'
        });
        return;
      }

      await API.batchUpdateInscripciones(payload);

      // Refresh Data
      const isAdmin = user?.rol === 'admin';
      const newData = await API.listInscripciones(isAdmin ? {} : { misCursos: true });
      setAllInscripciones(newData);

      setEditedData({});
      setFeedback({
        type: 'success',
        title: 'Guardado',
        message: 'Notas guardadas exitosamente.'
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Error al guardar: ' + (err.message || 'Error desconocido')
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  if (!selectedCourse) {
    // VIEW 1: Course Selection
    return (
      <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6">
        <div className="mb-8 py-6 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HiOutlineClipboardList className="text-blue-600" />
            Evaluaciones y Calificaciones
          </h1>
          <p className="text-gray-500 mt-2">
            Seleccione un curso para gestionar las notas y asistencia de los estudiantes.
          </p>
        </div>

        {loading && courses.length === 0 && <div className="text-center py-10">Cargando cursos...</div>}

        {!loading && courses.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No tienes cursos asignados para calificar.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div
              key={c.id_curso}
              onClick={() => selectCourse(c)}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaChalkboardTeacher className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.activo ? 'En Curso' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {c.curso_nombre || c.nombre}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {c.descripcion || 'Sin descripción'}
                </p>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                <span className="text-xs font-medium text-gray-500">
                  Rol: <span className="uppercase">{c.rol || 'Admin'}</span>
                </span>
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                  Gestionar Notas <HiOutlineArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VIEW 2: Student List (Bulk Edit)
  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-6">
        <div>
          <button
            onClick={clearSelection}
            className="mb-2 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            <HiOutlineArrowLeft /> Volver a Cursos
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {selectedCourse.curso_nombre || selectedCourse.nombre}
          </h1>
          <p className="text-sm text-gray-500">
            {courseRows.length} Estudiante(s) inscritos
          </p>
        </div>

        <div className="flex gap-2">
          {selectedCourse.rol !== 'responsable' && (
            <button
              onClick={handleSave}
              disabled={loading || (selectedCourse.curso_estado === 'finalizado' || selectedCourse.estado === 'finalizado')}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineDocumentReport className="w-5 h-5 mr-2" />
              Guardar Todo en Bloque
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Reuse Table */}
        <TablaEvaluaciones
          rows={courseRows}
          loading={loading}
          courseStatus={selectedCourse.curso_estado || selectedCourse.estado}
          onEdit={() => { }} // Disabled individual edit override
          onDelete={undefined} // No delete here
          isEditing={true} // ALWAYS EDITING
          editedData={editedData}
          onRowChange={handleRowChange}
        />
      </div>


      {/* FEEDBACK MODAL */}
      {
        feedback && (
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
        )
      }
    </div >
  );
}
