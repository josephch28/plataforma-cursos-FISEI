// src/modules/cursos/CursosListPage.jsx
import { useState } from 'react';
import TablaCursos from './TablaCursos';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export default function CursosListPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('activos');

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HiOutlineAcademicCap className="text-blue-600 hidden md:block" />
            Gestión de Cursos
          </h1>
          <p className="text-gray-500 mt-1">
            Administra la oferta académica, crea nuevos eventos y revisa el estado de los cursos.
          </p>
        </div>
        {user?.rol === 'admin' && (
          <button
            onClick={() => nav('/cursos/nuevo')}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            Nuevo Curso
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8 -mb-px" aria-label="Tabs">
          <button
            onClick={() => setTab('activos')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tab === 'activos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${tab === 'activos' ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'}`}></span>
            Activos/Todos
          </button>
          <button
            onClick={() => setTab('archivados')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tab === 'archivados'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${tab === 'archivados' ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'}`}></span>
            Archivados
          </button>
        </nav>
      </div>

      {/* Tabla Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <TablaCursos
          onEdit={(r) => nav(`/cursos/${r.id_curso}/editar`)}
          onManageEnc={() => { }}
          activeTab={tab}
        />
      </div>
    </div>
  );
}