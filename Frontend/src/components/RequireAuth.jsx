import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const location = useLocation();
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return <Navigate to="/login" replace state={{ from: location }} />;
    const user = JSON.parse(raw);
    if (!user || !user.rol) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
  } catch (e) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
}
