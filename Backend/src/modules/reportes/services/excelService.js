const XLSX = require('xlsx');

class ExcelService {
  generarReporteEstudiantes(estudiantes, nombreCurso) {
    // Mapear estudiantes a objeto con las columnas requeridas
    const data = estudiantes.map(estudiante => ({
      'Nombre Completo': estudiante.nombreCompleto,
      'Cédula': estudiante.cedula,
      'Email': estudiante.email,
      'Nota Final': estudiante.notaFinal,
      'Asistencia (%)': estudiante.porcentajeAsistencia,
      'Estado': estudiante.estado,
      'Fecha Inscripción': estudiante.fechaInscripcion
    }));

    // Crear worksheet con los datos
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columnas
    worksheet['!cols'] = [
      {wch: 30},  // Nombre Completo
      {wch: 12},  // Cédula
      {wch: 25},  // Email
      {wch: 10},  // Nota Final
      {wch: 12},  // Asistencia (%)
      {wch: 12},  // Estado
      {wch: 18}   // Fecha Inscripción
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Agregar hoja de estudiantes
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

    // Calcular estadísticas
    const total = estudiantes.length;
    const aprobados = estudiantes.filter(e => e.estado === 'Aprobado' || e.notaFinal >= 70).length;
    const promedio = estudiantes.reduce((sum, e) => sum + (e.notaFinal || 0), 0) / total;

    // Crear hoja de resumen
    const resumenData = [
      { 'Concepto': 'Curso', 'Valor': nombreCurso },
      { 'Concepto': 'Total Estudiantes', 'Valor': total },
      { 'Concepto': 'Aprobados', 'Valor': aprobados },
      { 'Concepto': 'Promedio General', 'Valor': promedio.toFixed(2) }
    ];

    const resumenWorksheet = XLSX.utils.json_to_sheet(resumenData);
    resumenWorksheet['!cols'] = [{wch: 25}, {wch: 20}];
    XLSX.utils.book_append_sheet(workbook, resumenWorksheet, 'Resumen');

    // Retornar buffer
    return XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'});
  }
}

module.exports = new ExcelService();

