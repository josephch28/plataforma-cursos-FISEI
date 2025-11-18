// src/modules/dashboard/DashboardPage.jsx
import { Link } from 'react-router-dom';

const mainButtons = [
  { label: 'Cursos', to: '/cursos' },
  { label: 'Evaluaciones', to: '/evaluaciones' },
  { label: 'Usuarios', to: '/usuarios' },
  { label: 'Reportes', to: '/reportes' }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Dashboard</h1>
        <p className="text-gray-600">Selecciona un módulo para comenzar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainButtons.map((button) => (
          <Link
            key={button.to}
            to={button.to}
            className="flex items-center justify-center px-4 py-6 rounded-lg border border-blue-200 bg-white text-blue-700 font-semibold shadow-sm hover:border-blue-400 hover:text-blue-900 hover:-translate-y-0.5 transition"
          >
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}