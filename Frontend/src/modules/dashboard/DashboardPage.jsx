// src/modules/dashboard/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import DashboardDevelop from '../solicitudes/DashboardDevelop';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const s = await API.getSolicitudesStats();
        setStats(s);
      } catch (e) {
        console.error('Error cargando stats de solicitudes:', e);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);



  if (user?.rol === 'develop') {
    // Show the full solicitudes dashboard for develop users
    return <DashboardDevelop />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Usuarios</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Cursos</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Inscripciones</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
        </div>
      </div>

      {user?.rol === 'develop' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Solicitudes de Cambio</h2>
            <Link to="/solicitudes/dashboard" className="text-sm text-blue-600 hover:underline">Ver dashboard de solicitudes</Link>
          </div>

          {loading ? (
            <div className="text-gray-500">Cargando estadísticas de solicitudes...</div>
          ) : error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm text-gray-500">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendientes ?? 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-sm text-gray-500">Realizadas</p>
                <p className="text-2xl font-bold text-green-600">{stats?.realizadas ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}