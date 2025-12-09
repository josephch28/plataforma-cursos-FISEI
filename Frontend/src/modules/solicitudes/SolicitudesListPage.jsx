// src/modules/solicitudes/SolicitudesListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineFilter, HiOutlineCheck, HiOutlineX, HiOutlineUserAdd, HiOutlinePlay, HiOutlineEye } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SolicitudesListPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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
  const [deleteModal, setDeleteModal] = useState(null);

  // Workflow Solicitudes
  const [activeTab, setActiveTab] = useState(
    user?.rol === 'develop' ? 'mis_pendientes' : 'pendientes'
  );

  // Modal de Confirmación Genérico
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Modal de Asignación
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState('');

  // Modal de Ver Detalles (Read-only)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // Map de Developers para mostrar nombres en la tabla
  const [devMap, setDevMap] = useState({});

  // Cargar datos
  useEffect(() => {
    loadSolicitudes();
    loadDevsForMap();
  }, [filters, activeTab, user]);

  const loadDevsForMap = async () => {
    try {
      const devs = await API.listDevelopers();
      const map = {};
      devs.forEach(d => {
        map[d.cedula] = `${d.nombre} ${d.apellido}`;
      });
      setDevMap(map);
    } catch (e) {
      console.error('Error loading devs map', e);
    }
  };

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      let currentFilters = { ...filters };

      if (user?.rol === 'comite') {
        if (activeTab === 'pendientes') {
          currentFilters.estado = 'pendiente';
        } else if (activeTab === 'aprobadas') {
          currentFilters.estado = 'aprobado';
        } else if (activeTab === 'realizadas') {
          currentFilters.estado = 'realizado';
        } else if (activeTab === 'rechazadas') {
          currentFilters.estado = 'rechazado';
        }
      } else if (user?.rol === 'develop') {
        currentFilters.asignado_a = user.cedula;
        if (activeTab === 'mis_pendientes') {
          currentFilters.estado = 'aprobado';
        } else if (activeTab === 'historial') {
          currentFilters.estado = 'realizado,verificado';
        }
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

  // ✅ NUEVO: Función de filtrado local por fechas
  const getSolicitudesFiltradasPorFecha = () => {
    return solicitudes.filter(sol => {
      if (!fechaInicio && !fechaFin) return true;
      const fechaSol = new Date(sol.fecha_solicitud).getTime(); 
      const inicio = fechaInicio ? new Date(fechaInicio).getTime() : 0;
      const fin = fechaFin ? new Date(fechaFin).getTime() + 86400000 : Infinity; // +1 día
      return fechaSol >= inicio && fechaSol < fin;
    });
  };

  // ✅ NUEVO: Función generar PDF
  const descargarPDF = () => {
    const doc = new jsPDF();
    const solicitudesReporte = getSolicitudesFiltradasPorFecha();

    doc.setFontSize(18);
    doc.text("Reporte de Gestión de Cambios", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableColumn = ["ID", "Solicitante", "Estado", "Prioridad", "Encargado", "Fecha"];
    const tableRows = [];

    solicitudesReporte.forEach(sol => {
      const rowData = [
        sol.id,
        `${sol.nombre_solicitante} ${sol.apellido_solicitante}`,
        sol.estado,
        sol.prioridad,
        devMap[sol.asignado_a] || 'Sin asignar',
        new Date(sol.fecha_solicitud).toLocaleDateString()
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save("reporte_solicitudes.pdf");
  };

  // Acciones de Workflow
  const handleConfirm = (title, message, action) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onConfirm: async () => {
        await action();
        setConfirmModal(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleApproveClick = async (id) => {
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

  const handleReject = (id) => {
    handleConfirm('Rechazar Solicitud', '¿Estás seguro de rechazar esta solicitud?', async () => {
      try {
        await API.rejectSolicitud(id);
        loadSolicitudes();
        setToast({ message: 'Solicitud rechazada', type: 'success' });
      } catch (error) {
        setToast({ message: 'Error al rechazar', type: 'error' });
      }
    });
  };

  const handleRealize = (id) => {
    handleConfirm('Marcar como Realizado', '¿Confirmas que has completado el desarrollo de este cambio?', async () => {
      try {
        await API.realizeSolicitud(id);
        setTimeout(loadSolicitudes, 500);
        setToast({ message: 'Cambio marcado como realizado', type: 'success' });
      } catch (error) {
        console.error(error);
        setToast({ message: 'Error al actualizar estado', type: 'error' });
      }
    });
  };

  const handleVerify = (id) => {
    handleConfirm('Verificar Cambio', '¿Verificar y cerrar este cambio definitivamente?', async () => {
      try {
        await API.verifySolicitud(id, 'aceptar');
        loadSolicitudes();
        setToast({ message: 'Solicitud verificada', type: 'success' });
      } catch (error) {
        setToast({ message: 'Error al verificar', type: 'error' });
      }
    });
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
    // Limpiar también fechas
    setFechaInicio('');
    setFechaFin('');
  };

  const handleDelete = (id) => {
    setDeleteModal(id);
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      await API.deleteSolicitud(deleteModal);
      setDeleteModal(null);
      loadSolicitudes();
      setToast({ message: 'Solicitud eliminada correctamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al eliminar solicitud', type: 'error' });
    }
  };

  const getPrioridadStyle = (prioridad) => {
    const styles = {
      alta: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
      media: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-600/20',
      baja: 'bg-green-50 text-green-700 border-green-200 ring-green-600/20'
    };
    return styles[prioridad?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getEstadoStyle = (estado) => {
    const styles = {
      realizado: 'bg-blue-50 text-blue-700 border-blue-200',
      aprobado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
      rechazado: 'bg-red-50 text-red-700 border-red-200',
      verificado: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return styles[estado] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const shouldShowDevColumn = user?.rol === 'comite' && ['aprobadas', 'realizadas', 'todas'].includes(activeTab);


  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {user?.rol === 'comite' ? 'Panel de Comité' :
              user?.rol === 'develop' ? 'Mis Tareas' : 'Solicitudes de Cambio'}
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona y visualiza las solicitudes de cambio del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center border ${showFilters
              ? 'bg-gray-100 text-gray-900 border-gray-300'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <HiOutlineFilter className={`mr-2 h-5 w-5 ${showFilters ? 'text-blue-600' : 'text-gray-400'}`} />
            Filtros
          </button>

          {user?.rol !== 'comite' && user?.rol !== 'develop' && (
            <Link
              to="/solicitudes/nueva"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Nueva Solicitud
            </Link>
          )}
        </div>
      </div>

      {(user?.rol === 'comite' || user?.rol === 'develop') && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {user?.rol === 'comite' ? (
              <>
                {[
                  { id: 'pendientes', label: 'Pendientes' },
                  { id: 'aprobadas', label: 'En Progreso' },
                  { id: 'realizadas', label: 'Por Verificar' },
                  { id: 'rechazadas', label: 'Rechazadas' },
                  { id: 'todas', label: 'Histórico' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { id: 'mis_pendientes', label: 'Mis Asignaciones' },
                  { id: 'historial', label: 'Completadas' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <HiOutlineX className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      {/* Filters Card */}
      <div className={`
        bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out
        ${showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}
      `}>
        <div className="p-6 bg-gray-50/50">
          <div className="md:col-span-3 border-t border-gray-200 pt-4 mt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Reportes y Rango de Fechas</h4>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                
                <div className="space-y-1 w-full md:w-auto">
                  <label className="text-xs font-semibold text-gray-500">Desde:</label>
                  <input 
                    type="date" 
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 p-2"
                  />
                </div>

                <div className="space-y-1 w-full md:w-auto">
                  <label className="text-xs font-semibold text-gray-500">Hasta:</label>
                  <input 
                    type="date" 
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 p-2"
                  />
                </div>

                <button 
                  onClick={descargarPDF}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm font-medium"
                >
                  <span className="text-lg">📄</span> Descargar PDF
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <HiOutlinePencil className="h-full w-full opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay solicitudes</h3>
            <p className="mt-1 text-gray-500">No se encontraron solicitudes con los filtros actuales.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Solicitante</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  {shouldShowDevColumn && (
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Desarrollador Asignado</th>
                  )}
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* ✅ NUEVO: Usamos getSolicitudesFiltradasPorFecha() en lugar de solicitudes directo */}
                {getSolicitudesFiltradasPorFecha().map((sol) => (
                  <tr key={sol.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{sol.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sol.nombre_solicitante} {sol.apellido_solicitante}</div>
                      <div className="text-xs text-gray-500">{sol.contacto || 'Sin contacto'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadStyle(sol.prioridad)}`}>
                        {sol.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyle(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </td>
                    {shouldShowDevColumn && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {devMap[sol.asignado_a] || sol.asignado_a || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={sol.descripcion}>
                      {sol.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user?.rol === 'comite' && sol.estado === 'pendiente' && (
                          <>
                            <button onClick={() => handleApproveClick(sol.id)} title="Aprobar y Asignar" className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"><HiOutlineUserAdd size={20} /></button>
                            <button onClick={() => handleReject(sol.id)} title="Rechazar" className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><HiOutlineX size={20} /></button>
                          </>
                        )}
                        {user?.rol === 'comite' && sol.estado === 'realizado' && (
                          <button onClick={() => handleVerify(sol.id)} title="Verificar Finalización" className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-md transition-colors"><HiOutlineCheck size={20} /></button>
                        )}
                        {user?.rol === 'develop' && (
                          <>
                            {sol.estado === 'aprobado' && (
                              <button onClick={() => handleRealize(sol.id)} title="Marcar como Realizado" className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><HiOutlinePlay size={20} /></button>
                            )}
                            <button onClick={() => setSelectedSolicitud(sol)} title="Ver Detalles" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><HiOutlineEye size={20} /></button>
                          </>
                        )}
                        {user?.rol !== 'comite' && user?.rol !== 'develop' && (
                          <>
                            <button onClick={() => handleDelete(sol.id)} title="Eliminar" className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"><HiOutlineTrash size={18} /></button>
                            <Link to={`/solicitudes/${sol.id}/editar`} title="Editar" className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"><HiOutlinePencil size={18} /></Link>
                          </>
                        )}
                        {user?.rol === 'comite' && (
                          <Link to={`/solicitudes/${sol.id}/editar`} title="Editar" className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"><HiOutlinePencil size={18} /></Link>
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

      {/* ... Modales siguen igual ... */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Asignar Desarrollador</h3>
            <p className="text-sm text-gray-500 mb-6">Selecciona el desarrollador encargado de esta solicitud.</p>
            <div className="relative">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                value={selectedDev}
                onChange={(e) => setSelectedDev(e.target.value)}
              >
                <option value="">Seleccione un desarrollador...</option>
                {developers.map(d => (
                  <option key={d.cedula} value={d.cedula}>
                    {d.nombre} {d.apellido}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2.5 rounded-lg text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-colors">Cancelar</button>
              <button onClick={confirmApprove} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-md transition-colors" disabled={!selectedDev}>Confirmar Asignación</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))} className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-md transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {selectedSolicitud && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="relative">
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10 rounded-t-xl">
                <div>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Solicitud</span>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">#{selectedSolicitud.id}<span className={`text-sm px-3 py-1 rounded-full border ${getPrioridadStyle(selectedSolicitud.prioridad)}`}>{selectedSolicitud.prioridad}</span></h3>
                </div>
                <button onClick={() => setSelectedSolicitud(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><HiOutlineX className="h-6 w-6" /></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Solicitante</label><p className="text-gray-900 font-medium text-lg">{selectedSolicitud.nombre_solicitante} {selectedSolicitud.apellido_solicitante}</p><p className="text-gray-500 text-sm">{selectedSolicitud.contacto}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Fecha Solicitud</label><p className="text-gray-900 font-medium">{selectedSolicitud.fecha_solicitud ? new Date(selectedSolicitud.fecha_solicitud).toLocaleDateString() : '-'}</p></div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Estado Actual</label><span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoStyle(selectedSolicitud.estado)}`}>{selectedSolicitud.estado?.toUpperCase()}</span></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Tipo Formulario</label><p className="text-gray-900 capitalize">{selectedSolicitud.tipo_formulario}</p></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Detalles del Cambio</h4>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Descripción</label><p className="text-gray-800 leading-relaxed">{selectedSolicitud.descripcion}</p></div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Justificación</label><p className="text-gray-800 leading-relaxed">{selectedSolicitud.razon}</p></div>
                  </div>
                </div>
                {selectedSolicitud.tipo_formulario === 'experto' && (
                  <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                    <h5 className="font-bold text-blue-900 mb-3 text-sm uppercase">Información Técnica</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div><span className="text-blue-700 font-medium block">Categoría:</span><span className="text-gray-700">{selectedSolicitud.categoria || '-'}</span></div>
                      <div><span className="text-blue-700 font-medium block">Impacto:</span><span className="text-gray-700">{selectedSolicitud.impacto || '-'}</span></div>
                      <div><span className="text-blue-700 font-medium block">Entornos:</span><span className="text-gray-700">{selectedSolicitud.entornos || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl border-t">
                <button onClick={() => setSelectedSolicitud(null)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">Cerrar Detalle</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Solicitud?</h3>
            <p className="text-gray-500 mb-6">Esta acción es irreversible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition w-full">Cancelar</button>
              <button onClick={executeDelete} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 transition w-full">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}