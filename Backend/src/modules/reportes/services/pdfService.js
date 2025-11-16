const PdfPrinter = require('pdfmake');
const styles = require('../utils/styles');

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

class PdfService {
  constructor() {
    this.printer = new PdfPrinter(fonts);
  }

  generarCertificado(datosEstudiante, datosCurso) {
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: 'FACULTAD DE INGENIERÍA EN SISTEMAS, ELECTRÓNICA E INDUSTRIAL',
          style: 'header',
          margin: [0, 20, 0, 10]
        },
        {
          text: 'FISEI - UTA',
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },
        {
          text: 'CERTIFICADO DE APROBACIÓN',
          style: 'certificadoTitulo',
          decoration: 'underline'
        },
        {
          text: 'Se certifica que',
          style: 'certificadoTexto',
          margin: [0, 30, 0, 10]
        },
        {
          text: datosEstudiante.nombreCompleto.toUpperCase(),
          fontSize: 24,
          bold: true,
          color: '#2E86AB',
          alignment: 'center',
          margin: [0, 10, 0, 20]
        },
        {
          text: `Cédula: ${datosEstudiante.cedula}`,
          style: 'certificadoTexto',
          margin: [0, 10, 0, 10]
        },
        {
          text: `ha aprobado satisfactoriamente el curso:`,
          style: 'certificadoTexto',
          margin: [0, 10, 0, 10]
        },
        {
          text: datosCurso.nombre,
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 10]
        },
        {
          columns: [
            {
              text: `Duración: ${datosCurso.duracion} horas`,
              style: 'certificadoTexto',
              width: 'auto'
            },
            {
              text: `Fecha de finalización: ${datosCurso.fechaFinalizacion}`,
              style: 'certificadoTexto',
              width: 'auto'
            }
          ],
          columnGap: 20,
          margin: [0, 20, 0, 30]
        },
        {
          text: `Nota Final: ${datosEstudiante.notaFinal}/100`,
          style: 'certificadoTexto',
          margin: [0, 10, 0, 40]
        },
        {
          columns: [
            {
              text: [
                {text: '_________________________\n', alignment: 'center'},
                {text: datosCurso.responsable || 'Responsable del Curso', alignment: 'center', fontSize: 10}
              ],
              width: '*'
            },
            {
              text: [
                {text: '_________________________\n', alignment: 'center'},
                {text: 'Decano FISEI', alignment: 'center', fontSize: 10}
              ],
              width: '*'
            }
          ],
          columnGap: 20,
          margin: [0, 40, 0, 0]
        },
        {
          text: `Fecha de emisión: ${new Date().toLocaleDateString('es-EC')}`,
          style: 'footer',
          margin: [0, 30, 0, 0]
        }
      ],
      defaultStyle: {
        font: 'Roboto'
      }
    };

    return this.printer.createPdfKitDocument(docDefinition);
  }

  generarReporteCurso(datosCurso, estudiantes) {
    // Mapear estudiantes para la tabla
    const tablaEstudiantes = estudiantes.map((estudiante, index) => [
      index + 1,
      estudiante.nombreCompleto,
      estudiante.cedula,
      estudiante.email,
      estudiante.notaFinal || 'N/A',
      `${estudiante.porcentajeAsistencia || 0}%`,
      estudiante.estado || 'En curso'
    ]);

    // Calcular estadísticas
    const total = estudiantes.length;
    const aprobados = estudiantes.filter(e => e.estado === 'Aprobado' || (e.notaFinal && e.notaFinal >= 70)).length;
    const promedio = estudiantes.length > 0 
      ? (estudiantes.reduce((sum, e) => sum + (e.notaFinal || 0), 0) / estudiantes.length).toFixed(2)
      : 0;

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: 'REPORTE DE CURSO',
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        {
          text: datosCurso.nombre,
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            {
              text: `Duración: ${datosCurso.duracion} horas`,
              width: '*'
            },
            {
              text: `Fecha: ${datosCurso.fechaFinalizacion || 'N/A'}`,
              width: '*'
            }
          ],
          margin: [0, 0, 0, 20]
        },
        {
          text: 'ESTUDIANTES INSCRITOS',
          style: 'subheader',
          margin: [0, 20, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: [30, '*', 100, '*', 60, 70, 80],
            body: [
              [
                {text: '#', style: 'tableHeader'},
                {text: 'Nombre Completo', style: 'tableHeader'},
                {text: 'Cédula', style: 'tableHeader'},
                {text: 'Email', style: 'tableHeader'},
                {text: 'Nota Final', style: 'tableHeader'},
                {text: 'Asistencia', style: 'tableHeader'},
                {text: 'Estado', style: 'tableHeader'}
              ],
              ...tablaEstudiantes.map((fila, index) => 
                fila.map((celda, colIndex) => ({
                  text: celda.toString(),
                  fillColor: index % 2 === 0 ? '#F0F0F0' : null
                }))
              )
            ]
          },
          margin: [0, 0, 0, 20]
        },
        {
          text: 'ESTADÍSTICAS',
          style: 'subheader',
          margin: [0, 20, 0, 10]
        },
        {
          ul: [
            `Total de estudiantes: ${total}`,
            `Estudiantes aprobados: ${aprobados}`,
            `Promedio general: ${promedio}`
          ],
          margin: [0, 0, 0, 20]
        },
        {
          text: `Fecha de generación: ${new Date().toLocaleDateString('es-EC')}`,
          style: 'footer',
          margin: [0, 20, 0, 0]
        }
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      },
      styles: styles
    };

    return this.printer.createPdfKitDocument(docDefinition);
  }
}

module.exports = new PdfService();

