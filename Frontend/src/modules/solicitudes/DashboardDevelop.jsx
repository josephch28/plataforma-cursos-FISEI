// src/modules/solicitudes/DashboardDevelop.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineExclamation } from 'react-icons/hi';

export default function DashboardDevelop() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [s, list] = await Promise.all([API.getSolicitudesStats(), API.listSolicitudes()]);
      setStats(s);
      // take the 5 most recent (backend orders by fecha_solicitud desc)
      setRecent((list || []).slice(0, 5));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard - Solicitudes de Cambio</h1>
        <Link
          to="/solicitudes/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nueva Solicitud
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.total || 0}</p>
            </div>
            <HiOutlineClipboardList className="text-5xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendientes || 0}</p>
            </div>
            <HiOutlineClock className="text-5xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Realizadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.realizadas || 0}</p>
            </div>
            <HiOutlineCheckCircle className="text-5xl text-green-500" />
          </div>
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por tipo de formulario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HiOutlineDocumentText className="mr-2" />
            Por Tipo de Formulario
          </h2>
          <div className="space-y-3">
            {stats?.porTipo?.map((item) => (
              <div key={item.tipo_formulario} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{item.tipo_formulario}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-4 mr-3">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${(item.total / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-800 font-semibold w-8 text-right">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por prioridad */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HiOutlineExclamation className="mr-2" />
            Por Prioridad
          </h2>
          <div className="space-y-3">
            {stats?.porPrioridad?.map((item) => {
              const colorMap = {
                alta: 'bg-red-600',
                media: 'bg-yellow-500',
                baja: 'bg-green-500'
              };
              const color = colorMap[item.prioridad?.toLowerCase()] || 'bg-gray-600';

              return (
                <div key={item.prioridad} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{item.prioridad}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-4 mr-3">
                      <div
                        className={`${color} h-4 rounded-full`}
                        style={{ width: `${(item.total / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-800 font-semibold w-8 text-right">{item.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Acceso rápido */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/solicitudes"
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <h3 className="font-bold text-blue-700">Gestión Completa</h3>
            <p className="text-gray-600 text-sm mt-1">Ver panel de aprobación y asignación.</p>
          </Link>
          <Link
            to="/solicitudes?estado=pendiente"
            className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition"
          >
            <h3 className="font-bold text-yellow-700">Pendientes de Aprobación</h3>
            <p className="text-gray-600 text-sm mt-1">Revisar solicitudes nuevas para asignar.</p>
          </Link>
        </div>
      </div>

      {/* Últimas solicitudes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Últimas Solicitudes</h2>
          <Link to="/solicitudes" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
        </div>

        {error ? (
          <div className="text-red-600">Error cargando solicitudes: {error}</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-500">No hay solicitudes registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.nombre_solicitante} {r.apellido_solicitante}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{r.prioridad}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{r.estado}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-sm text-blue-600">
                      <Link to={`/solicitudes/${r.id}/editar`} className="hover:underline">Editar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
