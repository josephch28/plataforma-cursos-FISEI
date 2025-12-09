// Backend/src/controllers/pagos.controller.js
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La carpeta debe existir en la raíz del backend
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `pago_${req.params.idInscripcion}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado. Use PDF, JPG o PNG.'), false);
    }
  }
}).single('comprobante'); // El nombre del campo en el formulario es 'comprobante'

// 1. Subir comprobante (Usuario)
exports.uploadComprobante = (req, res) => {
  const { idInscripcion } = req.params;
  const user = req.user;

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error al subir el archivo' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Comprobante no proporcionado' });
    }

    try {
      const [inscripciones] = await pool.query(
        'SELECT cedula_usuario, estado FROM inscripcion WHERE id_inscripcion = ?',
        [idInscripcion]
      );
      if (!inscripciones.length) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      const inscripcion = inscripciones[0];

      if (user.rol !== 'admin' && inscripcion.cedula_usuario !== user.cedula) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'No autorizado para esta inscripción' });
      }

      if (inscripcion.estado !== 'pendiente') {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'La inscripción no requiere comprobante' });
      }

      const [pagos] = await pool.query(
        'SELECT id_pago, comprobante_pdf FROM pago WHERE id_inscripcion = ?',
        [idInscripcion]
      );
      if (!pagos.length) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'No existe orden de pago para esta inscripción' });
      }

      // Eliminar archivo previo si se vuelve a subir
      if (pagos[0].comprobante_pdf) {
        const prevPath = path.join(__dirname, '..', 'uploads', pagos[0].comprobante_pdf);
        if (fs.existsSync(prevPath)) {
          fs.unlinkSync(prevPath);
        }
      }

      const filePath = req.file.filename;
      await pool.query(
        'UPDATE pago SET comprobante_pdf = ?, fecha_pago = NOW(), aprobado = 0 WHERE id_pago = ?',
        [filePath, pagos[0].id_pago]
      );

      return res.status(200).json({
        message: 'Comprobante subido exitosamente. Pendiente de aprobación.',
        filePath: `/uploads/${filePath}`
      });

    } catch (dbError) {
      console.error('Error DB al subir comprobante:', dbError);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: 'Error al actualizar registro de pago' });
    }
  });
};

// 2. Obtener detalle de orden de pago (Usuario/Admin)
exports.getOrdenByInscripcion = async (req, res) => {
  const { idInscripcion } = req.params;
  const user = req.user;

  try {
    const [ordenes] = await pool.query(
      `SELECT p.*, i.cedula_usuario
       FROM pago p
       JOIN inscripcion i ON i.id_inscripcion = p.id_inscripcion
       WHERE p.id_inscripcion = ?`,
      [idInscripcion]
    );

    if (!ordenes.length) {
      return res.status(404).json({ message: 'Orden de pago no encontrada' });
    }

    const orden = ordenes[0];
    if (user.rol !== 'admin' && orden.cedula_usuario !== user.cedula) {
      return res.status(403).json({ message: 'No autorizado para consultar esta orden' });
    }

    res.json({
      id_pago: orden.id_pago,
      monto: orden.monto,
      metodo_pago: orden.metodo_pago,
      numero_orden: orden.numero_orden,
      comprobante_pdf: orden.comprobante_pdf,
      aprobado: orden.aprobado,
      fecha_pago: orden.fecha_pago,
      fecha_aprobacion: orden.fecha_aprobacion
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ message: 'Error al obtener orden de pago' });
  }
};

// 3. Listar pagos pendientes (Admin)
exports.listPending = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT 
                p.id_pago, p.monto, p.metodo_pago, p.numero_orden,
                p.comprobante_pdf, p.fecha_pago,
                i.cedula_usuario, c.nombre as curso_nombre
            FROM pago p
            JOIN inscripcion i ON i.id_inscripcion = p.id_inscripcion
            JOIN curso c ON c.id_curso = i.id_curso
            WHERE p.aprobado = 0
            ORDER BY p.fecha_pago ASC
        `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar pagos pendientes' });
  }
};

// 4. Aprobar pago (Admin)
exports.approvePayment = async (req, res) => {
  const { idPago } = req.params;
  const approverCedula = req.user?.cedula || null;
  try {
    // 1. Obtener la inscripción asociada
    const [pagos] = await pool.query('SELECT id_inscripcion FROM pago WHERE id_pago = ?', [idPago]);
    if (pagos.length === 0) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    const idInscripcion = pagos[0].id_inscripcion;

    // 2. Marcar el pago como aprobado
    await pool.query(
      'UPDATE pago SET aprobado = 1, aprobado_por = ?, fecha_aprobacion = NOW() WHERE id_pago = ?',
      [approverCedula, idPago]
    );

    // 3. Marcar la inscripción como 'pagado'
    await pool.query('UPDATE inscripcion SET estado = "pagado" WHERE id_inscripcion = ?', [idInscripcion]);

    res.json({ message: 'Pago aprobado y estado de inscripción actualizado a PAGADO' });

  } catch (error) {
    console.error('Error al aprobar pago:', error);
    res.status(500).json({ message: 'Error al aprobar el pago' });
  }
};