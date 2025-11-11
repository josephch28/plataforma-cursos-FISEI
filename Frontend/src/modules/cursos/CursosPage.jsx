// src/modules/cursos/CursosPage.jsx
import { useState, useEffect } from 'react';
import TablaCursos from './TablaCursos';
import FormCurso from './FormCurso';
import EncargadosPanel from './EncargadosPanel';
import { API } from '../../services/api';

export default function CursosPage({ auth }) {
  const [editing, setEditing] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [encCurso, setEncCurso] = useState(null);

  const onSaved = () => {
    setEditing(null);
    setRefreshFlag(x => x + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Cursos</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TablaCursos
            key={refreshFlag}
            onEdit={setEditing}
            onManageEnc={(curso) => setEncCurso(curso)}
            auth={auth}
          />
        </div>
        <div className="lg:col-span-1">
          <div className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            <h2 className="text-lg font-medium mb-3">{editing ? 'Editar curso' : 'Crear curso'}</h2>
            <FormCurso initial={editing || {}} onSaved={onSaved} auth={auth} />
          </div>
        </div>
      </div>

      {encCurso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-medium">Encargados — {encCurso.nombre}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setEncCurso(null)}>Cerrar</button>
            </div>
            <div className="p-4">
              <EncargadosPanel curso={encCurso} auth={auth} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
