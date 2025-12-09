// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineHome, HiOutlineLogout, HiOutlineDocumentText, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const allMenuItems = [
  { key: 'dashboard-admin', label: 'Dashboard', to: '/dashboard', icon: HiOutlineHome, roles: ['admin'] },
  { key: 'dashboard-sol', label: 'Dashboard', to: '/solicitudes/dashboard', icon: HiOutlineHome, roles: ['develop', 'comite'] },
  { key: 'perfil', label: 'Mi Perfil', to: '/perfil', icon: HiOutlineUser, roles: ['usuario', 'docente'] },
  { key: 'catalogo', label: 'Cursos (Catálogo)', to: '/catalogo', icon: HiOutlineBookOpen, roles: ['usuario'] },
  { key: 'mis-cursos', label: 'Mis Cursos', to: '/mis-cursos', icon: HiOutlineClipboardList, roles: ['usuario', 'responsable'] },
  { key: 'pagos', label: 'Aprobación Pagos', to: '/pagos', icon: HiOutlineCheckCircle, roles: ['responsable'] },
  { key: 'validar-docs', label: 'Validación Requisitos', to: '/documentos/validar', icon: HiOutlineDocumentText, roles: ['responsable'] },
  { key: 'usuarios', label: 'Usuarios', to: '/usuarios', icon: HiOutlineUserGroup, roles: ['admin'] },
  { key: 'cursos', label: 'Cursos', to: '/cursos', icon: HiOutlineBookOpen, roles: ['admin', 'responsable'] },
  { key: 'inscripciones', label: 'Inscripciones', to: '/inscripciones', icon: HiOutlineClipboardList, roles: ['admin'] },
  { key: 'evaluaciones', label: 'Evaluaciones', to: '/evaluaciones', icon: HiOutlineCheckCircle, roles: ['responsable', 'usuario'] },
  { key: 'solicitudes', label: 'Solicitudes', to: '/solicitudes', icon: HiOutlineClipboardList, roles: ['develop', 'comite'] },
  { key: 'cambios', label: 'Gestión de Cambios', to: '/formulario/index.html', icon: HiOutlineClipboardList, roles: ['usuario', 'responsable', 'admin', 'develop'], external: true }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Filtrar menú según el rol del usuario
  const menu = allMenuItems.filter(item => item.roles.includes(user?.rol));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar mejorado */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-100 mb-2">
          <h2 className="text-xl font-bold text-blue-700 tracking-wide">Panel de Administración</h2>
          {user && (
            <div className="mt-3 text-sm">
              <p className="text-gray-700 font-medium">{user.nombre} {user.apellido}</p>
              <p className="text-gray-500 text-xs capitalize">{user.rol}</p>
            </div>
          )}
        </div>
        <nav className="flex flex-col px-3 space-y-1 flex-1">
          {menu.map(item => {
            if (item.external) {
              return (
                <a
                  key={item.key}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-150 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <item.icon className="mr-2 text-lg text-blue-600" />
                  <span>{item.label}</span>
                </a>
              )
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={true}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-150 ${isActive
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
            )
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <HiOutlineLogout className="mr-2 text-lg" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
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
