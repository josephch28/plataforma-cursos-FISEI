// Frontend/src/modules/pagos/PagoSubirPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';

const instruccionesPorMetodo = {
  transferencia: [
    'Realiza la transferencia al banco Pichincha, cuenta corriente 1234567890 a nombre de FISEI.',
    'Indica en la referencia el número de orden.',
    'Guarda el comprobante en formato PDF, JPG o PNG.'
  ],
  deposito: [
    'Acude a la ventanilla del banco con el número de orden.',
    'Solicita que en el comprobante se registre el número de orden.',
    'Escanea o fotografía el comprobante claramente.'
  ]
};

export default function PagoSubirPage() {
  const { idInscripcion } = useParams();
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [orden, setOrden] = useState(null);
  const [loadingOrden, setLoadingOrden] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadOrden = async () => {
      setError('');
      setLoadingOrden(true);
      try {
        const data = await API.getOrdenPago(idInscripcion);
        setOrden(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'No se pudo cargar la orden de pago.');
      } finally {
        setLoadingOrden(false);
      }
    };
    loadOrden();
  }, [idInscripcion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Por favor, selecciona un archivo (PDF, JPG, PNG).');
      return;
    }

    setUploading(true);
    try {
      const data = await API.uploadComprobante(idInscripcion, file);
      setSuccess(data.message || 'Comprobante subido exitosamente.');
      
      setTimeout(() => {
        nav('/mis-cursos'); 
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al subir el comprobante.');
    } finally {
      setUploading(false);
    }
  };
  
  if (loadingOrden) {
    return <div className="text-center py-8 text-gray-500">Cargando orden de pago...</div>;
  }

  if (!orden) {
    return (
      <div className="text-center py-8 text-red-500">
        No se encontró la orden de pago para esta inscripción.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-blue-700">Comprobante de Pago</h1>
      <div className="text-gray-600 space-y-1">
        <p>Inscripción <strong>#{idInscripcion}</strong></p>
        <p>Monto a cancelar: <strong>${Number(orden.monto || 0).toFixed(2)}</strong></p>
        <p>Método sugerido: <strong className="capitalize">{orden.metodo_pago}</strong></p>
        <p>Número de orden: <strong>{orden.numero_orden}</strong></p>
        {orden.fecha_pago && (
          <p className="text-sm text-green-600">Comprobante cargado el {new Date(orden.fecha_pago).toLocaleDateString()}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-2">
        <p className="font-semibold">Instrucciones para {orden.metodo_pago}:</p>
        <ul className="list-disc ml-6 space-y-1">
          {(instruccionesPorMetodo[orden.metodo_pago] || []).map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
        >
          Imprimir orden
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el archivo (PDF, JPG, PNG)
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: **{file.name}**</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => nav('/mis-cursos')}
            className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Subir Comprobante'}
          </button>
        </div>
      </form>
    </div>
  );
}