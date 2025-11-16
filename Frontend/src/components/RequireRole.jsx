import { Navigate, useLocation } from 'react-router-dom';

/**
 * Envuelve una ruta y solo la muestra si el usuario tiene uno de los roles permitidos.
 * @param {string[]} roles - roles permitidos (ej: ['admin','responsable'])
 * @param {ReactNode} children
 */
export default function RequireRole({ roles, children }) {
  const location = useLocation();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  if (!user || !roles.includes(user.rol)) {
    // Si no tiene rol permitido, redirige a dashboard o login
    return <Navigate to={user ? '/dashboard' : '/login'} replace state={{ from: location }} />;
  }
  return children;
}
