// Backend/src/routes/pagos.routes.js
const { Router } = require('express');
const ctrl = require('../controllers/pagos.controller');
const auth = require('../middlewares/auth');

const router = Router();

// 1. Ruta para subir el comprobante (Usuario autenticado)
router.post('/upload/:idInscripcion', auth(), ctrl.uploadComprobante);

// 2. Obtener orden de pago por inscripción
router.get('/orden/:idInscripcion', auth(), ctrl.getOrdenByInscripcion);

// 3. Ruta para listar pagos pendientes (Admin y Responsable)
router.get('/', auth(['admin', 'responsable']), ctrl.listPending);

// 4. Ruta para aprobar un pago (Admin y Responsable)
router.put('/:idPago/aprobar', auth(['admin', 'responsable']), ctrl.approvePayment);

module.exports = router;