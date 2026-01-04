import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', reportController.generateReport);
router.get('/charity/:charity_id', reportController.getCharityReports);
router.get('/:id', reportController.getReportById);

export default router;
