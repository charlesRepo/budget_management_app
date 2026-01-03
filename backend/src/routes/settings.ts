import express from 'express';
import { settingsController } from '../controllers/settings.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All settings routes require authentication
router.use(requireAuth);

// GET /api/settings - Get user settings
router.get('/', settingsController.getSettings);

// PUT /api/settings - Update user settings
router.put('/', settingsController.updateSettings);

export default router;
