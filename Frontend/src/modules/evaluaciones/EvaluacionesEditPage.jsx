// src/modules/evaluaciones/EvaluacionesEditPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';
import FormEvaluacion from './FormEvaluacion';
import Toast from '../../components/Toast';

export default function EvaluacionesEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getInscripcion(id);
        setEvaluacion(data);
        setLoading(false);
      } catch (e) {
        setToast({ show: true, message: 'Error al cargar evaluación', type: 'error' });
        setTimeout(() => nav('/evaluaciones'), 2000);
      }
    };
    load();
  }, [id, nav]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        Cargando...
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => { }} />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Editar Evaluación</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <FormEvaluacion initial={evaluacion || {}} onSaved={() => nav('/evaluaciones')} />
      </div>
    </div>
  );
}