import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../../services/api'; 
import { HiCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // Nuevo estado para controlar el éxito
  
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    es_estudiante_uta: false,
    es_personal_uta: false
  });

  // Redirección automática cuando hay éxito
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2500); // Espera 2.5 segundos antes de redirigir
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.cedula.length < 10) {
      setError('La cédula debe tener al menos 10 dígitos.');
      return;
    }

    setLoading(true);

    try {
      const datosParaEnviar = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        es_estudiante_uta: formData.es_estudiante_uta ? 1 : 0,
        es_personal_uta: formData.es_personal_uta ? 1 : 0
      };

      await API.register(datosParaEnviar); 
      setSuccess(true); // ¡Éxito! Activamos la vista bonita

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  // --- VISTA DE ÉXITO ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center border border-green-100 transform transition-all animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <HiCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Cuenta Creada!</h2>
          <p className="text-gray-500 mb-6">
            Tu registro se ha completado exitosamente. <br/>
            Te estamos redirigiendo al inicio de sesión...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="bg-green-600 h-1.5 rounded-full animate-progress-bar"></div>
          </div>
          <button onClick={() => navigate('/login')} className="text-sm text-green-600 font-semibold hover:underline">
            ¿No redirige? Clic aquí
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Botón flotante para regresar al Landing (por si acaso) */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
        <HiOutlineArrowLeft className="w-5 h-5" />
        <span>Volver al inicio</span>
      </Link>

      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-500">
            Completa tus datos para acceder a la plataforma
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Nombre</label>
              <input name="nombre" type="text" required onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="Ej. Juan" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Apellido</label>
              <input name="apellido" type="text" required onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="Ej. Pérez" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Cédula</label>
            <input name="cedula" type="text" required maxLength="10" onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="10 dígitos" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Correo Electrónico</label>
            <input name="email" type="email" required onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="correo@ejemplo.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Contraseña</label>
               <input name="password" type="password" required onChange={handleChange}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="••••••" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-700 uppercase ml-1 mb-1 block">Confirmar</label>
               <input name="confirmPassword" type="password" required onChange={handleChange}
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="••••••" />
             </div>
          </div>

          <div className="flex gap-4 pt-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" name="es_estudiante_uta" onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700">Soy estudiante UTA</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" name="es_personal_uta" onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700">Soy personal UTA</span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5">
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}