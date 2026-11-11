import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All admin routes are protected by JWT and role check
router.use(authenticateToken);
router.use(authorizeAdmin);

// Dashboard Stats
router.get('/stats', adminController.getAdminStats);

// Applicants Management
router.get('/applicants', adminController.getAllApplicants);
router.get('/applicants/:id', adminController.getApplicantDetail);
router.put('/applicants/:id/status', adminController.updateApplicantStatus);

// Announcements Management
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.post('/announcements/upload', upload.single('image'), adminController.uploadAnnouncementImage);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Complaints Management
import * as complaintsController from '../controllers/complaintsController.js';
router.get('/complaints', complaintsController.getComplaints);
router.get('/complaints/:id', complaintsController.getComplaintDetail);
router.put('/complaints/:id/status', complaintsController.updateComplaintStatus);
router.delete('/complaints/:id', complaintsController.deleteComplaint);

export default router;
