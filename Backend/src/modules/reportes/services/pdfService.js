const PdfPrinter = require('pdfmake');
const moment = require('moment');
require('moment/locale/es');
moment.locale('es');
const { colors, tableStyles } = require('../utils/styles');

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
    const fechaEmision = moment().format('D [de] MMMM [de] YYYY');

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [60, 60, 60, 60],
      watermark: {
        text: 'FISEI',
        color: colors.secondary,
        opacity: 0.05,
        bold: true,
        italics: true
      },
      background: (currentPage, pageSize) => ({
        canvas: [
          {
            type: 'rect',
            x: 30,
            y: 30,
            w: pageSize.width - 60,
            h: pageSize.height - 60,
            lineColor: colors.accent,
            lineWidth: 2
          },
          {
            type: 'rect',
            x: 40,
            y: 40,
            w: pageSize.width - 80,
            h: pageSize.height - 80,
            lineColor: colors.primary,
            lineWidth: 1
          }
        ]
      }),
      content: [
        {
          stack: [
            { text: 'FISEI', fontSize: 26, bold: true, color: colors.primary, alignment: 'center' },
            { text: 'FACULTAD DE INGENIERÍA EN SISTEMAS, ELECTRÓNICA E INDUSTRIAL', fontSize: 11, alignment: 'center', color: colors.text },
            { text: 'UNIVERSIDAD TÉCNICA DE AMBATO', fontSize: 10, alignment: 'center', color: colors.text }
          ],
          margin: [0, 0, 0, 30]
        },
        {
          text: 'CERTIFICADO DE PARTICIPACIÓN',
          fontSize: 28,
          bold: true,
          alignment: 'center',
          color: colors.primary,
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Se certifica que:',
          italics: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },
        {
          text: datosEstudiante.nombreCompleto.toUpperCase(),
          fontSize: 24,
          bold: true,
          color: colors.primary,
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },
        {
          text: `Cédula: ${datosEstudiante.cedula}`,
          alignment: 'center',
          fontSize: 12,
          margin: [0, 0, 0, 20]
        },
        {
          text: `Ha completado satisfactoriamente el curso`,
          alignment: 'center',
          fontSize: 13,
          margin: [0, 0, 0, 8]
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: datosCurso.nombre,
                  alignment: 'center',
                  bold: true,
                  fontSize: 16,
                  margin: [0, 8, 0, 8]
                }
              ]
            ]
          },
          layout: {
            fillColor: () => colors.lightGray,
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 8,
            paddingBottom: () => 8
          },
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: `Duración: ${datosCurso.duracion} horas`, fontSize: 12 },
                { text: `Fecha de finalización: ${datosCurso.fechaFinalizacion}`, fontSize: 12 }
              ]
            },
            {
              width: '*',
              stack: [
                { text: `Nota final: ${datosEstudiante.notaFinal}/100`, fontSize: 12 },
                { text: `Asistencia: ${datosEstudiante.porcentajeAsistencia}%`, fontSize: 12 }
              ],
              alignment: 'right'
            }
          ],
          columnGap: 30,
          margin: [0, 0, 0, 30]
        },
        {
          text: `Quito, ${fechaEmision}`,
          alignment: 'center',
          fontSize: 13,
          margin: [0, 0, 0, 50]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1.2, lineColor: colors.primary }] },
                { text: datosCurso.responsable || 'Director del Programa', fontSize: 11, alignment: 'center', margin: [0, 6, 0, 0] }
              ]
            },
            {
              width: '*',
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1.2, lineColor: colors.primary }] },
                { text: 'Decano FISEI', fontSize: 11, alignment: 'center', margin: [0, 6, 0, 0] }
              ]
            }
          ],
          columnGap: 40,
          margin: [0, 0, 0, 40]
        },
        {
          text: 'Universidad Técnica de Ambato - Facultad FISEI',
          alignment: 'center',
          fontSize: 10,
          color: colors.secondary
        }
      ],
      defaultStyle: {
        font: 'Roboto'
      },
      styles: {
        small: { fontSize: 10, color: colors.text }
      }
    };

    return this.printer.createPdfKitDocument(docDefinition);
  }

  generarReporteCurso(datosCurso, estudiantes) {
    const fechaGeneracion = moment().format('DD/MM/YYYY HH:mm');
    const tablaEstudiantes = estudiantes.map((estudiante, index) => [
      index + 1,
      estudiante.nombreCompleto,
      estudiante.cedula,
      estudiante.email,
      estudiante.notaFinal != null ? estudiante.notaFinal : 'N/A',
      `${estudiante.porcentajeAsistencia || 0}%`,
      estudiante.estado || 'En curso'
    ]);

    const total = estudiantes.length;
    const aprobados = estudiantes.filter(e => e.estado === 'Aprobado' || (e.notaFinal && e.notaFinal >= 70)).length;
    const promedio = estudiantes.length > 0
      ? (estudiantes.reduce((sum, e) => sum + (e.notaFinal || 0), 0) / estudiantes.length).toFixed(2)
      : 0;

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [50, 60, 50, 60],
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: `Página ${currentPage} de ${pageCount}`, alignment: 'left', style: 'footerSmall' },
          { text: fechaGeneracion, alignment: 'center', style: 'footerSmall' },
          { text: 'Generado por Sistema FISEI', alignment: 'right', style: 'footerSmall' }
        ],
        margin: [50, 0]
      }),
      content: [
        this._buildReportHeader(datosCurso, fechaGeneracion),
        {
          table: {
            headerRows: 1,
            widths: [25, '*', 90, 120, 50, 60, 70],
            body: [
              [
                { text: '#', style: 'tableHeader' },
                { text: 'Nombre Completo', style: 'tableHeader' },
                { text: 'Cédula', style: 'tableHeader' },
                { text: 'Email', style: 'tableHeader' },
                { text: 'Nota', style: 'tableHeader' },
                { text: 'Asistencia', style: 'tableHeader' },
                { text: 'Estado', style: 'tableHeader' }
              ],
              ...tablaEstudiantes.map((fila, index) =>
                fila.map(celda => ({
                  text: celda.toString(),
                  alignment: typeof celda === 'number' ? 'center' : 'left'
                }))
              )
            ]
          },
          layout: {
            fillColor: (rowIndex) => {
              if (rowIndex === 0) return tableStyles.headerFillColor;
              return rowIndex % 2 === 0 ? tableStyles.evenRowFillColor : tableStyles.oddRowFillColor;
            },
            hLineColor: () => '#d5d5d5',
            vLineColor: () => '#d5d5d5',
            hLineWidth: (i) => (i === 0 ? 0 : 0.4),
            vLineWidth: () => 0.4,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6
          },
          margin: [0, 0, 0, 25]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Total de estudiantes', style: 'summaryLabel' },
                    { text: total.toString(), style: 'summaryValue' }
                  ]
                },
                {
                  stack: [
                    { text: 'Aprobados', style: 'summaryLabel' },
                    { text: aprobados.toString(), style: 'summaryValue' }
                  ]
                },
                {
                  stack: [
                    { text: 'Promedio general', style: 'summaryLabel' },
                    { text: promedio.toString(), style: 'summaryValue' }
                  ]
                }
              ]
            ]
          },
          layout: {
            fillColor: () => '#e3efff',
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 12,
            paddingBottom: () => 12
          }
        }
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        color: colors.text
      },
      styles: {
        tableHeader: { fontSize: 11, bold: true, color: colors.white },
        footer: { fontSize: 10, alignment: 'center' },
        footerSmall: { fontSize: 9, color: '#666666' },
        summaryLabel: { fontSize: 10, color: colors.primary },
        summaryValue: { fontSize: 16, bold: true, color: colors.primary }
      }
    };

    return this.printer.createPdfKitDocument(docDefinition);
  }

  _buildReportHeader(datosCurso, fechaGeneracion) {
    return {
      stack: [
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: 'REPORTE ACADÉMICO DEL CURSO', fontSize: 18, bold: true, color: colors.white, alignment: 'center' },
                    { text: datosCurso.nombre, fontSize: 12, color: colors.white, alignment: 'center', margin: [0, 4, 0, 0] },
                    { text: `Generado: ${fechaGeneracion}`, fontSize: 10, color: colors.white, alignment: 'center', margin: [0, 6, 0, 0] }
                  ],
                  margin: [0, 6, 0, 6]
                }
              ]
            ]
          },
          layout: {
            fillColor: () => colors.primary,
            paddingLeft: () => 15,
            paddingRight: () => 15,
            paddingTop: () => 6,
            paddingBottom: () => 6
          }
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 495,
              y2: 0,
              lineWidth: 2,
              lineColor: colors.accent
            }
          ],
          margin: [0, 12, 0, 18]
        },
        {
          columns: [
            { text: `Duración: ${datosCurso.duracion} horas`, width: 'auto', margin: [0, 0, 20, 0] },
            { text: `Fecha de finalización: ${datosCurso.fechaFinalizacion || 'No especificada'}`, width: 'auto' },
            { text: `Responsable: ${datosCurso.responsable || 'Sin asignar'}`, width: '*' }
          ]
        },
        { text: 'Listado de estudiantes', fontSize: 14, bold: true, color: colors.primary, margin: [0, 20, 0, 10] }
      ],
      margin: [0, 0, 0, 10]
    };
  }
}

module.exports = new PdfService();

