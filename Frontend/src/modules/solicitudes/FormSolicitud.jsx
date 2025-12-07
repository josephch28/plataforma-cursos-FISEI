// src/modules/solicitudes/FormSolicitud.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';
import Toast from '../../components/Toast';

export default function FormSolicitud() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    tipo_formulario: 'usuario',
    nombre_solicitante: '',
    apellido_solicitante: '',
    prioridad: 'media',
    fecha_solicitud: new Date().toISOString().split('T')[0],

    descripcion: '',
    razon: '',
    fecha_deseada: '',
    contacto: '',
    tipo_cambio: '',
    impacto: '',
    entorno_back: false,
    entorno_front: false,
    entorno_bd: false,
    estado: 'pendiente'
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isEdit) {
      loadSolicitud();
    }
  }, [id]);

  const loadSolicitud = async () => {
    try {
      const data = await API.getSolicitud(id);
      setForm({
        ...data,
        fecha_solicitud: data.fecha_solicitud?.split('T')[0] || '',
        fecha_deseada: data.fecha_deseada?.split('T')[0] || '',
        tipo_cambio: data.tipo_cambio || '',
        impacto: data.impacto || ''
      });
    } catch (error) {
      setToast({ message: 'Error al cargar solicitud', type: 'error' });
      setTimeout(() => navigate('/solicitudes'), 2000);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await API.updateSolicitud(id, form);
        setToast({ message: 'Solicitud actualizada correctamente', type: 'success' });
      } else {
        await API.createSolicitud(form);
        setToast({ message: 'Solicitud creada correctamente', type: 'success' });
      }
      setTimeout(() => navigate('/solicitudes'), 1500);
    } catch (error) {
      setToast({ message: `Error al ${isEdit ? 'actualizar' : 'crear'} solicitud`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Editar' : 'Nueva'} Solicitud de Cambio
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Información del solicitante */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Solicitante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Formulario <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_formulario"
                value={form.tipo_formulario}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="usuario">Usuario</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_solicitante"
                value={form.nombre_solicitante}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellido_solicitante"
                value={form.apellido_solicitante}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                required
                placeholder="Email o teléfono"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Fechas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Solicitud <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_solicitud"
                value={form.fecha_solicitud}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Deseada
              </label>
              <input
                type="date"
                name="fecha_deseada"
                value={form.fecha_deseada}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>



        {/* Detalles del cambio */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detalles del Cambio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón <span className="text-red-500">*</span>
              </label>
              <textarea
                name="razon"
                value={form.razon}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cambio</label>
                <select
                  name="tipo_cambio"
                  value={form.tipo_cambio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="rutinario">Rutinario</option>
                  <option value="estandar">Estándar</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impacto</label>
                <input
                  type="text"
                  name="impacto"
                  value={form.impacto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Entornos afectados */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Entornos Afectados</h2>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="entorno_back"
                checked={form.entorno_back}
                onChange={handleChange}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Backend</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="entorno_front"
                checked={form.entorno_front}
                onChange={handleChange}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Frontend</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="entorno_bd"
                checked={form.entorno_bd}
                onChange={handleChange}
                className="mr-2 w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Base de Datos</span>
            </label>
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estado</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="realizado">Realizado</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                * Al cambiar a "Realizado" se guardará automáticamente la fecha de término
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/solicitudes')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'} Solicitud
          </button>
        </div>
      </form>
    </div>
  );
}
