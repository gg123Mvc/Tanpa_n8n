import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

// Protected routes
router.post('/upload', authenticateToken, upload.single('file'), documentController.uploadDocument);
router.get('/list', authenticateToken, documentController.getUploadedDocuments);
router.delete('/:documentId', authenticateToken, documentController.deleteDocument);
router.post('/submit', authenticateToken, documentController.submitRegistration);
router.get('/status', authenticateToken, documentController.getRegistrationStatus);

export default router;
