import { useState } from 'react';
import { API } from '../../services/api';

export default function ReportesListPage({ auth }) {
  const [loading, setLoading] = useState(false);
  const [cursoId, setCursoId] = useState('1');
  const [estudianteId, setEstudianteId] = useState('1');
  const [successModal, setSuccessModal] = useState(null);

  const handleGenerarCertificado = async () => {
    setLoading(true);
    try {
      await API.generarCertificado(cursoId, estudianteId);
      setSuccessModal('Certificado generado exitosamente');
    } catch (e) {
      alert(e?.message || 'Error al generar certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarPDF = async () => {
    setLoading(true);
    try {
      await API.generarReportePDF(cursoId);
      setSuccessModal('Reporte PDF generado exitosamente');
    } catch (e) {
      alert(e?.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarExcel = async () => {
    setLoading(true);
    try {
      await API.generarReporteExcel(cursoId);
      setSuccessModal('Reporte Excel generado exitosamente');
    } catch (e) {
      alert(e?.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Reportes y Certificados</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generar Certificado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Curso 1 - Desarrollo Web</option>
              <option value="2">Curso 2 - Base de Datos</option>
              <option value="3">Curso 3 - Redes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
            <select
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Juan Pérez García</option>
              <option value="2">María López Sánchez</option>
              <option value="3">Carlos Rodríguez Martínez</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerarCertificado}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Certificado PDF'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generar Reporte de Curso</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
          <select
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Curso 1 - Desarrollo Web</option>
            <option value="2">Curso 2 - Base de Datos</option>
            <option value="3">Curso 3 - Redes</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerarPDF}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Descargar PDF'}
          </button>
          <button
            onClick={handleGenerarExcel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Descargar Excel'}
          </button>
        </div>
      </div>

      {successModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Éxito!</h3>
            <p className="text-sm text-gray-600 mb-6">{successModal}</p>
            <button
              onClick={() => setSuccessModal(null)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

