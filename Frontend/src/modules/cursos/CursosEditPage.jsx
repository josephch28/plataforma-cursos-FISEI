// src/modules/cursos/CursosEditPage.jsx
import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';  // ✅ CORREGIDO
import FormCurso from './FormCurso';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';

export default function CursosEditPage({ auth }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getCurso(id);
        setCurso(data);
      } catch (error) {
        alert('Error al cargar curso');
        nav('/cursos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <AppLayout active="cursos">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout active="cursos">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Editar curso</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormCurso initial={curso} auth={auth} onSaved={() => nav('/cursos')} />
      </div>
    </AppLayout>
  );
}
