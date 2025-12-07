const router = require('express').Router();
const ctrl = require('../controllers/certificados.controller');

// Ruta pública para descargar/verificar certificado por código
router.get('/:codigo', ctrl.download);

module.exports = router;
