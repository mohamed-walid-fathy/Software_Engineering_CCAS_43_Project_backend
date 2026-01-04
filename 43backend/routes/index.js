import express from 'express';
import authRoutes from './auth.js';
import campaignRoutes from './campaigns.js';
import donationRoutes from './donations.js';
import userRoutes from './users.js';
import adminRoutes from './admin.js';
import notificationRoutes from './notifications.js';
import uploadRoutes from './upload.js';
import charityRoutes from './charity.js';
import reportRoutes from './reports.js';

const router = express.Router();

// Route modules
router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/donations', donationRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/charity', charityRoutes);
router.use('/reports', reportRoutes);

export default router;



