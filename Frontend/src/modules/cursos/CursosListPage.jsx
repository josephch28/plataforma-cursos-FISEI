// src/modules/cursos/CursosListPage.jsx - CON TABS
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import TablaCursos from './TablaCursos';
import { useNavigate } from 'react-router-dom';

export default function CursosListPage({ auth }) {
  const nav = useNavigate();
  const [tab, setTab] = useState('activos');

  return (
    <AppLayout active="cursos">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Cursos</h1>
        <button
          onClick={() => nav('/cursos/nuevo')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Nuevo curso
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setTab('activos')}
            className={`pb-3 border-b-2 font-medium text-sm transition ${
              tab === 'activos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setTab('desactivados')}
            className={`pb-3 border-b-2 font-medium text-sm transition ${
              tab === 'desactivados'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Desactivados
          </button>
        </nav>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TablaCursos
          onEdit={(r) => nav(`/cursos/${r.id_curso}/editar`)}
          onManageEnc={() => {}}
          auth={auth}
          showInactive={tab === 'desactivados'}
        />
      </div>
    </AppLayout>
  );
}
