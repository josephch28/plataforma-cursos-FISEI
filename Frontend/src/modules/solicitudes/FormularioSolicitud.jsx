import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';

export default function FormularioSolicitud({ onSubmit, initialData = null }) {
  const navigate = useNavigate();
  const [tipoFormulario, setTipoFormulario] = useState('usuario');
  const [nombreSolicitante, setNombreSolicitante] = useState('');
  const [apellidoSolicitante, setApellidoSolicitante] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [fechaSolicitud, setFechaSolicitud] = useState(new Date().toISOString().split('T')[0]);
  
  const [encargado1, setEncargado1] = useState('');
  const [encargado2, setEncargado2] = useState('');
  const [encargado3, setEncargado3] = useState('');
  const [encargado4, setEncargado4] = useState('');
  
  const [descripcion, setDescripcion] = useState('');
  const [razon, setRazon] = useState('');
  const [fechaDeseada, setFechaDeseada] = useState('');
  const [contacto, setContacto] = useState('');
  
  const [tipoCambio, setTipoCambio] = useState('');
  const [impacto, setImpacto] = useState('bajo');
  
  const [entornoBack, setEntornoBack] = useState(false);
  const [entornoFront, setEntornoFront] = useState(false);
  const [entornoBd, setEntornoBd] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTipoFormulario(initialData.tipo_formulario || 'usuario');
      setNombreSolicitante(initialData.nombre_solicitante || '');
      setApellidoSolicitante(initialData.apellido_solicitante || '');
      setPrioridad(initialData.prioridad || 'media');
      setFechaSolicitud(initialData.fecha_solicitud || new Date().toISOString().split('T')[0]);
      setEncargado1(initialData.encargado1 || '');
      setEncargado2(initialData.encargado2 || '');
      setEncargado3(initialData.encargado3 || '');
      setEncargado4(initialData.encargado4 || '');
      setDescripcion(initialData.descripcion || '');
      setRazon(initialData.razon || '');
      setFechaDeseada(initialData.fecha_deseada || '');
      setContacto(initialData.contacto || '');
      setTipoCambio(initialData.tipo_cambio || 'rutinario');
      setImpacto(initialData.impacto || 'bajo');
      setEntornoBack(initialData.entorno_back || false);
      setEntornoFront(initialData.entorno_front || false);
      setEntornoBd(initialData.entorno_bd || false);
    }
  }, [initialData]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        tipo_formulario: tipoFormulario,
        nombre_solicitante: nombreSolicitante,
        apellido_solicitante: apellidoSolicitante,
        prioridad,
        fecha_solicitud: fechaSolicitud,
        encargado1,
        encargado2,
        encargado3,
        encargado4,
        descripcion,
        razon,
        fecha_deseada: fechaDeseada,
        contacto,
        tipo_cambio: tipoFormulario === 'experto' ? tipoCambio : null,
        impacto: tipoFormulario === 'experto' ? impacto : null,
        entorno_back: entornoBack ? 1 : 0,
        entorno_front: entornoFront ? 1 : 0,
        entorno_bd: entornoBd ? 1 : 0
      };

      if (initialData?.id) {
        // Actualizar
        await API.put(`/solicitudes/${initialData.id}`, payload);
      } else {
        // Crear
        await API.post('/solicitudes', payload);
      }

      if (onSubmit) {
        onSubmit();
      } else {
        navigate('/solicitudes');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? 'Editar Solicitud' : 'Nueva Solicitud de Cambio'}
        </h2>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Tipo de formulario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Formulario</label>
        <select
          value={tipoFormulario}
          onChange={(e) => setTipoFormulario(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="usuario">Usuario</option>
          <option value="experto">Experto</option>
        </select>
      </div>

      {/* Nombre y apellido del solicitante */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Solicitante</label>
          <input
            type="text"
            value={nombreSolicitante}
            onChange={(e) => setNombreSolicitante(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Solicitante</label>
          <input
            type="text"
            value={apellidoSolicitante}
            onChange={(e) => setApellidoSolicitante(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Prioridad y Fecha */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Solicitud</label>
          <input
            type="date"
            value={fechaSolicitud}
            onChange={(e) => setFechaSolicitud(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Encargados */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Encargados (Mínimo 1)</label>
        {[
          { value: encargado1, onChange: setEncargado1, label: 'Encargado 1' },
          { value: encargado2, onChange: setEncargado2, label: 'Encargado 2 (Opcional)' },
          { value: encargado3, onChange: setEncargado3, label: 'Encargado 3 (Opcional)' },
          { value: encargado4, onChange: setEncargado4, label: 'Encargado 4 (Opcional)' }
        ].map((field, idx) => (
          <input
            key={idx}
            type="text"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.label}
            required={idx === 0}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      {/* Descripción y Razón */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows="4"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Razón del Cambio</label>
          <textarea
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            required
            rows="4"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fecha Deseada y Contacto */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Deseada (Opcional)</label>
          <input
            type="date"
            value={fechaDeseada}
            onChange={(e) => setFechaDeseada(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
          <input
            type="text"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            required
            placeholder="Email o teléfono"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Campos exclusivos de Experto */}
      {tipoFormulario === 'experto' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cambio</label>
              <select
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rutinario">Rutinario</option>
                <option value="estandar">Estándar</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Impacto</label>
              <select
                value={impacto}
                onChange={(e) => setImpacto(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Entornos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Entornos Afectados</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={entornoBack}
              onChange={(e) => setEntornoBack(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Backend</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={entornoFront}
              onChange={(e) => setEntornoFront(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Frontend</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={entornoBd}
              onChange={(e) => setEntornoBd(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Base de Datos</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => navigate('/solicitudes')}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

