import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function SolicitudesListPage({ auth }) {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroTipoCambio, setFiltroTipoCambio] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/solicitudes');
      if (res.ok) {
        setSolicitudes(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtradas = solicitudes.filter(s => {
    // Estado
    if (filtroEstado && s.estado !== filtroEstado) return false;
    // Prioridad
    if (filtroPrioridad && s.prioridad !== filtroPrioridad) return false;
    // Tipo de cambio (solo aplica a expertos)
    if (filtroTipoCambio) {
      const tc = s.tipo_cambio || '';
      if (tc !== filtroTipoCambio) return false;
    }
    // Nombre solicitante (búsqueda parcial, case-insensitive)
    if (filtroNombre) {
      const full = ((s.nombre_solicitante || '') + ' ' + (s.apellido_solicitante || '')).toLowerCase();
      if (!full.includes(filtroNombre.toLowerCase())) return false;
    }
    // Rango de fechas (fecha_solicitud)
    if (filtroFechaDesde) {
      if (!s.fecha_solicitud || new Date(s.fecha_solicitud) < new Date(filtroFechaDesde)) return false;
    }
    if (filtroFechaHasta) {
      if (!s.fecha_solicitud || new Date(s.fecha_solicitud) > new Date(filtroFechaHasta)) return false;
    }
    return true;
  });

  const deleteSolicitud = async (id) => {
    if (window.confirm('¿Eliminar esta solicitud?')) {
      try {
        await fetch(`/api/solicitudes/${id}`, { method: 'DELETE' });
        await load();
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const updateStatus = async (id, nuevoEstado) => {
    try {
      await fetch(`/api/solicitudes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      await load();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Solicitudes de Cambio</h1>
        <button
          onClick={() => navigate('/solicitudes/nueva')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="realizado">Realizado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Prioridad</label>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Tipo de Cambio</label>
          <select
            value={filtroTipoCambio}
            onChange={(e) => setFiltroTipoCambio(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="rutinario">Rutinario</option>
            <option value="estandar">Estándar</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre solicitante</label>
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            placeholder="Nombre o apellido"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
          <input
            type="date"
            value={filtroFechaDesde}
            onChange={(e) => setFiltroFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
          <input
            type="date"
            value={filtroFechaHasta}
            onChange={(e) => setFiltroFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtradas.map((sol) => (
              <tr key={sol.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{sol.nombre_solicitante} {sol.apellido_solicitante}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{sol.tipo_formulario}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sol.prioridad === 'crítica' ? 'bg-red-100 text-red-800' :
                    sol.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                    sol.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {sol.prioridad}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={sol.estado || 'pendiente'}
                    onChange={(e) => updateStatus(sol.id, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="realizado">Realizado</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{sol.fecha_solicitud}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/solicitudes/${sol.id}`)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => navigate(`/solicitudes/${sol.id}/editar`)}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteSolicitud(sol.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!filtradas.length && !loading && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500 col-span-6">Sin solicitudes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

