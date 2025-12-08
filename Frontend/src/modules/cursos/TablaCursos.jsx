// src/modules/cursos/TablaCursos.jsx
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import Switch from '../../components/Switch';
import {
  HiOutlinePencil,
  HiOutlineSwitchHorizontal,
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineExclamation
} from 'react-icons/hi';

export default function TablaCursos({ onEdit, showInactive = false }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pag, setPag] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [activateModal, setActivateModal] = useState(null);
  const [finalizeModal, setFinalizeModal] = useState(null);
  const { user } = useAuth();

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filtros
  const [horasFiltro, setHorasFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [publicoFiltro, setPublicoFiltro] = useState('');

  // Paginación segura
  const hasNext = useMemo(() => rows.length === Number(size), [rows, size]);
  const hasPrev = useMemo(() => pag > 1, [pag]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const buildParams = () => {
    const params = { q, pag, size, inactivo: showInactive };
    if (tipoFiltro) params.tipo = tipoFiltro;
    if (publicoFiltro) params.publico_objetivo = publicoFiltro;

    if (horasFiltro === 'lt10') params.horas_max = 9;
    else if (horasFiltro === 'b10_20') { params.horas_min = 10; params.horas_max = 20; }
    else if (horasFiltro === 'b20_30') { params.horas_min = 20; params.horas_max = 30; }
    else if (horasFiltro === 'gt30') params.horas_min = 31;

    return params;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await API.listCursos(buildParams());
      const cedula = user?.cedula;
      const rol = user?.rol;
      let visible = Array.isArray(data) ? data : [];
      if (rol === 'responsable' && cedula) {
        visible = visible.filter(c => c.cedula_responsable === cedula);
      }

      if (visible.length === 0 && pag > 1) {
        setPag((p) => Math.max(1, p - 1));
      } else {
        setRows(visible);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [pag, size, showInactive]);

  useEffect(() => {
    const timer = setTimeout(() => { setPag(1); load(); }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => { setPag(1); load(); }, [horasFiltro, tipoFiltro, publicoFiltro]);

  const confirmDelete = (id) => setDeleteModal(id);
  const confirmActivate = (id) => setActivateModal(id);

  const executeDelete = async () => {
    try {
      await API.deleteCurso(deleteModal);
      setDeleteModal(null);
      await load();
      showToast('Curso desactivado correctamente', 'success');
    } catch (e) {
      showToast(e?.message || 'No se pudo desactivar', 'error');
      setDeleteModal(null);
    }
  };

  const executeActivate = async () => {
    try {
      await API.activateCurso(activateModal);
      setActivateModal(null);
      await load();
      showToast('Curso activado correctamente', 'success');
    } catch (e) {
      showToast(e?.message || 'No se pudo activar', 'error');
      setActivateModal(null);
    }
  };

  const executeFinalize = async () => {
    try {
      await API.finalizeCurso(finalizeModal);
      setFinalizeModal(null);
      await load();
      showToast('Curso finalizado y certificados generados', 'success');
    } catch (e) {
      showToast(e?.message || 'No se pudo finalizar', 'error');
      setFinalizeModal(null);
    }
  };

  return (
    <div>
      {/* TOAST PANEL */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="p-4 border-b border-gray-200">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
        <select className="rounded border border-gray-300 px-2 py-1 text-sm bg-white" value={horasFiltro} onChange={(e) => setHorasFiltro(e.target.value)}>
          <option value="">Horas: Todas</option>
          <option value="lt10">Menos de 10</option>
          <option value="b10_20">Entre 10 y 20</option>
          <option value="b20_30">Entre 20 y 30</option>
          <option value="gt30">Mayor de 30</option>
        </select>
        <select className="rounded border border-gray-300 px-2 py-1 text-sm bg-white" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          <option value="">Tipo: Todos</option>
          <option value="Curso">Curso</option>
          <option value="Webinar">Webinar</option>
          <option value="Taller">Taller</option>
        </select>
        <select className="rounded border border-gray-300 px-2 py-1 text-sm bg-white" value={publicoFiltro} onChange={(e) => setPublicoFiltro(e.target.value)}>
          <option value="">Público: Todos</option>
          <option value="Estudiantes UTA">Estudiantes UTA</option>
          <option value="Personal UTA">Personal UTA</option>
          <option value="Público General">Público General</option>
        </select>
      </div>

      {/* VISTA DE TARJETAS PARA RESPONSABLE */}
      {user?.rol === 'responsable' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50">
          {rows.map((r) => {
            const isFinalized = r.estado === 'finalizado';
            return (
              <div key={r.id_curso} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className={`h-2 ${isFinalized ? 'bg-gray-500' : (!showInactive ? 'bg-green-500' : 'bg-yellow-500')}`}></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {r.tipo || 'Curso'}
                    </span>
                    {isFinalized ? (
                      <span className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-full flex items-center gap-1">
                        <HiOutlineArchive className='w-3 h-3' /> Finalizado
                      </span>
                    ) : showInactive ? (
                      <span className="px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full flex items-center gap-1">
                        <HiOutlineExclamation className='w-3 h-3' /> Inactivo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full flex items-center gap-1">
                        <HiOutlineCheckCircle className='w-3 h-3' /> Activo
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{r.nombre}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
                    <p><strong>Horas:</strong> {r.horas || 'N/A'}</p>
                    <p><strong>Fechas:</strong> {r.fecha_inicio || '?'} - {r.fecha_fin || '?'}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    {/* Restriction: Responsable CANNOT Edit Active Courses */}
                    {(!(!showInactive && user?.rol === 'responsable')) && !isFinalized && (
                      <button onClick={() => onEdit(r)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${showInactive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                        <HiOutlinePencil className="w-4 h-4" />
                        {showInactive ? 'Completar Info' : 'Editar'}
                      </button>
                    )}
                    {showInactive ? (
                      <div className="flex items-center gap-2 justify-center py-2 px-3">
                        <span className="text-sm font-medium text-gray-600">Activar:</span>
                        <Switch checked={false} onChange={() => confirmActivate(r.id_curso)} color="green" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center py-2 px-3">
                        <span className="text-sm font-medium text-gray-600">Estado:</span>
                        {/* Restriction: Responsable CANNOT Deactivate Active Courses */}
                        <Switch
                          checked={true}
                          onChange={() => confirmDelete(r.id_curso)}
                          color="green"
                          disabled={user?.rol === 'responsable'}
                        />
                      </div>
                    )}
                    {!showInactive && !isFinalized && (
                      <button onClick={() => setFinalizeModal(r.id_curso)} className="py-2 px-3 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition flex items-center justify-center gap-1" title="Finalizar y Certificar">
                        <HiOutlineArchive className="w-4 h-4" />
                        Finalizar
                      </button>
                    )}
                    {isFinalized && (
                      <div className="w-full text-center text-sm text-gray-500 italic py-2">Curso Cerrado - Certificados Generados</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!rows.length && !loading && (
            <div className="col-span-full text-center py-10 text-gray-500">No hay cursos en esta sección.</div>
          )}
        </div>
      ) : (
        /* TABLA ORIGINAL PARA ADMINS / OTROS */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r) => (
                <tr key={r.id_curso} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{r.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.tipo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.horas ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.cedula_responsable}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(r.fecha_inicio || '-') + ' — ' + (r.fecha_fin || '-')}</td>
                  <td className="px-6 py-4 text-center">
                    {!showInactive ? (
                      <div title="Desactivar Curso" className="inline-block">
                        <Switch checked={true} onChange={() => confirmDelete(r.id_curso)} color="green" />
                      </div>
                    ) : (
                      <div title="Activar Curso" className="inline-block">
                        <Switch checked={false} onChange={() => confirmActivate(r.id_curso)} color="green" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(r)} title="Editar" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (<tr><td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Sin resultados</td></tr>)}
            </tbody>
          </table>
        </div>
      )
      }

      {/* Paginación */}
      <div className="px-4 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tamaño:</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPag(1); }} className="rounded border border-gray-300 px-2 py-1 text-sm">
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={!hasPrev} onClick={() => setPag((p) => Math.max(1, p - 1))} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">Anterior</button>
          <span className="text-sm text-gray-600">Página {pag}</span>
          <button onClick={() => hasNext && setPag((p) => p + 1)} disabled={!hasNext || loading || rows.length === 0} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">Siguiente</button>
        </div>
      </div>

      {/* MODALES */}
      {
        deleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineSwitchHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Desactivar curso?</h3>
                <p className="text-gray-500 mb-6">El curso dejará de ser visible para los estudiantes. Puedes reactivarlo después en la pestaña "Desactivados".</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition w-full">Cancelar</button>
                  <button onClick={executeDelete} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 transition w-full">Desactivar</button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        activateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineSwitchHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Activar curso?</h3>
                <p className="text-gray-500 mb-6">El curso volverá a estar visible y los estudiantes podrán inscribirse.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setActivateModal(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition w-full">Cancelar</button>
                  <button onClick={executeActivate} className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition w-full">Activar</button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        finalizeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineArchive className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Finalizar Curso?</h3>
                <p className="text-gray-500 mb-6">El curso pasará a estado de 'Finalizado' y se generarán automáticamente los certificados para los estudiantes aprobados. <strong className="text-red-600">Esto no se puede deshacer.</strong></p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setFinalizeModal(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition w-full">Cancelar</button>
                  <button onClick={executeFinalize} className="px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold hover:bg-blue-900 shadow-lg shadow-blue-800/30 transition w-full">Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
