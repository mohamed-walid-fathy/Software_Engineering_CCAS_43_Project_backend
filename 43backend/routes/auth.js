import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// Protected routes (require Bearer token in Authorization header)
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

export default router;
