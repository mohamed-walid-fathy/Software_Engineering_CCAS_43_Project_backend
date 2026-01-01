import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// All routes are public (no authentication required)

router.get('/', notificationController.getNotifications);
router.post('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);
router.post('/preferences', notificationController.updatePreferences);

export default router;

