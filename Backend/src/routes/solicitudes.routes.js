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

module.exports = router;
