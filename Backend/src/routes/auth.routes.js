// Backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');

// Ruta para que un usuario inicie sesión
router.post('/login', ctrl.login);

module.exports = router;