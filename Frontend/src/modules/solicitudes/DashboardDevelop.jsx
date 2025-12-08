// src/modules/solicitudes/DashboardDevelop.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';

export default function DashboardDevelop() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [error, setError] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const promises = [API.getSolicitudesStats(), API.listSolicitudes()];
      if (user?.cedula) {
        promises.push(API.listSolicitudes({ asignado_a: user.cedula }));
      }

      const [s, list, misAsignadas] = await Promise.all(promises);

      setStats(s);
      // take the 5 most recent
      setRecent((list || []).slice(0, 5));
      if (misAsignadas) {
        setAssigned(misAsignadas);
      }
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

      {/* Mis Asignaciones */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Asignaciones</h2>
        {assigned.length === 0 ? (
          <p className="text-gray-500">No tienes solicitudes asignadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assigned.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-xs">{r.descripcion}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{r.prioridad}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{r.estado}</td>
                    <td className="px-4 py-2 text-sm text-blue-600">
                      <button
                        onClick={() => setSelectedSolicitud(r)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimas solicitudes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Últimas Solicitudes (General)</h2>
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
                      <button
                        onClick={() => setSelectedSolicitud(r)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Solicitud #{selectedSolicitud.id}
                </h3>
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <HiOutlineX className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Solicitante</label>
                    <p>{selectedSolicitud.nombre_solicitante} {selectedSolicitud.apellido_solicitante}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Fecha</label>
                    <p>{selectedSolicitud.fecha_solicitud ? new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Prioridad</label>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedSolicitud.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                      selectedSolicitud.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {selectedSolicitud.prioridad?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Estado</label>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {selectedSolicitud.estado?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <hr />

                <div>
                  <label className="text-sm font-bold text-gray-500 block">Descripción</label>
                  <p className="bg-gray-50 p-3 rounded mt-1">{selectedSolicitud.descripcion}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-500 block">Razón / Justificación</label>
                  <p className="bg-gray-50 p-3 rounded mt-1">{selectedSolicitud.razon}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Contacto</label>
                    <p>{selectedSolicitud.contacto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 block">Tipo Formulario</label>
                    <p className="capitalize">{selectedSolicitud.tipo_formulario}</p>
                  </div>
                </div>

                {selectedSolicitud.tipo_formulario === 'experto' && (
                  <div className="bg-gray-50 p-3 rounded mt-2 text-sm">
                    <p><strong>Categoría:</strong> {selectedSolicitud.categoria || '-'}</p>
                    <p><strong>Impacto:</strong> {selectedSolicitud.impacto || '-'}</p>
                    <p><strong>Entornos:</strong> {selectedSolicitud.entornos || '-'}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
