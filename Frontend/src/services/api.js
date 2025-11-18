// src/services/api.js

// ¡NUEVO! Función para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ¡NUEVO! Headers solo con 'Content-Type' para peticiones JSON públicas
const getPublicHeaders = () => {
  return { 'Content-Type': 'application/json' };
};

// Maneja respuestas JSON o texto y arroja errores legibles
const handleResponse = async (r) => {
  if (r.ok) {
    if (r.status === 204) return true;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/json')) return await r.json();
    return await r.text();
  }
  try {
    const body = await r.json();
    throw body;
  } catch (e) {
    const text = await r.text();
    throw new Error(text || `HTTP ${r.status}`);
  }
};

export const API = {
  // --- Usuarios (Ya no reciben 'auth') ---
  async listUsuarios(params = {}) {
    const query = new URLSearchParams(params).toString();
    // Esta ruta es pública para autocompletar, no necesita token
    const res = await fetch(`/api/usuarios${query ? `?${query}` : ''}`); 
    return await handleResponse(res);
  },
  async getUsuario(cedula) {
    const r = await fetch(`/api/usuarios/${cedula}`, {
        headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },
  async createUsuario(data) {
    const r = await fetch(`/api/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateUsuario(cedula, data) {
    const r = await fetch(`/api/usuarios/${cedula}`, {
      method: 'PUT',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteUsuario(cedula) {
    const r = await fetch(`/api/usuarios/${cedula}`, {
      method: 'DELETE',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },
  async activateUsuario(cedula) { 
    const r = await fetch(`/api/usuarios/${cedula}/activar`, {
      method: 'PUT',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },
  
  // --- Cursos (Ya no reciben 'auth') ---
  async getCurso(id) {
    const r = await fetch(`/api/cursos/${id}`);
    return await handleResponse(r);
  },
  async createCurso(data) {
    const r = await fetch(`/api/cursos`, {
      method: 'POST',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateCurso(id, data) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteCurso(id) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },
  async activateCurso(id) {
    const r = await fetch(`/api/cursos/${id}/activar`, {
      method: 'PUT',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },

  // --- Encargados (Ya no reciben 'auth') ---
  async listEncargados(id) {
    const r = await fetch(`/api/cursos/${id}/encargados`);
    return await handleResponse(r);
  },
  async addEncargado(id, cedula) {
    const r = await fetch(`/api/cursos/${id}/encargados`, {
      method: 'POST',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify({ cedula_encargado: cedula })
    });
    return await handleResponse(r);
  },
  async removeEncargado(id, cedula) {
    const r = await fetch(`/api/cursos/${id}/encargados/${cedula}`, {
      method: 'DELETE',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },

  // --- Inscripciones (Ya no reciben 'auth') ---
  async listInscripciones() {
    const r = await fetch('/api/inscripciones');
    return await handleResponse(r);
  },
  async createInscripcion(data) {
    const r = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateInscripcion(id, data) {
    const r = await fetch(`/api/inscripciones/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(), // Usa token
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteInscripcion(id) {
    const r = await fetch(`/api/inscripciones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders() // Usa token
    });
    return await handleResponse(r);
  },
  async getInscripcion(id) {
    const r = await fetch(`/api/inscripciones/${id}`);
    return await handleResponse(r);
  },

  // --- Listas para autocompletar (públicas) ---
  async listCursos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/cursos${query ? `?${query}` : ''}`);
    return await handleResponse(res);
  },
  
  // --- Solicitudes (públicas) ---
  async listSolicitudes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const r = await fetch(`/api/solicitudes${query ? `?${query}` : ''}`);
    return await handleResponse(r);
  },
  async getSolicitud(id) {
    const r = await fetch(`/api/solicitudes/${id}`);
    return await handleResponse(r);
  },
  async createSolicitud(data) {
    const r = await fetch(`/api/solicitudes`, {
      method: 'POST',
      headers: getPublicHeaders(), // Es pública
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateSolicitud(id, data) {
    const r = await fetch(`/api/solicitudes/${id}`, {
      method: 'PUT',
      headers: getPublicHeaders(), // Es pública
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteSolicitud(id) {
    const r = await fetch(`/api/solicitudes/${id}`, { method: 'DELETE' });
    return await handleResponse(r);
  },
  async getSolicitudesStats() {
    const r = await fetch(`/api/solicitudes/stats`);
    return await handleResponse(r);
  },
};