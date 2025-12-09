import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.rol) {
    case 'admin':
    case 'develop':
      return <Navigate to="/dashboard" replace />;
    
    case 'responsable':
      return <Navigate to="/cursos" replace />;
      
    case 'usuario':
    case 'estudiante': 
      return <Navigate to="/catalogo" replace />;

    // ✅ NUEVO: Caso explícito para comité
    case 'comite':
      return <Navigate to="/solicitudes/dashboard" replace />;
      
    default:
      return <Navigate to="/catalogo" replace />; 
  }
}