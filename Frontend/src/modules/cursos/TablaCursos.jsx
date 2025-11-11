// src/modules/cursos/TablaCursos.jsx - CON BÚSQUEDA EN TIEMPO REAL
import { useEffect, useState } from 'react';
import { API } from '../../services/api';

export default function TablaCursos({ onEdit, auth, showInactive = false }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pag, setPag] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [activateModal, setActivateModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await API.listCursos({ q, pag, size, inactivo: showInactive });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambian pag, size, showInactive
  useEffect(() => {
    load();
  }, [pag, size, showInactive]);

  // ✅ BÚSQUEDA EN TIEMPO REAL CON DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setPag(1); // Resetear a página 1 al buscar
      load();
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => clearTimeout(timer);
  }, [q]);

  const confirmDelete = (id) => {
    setDeleteModal(id);
  };

  const confirmActivate = (id) => {
    setActivateModal(id);
  };

  const executeDelete = async () => {
    try {
      await API.deleteCurso(deleteModal, auth);
      setDeleteModal(null);
      await load();
    } catch (e) {
      alert(e?.message || 'No se pudo desactivar');
      setDeleteModal(null);
    }
  };

  const executeActivate = async () => {
    try {
      await API.activateCurso(activateModal, auth);
      setActivateModal(null);
      await load();
    } catch (e) {
      alert(e?.message || 'No se pudo activar');
      setActivateModal(null);
    }
  };

  return (
    <div>
      {/* BARRA DE BÚSQUEDA - SIN BOTÓN, BÚSQUEDA AUTOMÁTICA */}
      <div className="p-4 border-b border-gray-200">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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
            disabled={pag === 1}
            onClick={() => setPag(pag - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {pag}</span>
          <button
            onClick={() => setPag(pag + 1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODAL DESACTIVAR */}
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

      {/* MODAL ACTIVAR */}
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
