// src/layouts/AppLayout.jsx
import { NavLink, Outlet } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineHome } from 'react-icons/hi';

const menu = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: HiOutlineHome },
  { key: 'usuarios', label: 'Usuarios', to: '/usuarios', icon: HiOutlineUserGroup },
  { key: 'cursos', label: 'Cursos', to: '/cursos', icon: HiOutlineBookOpen },
  { key: 'inscripciones', label: 'Inscripciones', to: '/inscripciones', icon: HiOutlineClipboardList },
  { key: 'evaluaciones', label: 'Evaluaciones', to: '/evaluaciones', icon: HiOutlineCheckCircle }
];

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar mejorado */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 mb-2">
          <h2 className="text-xl font-bold text-blue-700 tracking-wide">Panel de Administración</h2>
        </div>
        <nav className="flex flex-col px-3 space-y-1">
          {menu.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`mr-2 text-lg ${isActive ? 'text-white' : 'text-blue-600'}`} />
                    <span className={isActive ? 'text-white' : 'text-blue-600'}>
                      {item.label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
