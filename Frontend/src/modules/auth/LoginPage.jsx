// src/modules/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // If already authenticated, redirect according to role
      switch (user.rol) {
        case 'admin':
        case 'develop':
          navigate('/dashboard');
          break;
        case 'responsable':
          navigate('/cursos');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      
      // Redirigir según el rol
      switch (userData.rol) {
        case 'admin':
          navigate('/dashboard');
          break;
        case 'responsable':
          navigate('/cursos');
          break;
        case 'usuario':
          // Usuario no tiene acceso aún
          alert('El rol usuario aún no tiene acceso al sistema. Las vistas se implementarán próximamente.');
          logout();
          break;
        case 'develop':
          navigate('/dashboard');
          break;
        default:
          navigate('/cursos');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Plataforma de Cursos FISEI</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-center text-sm font-medium text-gray-700 mb-3">Usuarios de prueba:</p>
          <div className="space-y-2 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <p className="font-semibold text-blue-700">Admin</p>
              <p className="font-mono text-gray-700">damian@uta.edu.ec / 123456</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="font-semibold text-green-700">Responsable</p>
              <p className="font-mono text-gray-700">boris@uta.edu.ex / 123456</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <p className="font-semibold text-purple-700">Usuario (Sin acceso aún)</p>
              <p className="font-mono text-gray-700">jm@gmail.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
