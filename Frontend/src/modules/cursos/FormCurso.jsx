// src/modules/cursos/FormCurso.jsx
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const isTenDigits = (v) => /^[0-9]{10}$/.test(v || '');

function toDateInputValue(date) {
  if (!date) return '';
  // Si ya está en formato yyyy-MM-dd, regresa igual
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Si es formato ISO, conviértelo
  const d = new Date(date);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function FormCurso({ initial = {}, onSaved, auth }) {
  const [data, setData] = useState({
    cedula_admin: initial.cedula_admin || '',
    cedula_responsable: initial.cedula_responsable || '',
    nombre: initial.nombre || '',
    descripcion: initial.descripcion || '',
    tipo: initial.tipo || '',
    horas: initial.horas ?? '',
    es_pagado: initial.es_pagado ?? false,
    prerequisito: initial.prerequisito || '',
    publico_objetivo: initial.publico_objetivo || '',
    nota_aprobacion: initial.nota_aprobacion ?? 7,
    requiere_asistencia: initial.requiere_asistencia ?? true,
    fecha_inicio: toDateInputValue(initial.fecha_inicio),
    fecha_fin: toDateInputValue(initial.fecha_fin)
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carga los usuarios para el autocompletado
    API.listUsuarios().then(setUsuarios);
  }, []);

  const usuarioOptions = usuarios.map(u => ({
    value: u.cedula,
    label: `${u.cedula} - ${u.nombre} ${u.apellido}`
  }));

  const validate = () => {
    const e = {};
    if (!isTenDigits(data.cedula_admin))
      e.cedula_admin = 'Cédula admin: exactamente 10 dígitos';
    if (!isTenDigits(data.cedula_responsable))
      e.cedula_responsable = 'Cédula responsable: exactamente 10 dígitos';
    if (!data.nombre || data.nombre.trim().length < 3)
      e.nombre = 'Nombre mínimo 3 caracteres';
    if (
      data.horas !== '' &&
      (!Number.isInteger(Number(data.horas)) || Number(data.horas) <= 0)
    )
      e.horas = 'Horas entero positivo';
    if (data.nota_aprobacion < 0 || data.nota_aprobacion > 10)
      e.nota_aprobacion = 'Nota entre 0 y 10';
    if (
      data.fecha_inicio &&
      data.fecha_fin &&
      new Date(data.fecha_inicio) > new Date(data.fecha_fin)
    )
      e.fecha_fin = 'Fin debe ser mayor o igual a inicio';
    return e;
  };

  const save = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const e = validate();
      setErrors(e);
      if (Object.keys(e).length) return;
      const payload = {
        ...data,
        cedula_admin: typeof data.cedula_admin === 'object' ? data.cedula_admin.value : data.cedula_admin,
        cedula_responsable: typeof data.cedula_responsable === 'object' ? data.cedula_responsable.value : data.cedula_responsable,
        horas: data.horas === '' ? null : Number(data.horas),
        nota_aprobacion: Number(data.nota_aprobacion),
        requiere_asistencia: Boolean(data.requiere_asistencia), 
        es_pagado: Boolean(data.es_pagado), 
        fecha_inicio: toDateInputValue(data.fecha_inicio),
        fecha_fin: toDateInputValue(data.fecha_fin)
      };
      if (initial.id_curso) {
        await API.updateCurso(initial.id_curso, payload, auth);
        setMensaje({ tipo: 'exito', texto: 'Curso actualizado correctamente.' });
      } else {
        await API.createCurso(payload, auth);
        setMensaje({ tipo: 'exito', texto: 'Curso creado correctamente.' });
        // Limpiar campos si quieres
      }
      setTimeout(() => {
        setMensaje(null);
        if (onSaved) onSaved();
      }, 1200);
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el curso. Intenta nuevamente.' });
    }
    setBusy(false);
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Cédula Admin</label>
          <Select
            options={usuarioOptions}
            value={usuarioOptions.find(o => o.value === data.cedula_admin)}
            onChange={opt => setData(d => ({ ...d, cedula_admin: opt?.value || '' }))}
            placeholder="Buscar administrador..."
            isClearable
            className="mb-4"
          />
          {errors.cedula_admin && (
            <p className="text-red-600 text-sm mt-1">{errors.cedula_admin}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Cédula Responsable</label>
          <Select
            options={usuarioOptions}
            value={usuarioOptions.find(o => o.value === data.cedula_responsable)}
            onChange={opt => setData(d => ({ ...d, cedula_responsable: opt?.value || '' }))}
            placeholder="Buscar responsable..."
            isClearable
            className="mb-4"
          />
          {errors.cedula_responsable && (
            <p className="text-red-600 text-sm mt-1">{errors.cedula_responsable}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Nombre del curso</label>
          <input
            className={inputClass}
            value={data.nombre}
            onChange={(e) => setData({ ...data, nombre: e.target.value })}
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            className={inputClass}
            rows={3}
            value={data.descripcion}
            onChange={(e) => setData({ ...data, descripcion: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            className={inputClass}
            value={data.tipo}
            onChange={(e) => setData({ ...data, tipo: e.target.value })}
          >
            <option value="">Seleccionar</option>
            <option value="Curso">Curso</option>
            <option value="Webinar">Webinar</option>
            <option value="Taller">Taller</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Horas</label>
          <input
            type="number"
            className={inputClass}
            value={data.horas}
            onChange={(e) => setData({ ...data, horas: e.target.value })}
          />
          {errors.horas && <p className="text-red-600 text-sm mt-1">{errors.horas}</p>}
        </div>
        <div>
          <label className={labelClass}>Nota de aprobación</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            className={inputClass}
            value={data.nota_aprobacion}
            onChange={(e) => setData({ ...data, nota_aprobacion: Number(e.target.value) })}
          />
          {errors.nota_aprobacion && (
            <p className="text-red-600 text-sm mt-1">{errors.nota_aprobacion}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Requiere asistencia</label>
          <select
            className={inputClass}
            value={String(data.requiere_asistencia)}
            onChange={(e) => setData({ ...data, requiere_asistencia: e.target.value === 'true' })}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Fecha de inicio</label>
          <input
            type="date"
            className={inputClass}
            value={toDateInputValue(data.fecha_inicio)}
            onChange={(e) => setData({ ...data, fecha_inicio: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha de fin</label>
          <input
            type="date"
            className={inputClass}
            value={toDateInputValue(data.fecha_fin)}
            onChange={(e) => setData({ ...data, fecha_fin: e.target.value })}
          />
          {errors.fecha_fin && <p className="text-red-600 text-sm mt-1">{errors.fecha_fin}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Público objetivo</label>
          <input
            className={inputClass}
            value={data.publico_objetivo}
            onChange={(e) => setData({ ...data, publico_objetivo: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Prerrequisito</label>
          <input
            className={inputClass}
            value={data.prerequisito}
            onChange={(e) => setData({ ...data, prerequisito: e.target.value })}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="es_pagado"
            checked={data.es_pagado}
            onChange={(e) => setData({ ...data, es_pagado: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="es_pagado" className="text-sm text-gray-700">
            Curso pagado
          </label>
        </div>
      </div>

      {errors.general && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-600">
          {errors.general}
        </div>
      )}

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
          onClick={() => navigate('/cursos')}
        >
          Volver
        </button>
      </div>
    </form>
  );
}
