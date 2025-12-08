// Frontend/src/modules/pagos/AprobacionPagosPage.jsx
import { useState, useEffect } from 'react';
import { API } from '../../services/api';
import Toast from '../../components/Toast';
import { HiOutlineCheckCircle, HiOutlineDocumentDownload } from 'react-icons/hi';

export default function AprobacionPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const loadPagos = async () => {
    setLoading(true);
    try {
      const data = await API.listPendingPayments();
      setPagos(data);
    } catch (err) {
      showToast(err.message || 'Error al cargar pagos pendientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPagos(); }, []);

  const handleAprobar = (idPago, cedula) => {
    setConfirmModal({ idPago, cedula });
  };

  const executeApproval = async () => {
    if (!confirmModal) return;
    try {
      await API.approvePayment(confirmModal.idPago);
      showToast('Pago aprobado exitosamente.', 'success');
      setConfirmModal(null);
      loadPagos();
    } catch (err) {
      showToast(`Error al aprobar pago: ${err.message || 'Error desconocido.'}`, 'error');
      setConfirmModal(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>Cargando pagos pendientes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {toast.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Aprobación de Pagos</h1>
        <p className="text-gray-500 mt-1">Revisa los comprobantes de depósito/transferencia y aprueba los pagos pendientes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Pago</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cédula</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles Pago</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comprobante</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos.map((p) => (
                <tr key={p.id_pago} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{p.id_pago}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.cedula_usuario}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={p.curso_nombre}>{p.curso_nombre}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">${Number(p.monto || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      {p.metodo_pago} <span className="text-gray-300">|</span> Ord: {p.numero_orden}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {p.comprobante_pdf ? (
                      <a
                        href={`/uploads/${p.comprobante_pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <HiOutlineDocumentDownload className="w-4 h-4 mr-1.5" />
                        Ver Archivo
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No subido</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAprobar(p.id_pago, p.cedula_usuario)}
                      title="Aprobar Pago"
                      className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/20 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
                      disabled={!p.comprobante_pdf}
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 bg-gray-50 italic">
                    <div className="flex flex-col items-center">
                      <HiOutlineCheckCircle className="w-10 h-10 mb-2 text-gray-300" />
                      No hay pagos pendientes de aprobación.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-[999] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden animate-fade-in-up">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 text-green-600">
                <HiOutlineCheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">¿Aprobar pago?</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                El pago #{confirmModal.idPago} será marcado como completado y el estudiante quedará inscrito oficialmente. <br /><strong>Esta acción es irreversible.</strong>
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeApproval}
                  className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition flex-1 transform active:scale-95"
                >
                  Sí, Aprobar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}