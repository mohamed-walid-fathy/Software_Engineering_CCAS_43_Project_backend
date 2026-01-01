import express from 'express';
import * as donationController from '../controllers/donationController.js';

const router = express.Router();

// All routes are public (no authentication required)
router.post('/', donationController.createDonation);
router.get('/', donationController.getDonations);
router.get('/stats', donationController.getDonationStats);
router.get('/:id', donationController.getDonationById);
router.post('/:id/refund', donationController.refundDonation);
router.get('/receipt/:id', donationController.generateReceipt);
router.post('/webhook', donationController.handleStripeWebhook);

export default router;

