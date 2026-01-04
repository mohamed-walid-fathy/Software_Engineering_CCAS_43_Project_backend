import express from 'express';
import * as campaignController from '../controllers/campaignController.js';

const router = express.Router();

// All routes are public (no authentication required)
router.get('/', campaignController.getCampaigns);
router.get('/featured', campaignController.getFeaturedCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/:id/pause', campaignController.pauseCampaign);
router.post('/:id/resume', campaignController.resumeCampaign);
router.get('/:id/analytics', campaignController.getCampaignAnalytics);
router.post('/:id/flag', campaignController.flagCampaign);
router.put('/:id/reapply', campaignController.reapplyCampaign);

export default router;

