// src/modules/cursos/TablaCursos.jsx - CON BÚSQUEDA + FILTROS SIN CAMBIAR ESTILO
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../services/api';

export default function TablaCursos({ onEdit, showInactive = false }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pag, setPag] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [activateModal, setActivateModal] = useState(null);

  // Filtros (debajo del input para no afectar cabecera ni tabla)
  const [horasFiltro, setHorasFiltro] = useState('');      // '', lt10, b10_20, b20_30, gt30
  const [tipoFiltro, setTipoFiltro] = useState('');        // '', Curso, Webinar, Taller
  const [publicoFiltro, setPublicoFiltro] = useState('');  // '', Estudiantes UTA, Personal UTA, Público General

  // Paginación segura
  const hasNext = useMemo(() => rows.length === Number(size), [rows, size]);
  const hasPrev = useMemo(() => pag > 1, [pag]);

  const buildParams = () => {
    const params = { q, pag, size, inactivo: showInactive };
    if (tipoFiltro) params.tipo = tipoFiltro;
    if (publicoFiltro) params.publico_objetivo = publicoFiltro;

    // Mapear horas a horas_min/horas_max
    if (horasFiltro === 'lt10') {
      params.horas_max = 9;
    } else if (horasFiltro === 'b10_20') {
      params.horas_min = 10;
      params.horas_max = 20;
    } else if (horasFiltro === 'b20_30') {
      params.horas_min = 20;
      params.horas_max = 30;
    } else if (horasFiltro === 'gt30') {
      params.horas_min = 31;
    }
    return params;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await API.listCursos(buildParams());
      // Si la página actual queda vacía y no es la primera, retroceder una
      if (Array.isArray(data) && data.length === 0 && pag > 1) {
        setPag((p) => Math.max(1, p - 1));
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambian pag, size, showInactive
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pag, size, showInactive]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPag(1);
      load();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Reconsultar al cambiar filtros (reset a página 1)
  useEffect(() => {
    setPag(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horasFiltro, tipoFiltro, publicoFiltro]);

  // Handlers
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

      {/* Filtros compactos debajo del buscador */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
        <select
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={horasFiltro}
          onChange={(e) => setHorasFiltro(e.target.value)}
        >
          <option value="">Horas: Todas</option>
          <option value="lt10">Menos de 10</option>
          <option value="b10_20">Entre 10 y 20</option>
          <option value="b20_30">Entre 20 y 30</option>
          <option value="gt30">Mayor de 30</option>
        </select>

        <select
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
        >
          <option value="">Tipo: Todos</option>
          <option value="Curso">Curso</option>
          <option value="Webinar">Webinar</option>
          <option value="Taller">Taller</option>
        </select>

        <select
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={publicoFiltro}
          onChange={(e) => setPublicoFiltro(e.target.value)}
        >
          <option value="">Público: Todos</option>
          <option value="Estudiantes UTA">Estudiantes UTA</option>
          <option value="Personal UTA">Personal UTA</option>
          <option value="Público General">Público General</option>
        </select>
      </div>

      {/* TABLA */}
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
                <td className="px-6 py-4 text-sm text-gray-500">
                  {(r.fecha_inicio || '-') + ' — ' + (r.fecha_fin || '-')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(r)}
                      title="Editar"
                      className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {!showInactive && (
                      <button
                        onClick={() => confirmDelete(r.id_curso)}
                        title="Desactivar"
                        className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}

                    {showInactive && (
                      <button
                        onClick={() => confirmActivate(r.id_curso)}
                        title="Activar"
                        className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && !loading && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  Sin resultados
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  Buscando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación: misma UI, con validación de siguiente */}
      <div className="px-4 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tamaño:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPag(1);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={!hasPrev}
            onClick={() => setPag((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {pag}</span>
          <button
            onClick={() => hasNext && setPag((p) => p + 1)}
            disabled={!hasNext || loading || rows.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODALES */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Desactivar curso?</h3>
              <p className="text-sm text-gray-600 mb-6">
                El curso se moverá a la pestaña de Desactivados. Podrás verlo en el historial.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Desactivar
                </button>
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
              <p className="text-sm text-gray-600 mb-6">
                El curso volverá a la pestaña de Activos y estará disponible.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setActivateModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeActivate}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Activar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
