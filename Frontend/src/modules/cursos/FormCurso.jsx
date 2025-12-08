// src/modules/cursos/FormCurso.jsx
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

export default function FormCurso({ initial = {}, onSaved }) {
  const { user, token } = useAuth();
  const auth = token;
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
    min_asistencia: initial.min_asistencia ?? 75,
    fecha_inicio: toDateInputValue(initial.fecha_inicio),
    fecha_fin: toDateInputValue(initial.fecha_fin),
    fecha_inicio_inscripcion: toDateInputValue(initial.fecha_inicio_inscripcion),
    fecha_fin_inscripcion: toDateInputValue(initial.fecha_fin_inscripcion)
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

  // Determine if locked (Active course + Restriction rule)
  const isLocked = initial.estado === 'activo' || (initial.id_curso && initial.inactivo === false && initial.estado !== 'finalizado');

  // Determine if it is Admin Creating (Shell Mode)
  // If !initial.id_curso (creating) AND user.rol === 'admin'
  const isCreation = !initial.id_curso;
  const isAdmin = user?.rol === 'admin';
  const isShellMode = isCreation && isAdmin;

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

  // Preload prereq name
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

  // Load Options for Encargado Async
  const loadEncargados = (inputValue, callback) => {
    API.listUsuarios({ q: inputValue, rol: 'responsable' }, auth).then(users => {
      const options = users.map(u => ({ value: u.cedula, label: `${u.cedula} - ${u.nombre} ${u.apellido}` }));
      callback(options);
    });
  };

  const [selectedEncargado, setSelectedEncargado] = useState(null);

  // Initial load of Encargado Label
  useEffect(() => {
    if (initial.cedula_responsable && !selectedEncargado) {
      API.getUsuario(initial.cedula_responsable).then(u => {
        if (u) setSelectedEncargado({ value: u.cedula, label: `${u.cedula} - ${u.nombre} ${u.apellido}` });
      });
    }
  }, [initial.cedula_responsable]);

  const docenteOptions = useMemo(
    () => usuarios
      .filter(u => u.rol === 'usuario')
      .map(u => ({ value: u.cedula, label: `${u.cedula} - ${u.nombre} ${u.apellido}` })),
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


  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let updates = { tipo: newType };

    if (newType === 'Webinar' || newType === 'Congreso') {
      updates.nota_aprobacion = 0; // No approval grade usually
      updates.requiere_asistencia = true; // Usually attendance is key
      updates.min_asistencia = 100; // Usually full attendance expected for cert
    } else if (newType === 'Curso') {
      updates.nota_aprobacion = 7; // Standard
      updates.requiere_asistencia = true;
      updates.min_asistencia = 75; // Standard
    }

    setData(prev => ({ ...prev, ...updates }));
  };

  const validate = () => {
    const e = {};
    if (!isTenDigits(data.cedula_responsable)) e.cedula_responsable = 'Cédula encargado: exactamente 10 dígitos';
    if (!data.nombre || data.nombre.trim().length < 3) e.nombre = 'Nombre mínimo 3 caracteres';

    // In Shell Mode, only Name and Encargado are required.
    if (!isShellMode) {
      if (data.horas !== '' && (!Number.isInteger(Number(data.horas)) || Number(data.horas) <= 0)) e.horas = 'Horas entero positivo';

      // Validation Logic: For Webinar/Congreso, grade requirements might be lax
      if (data.tipo === 'Curso') {
        if (data.nota_aprobacion < 0 || data.nota_aprobacion > 10) e.nota_aprobacion = 'Nota entre 0 y 10';
      }

      if (data.requiere_asistencia) {
        if (data.min_asistencia < 0 || data.min_asistencia > 100) e.min_asistencia = 'Mínimo entre 0 y 100';
      }

      if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) > new Date(data.fecha_fin)) e.fecha_fin = 'Fin debe ser mayor o igual a inicio';
      if (data.fecha_inicio_inscripcion && data.fecha_fin_inscripcion && new Date(data.fecha_inicio_inscripcion) > new Date(data.fecha_fin_inscripcion)) e.fecha_fin_inscripcion = 'Fin insc. debe ser mayor o igual a inicio';
      if (data.es_pagado && (data.costo === '' || Number(data.costo) < 0)) e.costo = 'Costo válido requerido';
    }
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
        cedula_responsable: typeof data.cedula_responsable === 'object' ? data.cedula_responsable.value : data.cedula_responsable,
        cedula_docente: typeof data.cedula_docente === 'object' ? data.cedula_docente.value : (data.cedula_docente || null),
        horas: data.horas === '' ? null : Number(data.horas),
        costo: data.es_pagado ? Number(data.costo || 0) : 0,
        nota_aprobacion: Number(data.nota_aprobacion),
        requiere_asistencia: Boolean(data.requiere_asistencia),
        min_asistencia: data.requiere_asistencia ? Number(data.min_asistencia) : null,
        es_pagado: Boolean(data.es_pagado),
        fecha_inicio: toDateInputValue(data.fecha_inicio),
        fecha_fin: toDateInputValue(data.fecha_fin),
        fecha_inicio_inscripcion: toDateInputValue(data.fecha_inicio_inscripcion),
        fecha_fin_inscripcion: toDateInputValue(data.fecha_fin_inscripcion),
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
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm mb-4">
          <strong>Modo Lectura:</strong> Este curso está activo. Para modificar reglas críticas (fechas, horas, costos), primero debe desactivarlo.
        </div>
      )}
      {mensaje && (
        <div className={`rounded p-3 text-sm ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Encargado - Async Select */}
      {isAdmin && (
        <div>
          <label className={labelClass}>Encargado (Buscar por nombre)</label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadEncargados}
            value={selectedEncargado}
            onChange={(opt) => {
              setSelectedEncargado(opt);
              setData(d => ({ ...d, cedula_responsable: opt?.value || '' }));
            }}
            placeholder="Escribe para buscar..."
            isDisabled={!isAdmin && isLocked}
          />
          {errors.cedula_responsable && <p className="text-xs text-red-600 mt-1">{errors.cedula_responsable}</p>}
        </div>
      )}

      {/* Docente */}
      {!isShellMode && (
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
      )}

      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre del curso</label>
        <input
          className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={data.nombre}
          onChange={(e) => setData({ ...data, nombre: e.target.value })}
          required
          disabled={isLocked}
        />
        {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción {isShellMode && '(Opcional)'}</label>
        <textarea
          className={inputClass}
          value={data.descripcion}
          onChange={(e) => setData({ ...data, descripcion: e.target.value })}
          rows={3}
        />
      </div>

      {!isShellMode && (
        <>
          {/* Tipo y Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={data.tipo}
                onChange={handleTypeChange}
                disabled={isLocked}
              >
                <option value="">Selecciona</option>
                <option value="Curso">Curso</option>
                <option value="Webinar">Webinar</option>
                <option value="Congreso">Congreso</option>
                <option value="Taller">Taller</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Horas</label>
              <input
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                type="number"
                min={1}
                value={data.horas}
                onChange={(e) => setData({ ...data, horas: e.target.value })}
                placeholder="Ej. 20"
                disabled={isLocked}
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
              isDisabled={isLocked}
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
              isDisabled={isLocked}
            />
          </div>

          {/* Reglas de aprobación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nota de aprobación</label>
              <input
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                type="number"
                min={0}
                max={10}
                step="0.1"
                value={data.nota_aprobacion}
                onChange={(e) => setData({ ...data, nota_aprobacion: e.target.value })}
                disabled={isLocked}
              />
              {errors.nota_aprobacion && <p className="text-xs text-red-600 mt-1">{errors.nota_aprobacion}</p>}
            </div>
            <div>
              <label className={labelClass}>Requiere asistencia</label>
              <select
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={String(data.requiere_asistencia)}
                onChange={(e) => setData({ ...data, requiere_asistencia: e.target.value === 'true' })}
                disabled={isLocked}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            {data.requiere_asistencia && (
              <div>
                <label className={labelClass}>Asistencia Mínima (%)</label>
                <input
                  className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  type="number"
                  min={0}
                  max={100}
                  value={data.min_asistencia}
                  onChange={(e) => setData({ ...data, min_asistencia: e.target.value })}
                  disabled={isLocked}
                />
                {errors.min_asistencia && <p className="text-xs text-red-600 mt-1">{errors.min_asistencia}</p>}
              </div>
            )}
          </div>

          {/* Pago */}
          <div>
            <label className={labelClass}>Es pagado</label>
            <select
              className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={String(data.es_pagado)}
              onChange={(e) => setData({ ...data, es_pagado: e.target.value === 'true' })}
              disabled={isLocked}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
          {data.es_pagado && (
            <div>
              <label className={labelClass}>Costo (USD)</label>
              <input
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                type="number"
                min="0"
                step="0.01"
                value={data.costo}
                onChange={(e) => setData({ ...data, costo: e.target.value })}
                placeholder="Ej. 120.00"
                disabled={isLocked}
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
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={data.fecha_inicio}
                onChange={(e) => setData({ ...data, fecha_inicio: e.target.value })}
                disabled={isLocked}
              />
            </div>
            <div>
              <label className={labelClass}>Fecha fin</label>
              <input
                type="date"
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={data.fecha_fin}
                onChange={(e) => setData({ ...data, fecha_fin: e.target.value })}
                disabled={isLocked}
              />
              {errors.fecha_fin && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin}</p>}
            </div>
          </div>

          {/* Fechas de Inscripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha Inicio Inscripción</label>
              <input
                type="date"
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={data.fecha_inicio_inscripcion}
                onChange={(e) => setData({ ...data, fecha_inicio_inscripcion: e.target.value })}
                disabled={isLocked}
              />
            </div>
            <div>
              <label className={labelClass}>Fecha Fin Inscripción</label>
              <input
                type="date"
                className={`${inputClass} ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={data.fecha_fin_inscripcion}
                onChange={(e) => setData({ ...data, fecha_fin_inscripcion: e.target.value })}
                disabled={isLocked}
              />
              {errors.fecha_fin_inscripcion && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin_inscripcion}</p>}
            </div>
          </div>
        </>
      )}

      {/* Acciones */}
      <div className="flex gap-3 justify-end">
        <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        {(!isLocked || initial.estado === 'inactivo' || user?.rol === 'admin' || initial.estado === 'creado') && (
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60">
            {busy ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>
    </form>
  );
}
