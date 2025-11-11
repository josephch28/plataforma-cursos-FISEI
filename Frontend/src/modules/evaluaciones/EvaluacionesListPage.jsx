import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TablaEvaluaciones from './TablaEvaluaciones';

export default function EvaluacionesListPage({ auth }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pag, setPag] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // NUEVO: estados para el modal de confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(() => {
    setLoading(true);
    API.listInscripciones()
      .then(data => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtros y paginación
  const filtered = rows.filter(row =>
    row.cedula_usuario?.toLowerCase().includes(q.toLowerCase()) ||
    String(row.id_curso).includes(q)
  );
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / size));
  const pagRows = filtered.slice((pag - 1) * size, pag * size);

  const handleEdit = (row) => nav(`/evaluaciones/${row.id_inscripcion}/editar`);

  // MODIFICADO: ahora solo muestra el modal
  const handleDelete = (id) => {
    setToDeleteId(id);
    setShowConfirm(true);
  };

  // NUEVO: función para confirmar borrado
  const confirmDelete = async () => {
    setShowConfirm(false);
    if (toDeleteId) {
      setLoading(true);
      await API.deleteInscripcion(toDeleteId, auth);
      setRows(rows => rows.filter(r => r.id_inscripcion !== toDeleteId));
      setLoading(false);
      setToDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Evaluaciones</h1>
        <button
          onClick={() => nav('/evaluaciones/nueva')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Nueva evaluación
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar evaluación o curso..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Tabla */}
        <TablaEvaluaciones
          rows={pagRows}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/* Paginación */}
        <div className="px-4 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tamaño:</span>
            <select
              value={size}
              onChange={e => { setSize(Number(e.target.value)); setPag(1); }}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(n => (
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
              disabled={pag === lastPage}
              onClick={() => setPag(pag + 1)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {/* MODAL de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/20 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-auto">
            <h2 className="text-lg font-semibold mb-4">¿Eliminar evaluación?</h2>
            <p className="mb-6 text-gray-700">Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                onClick={confirmDelete}
              >
                Eliminar
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
