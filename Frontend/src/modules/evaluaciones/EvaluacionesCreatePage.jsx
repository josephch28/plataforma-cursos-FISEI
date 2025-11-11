// src/modules/evaluaciones/EvaluacionesCreatePage.jsx
import { useNavigate } from 'react-router-dom';
import FormEvaluacion from './FormEvaluacion';

export default function EvaluacionesCreatePage({ auth }) {
  const nav = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Crear evaluación</h1>
        <button
          onClick={() => nav('/evaluaciones')}
          className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
        >
          Cancelar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormEvaluacion initial={{}} auth={auth} onSaved={() => nav('/evaluaciones')} />
      </div>
    </div>
  );
}