// Frontend/src/modules/usuarios/UsuariosListPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaUsuarios from './TablaUsuarios';
import { API } from '../../services/api';
import Toast from '../../components/Toast';
import { HiOutlineSwitchHorizontal, HiOutlineUserAdd } from 'react-icons/hi';

export default function UsuariosListPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('activos');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Estado para el modal de activación/desactivación
  const [confirmModal, setConfirmModal] = useState(null); // { cedula, action: 'delete' | 'activate', loadUsersCallback }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleAction = (cedula, action, loadUsersCallback) => {
    setConfirmModal({ cedula, action, loadUsersCallback });
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { cedula, action, loadUsersCallback } = confirmModal;

    try {
      if (action === 'delete') {
        await API.deleteUsuario(cedula);
        showToast('Usuario desactivado correctamente', 'success');
      } else if (action === 'activate') {
        await API.activateUsuario(cedula);
        showToast('Usuario activado correctamente', 'success');
      }
      setConfirmModal(null);
      // Ejecutar la función de recarga que vino desde TablaUsuarios
      if (loadUsersCallback) loadUsersCallback();

    } catch (e) {
      showToast(e?.message || `Error al ${action === 'delete' ? 'desactivar' : 'activar'}`, 'error');
      setConfirmModal(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* TOAST PANEL */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios del sistema, sus roles y estados.</p>
        </div>
        <button
          onClick={() => nav('/usuarios/nuevo')}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
        >
          <HiOutlineUserAdd className="w-5 h-5 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8 -mb-px">
          <button
            onClick={() => setTab('activos')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tab === 'activos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${tab === 'activos' ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'}`}></span>
            Activos
          </button>
          <button
            onClick={() => setTab('desactivados')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${tab === 'desactivados'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${tab === 'desactivados' ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'}`}></span>
            Desactivados
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <TablaUsuarios
          showInactive={tab === 'desactivados'}
          onEdit={(cedula) => nav(`/usuarios/${cedula}/editar`)}
          onAction={handleAction}
        />
      </div>

      {/* MODAL DE CONFIRMACIÓN (Activar/Desactivar) */}
      {confirmModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden animate-fade-in-up">
            <div className="p-8 text-center">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${confirmModal.action === 'delete' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <HiOutlineSwitchHorizontal className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {confirmModal.action === 'delete' ? '¿Desactivar usuario?' : '¿Activar usuario?'}
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {confirmModal.action === 'delete'
                  ? 'El usuario será desactivado y ya no aparecerá en las listas activas, pero sus datos se mantendrán.'
                  : 'El usuario volverá a estar activo y disponible en el sistema.'
                }
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAction}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition flex-1 transform active:scale-95 ${confirmModal.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
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