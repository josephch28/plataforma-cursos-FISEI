// Backend/src/routes/auth.routes.js
const { Router } = require('express');
// 👇 CAMBIO IMPORTANTE: Usar require en lugar de import
const { login, register } = require('../controllers/auth.controller.js');

const router = Router();

router.post('/login', login);
router.post('/register', register);

module.exports = router;