import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecciones según el rol
  switch (user.rol) {
    case 'admin':
    case 'develop':
      return <Navigate to="/dashboard" replace />;
    
    case 'responsable':
      return <Navigate to="/cursos" replace />;
      
    case 'usuario':
    case 'estudiante': 
      return <Navigate to="/catalogo" replace />;

    // ✅ NUEVO: Caso para el comité
    case 'comite':
      return <Navigate to="/solicitudes/dashboard" replace />;
      
    default:
      // Mándalo siempre a una ruta interna segura.
      return <Navigate to="/catalogo" replace />; 
  }
}