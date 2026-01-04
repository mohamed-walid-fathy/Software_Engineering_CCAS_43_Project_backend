import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// All routes are public (no authentication required)

router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);
router.get('/flagged-campaigns', adminController.getFlaggedCampaigns);
router.get('/pending-campaigns', adminController.getPendingCampaigns);
router.post('/campaigns/:id/approve', adminController.approveCampaign);
router.post('/campaigns/:id/reject', adminController.rejectCampaign);
router.put('/campaigns/:id/reapply', adminController.reapplyCampaign);
router.post('/campaigns/:id/flag', adminController.flagCampaign);
router.post('/campaigns/:id/unflag', adminController.unflagCampaign);
router.post('/campaigns/:id/suspend', adminController.suspendCampaign);
router.post('/charities/:id/reject', adminController.rejectCharity);
router.get('/reports', adminController.getReports);
router.get('/analytics', adminController.getAnalytics);

export default router;

