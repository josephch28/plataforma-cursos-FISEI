const pool = require('../db');
const PDFDocument = require('pdfkit');

exports.download = async (req, res) => {
    try {
        const { codigo } = req.params;

        // 1. Fetch certificate data
        const [rows] = await pool.query(`
        SELECT c.*, u.nombre as u_nombre, u.apellido as u_apellido, u.cedula,
               cr.nombre as curso_nombre, cr.horas, cr.fecha_inicio, cr.fecha_fin
        FROM certificados c
        JOIN inscripcion i ON c.id_inscripcion = i.id_inscripcion
        JOIN usuario u ON i.cedula_usuario = u.cedula
        JOIN curso cr ON i.id_curso = cr.id_curso
        WHERE c.codigo_verificacion = ?
    `, [codigo]);

        if (!rows.length) {
            return res.status(404).send('Certificado no encontrado');
        }

        const data = rows[0];

        // 2. Generate PDF
        // Create a document
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificado-${codigo}.pdf`);

        doc.pipe(res);

        // --- DESIGN ---
        // Border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

        // Title
        doc.moveDown(2);
        doc.fontSize(30).font('Helvetica-Bold').text('CERTIFICADO DE APROBACIÓN', { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(14).font('Helvetica').text('La Facultad de Ingeniería en Sistemas, Electrónica e Industrial', { align: 'center' });
        doc.text('otorga el presente certificado a:', { align: 'center' });

        // Name
        doc.moveDown(1.5);
        doc.fontSize(24).font('Helvetica-Bold').text(`${data.u_nombre} ${data.u_apellido}`, { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`C.I. ${data.cedula}`, { align: 'center' });

        // Course info
        doc.moveDown(1.5);
        doc.fontSize(14).text('Por haber aprobado satisfactoriamente el curso de:', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(20).font('Helvetica-Bold').text(data.curso_nombre, { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica').text(`Con una duración de ${data.horas} horas.`, { align: 'center' });

        // Dates
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : 'N/A';
        doc.text(`Realizado desde ${fmtDate(data.fecha_inicio)} hasta ${fmtDate(data.fecha_fin)}`, { align: 'center' });

        // Footer / Code
        doc.moveDown(4);
        doc.fontSize(10).text(`Código de Verificación: ${data.codigo_verificacion}`, { align: 'center' });
        doc.text(`Fecha de Emisión: ${fmtDate(data.fecha_emision)}`, { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('CERT PDF Error:', error);
        res.status(500).send('Error generando certificado');
    }
};
