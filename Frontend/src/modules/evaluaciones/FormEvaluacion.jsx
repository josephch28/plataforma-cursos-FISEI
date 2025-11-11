// src/modules/evaluaciones/FormEvaluacion.jsx
import { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

export default function FormEvaluacion({ initial = {}, onSaved, auth }) {
  const [data, setData] = useState({
    cedula_usuario: initial.cedula_usuario || '',
    id_curso: initial.id_curso || '',
    nota_final: initial.nota_final ?? '',
    asistencia: initial.asistencia ?? '',
    estado: initial.estado || 'pendiente'
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.listCursos().then(setCursos).catch(()=>setCursos([]));
    API.listUsuarios().then(setUsuarios).catch(()=>setUsuarios([]));
  }, []);

  const validate = () => {
    const err = {};
    if (!data.cedula_usuario) err.cedula_usuario = 'Cédula requerida';
    if (!data.id_curso) err.id_curso = 'Curso requerido';
    if (data.nota_final === '') err.nota_final = 'Nota requerida';
    if (data.asistencia === '') err.asistencia = 'Asistencia requerida';
    if (data.nota_final < 0 || data.nota_final > 10) err.nota_final = 'La nota debe estar entre 0 y 10';
    if (data.asistencia < 0 || data.asistencia > 100) err.asistencia = 'La asistencia debe estar entre 0 y 100';
    return err;
  };

  const save = async (ev) => {
    ev.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      if (initial.id_inscripcion) {
        await API.updateInscripcion(initial.id_inscripcion, data, auth);
        setMensaje({ tipo: 'exito', texto: 'Evaluación actualizada correctamente.' });
      } else {
        await API.createInscripcion(data, auth);
        setMensaje({ tipo: 'exito', texto: 'Evaluación creada correctamente.' });
        // Limpiar campos tras guardar
        setData({
          cedula_usuario: '',
          id_curso: '',
          nota_final: '',
          asistencia: '',
          estado: 'pendiente'
        });
      }
      setTimeout(() => {
        setMensaje(null);
        if (onSaved) onSaved();
        else navigate('/evaluaciones');
      }, 1200);
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar. Intenta nuevamente.' });
    }
    setBusy(false);
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const usuarioOptions = usuarios.map(u => ({
    value: u.cedula,
    label: `${u.cedula} - ${u.nombre} ${u.apellido}`
  }));

  return (
    <form className="space-y-4" onSubmit={save}>
      <div>
        <label className={labelClass}>Usuario</label>
        <Select
          options={usuarioOptions}
          value={usuarioOptions.find(opt => opt.value === data.cedula_usuario) || null}
          onChange={opt => setData({ ...data, cedula_usuario: opt ? opt.value : '' })}
          isDisabled={!!initial.id_inscripcion}
          placeholder="Buscar usuario..."
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '2.5rem',
              fontSize: '0.95rem'
            })
          }}
        />
        {errors.cedula_usuario && <p className="text-red-600 text-sm mt-1">{errors.cedula_usuario}</p>}
      </div>
      <div>
        <label className={labelClass}>Curso</label>
        <Select
          classNamePrefix="react-select"
          value={cursos.find(c => c.id_curso === data.id_curso) ? { value: data.id_curso, label: `${data.id_curso} - ${cursos.find(c => c.id_curso === data.id_curso).nombre}` } : null}
          onChange={e => setData({ ...data, id_curso: e.value })}
          options={cursos.map(c => ({ value: c.id_curso, label: `${c.id_curso} - ${c.nombre}` }))}
          isDisabled={!!initial.id_inscripcion}
          placeholder="Seleccione curso"
        />
        {errors.id_curso && <p className="text-red-600 text-sm mt-1">{errors.id_curso}</p>}
      </div>
      <div>
        <label className={labelClass}>Nota final</label>
        <input
          type="number"
          className={inputClass}
          value={data.nota_final}
          onChange={e => setData({ ...data, nota_final: e.target.value })}
        />
        {errors.nota_final && <p className="text-red-600 text-sm mt-1">{errors.nota_final}</p>}
      </div>
      <div>
        <label className={labelClass}>Asistencia (%)</label>
        <input
          type="number"
          className={inputClass}
          value={data.asistencia}
          onChange={e => setData({ ...data, asistencia: e.target.value })}
        />
        {errors.asistencia && <p className="text-red-600 text-sm mt-1">{errors.asistencia}</p>}
      </div>
      <div>
        <label className={labelClass}>Estado</label>
        <select
          className={inputClass}
          value={data.estado}
          onChange={e => setData({ ...data, estado: e.target.value })}
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="reprobado">Reprobado</option>
          <option value="pagado">Pagado</option>
        </select>
      </div>
      <div className="pt-2 flex gap-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          disabled={busy}
        >
          {busy ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          onClick={() => navigate('/evaluaciones')}
        >
          Volver
        </button>
      </div>
      {mensaje && (
        <div className={`mb-4 p-3 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}
    </form>
  );
}