import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardDevelop from '../solicitudes/DashboardDevelop';
import OverviewCharts from './OverviewCharts';

function IconUsers() {
  return (
    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconCourses() {
  return (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
    </svg>
  );
}

function IconEnrollments() {
  return (
    <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7M16 3.13a4 4 0 11-8 0" />
    </svg>
  );
}

export default function DashboardPage() {
  // Estado para las estadísticas generales
  const [generalStats, setGeneralStats] = useState({ usuarios: 0, cursos: 0, inscripciones: 0 });
  const [solicitudesStats, setSolicitudesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const { user } = useAuth();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [genStats, solStats] = await Promise.all([
        API.getGeneralStats(),
        API.getSolicitudesStats()
      ]);

      setGeneralStats(genStats || { usuarios: 0, cursos: 0, inscripciones: 0 });
      setSolicitudesStats(solStats || null);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Error cargando dashboard:', e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = async () => {
    await loadStats();
  };

  if (user?.rol === 'develop') {
    return <DashboardDevelop />;
  }

  const fmt = (n) => new Intl.NumberFormat('es-PE').format(n || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-700">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">Última actualización: {lastUpdated.toLocaleString()}</span>
          )}
          <button
            aria-label="Refrescar estadísticas"
            onClick={handleRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm ${loading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6" />
            </svg>
            {loading ? 'Cargando' : 'Refrescar'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <strong className="font-medium">Error:</strong> {error}
          <button onClick={handleRefresh} disabled={loading} className="ml-4 underline text-sm">Reintentar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-live="polite">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"> <IconUsers /> Usuarios Activos</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2" aria-label="Número de usuarios">
              {loading ? <span className="text-gray-400">—</span> : fmt(generalStats.usuarios)}
            </p>
            <Link to="/usuarios" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Ver usuarios</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"> <IconCourses /> Cursos Activos</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2" aria-label="Número de cursos">
              {loading ? <span className="text-gray-400">—</span> : fmt(generalStats.cursos)}
            </p>
            <Link to="/cursos" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Ver cursos</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2"> <IconEnrollments /> Inscripciones</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2" aria-label="Número de inscripciones">
              {loading ? <span className="text-gray-400">—</span> : fmt(generalStats.inscripciones)}
            </p>
            <Link to="/inscripciones" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Ver inscripciones</Link>
          </div>
        </div>
      </div>

      {/* Gráficos resumen */}
      <OverviewCharts />

      {/* Sección visible solo para desarrolladores (por seguridad adicional) */}
      {user?.rol === 'develop' && (
        <div className="space-y-3">
          {/* Si hay estadísticas de solicitudes las mostramos */}
          {solicitudesStats ? (
            <div className="bg-white rounded p-4 border">
              <h3 className="font-medium">Solicitudes</h3>
              <pre className="text-sm text-gray-600 mt-2">{JSON.stringify(solicitudesStats, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No hay datos de solicitudes.</div>
          )}
        </div>
      )}

    </div>
  );
}