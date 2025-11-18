// Frontend/src/modules/pagos/AprobacionPagosPage.jsx
import { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { HiOutlineCheckCircle } from 'react-icons/hi';

export default function AprobacionPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const loadPagos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await API.listPendingPayments();
      setPagos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar pagos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);
  
  const handleAprobar = async (idPago, cedula) => {
    if (!confirm(`¿Estás seguro de aprobar el pago #${idPago} del usuario ${cedula}? Esta acción es irreversible.`)) {
      return;
    }
    
    try {
      await API.approvePayment(idPago);
      alert('Pago aprobado exitosamente. La inscripción ha sido marcada como PAGADA.');
      loadPagos(); // Recargar la lista
    } catch (err) {
      alert(`Error al aprobar pago: ${err.message || 'Error desconocido.'}`);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando pagos pendientes...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Aprobación de Pagos</h1>
      <p className="text-gray-600">Revisa los comprobantes de depósito/transferencia y aprueba los pagos pendientes.</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto / Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprobante</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos.map((p) => (
                <tr key={p.id_pago} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{p.id_pago}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.cedula_usuario}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.curso_nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-semibold">${Number(p.monto || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 capitalize">{p.metodo_pago}</div>
                    <div className="text-xs text-gray-500">Orden: {p.numero_orden}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {p.comprobante_pdf ? (
                      <a 
                        // La URL estática que configuraste en app.js
                        href={`/uploads/${p.comprobante_pdf}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      <span className="text-red-500">No subido</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAprobar(p.id_pago, p.cedula_usuario)}
                      title="Aprobar Pago"
                      className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                      disabled={!p.comprobante_pdf} 
                    >
                      <HiOutlineCheckCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay pagos pendientes de aprobación.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}