// Backend/src/routes/usuarios.routes.js
const express = require('express');
const ctrl = require('../controllers/usuarios.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { createUsuario, updateUsuario } = require('../validators/usuarios'); // Asegúrate de crear este archivo

const router = express.Router();

// ⚠️ IMPORTANTE: Las rutas más específicas DEBEN ir primero para evitar conflictos con parámetros dinámicos
// Listar usuarios (Permitido para autocompletado en FormCurso, etc.)
router.get('/', ctrl.list);

// RUTA ESPECÍFICA: mis-cursos DEBE ir antes que /:cedula
router.get('/mis-cursos', auth(), ctrl.getUserCourses);

// Rutas de administración (requieren rol 'admin')
router.get('/:cedula', auth('admin'), ctrl.get);
router.post('/', auth('admin'), validate(createUsuario), ctrl.create);
router.put('/:cedula', auth('admin'), validate(updateUsuario), ctrl.update);
router.delete('/:cedula', auth('admin'), ctrl.remove);
router.put('/:cedula/activar', auth('admin'), ctrl.activate); // 🆕 NUEVO: Activación

module.exports = router;