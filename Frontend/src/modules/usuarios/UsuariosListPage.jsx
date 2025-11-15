import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaUsuarios from './TablaUsuarios';
import { API } from '../../services/api';

export default function UsuariosListPage({ auth }) {
  const nav = useNavigate();
  const [tab, setTab] = useState('activos');
  
  // Estado para el modal de activación/desactivación
  const [confirmModal, setConfirmModal] = useState(null); // { cedula, action: 'delete' | 'activate', loadUsersCallback }

  const handleAction = (cedula, action, loadUsersCallback) => {
    setConfirmModal({ cedula, action, loadUsersCallback });
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { cedula, action, loadUsersCallback } = confirmModal;

    try {
      if (action === 'delete') {
        await API.deleteUsuario(cedula, auth);
      } else if (action === 'activate') {
        await API.activateUsuario(cedula, auth);
      }
      setConfirmModal(null);
      // Ejecutar la función de recarga que vino desde TablaUsuarios
      if (loadUsersCallback) loadUsersCallback(); 

    } catch (e) {
      alert(e?.message || `Error al ${action === 'delete' ? 'desactivar' : 'activar'}`);
      setConfirmModal(null);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => nav('/usuarios/nuevo')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Nuevo Usuario
        </button>
      </div>
      
      {/* Tabs - Aquí se soluciona la falta de pestañas */}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TablaUsuarios
          auth={auth}
          showInactive={tab === 'desactivados'} // Pasa el estado de la pestaña
          onEdit={(cedula) => nav(`/usuarios/${cedula}/editar`)}
          onAction={handleAction} // Pasa el handler para abrir el modal
        />
      </div>

      {/* MODAL DE CONFIRMACIÓN (Activar/Desactivar) */}
      {confirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {confirmModal.action === 'delete' ? '¿Desactivar usuario?' : '¿Activar usuario?'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                          {confirmModal.action === 'delete'
                              ? 'El usuario será desactivado y ya no aparecerá en las listas activas, pero sus datos se mantendrán.'
                              : 'El usuario volverá a estar activo y disponible en el sistema.'
                          }
                      </p>
                      <div className="flex gap-3 justify-end">
                          <button
                              onClick={() => setConfirmModal(null)}
                              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                          >
                              Cancelar
                          </button>
                          <button
                              onClick={executeAction}
                              className={`px-4 py-2 rounded-lg text-white transition ${
                                  confirmModal.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                              }`}
                          >
                              {confirmModal.action === 'delete' ? 'Desactivar' : 'Activar'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}