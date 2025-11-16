import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FormularioSolicitud from './FormularioSolicitud';
import API from '../../services/api';

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/solicitudes/${id}`);
        if (res.ok) {
          setSolicitud(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!solicitud) return <div>Solicitud no encontrada</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/solicitudes')}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
      >
        ← Volver
      </button>
      <FormularioSolicitud initialData={solicitud} onSubmit={() => navigate('/solicitudes')} />
    </div>
  );
}

