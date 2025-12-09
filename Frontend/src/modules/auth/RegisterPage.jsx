// Frontend/src/modules/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../../services/api'; // Asegúrate de tener esto configurado

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado inicial basado en tu tabla 'usuario'
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    es_estudiante_uta: false, // Para coincidir con tu BD
    es_personal_uta: false    // Para coincidir con tu BD
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validaciones
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
      // 2. Preparar datos para el Backend
      // Tu BD espera rol 'estudiante', no 'usuario'
      const datosParaEnviar = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        rol: 'estudiante', // OBLIGATORIO según tu ENUM en SQL
        es_estudiante_uta: formData.es_estudiante_uta ? 1 : 0,
        es_personal_uta: formData.es_personal_uta ? 1 : 0,
        estado: 'activo'
      };

      // 3. Llamada a la API (Simulada o Real)
      console.log('Enviando a BD:', datosParaEnviar);
      await API.register(datosParaEnviar); 
      
      // 4. Redirección al Login tras éxito
      alert('¡Cuenta creada! Por favor inicia sesión.');
      navigate('/login');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al registrar el usuario. Revisa que la cédula o correo no existan ya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a la plataforma de Cursos FISEI
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Nombre</label>
              <input name="nombre" type="text" required onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Apellido</label>
              <input name="apellido" type="text" required onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase">Cédula</label>
            <input name="cedula" type="text" required maxLength="10" onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase">Correo Electrónico</label>
            <input name="email" type="email" required onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-gray-700 uppercase">Contraseña</label>
               <input name="password" type="password" required onChange={handleChange}
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-700 uppercase">Confirmar</label>
               <input name="confirmPassword" type="password" required onChange={handleChange}
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
          </div>

          {/* Checkboxes específicos de tu BD */}
          <div className="flex gap-4 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="es_estudiante_uta" onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Soy estudiante UTA</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="es_personal_uta" onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Soy personal UTA</span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}