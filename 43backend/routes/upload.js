import express from 'express';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// All routes are public (no authentication required)

router.post('/image', uploadController.uploadImage);
router.post('/document', uploadController.uploadDocument);
router.delete('/:id', uploadController.deleteFile);

export default router;

