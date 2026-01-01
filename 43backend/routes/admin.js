import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// All routes are public (no authentication required)

router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);
router.get('/flagged-campaigns', adminController.getFlaggedCampaigns);
router.post('/campaigns/:id/flag', adminController.flagCampaign);
router.post('/campaigns/:id/unflag', adminController.unflagCampaign);
router.post('/campaigns/:id/suspend', adminController.suspendCampaign);
router.get('/reports', adminController.getReports);
router.get('/analytics', adminController.getAnalytics);

export default router;

