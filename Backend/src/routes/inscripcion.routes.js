// src/routes/inscripcion.routes.js
const express = require('express');
const ctrl = require('../controllers/inscripcion.controller');
const validate = require('../middlewares/validate');
const { createEvaluacion } = require('../validators/evaluaciones');
const router = express.Router();

router.get('/', ctrl.list);
router.post('/', validate(createEvaluacion), ctrl.create);
router.put('/:id', validate(createEvaluacion), ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id', ctrl.getOne);

module.exports = router;