// Frontend/src/modules/usuarios/UsuariosEditPage.jsx
import { useEffect, useState } from 'react';
import FormUsuario from './FormUsuario';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';

export default function UsuariosEditPage({ auth }) { // <-- DEBE INCLUIR 'export default' AQUÍ
  const { cedula } = useParams();
  const nav = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getUsuario(cedula, auth);
        setUsuario(data);
      } catch {
        alert('Error al cargar usuario');
        nav('/usuarios');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cedula, nav, auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Editar Usuario: {usuario.nombre} {usuario.apellido}</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormUsuario initial={usuario} auth={auth} onSaved={() => nav('/usuarios')} />
      </div>
    </div>
  );
}