import { useEffect, useState } from 'react'; 
import { API } from '../../services/api';

// Props: onEdit, auth, showInactive (de UsuariosListPage), onAction (callback al modal)
export default function TablaUsuarios({ onEdit, auth, showInactive = false, onAction }) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);

    // Función de carga. Usada internamente y pasada al padre para recargar post-acción.
    const load = async () => {
        setLoading(true);
        try {
            // Llama a la API con el filtro inactivo: 'true' o 'false'
            const data = await API.listUsuarios({ inactivo: showInactive });
            setRows(data);
        } catch (e) {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // Recarga la lista cada vez que se cambia de pestaña (showInactive)
    useEffect(() => {
        load();
    }, [showInactive]); 

    // Filtro simple en el frontend basado en la búsqueda 'q'
    const filteredRows = rows.filter(row =>
        row.cedula?.includes(q) ||
        row.nombre?.toLowerCase().includes(q.toLowerCase()) ||
        row.apellido?.toLowerCase().includes(q.toLowerCase()) ||
        row.email?.toLowerCase().includes(q.toLowerCase())
    );

    // Pasa la acción al componente padre (UsuariosListPage) con el callback de recarga
    const handleDesactivate = (cedula) => {
        onAction(cedula, 'delete', load); // Pasa 'load' como callback
    };

    const handleActivate = (cedula) => {
        onAction(cedula, 'activate', load); // Pasa 'load' como callback
    };

    return (
        <div>
            {/* BARRA DE BÚSQUEDA - ÚNICA (Soluciona la duplicación) */}
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
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(r.cedula)}
                                            title="Editar"
                                            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {/* Botón para Desactivar (solo en pestaña Activos) */}
                                        {!showInactive && (
                                            <button
                                                onClick={() => handleDesactivate(r.cedula)}
                                                title="Desactivar"
                                                className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Botón para Activar (solo en pestaña Desactivados) */}
                                        {showInactive && (
                                            <button
                                                onClick={() => handleActivate(r.cedula)}
                                                title="Activar"
                                                className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        )}
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