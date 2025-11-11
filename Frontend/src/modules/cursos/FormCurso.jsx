// src/modules/cursos/FormCurso.jsx
import { useState } from 'react';
import { API } from '../../services/api';

const isTenDigits = (v) => /^[0-9]{10}$/.test(v || '');

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
    fecha_inicio: initial.fecha_inicio || '',
    fecha_fin: initial.fecha_fin || ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

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
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const payload = { ...data, horas: data.horas === '' ? null : Number(data.horas) };
      if (initial.id_curso) await API.updateCurso(initial.id_curso, payload, auth);
      else await API.createCurso(payload, auth);
      onSaved && onSaved();
    } catch (err) {
      alert(err?.message || 'Error al guardar');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Cédula Admin</label>
          <input
            className={inputClass}
            value={data.cedula_admin}
            onChange={(e) => setData({ ...data, cedula_admin: e.target.value })}
          />
          {errors.cedula_admin && (
            <p className="text-red-600 text-sm mt-1">{errors.cedula_admin}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Cédula Responsable</label>
          <input
            className={inputClass}
            value={data.cedula_responsable}
            onChange={(e) => setData({ ...data, cedula_responsable: e.target.value })}
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
            value={data.fecha_inicio}
            onChange={(e) => setData({ ...data, fecha_inicio: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha de fin</label>
          <input
            type="date"
            className={inputClass}
            value={data.fecha_fin}
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

      <div className="flex gap-3 pt-4">
        <button
          disabled={busy}
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          {initial.id_curso ? 'Actualizar' : 'Guardar'}
        </button>
        {initial.id_curso && (
          <button
            type="button"
            onClick={() => onSaved && onSaved()}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
