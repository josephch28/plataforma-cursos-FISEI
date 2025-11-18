// Frontend/src/modules/usuarios/FormUsuario.jsx
import { useState } from 'react';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const isTenDigits = (v) => /^[0-9]{10}$/.test(v || '');

export default function FormUsuario({ initial = {}, onSaved }) { // <-- SIN auth
  const isUpdate = !!initial.cedula;
  const { user } = useAuth();
  const [data, setData] = useState({
    cedula: initial.cedula || '',
    nombre: initial.nombre || '',
    apellido: initial.apellido || '',
    email: initial.email || '',
    rol: initial.rol || 'usuario',
    password: '',
    es_estudiante_uta: !!initial.es_estudiante_uta,
    es_personal_uta: !!initial.es_personal_uta, 
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!isTenDigits(data.cedula)) e.cedula = 'Cédula: exactamente 10 dígitos';
    if (!data.nombre || data.nombre.trim().length < 3) e.nombre = 'Nombre mínimo 3 caracteres';
    if (!data.apellido || data.apellido.trim().length < 3) e.apellido = 'Apellido mínimo 3 caracteres';
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Email: formato inválido';
    if (!data.rol) e.rol = 'Rol es requerido';
    if (!isUpdate && (!data.password || data.password.length < 6)) e.password = 'Password mínimo 6 caracteres';
    if (isUpdate && data.password && data.password.length < 6) e.password = 'Password (si se actualiza) mínimo 6 caracteres';

    return e;
  };

  const save = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setErrors({});
    setMensaje(null);
    try {
      const e = validate();
      setErrors(e);
      if (Object.keys(e).length) return;

      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol: data.rol,
        es_estudiante_uta: data.es_estudiante_uta,
        es_personal_uta: data.es_personal_uta,
      };

      if (!isUpdate || data.password) {
        payload.password = data.password;
      }
      
      if (isUpdate) {
        await API.updateUsuario(initial.cedula, payload); // <-- SIN auth
        setMensaje({ tipo: 'exito', texto: 'Usuario actualizado correctamente.' });
      } else {
        payload.cedula = data.cedula;
        await API.createUsuario(payload); // <-- SIN auth
        setMensaje({ tipo: 'exito', texto: 'Usuario creado correctamente.' });
        // Limpiar campos para nueva entrada
        setData({ cedula: '', nombre: '', apellido: '', email: '', rol: 'usuario', password: '' });
      }
      
      setTimeout(() => {
        setMensaje(null);
        if (onSaved) onSaved();
      }, 1200);
    } catch (e) {
      const msg = e?.message || e?.errors?.[0] || 'Error al guardar el usuario. Intenta nuevamente.';
      setMensaje({ tipo: 'error', texto: msg });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Cédula</label>
          <input
            className={inputClass}
            value={data.cedula}
            onChange={(e) => setData({ ...data, cedula: e.target.value })}
            disabled={isUpdate}
          />
          {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
        </div>
        <div>
          <label className={labelClass}>Rol</label>
          <select
            className={inputClass}
            value={data.rol}
            onChange={(e) => setData({ ...data, rol: e.target.value })}
          >
            <option value="usuario">Usuario</option>
            <option value="responsable">Responsable</option>
            <option value="admin">Admin</option>
          </select>
          {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
        </div>
        {/* ... Resto de campos (Nombre, Apellido, Email, Password) ... */}
        <div>
          <label className={labelClass}>Nombre</label>
          <input className={inputClass} value={data.nombre} onChange={(e) => setData({ ...data, nombre: e.target.value })} />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <label className={labelClass}>Apellido</label>
          <input className={inputClass} value={data.apellido} onChange={(e) => setData({ ...data, apellido: e.target.value })} />
          {errors.apellido && <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Email</label>
          <input type="email" className={inputClass} value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Password {isUpdate && '(Dejar en blanco para no cambiar)'}</label>
          <input type="password" className={inputClass} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </div>
        <div className="md:col-span-2 pt-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pertenencia a la UTA</h3>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="es_estudiante_uta"
                checked={data.es_estudiante_uta}
                onChange={(e) => setData({ ...data, es_estudiante_uta: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Es Estudiante UTA</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="es_personal_uta"
                checked={data.es_personal_uta}
                onChange={(e) => setData({ ...data, es_personal_uta: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Es Personal UTA</span>
            </label>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-4 p-3 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="pt-2 flex gap-2 mt-8">
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {busy ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          onClick={() => navigate('/usuarios')}
        >
          Volver
        </button>
      </div>
    </form>
  );
}