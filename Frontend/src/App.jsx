// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import CursosListPage from './modules/cursos/CursosListPage';
import CursosCreatePage from './modules/cursos/CursosCreatePage';
import CursosEditPage from './modules/cursos/CursosEditPage';
import EvaluacionesListPage from './modules/evaluaciones/EvaluacionesListPage';
import EvaluacionesCreatePage from './modules/evaluaciones/EvaluacionesCreatePage';
import EvaluacionesEditPage from './modules/evaluaciones/EvaluacionesEditPage';
import UsuariosListPage from './modules/usuarios/UsuariosListPage';
import UsuariosCreatePage from './modules/usuarios/UsuariosCreatePage';
import UsuariosEditPage from './modules/usuarios/UsuariosEditPage';
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import LandingPage from './modules/home/LandingPage';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import './index.css';
import DashboardPage from './modules/dashboard/DashboardPage';
import SolicitudesListPage from './modules/solicitudes/SolicitudesListPage';
import FormSolicitud from './modules/solicitudes/FormSolicitud';
import DashboardDevelop from './modules/solicitudes/DashboardDevelop';
import CursosCatalogoPage from './modules/cursos/CursosCatalogoPage';
import PagoSubirPage from './modules/pagos/PagoSubirPage';
import AprobacionPagosPage from './modules/pagos/AprobacionPagosPage';
import MisCursosPage from './modules/misCursos/MisCursosPage';

// Componente inteligente:
// - Si NO hay usuario: Muestra la página pública (Landing/Login/Register)
// - Si HAY usuario: Lo redirige automáticamente a su panel (Dashboard/Cursos)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <RoleBasedRedirect />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={
          <PublicRoute><LandingPage /></PublicRoute>
        } />

        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><RegisterPage /></PublicRoute>
        } />

        {/* --- RUTAS PROTEGIDAS --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* Rutas públicas (requieren autenticación pero no rol específico) */}
            <Route path="/pago/:idInscripcion/subir" element={<PagoSubirPage />} />

            {/* Rutas para Admin y Develop */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin', 'develop']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Rutas solo para Admin */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/pagos" element={<AprobacionPagosPage />} />
              <Route path="/usuarios" element={<UsuariosListPage />} />
              <Route path="/usuarios/nuevo" element={<UsuariosCreatePage />} />
              <Route path="/usuarios/:cedula/editar" element={<UsuariosEditPage />} />
              <Route path="/inscripciones" element={<EvaluacionesListPage />} />
            </Route>

            {/* Rutas para Admin y Responsable (Gestión de Cursos) */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin', 'responsable']} />}>
              <Route path="/cursos" element={<CursosListPage />} />
              <Route path="/cursos/nuevo" element={<CursosCreatePage />} />
              <Route path="/cursos/:id/editar" element={<CursosEditPage />} />
            </Route>

            {/* Rutas para Responsable y Usuario (Evaluaciones) */}
            <Route element={<RoleProtectedRoute allowedRoles={['responsable', 'usuario']} />}>
              <Route path="/evaluaciones" element={<EvaluacionesListPage />} />
              <Route path="/evaluaciones/nueva" element={<EvaluacionesCreatePage />} />
              <Route path="/evaluaciones/:id/editar" element={<EvaluacionesEditPage />} />
            </Route>

            {/* Rutas para Usuario y Responsable (Catálogo y Mis Cursos) */}
            {/* ✅ Asegúrate de tener 'estudiante' aquí, que es el rol que estamos registrando */}
            <Route element={<RoleProtectedRoute allowedRoles={['usuario', 'responsable', 'estudiante']} />}>
              <Route path="/catalogo" element={<CursosCatalogoPage />} />
              <Route path="/mis-cursos" element={<MisCursosPage />} />
            </Route>

            {/* Rutas para Develop y Comité */}
            <Route element={<RoleProtectedRoute allowedRoles={['develop', 'comite']} />}>
              <Route path="/solicitudes" element={<SolicitudesListPage />} />
              <Route path="/solicitudes/nueva" element={<FormSolicitud />} />
              <Route path="/solicitudes/:id/editar" element={<FormSolicitud />} />
              <Route path="/solicitudes/dashboard" element={<DashboardDevelop />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}