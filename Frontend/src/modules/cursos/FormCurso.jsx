// src/modules/cursos/FormCurso.jsx
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const isTenDigits = (v) => /^[0-9]{10}$/.test(v || '');

function toDateInputValue(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const PUBLICO_OPTIONS = [
  { value: 'Estudiantes UTA', label: 'Estudiantes UTA' },
  { value: 'Personal UTA', label: 'Personal UTA' },
  { value: 'Público General', label: 'Público General' },
];

export default function FormCurso({ initial = {}, onSaved, auth }) {
  const [data, setData] = useState({
    cedula_responsable: initial.cedula_responsable || '',
    cedula_docente: initial.cedula_docente || '',
    nombre: initial.nombre || '',
    descripcion: initial.descripcion || '',
    tipo: initial.tipo || '',
    horas: initial.horas ?? '',
    es_pagado: initial.es_pagado ?? false,
    costo: initial.costo ?? 0,
    publico_objetivo: initial.publico_objetivo || '',
    nota_aprobacion: initial.nota_aprobacion ?? 7,
    requiere_asistencia: initial.requiere_asistencia ?? true,
    fecha_inicio: toDateInputValue(initial.fecha_inicio),
    fecha_fin: toDateInputValue(initial.fecha_fin)
  });

  // Estado dual: nombre en UI, id para backend
  const [prereqId, setPrereqId] = useState(initial.prerequisito ?? null);
  const [prereqNombre, setPrereqNombre] = useState(initial.prerequisito_nombre || '');

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  // Typeahead de cursos
  const [cursoOptions, setCursoOptions] = useState([]); // {value: nombre, label: nombre}
  const [idPorNombre, setIdPorNombre] = useState({});   // {'Nombre': id}

  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.listUsuarios({}, auth).then(setUsuarios);
    fetchCursos('');
  }, [auth]);

  const fetchCursos = async (q) => {
    const res = await API.listCursos({ q, size: 20 }, auth);
    setCursoOptions(res.map(c => ({ value: c.nombre, label: c.nombre })));
    setIdPorNombre(prev => {
      const copy = { ...prev };
      res.forEach(c => { copy[c.nombre] = c.id_curso || c.id; });
      return copy;
    });
  };

  // Precarga nombre por id en edición
  useEffect(() => {
    const loadById = async () => {
      if (prereqId && !prereqNombre) {
        const c = await API.getCurso(prereqId, auth);
        if (c?.nombre) {
          setPrereqNombre(c.nombre);
          setCursoOptions(prev => [{ value: c.nombre, label: c.nombre }, ...prev]);
          setIdPorNombre(prev => ({ ...prev, [c.nombre]: prereqId }));
        }
      }
    };
    loadById();
  }, [prereqId, prereqNombre, auth]);

  const encargadoOptions = useMemo(
    () => usuarios
      .filter(u => u.rol === 'responsable' || u.rol === 'encargado')
      .map(u => ({ value: u.cedula, label: `${u.cedula} - ${u.nombre} ${u.apellido}` })),
    [usuarios]
  );

  const docenteOptions = useMemo(
    () => usuarios.map(u => ({ value: u.cedula, label: `${u.cedula} - ${u.nombre} ${u.apellido}` })),
    [usuarios]
  );

  const publicoValue = useMemo(() => {
    if (!data.publico_objetivo) return [];
    if (Array.isArray(data.publico_objetivo)) {
      return data.publico_objetivo.map(v => PUBLICO_OPTIONS.find(o => o.value === v) || { value: v, label: v });
    }
    const parts = String(data.publico_objetivo || '').split(',').map(s => s.trim()).filter(Boolean);
    return parts.map(v => ({ value: v, label: v }));
  }, [data.publico_objetivo]);

  const validate = () => {
    const e = {};
    if (!isTenDigits(data.cedula_responsable)) e.cedula_responsable = 'Cédula encargado: exactamente 10 dígitos';
    if (!data.nombre || data.nombre.trim().length < 3) e.nombre = 'Nombre mínimo 3 caracteres';
    if (data.horas !== '' && (!Number.isInteger(Number(data.horas)) || Number(data.horas) <= 0)) e.horas = 'Horas entero positivo';
    if (data.nota_aprobacion < 0 || data.nota_aprobacion > 10) e.nota_aprobacion = 'Nota entre 0 y 10';
    if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) > new Date(data.fecha_fin)) e.fecha_fin = 'Fin debe ser mayor o igual a inicio';
    if (data.es_pagado && (data.costo === '' || Number(data.costo) < 0)) e.costo = 'Costo válido requerido';
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
        // cedula_admin ahora la impone el backend desde token/headers
        cedula_responsable: typeof data.cedula_responsable === 'object' ? data.cedula_responsable.value : data.cedula_responsable,
        cedula_docente: typeof data.cedula_docente === 'object' ? data.cedula_docente.value : (data.cedula_docente || null),
        horas: data.horas === '' ? null : Number(data.horas),
        costo: data.es_pagado ? Number(data.costo || 0) : 0,
        nota_aprobacion: Number(data.nota_aprobacion),
        requiere_asistencia: Boolean(data.requiere_asistencia),
        es_pagado: Boolean(data.es_pagado),
        fecha_inicio: toDateInputValue(data.fecha_inicio),
        fecha_fin: toDateInputValue(data.fecha_fin),
        prerequisito: prereqId ?? null,
        publico_objetivo: Array.isArray(data.publico_objetivo)
          ? data.publico_objetivo
          : publicoValue.map(o => o.value)
      };

      if (initial.id_curso) {
        await API.updateCurso(initial.id_curso, payload, auth);
        setMensaje({ tipo: 'exito', texto: 'Curso actualizado correctamente.' });
      } else {
        await API.createCurso(payload, auth);
        setMensaje({ tipo: 'exito', texto: 'Curso creado correctamente.' });
      }

      setTimeout(() => {
        setMensaje(null);
        onSaved?.();
      }, 1200);
    } catch (err) {
      console.error('SAVE error:', err);
      setMensaje({ tipo: 'error', texto: (err?.message || 'Error al guardar el curso. Intenta nuevamente.') });
    }
    setBusy(false);
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={save} className="space-y-5">
      {mensaje && (
        <div className={`rounded p-3 text-sm ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Encargado */}
      <div>
        <label className={labelClass}>Encargado</label>
        <Select
          options={encargadoOptions}
          value={encargadoOptions.find(o => o.value === data.cedula_responsable) || null}
          onChange={(opt) => setData(d => ({ ...d, cedula_responsable: opt?.value || '' }))}
          placeholder="Selecciona encargado"
        />
        {errors.cedula_responsable && <p className="text-xs text-red-600 mt-1">{errors.cedula_responsable}</p>}
      </div>

      {/* Docente */}
      <div>
        <label className={labelClass}>Docente</label>
        <Select
          options={docenteOptions}
          value={docenteOptions.find(o => o.value === data.cedula_docente) || null}
          onChange={(opt) => setData(d => ({ ...d, cedula_docente: opt?.value || '' }))}
          placeholder="Selecciona docente"
          isClearable
        />
      </div>

      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre del curso</label>
        <input
          className={inputClass}
          value={data.nombre}
          onChange={(e) => setData({ ...data, nombre: e.target.value })}
          required
        />
        {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          className={inputClass}
          value={data.descripcion}
          onChange={(e) => setData({ ...data, descripcion: e.target.value })}
          rows={3}
        />
      </div>

      {/* Tipo y Horas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            className={inputClass}
            value={data.tipo}
            onChange={(e) => setData({ ...data, tipo: e.target.value })}
          >
            <option value="">Selecciona</option>
            <option value="Curso">Curso</option>
            <option value="Webinar">Webinar</option>
            <option value="Taller">Taller</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Horas</label>
          <input
            className={inputClass}
            type="number"
            min={1}
            value={data.horas}
            onChange={(e) => setData({ ...data, horas: e.target.value })}
            placeholder="Ej. 20"
          />
          {errors.horas && <p className="text-xs text-red-600 mt-1">{errors.horas}</p>}
        </div>
      </div>

      {/* Prerrequisito: typeahead por nombre, guardando id */}
      <div>
        <label className={labelClass}>Prerrequisito (opcional)</label>
        <Select
          options={cursoOptions}
          value={prereqNombre ? { value: prereqNombre, label: prereqNombre } : null}
          onChange={(opt) => {
            const nombre = opt?.value || '';
            setPrereqNombre(nombre);
            setPrereqId(nombre ? idPorNombre[nombre] ?? null : null);
          }}
          onInputChange={(val, meta) => { if (meta.action === 'input-change') fetchCursos(val || ''); }}
          isClearable
          placeholder="Buscar curso existente..."
        />
      </div>

      {/* Público objetivo múltiple */}
      <div>
        <label className={labelClass}>Público objetivo</label>
        <Select
          isMulti
          options={PUBLICO_OPTIONS}
          value={publicoValue}
          onChange={(opts) => setData(d => ({ ...d, publico_objetivo: (opts || []).map(o => o.value) }))}
          placeholder="Selecciona uno o más"
        />
      </div>

      {/* Reglas de aprobación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nota de aprobación</label>
          <input
            className={inputClass}
            type="number"
            min={0}
            max={10}
            step="0.1"
            value={data.nota_aprobacion}
            onChange={(e) => setData({ ...data, nota_aprobacion: e.target.value })}
          />
          {errors.nota_aprobacion && <p className="text-xs text-red-600 mt-1">{errors.nota_aprobacion}</p>}
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
      </div>

      {/* Pago */}
      <div>
        <label className={labelClass}>Es pagado</label>
        <select
          className={inputClass}
          value={String(data.es_pagado)}
          onChange={(e) => setData({ ...data, es_pagado: e.target.value === 'true' })}
        >
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      </div>
      {data.es_pagado && (
        <div>
          <label className={labelClass}>Costo (USD)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={data.costo}
            onChange={(e) => setData({ ...data, costo: e.target.value })}
            placeholder="Ej. 120.00"
          />
          {errors.costo && <p className="text-xs text-red-600 mt-1">{errors.costo}</p>}
        </div>
      )}

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fecha inicio</label>
          <input
            type="date"
            className={inputClass}
            value={data.fecha_inicio}
            onChange={(e) => setData({ ...data, fecha_inicio: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha fin</label>
          <input
            type="date"
            className={inputClass}
            value={data.fecha_fin}
            onChange={(e) => setData({ ...data, fecha_fin: e.target.value })}
          />
          {errors.fecha_fin && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin}</p>}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 justify-end">
        <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60">
          {busy ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
