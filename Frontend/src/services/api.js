// src/services/api.js

// Headers de autenticación (token + cabeceras útiles para backend)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');          // opcional si lo guardas tras login
  const cedula = localStorage.getItem('cedula');    // opcional si lo guardas tras login
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(rol && { 'x-user-rol': rol }),
    ...(cedula && { 'x-user-cedula': cedula })
  };
};

// Headers públicos (cuando la ruta no exige auth)
const getPublicHeaders = () => ({ 'Content-Type': 'application/json' });

// Manejo seguro: lee el cuerpo una sola vez
const handleResponse = async (r) => {
  const ct = r.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const body = isJson ? await r.json().catch(() => null) : await r.text().catch(() => '');

  if (r.ok) {
    return body ?? true; // 204 => true
  }

  const message =
    (isJson && body && (body.message || body.error)) ||
    (typeof body === 'string' && body) ||
    `HTTP ${r.status}`;

  const err = new Error(message);
  err.status = r.status;
  err.body = body;
  throw err;
};

export const API = {
  // ===================== Usuarios =====================
  async listUsuarios(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/usuarios${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async getUsuario(cedula) {
    const res = await fetch(`/api/usuarios/${cedula}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async createUsuario(data) {
    const res = await fetch(`/api/usuarios`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async updateUsuario(cedula, data) {
    const res = await fetch(`/api/usuarios/${cedula}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async deleteUsuario(cedula) {
    const res = await fetch(`/api/usuarios/${cedula}`, { method: 'DELETE', headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async activateUsuario(cedula) {
    const res = await fetch(`/api/usuarios/${cedula}/activar`, { method: 'PUT', headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  // ===================== Usuario - Mis Cursos =====================
  async getUserCourses() {
    const res = await fetch(`/api/usuarios/mis-cursos`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },

  // ===================== Cursos =====================
  async listCursos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/cursos${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async getCurso(id) {
    const res = await fetch(`/api/cursos/${id}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async createCurso(body) {
    const res = await fetch(`/api/cursos`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
    return await handleResponse(res);
  },
  async updateCurso(id, body) {
    const res = await fetch(`/api/cursos/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body) });
    return await handleResponse(res);
  },
  async deleteCurso(id) {
    const res = await fetch(`/api/cursos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async activateCurso(id) {
    const res = await fetch(`/api/cursos/${id}/activar`, { method: 'PUT', headers: getAuthHeaders() });
    return await handleResponse(res);
  },

  // ===================== Encargados del curso =====================
  async listEncargados(id) {
    const res = await fetch(`/api/cursos/${id}/encargados`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async addEncargado(id, cedula) {
    const res = await fetch(`/api/cursos/${id}/encargados`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cedula_encargado: cedula })
    });
    return await handleResponse(res);
  },
  async removeEncargado(id, cedula) {
    const res = await fetch(`/api/cursos/${id}/encargados/${cedula}`, { method: 'DELETE', headers: getAuthHeaders() });
    return await handleResponse(res);
  },

  // ===================== Inscripciones =====================
  async listInscripciones(params = {}) {
    const { misCursos, ...rest } = params || {};
    const query = new URLSearchParams(rest).toString();
    const base = misCursos ? '/api/inscripciones/mis-cursos' : '/api/inscripciones';
    const res = await fetch(`${base}${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async getInscripcion(id) {
    const res = await fetch(`/api/inscripciones/${id}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async createInscripcion(data) {
    const res = await fetch(`/api/inscripciones`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async updateInscripcion(id, data) {
    const res = await fetch(`/api/inscripciones/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async deleteInscripcion(id) {
    const res = await fetch(`/api/inscripciones/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return await handleResponse(res);
  },

  // ===================== Solicitudes =====================
  async listSolicitudes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/solicitudes${query ? `?${query}` : ''}`, { headers: getPublicHeaders() });
    return await handleResponse(res);
  },
  async getSolicitud(id) {
    const res = await fetch(`/api/solicitudes/${id}`, { headers: getPublicHeaders() });
    return await handleResponse(res);
  },
  async createSolicitud(data) {
    const res = await fetch(`/api/solicitudes`, { method: 'POST', headers: getPublicHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async updateSolicitud(id, data) {
    const res = await fetch(`/api/solicitudes/${id}`, { method: 'PUT', headers: getPublicHeaders(), body: JSON.stringify(data) });
    return await handleResponse(res);
  },
  async deleteSolicitud(id) {
    const res = await fetch(`/api/solicitudes/${id}`, { method: 'DELETE', headers: getPublicHeaders() });
    return await handleResponse(res);
  },
  async getSolicitudesStats() {
    const res = await fetch(`/api/solicitudes/stats`, { headers: getPublicHeaders() });
    return await handleResponse(res);
  },

  // ===================== Pagos =====================
  async uploadComprobante(idInscripcion, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('comprobante', file);

    const res = await fetch(`/api/pagos/upload/${idInscripcion}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return await handleResponse(res);
  },
  async listPendingPayments() {
    const res = await fetch(`/api/pagos`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async getOrdenPago(idInscripcion) {
    const res = await fetch(`/api/pagos/orden/${idInscripcion}`, { headers: getAuthHeaders() });
    return await handleResponse(res);
  },
  async approvePayment(idPago) {
    const res = await fetch(`/api/pagos/${idPago}/aprobar`, { 
      method: 'PUT', 
      headers: getAuthHeaders(),
      body: JSON.stringify({}) 
    });
    return await handleResponse(res);
  },

  // ===================== Reportes =====================
  async generarCertificado(cursoId, estudianteId) {
    const r = await fetch(`/api/reportes/certificado/${cursoId}/${estudianteId}`, { headers: getAuthHeaders() });
    if (!r.ok) throw new Error('Error al generar certificado');
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_${estudianteId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
  async generarReportePDF(cursoId) {
    const r = await fetch(`/api/reportes/curso/${cursoId}`, { headers: getAuthHeaders() });
    if (!r.ok) throw new Error('Error al generar reporte');
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_curso_${cursoId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
  async generarReporteExcel(cursoId) {
    const r = await fetch(`/api/reportes/curso/${cursoId}?formato=excel`, { headers: getAuthHeaders() });
    if (!r.ok) throw new Error('Error al generar reporte');
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_curso_${cursoId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  }
};
