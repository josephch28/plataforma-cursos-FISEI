// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CursosListPage from './modules/cursos/CursosListPage';
import CursosCreatePage from './modules/cursos/CursosCreatePage';
import CursosEditPage from './modules/cursos/CursosEditPage';
import EvaluacionesListPage from './modules/evaluaciones/EvaluacionesListPage';
import EvaluacionesCreatePage from './modules/evaluaciones/EvaluacionesCreatePage';
import EvaluacionesEditPage from './modules/evaluaciones/EvaluacionesEditPage';
import SolicitudesListPage from './modules/solicitudes/SolicitudesListPage';
import SolicitudCreatePage from './modules/solicitudes/SolicitudCreatePage';
import SolicitudDetailPage from './modules/solicitudes/SolicitudDetailPage';
import AppLayout from './layouts/AppLayout';
import './index.css';
import DashboardPage from './modules/dashboard/DashboardPage';
import LoginPage from './modules/auth/LoginPage';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: siempre mostrar login al levantar la app */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<RequireAuth><AppLayout user={user} setUser={setUser} /></RequireAuth>}>
          {/* Dashboard: solo develop */}
          <Route path="/dashboard" element={
            <RequireRole roles={["develop"]}>
              <DashboardPage />
            </RequireRole>
          } />
          {/* Solo admin puede ver usuarios */}
          <Route path="/usuarios" element={
            <RequireRole roles={["admin"]}>
              <div>Gestión de usuarios (solo admin)</div>
            </RequireRole>
          } />
          {/* Cursos: admin, responsable, usuario */}
          <Route path="/cursos" element={
            <RequireRole roles={["admin", "responsable", "usuario"]}>
              <CursosListPage auth={user} />
            </RequireRole>
          } />
          {/* Crear/editar cursos: admin, responsable */}
          <Route path="/cursos/nuevo" element={
            <RequireRole roles={["admin", "responsable"]}>
              <CursosCreatePage auth={user} />
            </RequireRole>
          } />
          <Route path="/cursos/:id/editar" element={
            <RequireRole roles={["admin", "responsable"]}>
              <CursosEditPage auth={user} />
            </RequireRole>
          } />
          {/* Evaluaciones: admin, responsable */}
          <Route path="/evaluaciones" element={
            <RequireRole roles={["admin", "responsable"]}>
              <EvaluacionesListPage auth={user} />
            </RequireRole>
          } />
          <Route path="/evaluaciones/nueva" element={
            <RequireRole roles={["admin", "responsable"]}>
              <EvaluacionesCreatePage auth={user} />
            </RequireRole>
          } />
          <Route path="/evaluaciones/:id/editar" element={
            <RequireRole roles={["admin", "responsable"]}>
              <EvaluacionesEditPage auth={user} />
            </RequireRole>
          } />
          {/* Página especial para develop */}
          <Route path="/devtools" element={
            <RequireRole roles={["develop"]}>
              <div>Herramientas de desarrollo (solo develop)</div>
            </RequireRole>
          } />
          {/* Solicitudes de Cambio: solo develop */}
          <Route path="/solicitudes" element={
            <RequireRole roles={["develop"]}>
              <SolicitudesListPage auth={user} />
            </RequireRole>
          } />
          <Route path="/solicitudes/nueva" element={
            <RequireRole roles={["develop"]}>
              <SolicitudCreatePage />
            </RequireRole>
          } />
          <Route path="/solicitudes/:id" element={
            <RequireRole roles={["develop"]}>
              <SolicitudDetailPage />
            </RequireRole>
          } />
          <Route path="/solicitudes/:id/editar" element={
            <RequireRole roles={["develop"]}>
              <SolicitudDetailPage />
            </RequireRole>
          } />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
