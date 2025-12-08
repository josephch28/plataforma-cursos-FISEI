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

  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      } else {
        await API.createSolicitud(form);
      }
      setShowSuccessModal(true);
    } catch (error) {
      setToast({ message: `Error al ${isEdit ? 'actualizar' : 'crear'} solicitud`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/solicitudes');
  };

  if (loadingData) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modal de Confirmación */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isEdit ? 'Actualización Exitosa' : 'Solicitud Enviada'}
            </h3>
            <p className="text-gray-500 mb-8">
              La solicitud de cambio se ha {isEdit ? 'actualizado' : 'enviado'} correctamente.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/solicitudes')}
            className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 mb-2 transition-colors"
          >
            ← Volver al listado
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isEdit ? 'Editar Solicitud' : 'Nueva Solicitud de Cambio'}
          </h1>
          <p className="text-gray-500 mt-1">
            Complete el formulario para registrar un requerimiento de cambio en el sistema.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Card: Información del solicitante */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              1. Información del Solicitante
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Formulario <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_formulario"
                value={form.tipo_formulario}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              >
                <option value="usuario">Usuario</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_solicitante"
                value={form.nombre_solicitante}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellido_solicitante"
                value={form.apellido_solicitante}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
                placeholder="Ej. Pérez"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                required
                placeholder="Email o teléfono"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card: Fechas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              2. Fechas Importantes
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Solicitud <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_solicitud"
                value={form.fecha_solicitud}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Deseada
              </label>
              <input
                type="date"
                name="fecha_deseada"
                value={form.fecha_deseada}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card: Detalles del cambio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              3. Detalles del Requerimiento
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción del Cambio <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors resize-none"
                placeholder="Describa detalladamente qué necesita cambiar..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Razón / Justificación <span className="text-red-500">*</span>
              </label>
              <textarea
                name="razon"
                value={form.razon}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors resize-none"
                placeholder="¿Por qué es necesario este cambio?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cambio</label>
                <select
                  name="tipo_cambio"
                  value={form.tipo_cambio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
                >
                  <option value="">Seleccionar...</option>
                  <option value="rutinario">Rutinario</option>
                  <option value="estandar">Estándar</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Impacto</label>
                <input
                  type="text"
                  name="impacto"
                  value={form.impacto}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
                  placeholder="Ej. Medio, Alto, Solo visual..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card: Entornos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              4. Entornos Afectados
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-8">
              <label className="inline-flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="entorno_back"
                    checked={form.entorno_back}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-colors"
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Backend</span>
              </label>

              <label className="inline-flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="entorno_front"
                    checked={form.entorno_front}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-colors"
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Frontend</span>
              </label>

              <label className="inline-flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="entorno_bd"
                    checked={form.entorno_bd}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-colors"
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Base de Datos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Estado de la Solicitud</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
              >
                <option value="pendiente">Pendiente</option>
                <option value="realizado">Realizado</option>
              </select>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Al cambiar a "Realizado" se guardará automáticamente la fecha de término.
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/solicitudes')}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Solicitud' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>

  );
}
