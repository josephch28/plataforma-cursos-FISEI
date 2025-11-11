// src/services/api.js
export const API = {
  async getCurso(id) {
    const r = await fetch(`/api/cursos/${id}`);
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async createCurso(data, auth) {
    const r = await fetch(`/api/cursos`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async updateCurso(id, data, auth) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async deleteCurso(id, auth) {
    const r = await fetch(`/api/cursos/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    if (!r.ok && r.status !== 204) throw await r.json();
    return true;
  },
  async activateCurso(id, auth) {
    const r = await fetch(`/api/cursos/${id}/activar`, {
      method: 'PUT',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async listEncargados(id) {
    const r = await fetch(`/api/cursos/${id}/encargados`);
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async addEncargado(id, cedula, auth) {
    const r = await fetch(`/api/cursos/${id}/encargados`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula },
      body: JSON.stringify({ cedula_encargado: cedula })
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async removeEncargado(id, cedula, auth) {
    const r = await fetch(`/api/cursos/${id}/encargados/${cedula}`, {
      method: 'DELETE',
      headers: { 'x-user-rol': auth.rol, 'x-user-cedula': auth.cedula }
    });
    if (!r.ok && r.status !== 204) throw await r.json();
    return true;
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
  async listUsuarios() {
    const res = await fetch('/api/usuarios');
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return await res.json();
  },
};
