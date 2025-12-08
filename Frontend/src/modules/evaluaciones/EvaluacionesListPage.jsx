import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TablaEvaluaciones from './TablaEvaluaciones';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineSearch, HiOutlineDocumentReport, HiOutlineTrash, HiOutlineExclamation, HiOutlinePlus } from 'react-icons/hi';

export default function EvaluacionesListPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [pag, setPag] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const isAdmin = user?.rol === 'admin';
    API.listInscripciones(isAdmin ? {} : { misCursos: true })
      .then(data => setRows(data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Filtros y paginación
  const filtered = rows.filter(row =>
    row.cedula_usuario?.toLowerCase().includes(q.toLowerCase()) ||
    String(row.id_curso).includes(q)
  );
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / size));
  const pagRows = filtered.slice((pag - 1) * size, pag * size);

  const handleEdit = (row) => nav(`/evaluaciones/${row.id_inscripcion}/editar`);

  const handleDelete = (id) => {
    setToDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    if (toDeleteId) {
      setLoading(true);
      await API.deleteInscripcion(toDeleteId);
      setRows(rows => rows.filter(r => r.id_inscripcion !== toDeleteId));
      setLoading(false);
      setToDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HiOutlineDocumentReport className="text-blue-600 hidden md:block" />
            Evaluaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona las evaluaciones y calificaciones de los estudiantes inscritos.
          </p>
        </div>
        {user?.rol === 'admin' && (
          <button
            onClick={() => nav('/evaluaciones/nueva')}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            Nueva evaluación
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por cédula o ID curso..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Tabla */}
        <TablaEvaluaciones
          rows={pagRows}
          loading={loading}
          onEdit={handleEdit}
          onDelete={user?.rol === 'admin' ? handleDelete : undefined}
        />

        {/* Paginación */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Filas por página:</span>
            <select
              value={size}
              onChange={e => { setSize(Number(e.target.value)); setPag(1); }}
              className="rounded-lg border-gray-300 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pag === 1}
              onClick={() => setPag(pag - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
              {pag} / {lastPage}
            </span>
            <button
              disabled={pag === lastPage}
              onClick={() => setPag(pag + 1)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODAL de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-auto overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineTrash className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar evaluación?</h2>
              <p className="text-gray-500 mb-6">
                Esta acción eliminará el registro permanentemente. No se puede deshacer.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 transition-colors w-full"
                  onClick={confirmDelete}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
