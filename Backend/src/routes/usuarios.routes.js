const express = require('express');
const ctrl = require('../controllers/usuarios.controller');
const router = express.Router();

router.get('/', ctrl.list);

module.exports = router;