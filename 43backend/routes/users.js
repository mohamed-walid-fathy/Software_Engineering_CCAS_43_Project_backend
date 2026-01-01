import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes are public (no authentication required)
router.get('/donors', userController.getDonors);
router.get('/charities/pending', userController.getPendingCharities);
router.post('/charities/:id/approve', userController.approveCharity);
router.post('/charities/:id/reject', userController.rejectCharity);
router.get('/charities', userController.getCharities);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deactivateUser);
router.get('/:id/donations', userController.getUserDonations);
router.get('/:id/campaigns', userController.getUserCampaigns);

export default router;

