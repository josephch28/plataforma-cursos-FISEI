import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import Toast from '../../components/Toast';
import { HiOutlineUpload, HiCheckCircle, HiExclamationCircle, HiClock } from 'react-icons/hi';

export default function PerfilPage() {
    const { user } = useAuth();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Definir requisitos generales
    const requiredDocs = [
        { key: 'cedula', label: 'Cédula de Identidad', required: true },
        { key: 'papeleta', label: 'Papeleta de Votación', required: true },
        { key: 'titulo', label: 'Título de Tercer Nivel', required: user?.rol === 'usuario' || user?.rol === 'docente' }, // Ejemplo
        { key: 'carnet', label: 'Carnet Estudiantil', required: true } // Opcional dependiendo de 'es_estudiante_uta'
        // Se puede refinar la logica de 'required'
    ];

    const loadDocs = async () => {
        try {
            const data = await API.getMyDocuments();
            setDocs(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadDocs();
    }, []);

    const handleUpload = async (file, type) => {
        if (!file) return;
        setUploading(type);
        try {
            await API.uploadDocument({ archivo: file, tipo_documento: type });
            showToast('Documento subido correctamente', 'success');
            await loadDocs();
        } catch (error) {
            showToast('Error al subir documento', 'error');
        } finally {
            setUploading(null);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const getDocStatus = (type) => {
        const doc = docs.find(d => d.tipo_documento === type && d.id_curso === null); // Solo generales
        if (!doc) return { status: 'missing', label: 'No subido', color: 'text-gray-400', icon: null };
        if (doc.estado === 'aprobado') return { status: 'approved', label: 'Aprobado', color: 'text-green-600', icon: <HiCheckCircle className="w-5 h-5" /> };
        if (doc.estado === 'rechazado') return { status: 'rejected', label: 'Rechazado', color: 'text-red-600', icon: <HiExclamationCircle className="w-5 h-5" />, obs: doc.observacion };
        return { status: 'pending', label: 'Pendiente', color: 'text-yellow-600', icon: <HiClock className="w-5 h-5" /> };
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                            {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{user?.nombre} {user?.apellido}</h2>
                        <span className="text-sm text-gray-500 capitalize">{user?.rol}</span>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p><strong>Cédula:</strong> {user?.cedula}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Estudiante UTA:</strong> {user?.es_estudiante_uta ? 'Sí' : 'No'}</p>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Requisitos Generales</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Sube los documentos requeridos para inscribirte en cursos.
                        Estos documentos deben ser aprobados por un responsable.
                    </p>

                    <div className="space-y-4">
                        {requiredDocs.map((req) => {
                            const { status, label, color, icon, obs } = getDocStatus(req.key);
                            return (
                                <div key={req.key} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-700">{req.label}</span>
                                            {req.required && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Requerido</span>}
                                        </div>
                                        <div className={`text-sm flex items-center gap-1 ${color}`}>
                                            {icon}
                                            <span>{label}</span>
                                        </div>
                                        {status === 'rejected' && (
                                            <p className="text-xs text-red-500 mt-1">Obs: {obs}</p>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        {(status === 'missing' || status === 'rejected' || status === 'pending') && (
                                            <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${uploading === req.key ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                                {uploading === req.key ? (
                                                    <span>Subiendo...</span>
                                                ) : (
                                                    <>
                                                        <HiOutlineUpload className="w-4 h-4" />
                                                        {status === 'missing' ? 'Subir' : 'Resubir'}
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleUpload(e.target.files[0], req.key)}
                                                    disabled={!!uploading}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                            </label>
                                        )}
                                        {status === 'approved' && (
                                            <div className="text-xs text-gray-400 italic">Verificado</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
