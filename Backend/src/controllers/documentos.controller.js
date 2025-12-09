const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // cecula-timestamp-filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, (req.user?.cedula || 'anon') + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.uploadMiddleware = upload.single('archivo');

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let { id_curso, tipo_documento, nombre_archivo } = req.body;
        const cedula = req.user.cedula;
        const ruta_archivo = '/uploads/documents/' + req.file.filename;

        // Sanitize id_curso
        if (id_curso === 'null' || id_curso === 'undefined' || id_curso === '') {
            id_curso = null;
        } else if (id_curso) {
            id_curso = parseInt(id_curso, 10);
            if (isNaN(id_curso)) id_curso = null;
        }

        // Check if document of this type already exists for this user (and course if specific)
        // If so, update it (re-submission), set status to 'pendiente'
        let queryCheck = 'SELECT id_documento FROM usuario_documento WHERE cedula_usuario = ? AND tipo_documento = ?';
        const paramsCheck = [cedula, tipo_documento];

        if (id_curso) {
            queryCheck += ' AND id_curso = ?';
            paramsCheck.push(id_curso);
        } else {
            queryCheck += ' AND id_curso IS NULL';
        }

        const [existing] = await pool.query(queryCheck, paramsCheck);

        if (existing.length > 0) {
            await pool.query(
                'UPDATE usuario_documento SET ruta_archivo = ?, nombre_archivo = ?, estado = "pendiente", observacion = NULL, fecha_subida = NOW() WHERE id_documento = ?',
                [ruta_archivo, nombre_archivo || req.file.originalname, existing[0].id_documento]
            );
        } else {
            await pool.query(
                'INSERT INTO usuario_documento (cedula_usuario, id_curso, tipo_documento, nombre_archivo, ruta_archivo, estado) VALUES (?, ?, ?, ?, ?, "pendiente")',
                [cedula, id_curso || null, tipo_documento, nombre_archivo || req.file.originalname, ruta_archivo]
            );
        }

        res.json({ message: 'Documento subido exitosamente', file: req.file.filename });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error al subir documento' });
    }
};

exports.getMyDocuments = async (req, res) => {
    try {
        const cedula = req.user.cedula;
        const [docs] = await pool.query(`
            SELECT d.*, c.nombre as nombre_curso 
            FROM usuario_documento d 
            LEFT JOIN curso c ON d.id_curso = c.id_curso 
            WHERE d.cedula_usuario = ?
            ORDER BY d.tipo_documento, d.fecha_subida DESC
        `, [cedula]);
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener documentos' });
    }
};

