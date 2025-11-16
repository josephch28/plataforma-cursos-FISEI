const express = require('express');
const router = express.Router();
const certificadoController = require('../controllers/certificadoController');
const reporteController = require('../controllers/reporteController');

router.get('/certificado/:cursoId/:estudianteId', certificadoController.generarCertificado.bind(certificadoController));
router.get('/curso/:cursoId', reporteController.reportePorCurso.bind(reporteController));

module.exports = router;

