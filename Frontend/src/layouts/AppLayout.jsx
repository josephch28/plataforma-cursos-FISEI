// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineHome } from 'react-icons/hi';

const menu = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: HiOutlineHome, roles: ['develop'] },
  { key: 'usuarios', label: 'Usuarios', to: '/usuarios', icon: HiOutlineUserGroup, roles: ['admin'] },
  { key: 'cursos', label: 'Cursos', to: '/cursos', icon: HiOutlineBookOpen, roles: ['admin', 'responsable', 'usuario'] },
  { key: 'inscripciones', label: 'Inscripciones', to: '/inscripciones', icon: HiOutlineClipboardList, roles: ['admin', 'responsable'] },
  { key: 'evaluaciones', label: 'Evaluaciones', to: '/evaluaciones', icon: HiOutlineCheckCircle, roles: ['admin', 'responsable'] },
  { key: 'solicitudes', label: 'Solicitudes', to: '/solicitudes', icon: HiOutlineClipboardList, roles: ['develop'] },
  // Ejemplo: página especial para develop
  { key: 'develop', label: 'DevTools', to: '/devtools', icon: HiOutlineHome, roles: ['develop'] },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  // Filtrar menú según rol
  const filteredMenu = user ? menu.filter(item => item.roles.includes(user.rol)) : [];
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar mejorado */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-100 mb-2">
          <h2 className="text-xl font-bold text-blue-700 tracking-wide">Panel de Administración</h2>
        </div>
        <nav className="flex-1 flex flex-col px-3 space-y-1">
          {filteredMenu.map(item => (
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
        {/* Área de usuario y logout en la parte inferior */}
        <div className="border-t border-gray-200 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 px-2">
                <p className="font-semibold text-gray-900">{user.nombre} {user.apellido}</p>
                <p className="text-xs text-gray-500">{user.rol}</p>
              </div>
              <button
                onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm transition-colors"
              >Cerrar sesión</button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors">Iniciar sesión</button>
          )}
        </div>
       </aside>      {/* Área principal */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
