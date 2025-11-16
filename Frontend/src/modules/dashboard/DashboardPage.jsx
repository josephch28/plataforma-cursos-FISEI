// src/modules/dashboard/DashboardPage.jsx
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/solicitudes/stats');
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Solicitudes</p>
          <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : (stats?.byEstado?.find(e => e.estado === 'pendiente')?.count ?? 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Realizados</p>
          <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : (stats?.byEstado?.find(e => e.estado === 'realizado')?.count ?? 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-3">Por Tipo de Cambio</h3>
          {loading && <p>Cargando...</p>}
          {!loading && stats?.byTipo && (
            <ul className="space-y-2">
              {stats.byTipo.map((t) => (
                <li key={t.tipo_cambio} className="flex justify-between text-sm">
                  <span className="capitalize">{t.tipo_cambio === 'no_aplica' ? 'No aplica' : t.tipo_cambio}</span>
                  <span className="font-semibold">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-3">Por Prioridad</h3>
          {loading && <p>Cargando...</p>}
          {!loading && stats?.byPrioridad && (
            <ul className="space-y-2">
              {stats.byPrioridad.map((p) => (
                <li key={p.prioridad} className="flex justify-between text-sm">
                  <span className="capitalize">{p.prioridad}</span>
                  <span className="font-semibold">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-medium mb-3">Solicitudes últimos 30 días</h3>
        {loading && <p>Cargando...</p>}
        {!loading && stats?.byDia && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {stats.byDia.map(d => (
                  <tr key={d.fecha} className="border-t">
                    <td className="py-2">{d.fecha}</td>
                    <td className="py-2 font-semibold">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}