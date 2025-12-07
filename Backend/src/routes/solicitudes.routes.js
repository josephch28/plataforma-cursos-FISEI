// src/routes/solicitudes.routes.js
const { Router } = require('express');
const { list, stats, get, create, update, remove } = require('../controllers/solicitudes.controller');

const router = Router();

router.get('/stats', stats);
router.get('/', list);
router.get('/:id', get);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Workflow routes
router.post('/:id/aprobar', require('../controllers/solicitudes.controller').aprobar);
router.post('/:id/rechazar', require('../controllers/solicitudes.controller').rechazar);
router.post('/:id/realizar', require('../controllers/solicitudes.controller').realizar);
router.post('/:id/verificar', require('../controllers/solicitudes.controller').verificar);

module.exports = router;
