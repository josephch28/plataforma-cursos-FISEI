// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CursosListPage from './modules/cursos/CursosListPage';
import CursosCreatePage from './modules/cursos/CursosCreatePage';
import CursosEditPage from './modules/cursos/CursosEditPage';
import EvaluacionesListPage from './modules/evaluaciones/EvaluacionesListPage';
import EvaluacionesCreatePage from './modules/evaluaciones/EvaluacionesCreatePage';
import EvaluacionesEditPage from './modules/evaluaciones/EvaluacionesEditPage';
import AppLayout from './layouts/AppLayout';
import './index.css';
import DashboardPage from './modules/dashboard/DashboardPage';

export default function App() {
  const auth = { rol: 'admin', cedula: '0101010101' };
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cursos" element={<CursosListPage auth={auth} />} />
          <Route path="/cursos/nuevo" element={<CursosCreatePage auth={auth} />} />
          <Route path="/cursos/:id/editar" element={<CursosEditPage auth={auth} />} />
          <Route path="/evaluaciones" element={<EvaluacionesListPage auth={auth} />} />
          <Route path="/evaluaciones/nueva" element={<EvaluacionesCreatePage auth={auth} />} />
          <Route path="/evaluaciones/:id/editar" element={<EvaluacionesEditPage auth={auth} />} />
          {/* Agrega más rutas aquí cuando implementes Dashboard, Usuarios, Inscripciones */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
