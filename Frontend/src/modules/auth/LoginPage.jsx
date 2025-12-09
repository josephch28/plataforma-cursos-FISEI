// src/modules/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.rol) {
        case 'admin':
        case 'develop': navigate('/dashboard'); break;
        case 'responsable': navigate('/cursos'); break;
        case 'usuario': navigate('/catalogo'); break;
        case 'comite': navigate('/solicitudes/dashboard'); break; // ✅ AGREGADO
        default: break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      switch (userData.rol) {
        case 'admin': navigate('/dashboard'); break;
        case 'responsable': navigate('/cursos'); break;
        case 'estudiante':
        case 'usuario': navigate('/catalogo'); break;
        case 'develop': navigate('/dashboard'); break;
        case 'comite': navigate('/solicitudes'); break; // ✅ AGREGADO
        default: navigate('/catalogo');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (El resto del renderizado visual se mantiene igual)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-blue-700 transition-all duration-300 font-medium px-4 py-2 rounded-full hover:bg-white/50">
        <HiOutlineArrowLeft className="w-5 h-5" /><span>Volver al inicio</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Plataforma de Cursos FISEI</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="correo@ejemplo.com" /></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="••••••••" /></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium">{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</button>
        </form>
        <div className="signup-prompt mt-6 text-center text-sm text-gray-700">
          <span className="mr-2">¿No tienes una cuenta?</span>
          <Link to="/register" className="signup-link text-blue-600 font-semibold hover:text-blue-700">
            Regístrate
          </Link>
        </div>
        <div className="mt-6 border-t pt-4">
          <p className="text-center text-sm font-medium text-gray-700 mb-3">Usuarios de prueba:</p>
          <div className="space-y-2 text-xs">
            <div className="bg-blue-50 p-2 rounded"><p className="font-semibold text-blue-700">Admin</p><p className="font-mono text-gray-700">damian@uta.edu.ec / 123456</p></div>
            <div className="bg-green-50 p-2 rounded"><p className="font-semibold text-green-700">Responsable</p><p className="font-mono text-gray-700">boris@uta.edu.ex / 123456</p></div>
            <div className="bg-purple-50 p-2 rounded"><p className="font-semibold text-purple-700">Usuario</p><p className="font-mono text-gray-700">jm@gmail.com / 123456</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}