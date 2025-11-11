// src/services/api.js - AGREGAR MÉTODO
export const API = {
  async listCursos(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`/api/cursos?${qs}`);
    if (!r.ok) throw await r.json();
    return r.json();
  },
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
  // ✅ NUEVO MÉTODO
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
  }
};