// For Responsables to review Pending Docs
exports.getPendingDocuments = async (req, res) => {
    try {
        const { cedula, rol } = req.user;
        let query = `
            SELECT d.*, u.nombre, u.apellido, c.nombre as curso_nombre 
            FROM usuario_documento d
            JOIN usuario u ON d.cedula_usuario = u.cedula
            LEFT JOIN curso c ON d.id_curso = c.id_curso
            WHERE d.estado = 'pendiente'
        `;

        const params = [];

        if (rol === 'responsable') {
            // Responsable only sees docs for their courses OR general docs?
            // "El rol de responsable deberá validar... tanto los generales de todos los usuarios como especificos de los cursos donde sea responsable"
            // Wait, "generales de todos los usuarios"? That might be huge. But usually admin does general.
            // User request: "responsable deberá validar... tanto los generales de todos los usuarios"
            // Okay, allow seeing NULL id_curso (General) AND id_curso IN (his courses).

            query += ` AND (d.id_curso IS NULL OR d.id_curso IN (SELECT id_curso FROM curso WHERE cedula_responsable = ?))`;
            params.push(cedula);
        }
        // Admin sees all?

        query += ` ORDER BY d.fecha_subida ASC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al listar documentos pendientes' });
    }
};

exports.reviewDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observacion } = req.body; // estado: 'aprobado' | 'rechazado'

        if (!['aprobado', 'rechazado'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        // 1. Update Document Status
        await pool.query(
            'UPDATE usuario_documento SET estado = ?, observacion = ? WHERE id_documento = ?',
            [estado, observacion || null, id]
        );

        // 2. CHECK ENROLLMENT LOGIC (Unlock pending enrollments)
        if (estado === 'aprobado') {
            // Get doc info to find related enrollment
            const [docs] = await pool.query('SELECT cedula_usuario, id_curso FROM usuario_documento WHERE id_documento = ?', [id]);
            const doc = docs[0];

            if (doc && doc.id_curso) {
                const cedula = doc.cedula_usuario;
                const idCurso = doc.id_curso;

                // Check if there is a PENDING enrollment for this user & course
                const [inscripciones] = await pool.query(
                    'SELECT id_inscripcion FROM inscripcion WHERE cedula_usuario = ? AND id_curso = ? AND estado = "pendiente"',
                    [cedula, idCurso]
                );

                if (inscripciones.length > 0) {
                    const inscripcion = inscripciones[0];

                    // CHECK IF ALL SPECIFIC REQUIREMENTS ARE NOW APPROVED
                    // Get mandatory specific reqs
                    const [reqs] = await pool.query('SELECT nombre_requisito FROM curso_requisito WHERE id_curso = ? AND obligatorio = 1 AND tipo = "ESPECIFICO"', [idCurso]);

                    // Get user's approved specific docs
                    const [userDocs] = await pool.query(
                        'SELECT tipo_documento FROM usuario_documento WHERE cedula_usuario = ? AND id_curso = ? AND estado = "aprobado"',
                        [cedula, idCurso]
                    );

                    // Normalize helper
                    const normalize = (str) => (str || '').toString().trim().toLowerCase().normalize("NFC");

                    // REQ_MAP (Needs to match Inscripcion Controller)
                    const REQ_MAP = {
                        'cédula de identidad': 'cedula',
                        'cedula de identidad': 'cedula',
                        'cedula': 'cedula',
                        'papeleta de votación': 'papeleta',
                        'papeleta de votacion': 'papeleta',
                        'papeleta': 'papeleta',
                        'carta de motivación': 'carta de motivacion',
                        'carta de motivacion': 'carta de motivacion',
                        'carnet estudiantil': 'carnet',
                        'carnet': 'carnet',
                        'título de tercer nivel': 'titulo',
                        'titulo de tercer nivel': 'titulo',
                        'titulo': 'titulo',
                        'título de bachiller/universitario': 'titulo',
                        'titulo de bachiller/universitario': 'titulo'
                    };

                    const allApproved = reqs.every(r => {
                        const reqName = normalize(r.nombre_requisito);
                        const targetType = REQ_MAP[reqName] || reqName;
                        return userDocs.some(ud => {
                            const docName = normalize(ud.tipo_documento);
                            return docName === reqName || docName === targetType;
                        });
                    });

                    if (allApproved) {
                        // UNLOCK FLOW
                        // Check if course is paid
                        const [cursos] = await pool.query('SELECT es_pagado, costo FROM curso WHERE id_curso = ?', [idCurso]);
                        const curso = cursos[0];

                        if (curso.es_pagado === 1) {
                            // Check if payment already exists
                            const [pagos] = await pool.query('SELECT id_pago FROM pago WHERE id_inscripcion = ?', [inscripcion.id_inscripcion]);

                            if (pagos.length === 0) {
                                // CREATE PAYMENT RECORD (Unlock Payment)
                                const monto = Number(curso.costo ?? 0);
                                const numeroOrden = `ORD-${inscripcion.id_inscripcion}-${Date.now()}`;
                                // Default method 'transferencia' if not known, user can change it later? Or we just create the order.

                                await pool.query(
                                    'INSERT INTO pago (id_inscripcion, monto, metodo_pago, numero_orden, aprobado) VALUES (?, ?, "transferencia", ?, 0)',
                                    [inscripcion.id_inscripcion, monto, numeroOrden]
                                );
                                console.log(`[Enrollment] Autogenerated Payment Order for Inscripcion ${inscripcion.id_inscripcion} after validation.`);
                            }
                        } else {
                            // Free course -> Approve immediately
                            await pool.query('UPDATE inscripcion SET estado = "pagado" WHERE id_inscripcion = ?', [inscripcion.id_inscripcion]);
                            console.log(`[Enrollment] Auto-approved Free Inscripcion ${inscripcion.id_inscripcion} after validation.`);
                        }
                    }
                }
            }
        }

        res.json({ message: `Documento marcado como ${estado}` });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: 'Error al revisar documento' });
    }
};
