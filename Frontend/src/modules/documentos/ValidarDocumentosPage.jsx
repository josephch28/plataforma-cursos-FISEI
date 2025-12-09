import { useEffect, useState } from 'react';
import { API } from '../../services/api';
import Toast from '../../components/Toast';
import { HiCheck, HiX, HiDownload, HiOutlineDocumentText, HiRefresh } from 'react-icons/hi';

export default function ValidarDocumentosPage() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [rejectModal, setRejectModal] = useState(null); // id of doc to reject
    const [observacion, setObservacion] = useState('');

    const [approveModal, setApproveModal] = useState(null); // id to approve

    const load = async () => {
        setLoading(true);
        try {
            const data = await API.getPendingDocuments();
            setDocs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading documents:', error);
            showToast('Error al cargar documentos: ' + (error.message || 'Error desconocido'), 'error');
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const handleApprove = (id) => {
        setApproveModal(id);
    };

    const confirmApprove = async () => {
        try {
            await API.reviewDocument(approveModal, { estado: 'aprobado' });
            showToast('Documento aprobado', 'success');
            setApproveModal(null);
            load();
        } catch (error) {
            showToast('Error al aprobar', 'error');
        }
    };

    const handleReject = async () => {
        if (!observacion.trim()) return showToast('Ingrese una observación', 'error');
        try {
            await API.reviewDocument(rejectModal, { estado: 'rechazado', observacion });
            showToast('Documento rechazado', 'success');
            setRejectModal(null);
            setObservacion('');
            load();
        } catch (error) {
            showToast('Error al rechazar', 'error');
        }
    };

    return (
        <div className="p-6">
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <HiOutlineDocumentText className="text-blue-600" />
                    Validación de Requisitos
                </h1>
                <button
                    onClick={load}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Recargar"
                >
                    <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Cargando documentos...</p>
                </div>
            ) : docs.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
                    <p className="text-gray-500 text-sm">No hay documentos pendientes de revisión en este momento.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 text-left">Usuario</th>
                                <th className="px-6 py-3 text-left">Documento</th>
                                <th className="px-6 py-3 text-left">Contexto</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {docs.map(doc => (
                                <tr key={doc.id_documento} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{doc.nombre} {doc.apellido}</div>
                                        <div className="text-xs text-gray-500">{doc.cedula_usuario}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 capitalize font-medium">{doc.tipo_documento}</div>
                                        <a
                                            href={`http://localhost:3000${doc.ruta_archivo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <HiDownload className="w-3 h-3" /> {doc.nombre_archivo}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        {doc.nombre_curso ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Curso: {doc.nombre_curso}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Requisito General
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(doc.fecha_subida).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleApprove(doc.id_documento)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition"
                                            title="Aprobar"
                                        >
                                            <HiCheck className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setRejectModal(doc.id_documento)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                            title="Rechazar"
                                        >
                                            <HiX className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Aprobación */}
            {approveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-fade-in-up text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <HiCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">¿Aprobar Documento?</h3>
                        <p className="text-sm text-gray-600 mb-6">El usuario recibirá una notificación de que su documento ha sido verificado correctamente.</p>

                        <div className="flex justify-center gap-3">
                            <button onClick={() => setApproveModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                            <button onClick={confirmApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Aprobar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Rechazo */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold mb-4">Rechazar Documento</h3>
                        <p className="text-sm text-gray-600 mb-2">Indique el motivo del rechazo:</p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 mb-4"
                            rows={3}
                            placeholder="Ej: Documento borroso, fecha vencida..."
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setRejectModal(null); setObservacion(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                            <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Rechazar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
