const ExcelJS = require('exceljs');

class ExcelService {
  async generarReporteEstudiantes(estudiantes, nombreCurso) {
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    
    // Crear hoja de estudiantes
    const worksheetEstudiantes = workbook.addWorksheet('Estudiantes');
    
    // Definir columnas
    worksheetEstudiantes.columns = [
      { header: 'Nombre Completo', key: 'nombreCompleto', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 12 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Nota Final', key: 'notaFinal', width: 10 },
      { header: 'Asistencia (%)', key: 'asistencia', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Fecha Inscripción', key: 'fechaInscripcion', width: 18 }
    ];
    
    // Estilizar encabezados
    worksheetEstudiantes.getRow(1).font = { bold: true };
    worksheetEstudiantes.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003366' }
    };
    worksheetEstudiantes.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheetEstudiantes.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Agregar datos de estudiantes
    estudiantes.forEach(estudiante => {
      worksheetEstudiantes.addRow({
        nombreCompleto: estudiante.nombreCompleto,
        cedula: estudiante.cedula,
        email: estudiante.email,
        notaFinal: estudiante.notaFinal != null ? estudiante.notaFinal : 'N/A',
        asistencia: `${estudiante.porcentajeAsistencia || 0}%`,
        estado: estudiante.estado || 'En curso',
        fechaInscripcion: estudiante.fechaInscripcion || 'N/A'
      });
    });
    
    // Calcular estadísticas
    const total = estudiantes.length;
    const aprobados = estudiantes.filter(e => e.estado === 'Aprobado' || e.notaFinal >= 70).length;
    const promedio = total > 0 
      ? (estudiantes.reduce((sum, e) => sum + (e.notaFinal || 0), 0) / total).toFixed(2)
      : 0;
    
    // Crear hoja de resumen
    const worksheetResumen = workbook.addWorksheet('Resumen');
    
    worksheetResumen.columns = [
      { header: 'Concepto', key: 'concepto', width: 25 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];
    
    // Estilizar encabezados del resumen
    worksheetResumen.getRow(1).font = { bold: true };
    worksheetResumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003366' }
    };
    worksheetResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheetResumen.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Agregar datos de resumen
    worksheetResumen.addRow({ concepto: 'Curso', valor: nombreCurso });
    worksheetResumen.addRow({ concepto: 'Total Estudiantes', valor: total });
    worksheetResumen.addRow({ concepto: 'Aprobados', valor: aprobados });
    worksheetResumen.addRow({ concepto: 'Promedio General', valor: promedio });
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

module.exports = new ExcelService();

