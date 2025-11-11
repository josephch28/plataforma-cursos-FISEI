// src/layouts/AppLayout.jsx
export default function AppLayout({ children, active = 'cursos' }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar blanco */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">Panel</h2>
        </div>
        <nav className="px-3 space-y-1">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'usuarios', label: 'Usuarios' },
            { key: 'cursos', label: 'Cursos' },
            { key: 'inscripciones', label: 'Inscripciones' },
            { key: 'evaluaciones', label: 'Evaluaciones' }
          ].map(item => (
            <div
              key={item.key}
              className={`px-4 py-2.5 rounded text-sm font-medium cursor-pointer transition ${
                active === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Área principal con fondo gris claro */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full h-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
