import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.rol) {
          // Ya autenticado -> redirigir según rol
          if (u.rol === 'admin') return navigate('/dashboard');
          return navigate('/cursos');
        }
      } catch {}
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data;
      // Guardar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // Redirigir según rol
      if (user.rol === 'admin') return navigate('/dashboard');
      return navigate('/cursos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-100">
        <p className="text-sm text-gray-700 mb-2">Cuentas de ejemplo (haz clic en <span className="font-semibold">Usar</span> para autocompletar):</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Administrador</div>
              <div className="text-xs text-gray-600">damian@uta.edu.ec • 12345</div>
            </div>
            <button type="button" onClick={() => { setEmail('damian@uta.edu.ec'); setPassword('12345'); }} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Usar</button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Responsable</div>
              <div className="text-xs text-gray-600">boris@uta.edu.ex • 12345</div>
            </div>
            <button type="button" onClick={() => { setEmail('boris@uta.edu.ex'); setPassword('12345'); }} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Usar</button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Usuario</div>
              <div className="text-xs text-gray-600">jm@gmail.com • 12345678</div>
            </div>
            <button type="button" onClick={() => { setEmail('jm@gmail.com'); setPassword('12345678'); }} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Usar</button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">Develop</div>
              <div className="text-xs text-gray-600">carlos@uta.edu.ec • develop123</div>
            </div>
            <button type="button" onClick={() => { setEmail('carlos@uta.edu.ec'); setPassword('develop123'); }} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Usar</button>
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Correo electrónico</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-2 border rounded" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Entrar</button>
        </div>
      </form>
    </div>
  );
}
