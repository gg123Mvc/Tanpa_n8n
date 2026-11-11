import express from 'express';
import * as formController from '../controllers/formController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/personal-data', authenticateToken, formController.savePersonalData);
router.get('/personal-data', authenticateToken, formController.getPersonalData);

router.post('/parent-data', authenticateToken, formController.saveParentData);
router.get('/parent-data', authenticateToken, formController.getParentData);

router.post('/school-data', authenticateToken, formController.saveSchoolData);
router.get('/school-data', authenticateToken, formController.getSchoolData);

router.get('/all-data', authenticateToken, formController.getAllRegistrationData);

export default router;
