const pdfService = require('../services/pdfService');
const excelService = require('../services/excelService');

class ReporteController {
  async reportePorCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const formato = req.query.formato || 'pdf';
      
      // Datos de prueba (en producción, estos vendrían de la base de datos)
      const datosCurso = {
        nombre: 'Desarrollo Web con Node.js y React',
        duracion: 40,
        fechaFinalizacion: '15/11/2025',
        responsable: 'Ing. María López'
      };
      
      const estudiantes = [
        {
          nombreCompleto: 'Juan Pérez García',
          cedula: '1234567890',
          email: 'juan.perez@example.com',
          notaFinal: 85,
          porcentajeAsistencia: 95,
          estado: 'Aprobado',
          fechaInscripcion: '01/09/2025'
        },
        {
          nombreCompleto: 'María González López',
          cedula: '0987654321',
          email: 'maria.gonzalez@example.com',
          notaFinal: 92,
          porcentajeAsistencia: 98,
          estado: 'Aprobado',
          fechaInscripcion: '01/09/2025'
        },
        {
          nombreCompleto: 'Carlos Rodríguez Martínez',
          cedula: '1122334455',
          email: 'carlos.rodriguez@example.com',
          notaFinal: 65,
          porcentajeAsistencia: 75,
          estado: 'Reprobado',
          fechaInscripcion: '02/09/2025'
        }
      ];
      
      if (formato === 'excel' || formato === 'xlsx') {
        // Generar reporte en Excel
        const buffer = excelService.generarReporteEstudiantes(estudiantes, datosCurso.nombre);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_curso_${cursoId}.xlsx`);
        
        res.send(buffer);
      } else {
        // Generar reporte en PDF (por defecto)
        const pdfDoc = pdfService.generarReporteCurso(datosCurso, estudiantes);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_curso_${cursoId}.pdf`);
        
        pdfDoc.pipe(res);
        pdfDoc.end();
      }
    } catch (error) {
      res.status(500).json({
        error: 'Error al generar reporte',
        mensaje: error.message
      });
    }
  }
}

module.exports = new ReporteController();

