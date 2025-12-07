import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  switch (user.rol) {
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    case 'develop':
      return <Navigate to="/dashboard" replace />;
    case 'responsable':
      return <Navigate to="/mis-cursos" replace />;
    case 'usuario':
      return <Navigate to="/catalogo" replace />;
    default:
      return <Navigate to="/catalogo" replace />;
  }
}
