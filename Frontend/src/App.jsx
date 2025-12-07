// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import './index.css';
import DashboardPage from './modules/dashboard/DashboardPage';
import SolicitudesListPage from './modules/solicitudes/SolicitudesListPage';
import FormSolicitud from './modules/solicitudes/FormSolicitud';
import DashboardDevelop from './modules/solicitudes/DashboardDevelop';
import CursosCatalogoPage from './modules/cursos/CursosCatalogoPage'; // 🆕 Importar
import PagoSubirPage from './modules/pagos/PagoSubirPage';
import AprobacionPagosPage from './modules/pagos/AprobacionPagosPage';
import MisCursosPage from './modules/misCursos/MisCursosPage';

export default function App() {
  // const auth = { rol: 'admin', cedula: '0101010101' }; // <-- ¡ELIMINADO! Ya no necesitamos esto.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RoleBasedRedirect />} />

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
            <Route element={<RoleProtectedRoute allowedRoles={['usuario', 'responsable']} />}>
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