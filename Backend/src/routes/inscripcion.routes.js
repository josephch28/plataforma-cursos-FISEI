// src/routes/inscripcion.routes.js
const express = require('express');
const ctrl = require('../controllers/inscripcion.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { createInscripcion, updateInscripcion } = require('../validators/inscripciones');

const router = express.Router();

router.get('/', auth('admin'), ctrl.list);
router.get('/mis-cursos', auth(), ctrl.listByDocente);
router.post('/', auth(), validate(createInscripcion), ctrl.create);
router.put('/:id', auth(), validate(updateInscripcion), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);
router.post('/batch', auth(), ctrl.batchUpdate);
router.get('/:id', auth(), ctrl.getOne);

module.exports = router;