// src/modules/cursos/EncargadosPanel.jsx
import { useEffect, useState } from 'react';
import { API } from '../../services/api';

const isTenDigits = (v) => /^[0-9]{10}$/.test(v || '');

export default function EncargadosPanel({ curso, auth }) {
  const [rows, setRows] = useState([]);
  const [cedula, setCedula] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    const data = await API.listEncargados(curso.id_curso);
    setRows(data);
  };

  useEffect(() => { load(); }, [curso.id_curso]);

  const add = async () => {
    setErr('');
    if (!isTenDigits(cedula)) { setErr('La cédula debe tener 10 dígitos'); return; }
    try {
      await API.addEncargado(curso.id_curso, cedula, auth);
      setCedula('');
      await load();
    } catch (e) {
      setErr(e?.message || 'No se pudo agregar');
    }
  };

  const remove = async (ced) => {
    if (!confirm('¿Quitar encargado?')) return;
    await API.removeEncargado(curso.id_curso, ced, auth).catch(()=>{});
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Cédula (10 dígitos)</label>
          <input className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={cedula} onChange={e=>setCedula(e.target.value)} />
          {err && <p className="text-red-600 text-sm mt-1">{err}</p>}
        </div>
        <button onClick={add} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Agregar</button>
      </div>

      <div className="border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Cédula</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.cedula_encargado} className="border-t">
                <td className="px-4 py-2">{r.cedula_encargado}</td>
                <td className="px-4 py-2">{(r.nombre || '') + ' ' + (r.apellido || '')}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end">
                    <button onClick={()=>remove(r.cedula_encargado)} className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">Quitar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Sin encargados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
