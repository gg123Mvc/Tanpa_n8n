import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import {
  getAllKnowledgeBase,
  getKnowledgeBaseById,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  toggleKnowledgeBaseStatus
} from '../controllers/knowledgeBaseController.js';

const router = express.Router();

// Semua route di bawah ini membutuhkan login dan role admin
router.use(authenticateToken, authorizeAdmin);

// CRUD Routes untuk Knowledge Base
router.get('/', getAllKnowledgeBase);
router.get('/:id', getKnowledgeBaseById);
router.post('/', createKnowledgeBase);
router.put('/:id', updateKnowledgeBase);
router.delete('/:id', deleteKnowledgeBase);
router.patch('/:id/status', toggleKnowledgeBaseStatus);

export default router;
