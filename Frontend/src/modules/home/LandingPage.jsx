// Frontend/src/modules/home/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineLightningBolt } from 'react-icons/hi';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Navbar Transparente */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-700 text-white p-2 rounded-lg font-bold text-xl">F</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Cursos FISEI</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-gray-600 font-medium hover:text-blue-700 transition-colors px-4 py-2"
          >
            Ingresar
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Registrarse
          </button>
        </div>
      </nav>

      {/* Hero Section (Portada) */}
      <header className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Formación Continua <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Facultad de Ingeniería
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Gestiona tus cursos, inscríbete en talleres y obtén tus certificados avalados por la Universidad Técnica de Ambato.
        </p>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Crear Cuenta Gratis
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
          >
            Ya tengo cuenta
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<HiOutlineAcademicCap className="w-8 h-8 text-blue-600"/>}
            title="Oferta Académica"
            desc="Explora cursos técnicos y talleres prácticos actualizados."
          />
          <FeatureCard 
            icon={<HiOutlineUserGroup className="w-8 h-8 text-indigo-600"/>}
            title="Perfil de Estudiante"
            desc="Lleva el control de tus inscripciones, notas y asistencia."
          />
          <FeatureCard 
            icon={<HiOutlineLightningBolt className="w-8 h-8 text-amber-500"/>}
            title="Certificación Rápida"
            desc="Descarga tus certificados digitales automáticamente al aprobar."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}