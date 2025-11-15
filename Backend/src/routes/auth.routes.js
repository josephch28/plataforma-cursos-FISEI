// Backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');

// Ruta para que un usuario inicie sesión
router.post('/login', ctrl.login);

// Ruta para que un nuevo usuario se registre (opcional, pero recomendado)
router.post('/register', ctrl.register);

module.exports = router;