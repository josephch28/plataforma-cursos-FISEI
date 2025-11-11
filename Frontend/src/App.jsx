// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CursosListPage from './modules/cursos/CursosListPage';
import CursosCreatePage from './modules/cursos/CursosCreatePage';
import CursosEditPage from './modules/cursos/CursosEditPage';
import './index.css';

export default function App() {
  const auth = { rol: 'admin', cedula: '0101010101' };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cursos" element={<CursosListPage auth={auth} />} />
        <Route path="/cursos/nuevo" element={<CursosCreatePage auth={auth} />} />
        <Route path="/cursos/:id/editar" element={<CursosEditPage auth={auth} />} />
        {/* Para editar puedes reutilizar FormCurso cargando el curso por id */}
      </Routes>
    </BrowserRouter>
  );
}
