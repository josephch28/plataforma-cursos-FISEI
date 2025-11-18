import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getDefaultRouteForRole(rol) {
  switch (rol) {
    case 'admin':
      return '/dashboard';
    case 'develop':
      return '/dashboard';
    case 'responsable':
      return '/mis-cursos';
    case 'usuario':
      return '/catalogo';
    default:
      return '/catalogo';
  }
}

export default function RoleProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (!allowedRoles.includes(user.rol)) {
    const defaultRoute = getDefaultRouteForRole(user.rol);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <p className="text-sm text-gray-500">Tu rol: <span className="font-medium capitalize">{user.rol}</span></p>
          <a href={defaultRoute} className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
