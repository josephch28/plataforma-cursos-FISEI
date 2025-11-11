// Backend/src/routes/cursos.routes.js - AGREGAR RUTA
const router = require('express').Router();
const ctrl = require('../controllers/cursos.controller');
const validate = require('../middlewares/validate');
const { createCurso } = require('../validators/cursos');
const auth = require('../middlewares/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth('admin'), validate(createCurso), ctrl.create);
router.put('/:id', auth('admin'), validate(createCurso), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);
router.put('/:id/activar', auth('admin'), ctrl.activate);  // ✅ NUEVO

module.exports = router;
