// src/modules/cursos/CursosEditPage.jsx
import { useEffect, useState } from 'react';
import FormCurso from './FormCurso';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../services/api';
import Toast from '../../components/Toast';

export default function CursosEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getCurso(id);
        setCurso(data);
        setLoading(false);
      } catch (e) {
        setToast({ show: true, message: 'Error al cargar curso: ' + (e?.message || ''), type: 'error' });
        setTimeout(() => nav('/cursos'), 3000);
      }
    };
    load();
  }, [id, nav]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        Cargando...
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Editar Curso</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <FormCurso initial={curso} onSaved={() => nav('/cursos')} />
      </div>
    </div>
  );
}