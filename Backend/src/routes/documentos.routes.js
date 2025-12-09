// Backend/src/routes/documentos.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentos.controller');
const auth = require('../middlewares/auth');

// Upload document (General or Course Specific)
router.post('/upload', auth(), controller.uploadMiddleware, controller.uploadDocument);

// Get my documents
router.get('/mine', auth(), controller.getMyDocuments);

// Get pending documents (for Responsable/Admin)
router.get('/pending', auth(), controller.getPendingDocuments);

// Review document (Approve/Reject)
router.post('/review/:id', auth(), controller.reviewDocument);

module.exports = router;
