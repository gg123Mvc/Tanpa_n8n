import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/data', authenticateToken, dashboardController.getDashboardData);
router.get('/announcements', dashboardController.getAnnouncements);
router.get('/announcements/:announcementId', dashboardController.getAnnouncementDetail);
router.put('/edit', authenticateToken, dashboardController.editRegistrationData);
router.get('/certificate', authenticateToken, dashboardController.downloadRegistrationCertificate);

export default router;
