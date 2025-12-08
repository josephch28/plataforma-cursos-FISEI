// Frontend/src/modules/usuarios/TablaUsuarios.jsx
import { useEffect, useState } from 'react';
import { API } from '../../services/api';
import Switch from '../../components/Switch';
import { HiOutlinePencil } from 'react-icons/hi';

export default function TablaUsuarios({ onEdit, showInactive = false, onAction }) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await API.listUsuarios({ inactivo: showInactive });
            setRows(data);
        } catch (e) {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [showInactive]);

    const filteredRows = rows.filter(row =>
        row.cedula?.includes(q) ||
        row.nombre?.toLowerCase().includes(q.toLowerCase()) ||
        row.apellido?.toLowerCase().includes(q.toLowerCase()) ||
        row.email?.toLowerCase().includes(q.toLowerCase())
    );

    const handleDesactivate = (cedula) => {
        onAction(cedula, 'delete', load);
    };

    const handleActivate = (cedula) => {
        onAction(cedula, 'activate', load);
    };

    return (
        <div>
            <div className="p-4 border-b border-gray-200">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por cédula, nombre, apellido o email..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRows.map((r) => (
                            <tr key={r.cedula} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">{r.cedula}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{r.nombre} {r.apellido}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{r.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{r.rol}</td>
                                <td className="px-6 py-4 text-center">
                                    {!showInactive ? (
                                        <div title="Desactivar Usuario" className="inline-block">
                                            <Switch checked={true} onChange={() => handleDesactivate(r.cedula)} color="green" />
                                        </div>
                                    ) : (
                                        <div title="Activar Usuario" className="inline-block">
                                            <Switch checked={false} onChange={() => handleActivate(r.cedula)} color="green" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(r.cedula)}
                                            title="Editar"
                                            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                        >
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!filteredRows.length && !loading && (
                            <tr>
                                <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                                    Sin resultados
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                                    Cargando...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}