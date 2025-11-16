import { useNavigate } from 'react-router-dom';
import FormularioSolicitud from './FormularioSolicitud';

export default function SolicitudCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/solicitudes')}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
      >
        ← Volver
      </button>
      <FormularioSolicitud onSubmit={() => navigate('/solicitudes')} />
    </div>
  );
}

