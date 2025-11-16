const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/solicitudes.controller');

// GET /api/solicitudes/stats - Estadísticas
router.get('/stats', ctrl.stats);

// GET /api/solicitudes - Listar todas
router.get('/', ctrl.list);

// GET /api/solicitudes/:id - Obtener una
router.get('/:id', ctrl.get);

// POST /api/solicitudes - Crear
router.post('/', ctrl.create);

// PUT /api/solicitudes/:id - Actualizar
router.put('/:id', ctrl.update);

// DELETE /api/solicitudes/:id - Eliminar
router.delete('/:id', ctrl.delete);

module.exports = router;

