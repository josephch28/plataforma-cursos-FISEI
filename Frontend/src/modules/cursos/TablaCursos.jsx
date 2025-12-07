// src/modules/cursos/TablaCursos.jsx - CON BÚSQUEDA + FILTROS SIN CAMBIAR ESTILO
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  // Filtros
  const [horasFiltro, setHorasFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [publicoFiltro, setPublicoFiltro] = useState('');

  // Paginación segura
  const hasNext = useMemo(() => rows.length === Number(size), [rows, size]);
  const hasPrev = useMemo(() => pag > 1, [pag]);

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
    } catch (e) {
      alert(e?.message || 'No se pudo desactivar');
      setDeleteModal(null);
    }
  };

  const executeActivate = async () => {
    try {
      await API.activateCurso(activateModal);
      setActivateModal(null);
      await load();
    } catch (e) {
      alert(e?.message || 'No se pudo activar');
      setActivateModal(null);
    }
  };

  const executeFinalize = async () => {
    try {
      await API.finalizeCurso(finalizeModal);
      setFinalizeModal(null);
      await load();
      alert('Curso finalizado y certificados generados');
    } catch (e) {
      alert(e?.message || 'No se pudo finalizar');
      setFinalizeModal(null);
    }
  };

  return (
    <div>
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
        <select className="rounded border border-gray-300 px-2 py-1 text-sm" value={horasFiltro} onChange={(e) => setHorasFiltro(e.target.value)}>
          <option value="">Horas: Todas</option>
          <option value="lt10">Menos de 10</option>
          <option value="b10_20">Entre 10 y 20</option>
          <option value="b20_30">Entre 20 y 30</option>
          <option value="gt30">Mayor de 30</option>
        </select>
        <select className="rounded border border-gray-300 px-2 py-1 text-sm" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          <option value="">Tipo: Todos</option>
          <option value="Curso">Curso</option>
          <option value="Webinar">Webinar</option>
          <option value="Taller">Taller</option>
        </select>
        <select className="rounded border border-gray-300 px-2 py-1 text-sm" value={publicoFiltro} onChange={(e) => setPublicoFiltro(e.target.value)}>
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
                      <span className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-full">Finalizado</span>
                    ) : showInactive ? (
                      <span className="px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">Pendiente</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">Activo</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{r.nombre}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
                    <p><strong>Horas:</strong> {r.horas || 'N/A'}</p>
                    <p><strong>Fechas:</strong> {r.fecha_inicio || '?'} - {r.fecha_fin || '?'}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    {!isFinalized && (
                      <button onClick={() => onEdit(r)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${showInactive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        {showInactive ? 'Completar Info' : 'Editar'}
                      </button>
                    )}
                    {showInactive && !isFinalized && (
                      <button onClick={() => confirmActivate(r.id_curso)} className="py-2 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1" title="Activar Curso">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Activar
                      </button>
                    )}
                    {!showInactive && !isFinalized && (
                      <>
                        <button onClick={() => setFinalizeModal(r.id_curso)} className="py-2 px-3 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition flex items-center justify-center gap-1" title="Finalizar y Certificar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Finalizar
                        </button>
                        <button onClick={() => confirmDelete(r.id_curso)} className="py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition" title="Desactivar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(r)} title="Editar" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {!showInactive && (
                        <button onClick={() => confirmDelete(r.id_curso)} title="Desactivar" className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                      {showInactive && (
                        <button onClick={() => confirmActivate(r.id_curso)} title="Activar" className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (<tr><td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Sin resultados</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

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
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Desactivar curso?</h3>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setDeleteModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={executeDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Desactivar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Activar curso?</h3>
              <div className="flex gap-3 justify-end mt-4">
                <button onClick={() => setActivateModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={executeActivate} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">Activar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {finalizeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Finalizar Curso?</h3>
              <p className="text-sm text-gray-600 mb-6">El curso pasará a estado de 'Finalizado' y se generarán automáticamente los certificados para los estudiantes aprobados. Esto no se puede deshacer.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setFinalizeModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={executeFinalize} className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition">Confirmar Finalización</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
