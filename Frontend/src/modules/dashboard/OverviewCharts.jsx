import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { API } from '../../services/api';

const COLORS = ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function OverviewCharts() {
  const [trends, setTrends] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [t, d] = await Promise.allSettled([API.getDashboardTrends(), API.getDashboardDistribution()]);

        if (!mounted) return;

        if (t.status === 'fulfilled' && Array.isArray(t.value) && t.value.length) {
          setTrends(t.value);
        } else {
          // fallback de ejemplo
          setTrends(generateSampleTrends());
        }

        if (d.status === 'fulfilled' && (Array.isArray(d.value) || typeof d.value === 'object')) {
          // Normalizar a array [{ name, value }]
          const data = Array.isArray(d.value) ? d.value : Object.keys(d.value).map(k => ({ name: k, value: d.value[k] }));
          setDistribution(data);
        } else {
          setDistribution(generateSampleDistribution());
        }

      } catch (e) {
        console.error(e);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded shadow-sm border border-gray-200 h-64 flex items-center justify-center text-gray-400">Cargando gráficos...</div>
        <div className="p-6 bg-white rounded shadow-sm border border-gray-200 h-64 flex items-center justify-center text-gray-400">Cargando distribución...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Tendencia de inscripciones (últimos días)</h4>
        {trends && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => formatDateShort(d)} />
              <YAxis />
              <Tooltip formatter={(v) => v} labelFormatter={(l) => `Fecha: ${l}`} />
              <Line type="monotone" dataKey="inscripciones" stroke="#4F46E5" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Distribución por categoría (cursos)</h4>
        {distribution && (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function formatDateShort(d) {
  try {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  } catch (e) {
    return d;
  }
}

function generateSampleTrends() {
  const today = new Date();
  const arr = [];
  for (let i = 8; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    arr.push({ date: dt.toISOString().slice(0, 10), inscripciones: Math.floor(Math.random() * 8) });
  }
  return arr;
}

function generateSampleDistribution() {
  return [
    { name: 'Programación', value: 8 },
    { name: 'Matemáticas', value: 5 },
    { name: 'Idiomas', value: 3 },
    { name: 'Diseño', value: 2 }
  ];
}
