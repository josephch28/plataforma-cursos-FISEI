// src/modules/evaluaciones/EvaluacionesEditPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';
import FormEvaluacion from './FormEvaluacion';

export default function EvaluacionesEditPage({ auth }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getInscripcion(id);
        setEvaluacion(data);
      } catch {
        alert('Error al cargar evaluación');
        nav('/evaluaciones');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, nav]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Editar evaluación</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormEvaluacion initial={evaluacion || {}} auth={auth} onSaved={() => nav('/evaluaciones')} />
      </div>
    </div>
  );
}