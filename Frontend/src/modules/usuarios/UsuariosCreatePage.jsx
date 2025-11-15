// Frontend/src/modules/usuarios/UsuariosCreatePage.jsx
import { useNavigate } from 'react-router-dom';
import FormUsuario from './FormUsuario';

export default function UsuariosCreatePage({ auth }) {
  const nav = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Crear Usuario</h1>
        <button
          onClick={() => nav('/usuarios')}
          className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
        >
          Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormUsuario initial={{ rol: 'usuario' }} auth={auth} onSaved={() => nav('/usuarios')} />
      </div>
    </div>
  );
}