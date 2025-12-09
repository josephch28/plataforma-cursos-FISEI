import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineLightningBolt, 
  HiOutlineBadgeCheck, HiOutlineDesktopComputer, HiOutlineBookOpen,
  HiOutlineChatAlt2, HiOutlineSparkles, HiArrowRight
} from 'react-icons/hi';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Navbar Flotante --- */}
      <nav className="w-full py-5 px-6 md:px-12 flex justify-between items-center fixed top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <HiOutlineAcademicCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight block leading-none">Cursos FISEI</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Formación Continua</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/login')} 
            className="text-gray-600 font-semibold hover:text-blue-700 transition-colors px-5 py-2.5 text-sm hidden sm:block"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
          >
            Registrarse Gratis <HiArrowRight />
          </button>
        </div>
      </nav>

      {/* --- Hero Section (Portada) --- */}
      <header className="pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wide mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Nuevos cursos disponibles 2025
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight max-w-5xl mx-auto">
            El conocimiento que necesitas para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              dominar el futuro.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            Plataforma oficial de capacitación de la Facultad de Ingeniería. 
            Cursos técnicos, talleres prácticos y certificaciones avaladas por la UTA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Comenzar Ahora
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <HiOutlineUserGroup className="w-6 h-6 text-gray-400" />
              Acceso Estudiantes
            </button>
          </div>

          {/* Mini Stats en el Hero */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-gray-100 pt-10">
            <StatItem number="+50" label="Cursos Activos" />
            <StatItem number="+1200" label="Estudiantes" />
            <StatItem number="100%" label="Certificados" />
            <StatItem number="24/7" label="Acceso Online" />
          </div>
        </div>
      </header>

      {/* --- Features Grid --- */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Características Principales</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900">Todo lo que necesitas para aprender</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<HiOutlineBadgeCheck className="w-8 h-8 text-white"/>}
              color="bg-orange-500"
              title="Certificación Oficial"
              desc="Al finalizar y aprobar tus cursos, recibirás un certificado digital con código QR verificable avalado por la universidad."
            />
            <FeatureCard 
              icon={<HiOutlineDesktopComputer className="w-8 h-8 text-white"/>}
              color="bg-blue-600"
              title="Aprendizaje Práctico"
              desc="Cursos diseñados con enfoque en proyectos reales. Aprende haciendo con tecnologías demandadas en la industria."
            />
            <FeatureCard 
              icon={<HiOutlineLightningBolt className="w-8 h-8 text-white"/>}
              color="bg-purple-600"
              title="A tu propio ritmo"
              desc="Accede al material de estudio, grabaciones y recursos en cualquier momento. Tu educación se adapta a tu horario."
            />
          </div>
        </div>
      </section>

      {/* --- Categories Preview --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Explora nuestras áreas</h2>
              <p className="text-gray-500 max-w-xl">Desde programación hasta gestión de proyectos, tenemos el curso ideal para potenciar tu perfil profesional.</p>
            </div>
            <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 transition-colors">
              Ver catálogo completo <HiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard title="Desarrollo de Software" icon={<HiOutlineDesktopComputer />} count="12 Cursos" />
            <CategoryCard title="Redes y Seguridad" icon={<HiOutlineLightningBolt />} count="8 Cursos" />
            <CategoryCard title="Inteligencia Artificial" icon={<HiOutlineSparkles />} count="5 Cursos" />
            <CategoryCard title="Gestión de Proyectos" icon={<HiOutlineBookOpen />} count="7 Cursos" />
          </div>
        </div>
      </section>

      {/* --- Testimonials (Social Proof) --- */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Lo que dicen nuestros estudiantes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="La plataforma es increíblemente intuitiva. Pude inscribirme, pagar y tomar el curso de React sin problemas. ¡Recomendado!"
              author="María González"
              role="Estudiante de Sistemas"
            />
            <TestimonialCard 
              quote="Los certificados automáticos son una gran ventaja. Aprobé el curso y en 5 minutos ya tenía mi diploma listo para LinkedIn."
              author="Carlos M."
              role="Ingeniero Industrial"
            />
            <TestimonialCard 
              quote="Excelente contenido actualizado. Los docentes de la FISEI realmente saben transmitir conocimientos prácticos."
              author="Ana Torres"
              role="Desarrolladora Web"
            />
          </div>
        </div>
      </section>

      {/* --- CTA Final --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-blue-50 rounded-3xl p-10 md:p-16 text-center border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 relative z-10">
            ¿Listo para empezar tu camino?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto relative z-10">
            Únete a cientos de estudiantes y profesionales que ya están mejorando sus habilidades con nosotros.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 transform hover:-translate-y-1 relative z-10"
          >
            Crear mi cuenta gratis
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80 grayscale hover:grayscale-0 transition-all">
            <div className="bg-gray-200 text-gray-600 p-2 rounded-lg font-bold">UTA</div>
            <span className="font-bold text-gray-700">FISEI</span>
          </div>
          <p className="text-gray-400 text-sm text-center md:text-right">
            © {new Date().getFullYear()} Plataforma de Cursos FISEI. <br className="hidden md:block"/>
            Desarrollado con fines académicos.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Componentes Auxiliares para no ensuciar el código principal ---

function StatItem({ number, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-black text-gray-900">{number}</span>
      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function CategoryCard({ title, count, icon }) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
      <div className="text-blue-500 mb-4 text-3xl group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500">{count}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
      <div className="text-yellow-400 text-4xl mb-4">"</div>
      <p className="text-lg text-blue-50 mb-6 leading-relaxed italic">{quote}</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center font-bold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <h5 className="font-bold text-white">{author}</h5>
          <span className="text-xs text-blue-200 uppercase tracking-wide">{role}</span>
        </div>
      </div>
    </div>
  );
}