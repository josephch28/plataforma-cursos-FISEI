// src/modules/solicitudes/SolicitudesListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineFilter, HiOutlineCheck, HiOutlineX, HiOutlineUserAdd, HiOutlinePlay } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

export default function SolicitudesListPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    q: '',
    tipo_formulario: '',
    prioridad: '',
    estado: '',
    encargado: '',
    tipo_cambio: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Workflow Solicitudes
  const [activeTab, setActiveTab] = useState('pendientes'); // Para Comité: 'pendientes' | 'realizadas'

  // Modal de Asignación
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState('');

  // Cargar datos
  useEffect(() => {
    loadSolicitudes();
  }, [filters, activeTab, user]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      let currentFilters = { ...filters };

      // Lógica por roles
      if (user?.rol === 'comite') {
        if (activeTab === 'pendientes') {
          // Comité ve pendientes (para aprobar/rechazar) o aprobados (seguimiento)
          currentFilters.estado = 'pendiente';
        } else if (activeTab === 'aprobadas') {
          currentFilters.estado = 'aprobado';
        } else if (activeTab === 'realizadas') {
          // Comité ve realizadas (para verificar)
          currentFilters.estado = 'realizado';
        } else if (activeTab === 'rechazadas') {
          currentFilters.estado = 'rechazado';
        } else if (activeTab === 'todas') {
          // No filter, show all
        }
      } else if (user?.rol === 'develop') {
        // Develop ve sus asignadas
        currentFilters.asignado_a = user.cedula;
      }

      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );

      const data = await API.listSolicitudes(cleanFilters);
      setSolicitudes(data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setErrorMessage(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  // Acciones de Workflow
  const handleApproveClick = async (id) => {
    // Abrir modal, cargar developers
    try {
      const devs = await API.listDevelopers();
      setDevelopers(devs);
      setSelectedSolicitudId(id);
      setIsAssignModalOpen(true);
    } catch (error) {
      setToast({ message: 'Error cargando desarrolladores', type: 'error' });
    }
  };

  const confirmApprove = async () => {
    if (!selectedDev) return setToast({ message: 'Seleccione un desarrollador', type: 'error' });
    try {
      await API.approveSolicitud(selectedSolicitudId, selectedDev);
      setToast({ message: 'Solicitud aprobada y asignada', type: 'success' });
      setIsAssignModalOpen(false);
      loadSolicitudes();
    } catch (error) {
      setToast({ message: 'Error al aprobar', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    if (!confirm('¿Rechazar solicitud?')) return;
    try {
      await API.rejectSolicitud(id);
      loadSolicitudes();
    } catch (error) {
      setToast({ message: 'Error al rechazar', type: 'error' });
    }
  };

  const handleRealize = async (id) => {
    if (!confirm('¿Marcar cambio como realizado?')) return;
    try {
      await API.realizeSolicitud(id);
      loadSolicitudes();
    } catch (error) {
      setToast({ message: 'Error al actualizar estado', type: 'error' });
    }
  };

  const handleVerify = async (id) => {
    if (!confirm('¿Verificar y cerrar cambio?')) return;
    try {
      await API.verifySolicitud(id, 'aceptar');
      loadSolicitudes();
    } catch (error) {
      setToast({ message: 'Error al verificar', type: 'error' });
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      tipo_formulario: '',
      prioridad: '',
      estado: '',
      encargado: '',
      tipo_cambio: ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;
    try {
      await API.deleteSolicitud(id);
      loadSolicitudes();
    } catch (error) {
      setToast({ message: 'Error al eliminar solicitud', type: 'error' });
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800'
    };
    return colors[prioridad?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoColor = (estado) => {
    const map = {
      realizado: 'bg-blue-100 text-blue-800',
      aprobado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      rechazado: 'bg-red-100 text-red-800',
      verificado: 'bg-purple-100 text-purple-800'
    };
    return map[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.rol === 'comite' ? 'Panel de Comité de Cambios' :
            user?.rol === 'develop' ? 'Mis Tareas Asignadas' : 'Solicitudes de Cambio'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium flex items-center"
          >
            <HiOutlineFilter className="mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>

          {user?.rol !== 'comite' && user?.rol !== 'develop' && (
            <Link
              to="/solicitudes/nueva"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Nueva Solicitud
            </Link>
          )}
        </div>
      </div>

      {user?.rol === 'comite' && (
        <div className="flex space-x-4 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'pendientes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('aprobadas')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'aprobadas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            En Progreso (Aprobadas)
          </button>
          <button
            onClick={() => setActiveTab('realizadas')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'realizadas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Por Verificar
          </button>
          <button
            onClick={() => setActiveTab('rechazadas')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'rechazadas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Rechazadas
          </button>
          <button
            onClick={() => setActiveTab('todas')}
            className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'todas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Auditoría (Todas)
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Panel de filtros (simplificado visualmente) */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow">
          {/* ... Filtros existentes ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <input type="text" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Buscar..." className="border p-2 rounded" />
            {/* Estados - Ocultar si es comite/develop porque ya filtramos por lógica */}
            {user?.rol !== 'comite' && user?.rol !== 'develop' && (
              <select name="estado" value={filters.estado} onChange={handleFilterChange} className="border p-2 rounded">
                <option value="">Estado: Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="realizado">Realizado</option>
                <option value="rechazado">Rechazado</option>
                <option value="verificado">Verificado</option>
              </select>
            )}
            <button onClick={clearFilters} className="bg-gray-200 px-3 py-2 rounded">Limpiar</button>
          </div>
        </div>
      )}

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No se encontraron solicitudes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sol.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {sol.nombre_solicitante} {sol.apellido_solicitante}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(sol.prioridad)}`}>
                        {sol.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{sol.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Botones para Comité */}
                        {user?.rol === 'comite' && sol.estado === 'pendiente' && (
                          <>
                            <button onClick={() => handleApproveClick(sol.id)} title="Aprobar y Asignar" className="text-green-600 hover:text-green-900"><HiOutlineUserAdd size={20} /></button>
                            <button onClick={() => handleReject(sol.id)} title="Rechazar" className="text-red-600 hover:text-red-900"><HiOutlineX size={20} /></button>
                          </>
                        )}
                        {user?.rol === 'comite' && sol.estado === 'realizado' && (
                          <button onClick={() => handleVerify(sol.id)} title="Verificar Finalización" className="text-purple-600 hover:text-purple-900"><HiOutlineCheck size={20} /></button>
                        )}

                        {/* Botones para Developer */}
                        {user?.rol === 'develop' && sol.estado === 'aprobado' && (
                          <button onClick={() => handleRealize(sol.id)} title="Marcar como Realizado" className="text-blue-600 hover:text-blue-900"><HiOutlinePlay size={20} /></button>
                        )}

                        {/* Botones Genéricos (solo si no es comite/develop o para editar/borrar simple) */}
                        {user?.rol !== 'comite' && user?.rol !== 'develop' && (
                          <button onClick={() => handleDelete(sol.id)} className="text-red-600 hover:text-red-900"><HiOutlineTrash size={18} /></button>
                        )}

                        {/* Botón Editar habilitado para Comité */}
                        {(user?.rol === 'comite' || (user?.rol !== 'comite' && user?.rol !== 'develop')) && (
                          <Link to={`/solicitudes/${sol.id}/editar`} className="text-blue-600 hover:text-blue-900"><HiOutlinePencil size={18} /></Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Asignación */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Asignar Desarrollador</h3>
            <select
              className="w-full border p-2 rounded mb-4"
              value={selectedDev}
              onChange={(e) => setSelectedDev(e.target.value)}
            >
              <option value="">Seleccione un desarrollador...</option>
              {developers.map(d => (
                <option key={d.cedula} value={d.id || d.cedula}>
                  {d.nombre} {d.apellido}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
              <button onClick={confirmApprove} className="px-4 py-2 bg-blue-600 text-white rounded">Asignar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
