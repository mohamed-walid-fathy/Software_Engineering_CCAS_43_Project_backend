import express from 'express';
import * as charityController from '../controllers/charityController.js';

const router = express.Router();

// Publicly accessible analytics for charities (can be scoped by ID)
router.get('/:id/stats', charityController.getCharityStats);
router.get('/:id/report', charityController.getMonthlyReport);
router.get('/:id/custom-report', charityController.getCustomReport);
router.put('/:id', charityController.updateCharityDetails);

export default router;
