// src/routes/encargados.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/encargados.controller');

router.get('/:id/encargados', ctrl.list);
router.post('/:id/encargados', auth('admin'), ctrl.add);
router.delete('/:id/encargados/:cedula', auth('admin'), ctrl.remove);

module.exports = router;
