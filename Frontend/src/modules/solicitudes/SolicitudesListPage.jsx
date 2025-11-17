// src/modules/solicitudes/SolicitudesListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineFilter } from 'react-icons/hi';

export default function SolicitudesListPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    tipo_formulario: '',
    prioridad: '',
    estado: '',
    encargado: '',
    tipo_cambio: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSolicitudes();
  }, [filters]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
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
      alert('Error al eliminar solicitud');
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
    return estado === 'realizado' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Solicitudes de Cambio</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium flex items-center"
          >
            <HiOutlineFilter className="mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link
            to="/solicitudes/nueva"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Nueva Solicitud
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Nombre, descripción..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="tipo_formulario"
                value={filters.tipo_formulario}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="usuario">Usuario</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                name="prioridad"
                value={filters.prioridad}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Encargado</label>
              <input
                type="text"
                name="encargado"
                value={filters.encargado}
                onChange={handleFilterChange}
                placeholder="Nombre del encargado"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cambio</label>
              <select
                name="tipo_cambio"
                value={filters.tipo_cambio || ''}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="rutinario">Rutinario</option>
                <option value="estandar">Estándar</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Limpiar Filtros
              </button>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Solicitud</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sol.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sol.nombre_solicitante} {sol.apellido_solicitante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{sol.tipo_formulario}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(sol.prioridad)}`}>
                        {sol.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sol.fecha_solicitud ? new Date(sol.fecha_solicitud).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{sol.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/solicitudes/${sol.id}/editar`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <HiOutlinePencil className="text-lg" />
                        </Link>
                        <button
                          onClick={() => handleDelete(sol.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
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
