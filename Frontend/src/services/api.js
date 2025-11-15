// src/services/api.js

// Maneja respuestas JSON o texto y arroja errores legibles cuando la respuesta no es JSON.
const handleResponse = async (r) => {
  if (r.ok) {
    if (r.status === 204) return true;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/json')) return await r.json();
    return await r.text();
  }

  // Intentar parsear JSON de error, si no es JSON devolver texto plano
  try {
    const body = await r.json();
    throw body;
  } catch (e) {
    const text = await r.text();
    throw new Error(text || `HTTP ${r.status}`);
  }
};

export const API = {
  // Usuarios API calls (Agregar al final de las funciones)
  async listUsuarios(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/usuarios${query ? `?${query}` : ''}`);
  return await handleResponse(res);
  },
  async getUsuario(cedula, auth) {
    const r = await fetch(`/api/usuarios/${cedula}`, {
        headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    return await handleResponse(r);
  },
  async createUsuario(data, auth) {
    const r = await fetch(`/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateUsuario(cedula, data, auth) {
    const r = await fetch(`/api/usuarios/${cedula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteUsuario(cedula, auth) {
  const r = await fetch(`/api/usuarios/${cedula}`, {
    method: 'DELETE',
    headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
  });
  return await handleResponse(r);
  },
  async activateUsuario(cedula, auth) { // 🆕 NUEVO
    const r = await fetch(`/api/usuarios/${cedula}/activar`, {
      method: 'PUT',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    return await handleResponse(r);
  },
  async getCurso(id) {
    const r = await fetch(`/api/cursos/${id}`);
    return await handleResponse(r);
  },
  async createCurso(data, auth) {
    const r = await fetch(`/api/cursos`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async updateCurso(id, data, auth) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    return await handleResponse(r);
  },
  async deleteCurso(id, auth) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    return await handleResponse(r);
  },
  async activateCurso(id, auth) {
    const r = await fetch(`/api/cursos/${id}/activar`, {
      method: 'PUT',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    return await handleResponse(r);
  },
  async listEncargados(id) {
    const r = await fetch(`/api/cursos/${id}/encargados`);
    return await handleResponse(r);
  },
  async addEncargado(id, cedula, auth) {
    const r = await fetch(`/api/cursos/${id}/encargados`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify({ cedula_encargado: cedula })
    });
    return await handleResponse(r);
  },
  async removeEncargado(id, cedula, auth) {
    const r = await fetch(`/api/cursos/${id}/encargados/${cedula}`, {
      method: 'DELETE',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    return await handleResponse(r);
  },

  // Inscripciones
  async listInscripciones() {
    const r = await fetch('/api/inscripciones');
    if (!r.ok) throw new Error('Error al obtener inscripciones');
    return r.json();
  },
  async createInscripcion(data, auth) {
    const r = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth && { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula })
      },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Error al crear inscripción');
    return r.json();
  },
  async updateInscripcion(id, data, auth) {
    const r = await fetch(`/api/inscripciones/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(auth && { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula })
      },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Error al actualizar inscripción');
    return r.json();
  },
  async deleteInscripcion(id, auth) {
    const r = await fetch(`/api/inscripciones/${id}`, {
      method: 'DELETE',
      headers: auth ? { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula } : {}
    });
    if (!r.ok) throw new Error('Error al eliminar inscripción');
    return r.json();
  },
  async getInscripcion(id) {
    const r = await fetch(`/api/inscripciones/${id}`);
    if (!r.ok) throw new Error('No encontrada');
    return r.json();
  },

  // Listar cursos y usuarios para autocompletar
  async listCursos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/cursos${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Error al obtener cursos');
    return await res.json();
  },
  // `listUsuarios` definido arriba (con `params`) maneja la obtención
  // de usuarios y acepta filtros. Eliminamos la definición duplicada
  // para evitar sobrescribirla.
};
