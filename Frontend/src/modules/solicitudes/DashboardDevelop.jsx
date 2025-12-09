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
  const [developerFilter, setDeveloperFilter] = useState('');
  const [developers, setDevelopers] = useState([]);

  useEffect(() => {
    loadStats();
    loadDevelopers();
  }, [user, developerFilter]);

  const loadDevelopers = async () => {
    try {
      const devs = await API.listDevelopers();
      setDevelopers(devs);
    } catch (error) {
      console.error('Error al cargar desarrolladores:', error);
    }
  };

  const loadStats = async () => {
    try {
      const promises = [API.getSolicitudesStats(), API.listSolicitudes()];
      if (user?.cedula) {
        promises.push(API.listSolicitudes({ asignado_a: user.cedula }));
      }

      const [s, list, misAsignadas] = await Promise.all(promises);

      setStats(s);
      
      // Apply developer filter if selected
      let filteredList = list || [];
      if (developerFilter) {
        filteredList = filteredList.filter(sol => String(sol.asignado_a) === String(developerFilter));
      }
      
      setRecent(filteredList.slice(0, 5));
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

  // --- HELPERS PARA ESTILOS (MEJORA UI) ---
  const getPrioridadStyle = (prio) => {
    switch (prio?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-blue-100 text-blue-800';
      case 'realizado': return 'bg-purple-100 text-purple-800';
      case 'verificado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard - Solicitudes de Cambio</h1>
        {/* 🔥 SE ELIMINÓ EL BOTÓN "+ NUEVA SOLICITUD" AQUÍ PARA LIMPIAR LA UI */}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.total || 0}</p>
            </div>
            <HiOutlineClipboardList className="text-5xl text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendientes || 0}</p>
            </div>
            <HiOutlineClock className="text-5xl text-yellow-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Realizadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.realizadas || 0}</p>
            </div>
            <HiOutlineCheckCircle className="text-5xl text-green-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por tipo de formulario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HiOutlineDocumentText className="mr-2 text-blue-500" />
            Por Tipo de Formulario
          </h2>
          <div className="space-y-4">
            {stats?.porTipo?.map((item) => (
              <div key={item.tipo_formulario} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize font-medium">{item.tipo_formulario}</span>
                <div className="flex items-center flex-1 mx-4">
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(item.total / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-800 font-bold">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por prioridad */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HiOutlineExclamation className="mr-2 text-red-500" />
            Por Prioridad
          </h2>
          <div className="space-y-4">
            {stats?.porPrioridad?.map((item) => {
              const colorMap = { alta: 'bg-red-500', media: 'bg-yellow-500', baja: 'bg-green-500' };
              const color = colorMap[item.prioridad?.toLowerCase()] || 'bg-gray-500';

              return (
                <div key={item.prioridad} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize font-medium">{item.prioridad}</span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${color} h-2.5 rounded-full`}
                        style={{ width: `${(item.total / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-gray-800 font-bold">{item.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mis Asignaciones */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Mis Asignaciones</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{assigned.length} tareas</span>
        </div>
        
        {assigned.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tienes solicitudes asignadas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assigned.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{r.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{r.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadStyle(r.prioridad)}`}>
                            {r.prioridad}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoStyle(r.estado)}`}>
                            {r.estado}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedSolicitud(r)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
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
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Últimas Solicitudes (Global)</h2>
          <Link to="/solicitudes" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">Ver todas las solicitudes &rarr;</Link>
        </div>

        {/* Filter by Developer */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filtrar por quien realizó los cambios:</label>
            <select
              value={developerFilter}
              onChange={(e) => setDeveloperFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los desarrolladores</option>
              {developers.map((dev) => (
                <option key={dev.cedula} value={dev.cedula}>
                  {dev.nombre} {dev.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-red-600 bg-red-50">Error: {error}</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay actividad reciente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{r.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.nombre_solicitante} {r.apellido_solicitante}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadStyle(r.prioridad)}`}>
                            {r.prioridad}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoStyle(r.estado)}`}>
                            {r.estado}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedSolicitud(r)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
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

      {/* Modal de Detalles (Sin cambios lógicos, solo visuales si aplica) */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                    Solicitud #{selectedSolicitud.id}
                    </h3>
                    <p className="text-sm text-gray-500">Detalles completos del requerimiento</p>
                </div>
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <HiOutlineX className="text-xl" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Solicitante</label>
                    <p className="font-medium text-gray-900">{selectedSolicitud.nombre_solicitante} {selectedSolicitud.apellido_solicitante}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Fecha</label>
                    <p className="font-medium text-gray-900">{selectedSolicitud.fecha_solicitud ? new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Prioridad</label>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPrioridadStyle(selectedSolicitud.prioridad)}`}>
                      {selectedSolicitud.prioridad?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Estado</label>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getEstadoStyle(selectedSolicitud.estado)}`}>
                      {selectedSolicitud.estado?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Descripción</label>
                        <p className="bg-white border border-gray-200 p-3 rounded-lg text-gray-700 leading-relaxed shadow-sm">{selectedSolicitud.descripcion}</p>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Razón / Justificación</label>
                        <p className="bg-white border border-gray-200 p-3 rounded-lg text-gray-700 leading-relaxed shadow-sm">{selectedSolicitud.razon}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
                  <div>
                    <label className="font-bold text-gray-500 block">Contacto</label>
                    <p>{selectedSolicitud.contacto}</p>
                  </div>
                  <div>
                    <label className="font-bold text-gray-500 block">Tipo Formulario</label>
                    <p className="capitalize">{selectedSolicitud.tipo_formulario}</p>
                  </div>
                </div>

                {selectedSolicitud.tipo_formulario === 'experto' && (
                  <div className="bg-blue-50 p-4 rounded-lg mt-2 text-sm border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">Detalles Técnicos</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <p><strong>Categoría:</strong> <br/>{selectedSolicitud.categoria || '-'}</p>
                        <p><strong>Impacto:</strong> <br/>{selectedSolicitud.impacto || '-'}</p>
                        <p><strong>Entornos:</strong> <br/>{selectedSolicitud.entornos || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSolicitud(null)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
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