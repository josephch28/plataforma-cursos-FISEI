const pdfService = require('../services/pdfService');

class CertificadoController {
  async generarCertificado(req, res) {
    try {
      const { cursoId, estudianteId } = req.params;
      
      // Datos de prueba (en producción, estos vendrían de la base de datos)
      const datosEstudiante = {
        nombreCompleto: 'Juan Pérez García',
        cedula: '1234567890',
        notaFinal: 85,
        porcentajeAsistencia: 95
      };
      
      const datosCurso = {
        nombre: 'Desarrollo Web con Node.js y React',
        duracion: 40,
        fechaFinalizacion: '15/11/2025',
        responsable: 'Ing. María López'
      };
      
      const pdfDoc = pdfService.generarCertificado(datosEstudiante, datosCurso);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificado_${datosEstudiante.cedula}.pdf`);
      
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      res.status(500).json({
        error: 'Error al generar certificado',
        mensaje: error.message
      });
    }
  }
}

module.exports = new CertificadoController();

