const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');

const router = Router();

// Esta ruta requiere autenticación
router.get('/general', auth(), ctrl.getGeneralStats);
router.get('/trends', auth(), ctrl.getTrends);
router.get('/distribution', auth(), ctrl.getDistribution);

module.exports = router;