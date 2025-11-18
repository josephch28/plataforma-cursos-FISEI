import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

export default function RegisterPage() {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esEstudiante, setEsEstudiante] = useState(false);
  const [esPersonal, setEsPersonal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.registerUser({ cedula, nombre, apellido, email, password, es_estudiante_uta: esEstudiante, es_personal_uta: esPersonal });
      // Redirect to login with a small success note
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Registro de usuario</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula</label>
            <input value={cedula} onChange={(e) => setCedula(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input value={apellido} onChange={(e) => setApellido(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={esEstudiante} onChange={(e) => setEsEstudiante(e.target.checked)} className="mr-2" />
              Es estudiante UTA
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" checked={esPersonal} onChange={(e) => setEsPersonal(e.target.checked)} className="mr-2" />
              Es personal UTA
            </label>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="text-blue-700 underline">Inicia sesión</button></p>
        </div>
      </div>
    </div>
  );
}
