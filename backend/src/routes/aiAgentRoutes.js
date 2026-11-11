import express from 'express';
import * as aiAgentController from '../controllers/aiAgentController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Routes (Optional Auth for public access)
router.post('/message', optionalAuthenticateToken, aiAgentController.sendMessageToAI);
router.get('/history', optionalAuthenticateToken, aiAgentController.getChatHistory);
router.delete('/history', optionalAuthenticateToken, aiAgentController.clearChatHistory);

// GPS-based distance calculation (no manual location input)
router.post('/calculate-distance', optionalAuthenticateToken, aiAgentController.calculateDistanceFromGPS);

export default router;

