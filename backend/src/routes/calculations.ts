import express from 'express';
import { calculationController } from '../controllers/calculation.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All calculation routes require authentication
router.use(requireAuth);

// GET /api/calculations/:month - Get financial calculations for a specific month
router.get('/:month', calculationController.getMonthCalculations);

export default router;
