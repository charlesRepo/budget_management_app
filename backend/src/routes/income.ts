import express from 'express';
import { incomeController } from '../controllers/income.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All income routes require authentication
router.use(requireAuth);

// GET /api/income/summary/:month - Get summary for specific month (must be before /:id)
router.get('/summary/:month', incomeController.getMonthSummary);

// POST /api/income/apply-inherited - Apply inherited income from previous month (must be before /:id)
router.post('/apply-inherited', incomeController.applyInheritedIncome);

// POST /api/income/apply-all-inherited - Apply both inherited income and credits from previous month
router.post('/apply-all-inherited', incomeController.applyAllInherited);

// GET /api/income - Get all income records
router.get('/', incomeController.getIncome);

// GET /api/income/:id - Get single income record
router.get('/:id', incomeController.getIncomeById);

// POST /api/income - Create new income record
router.post('/', incomeController.createIncome);

// PUT /api/income/:id - Update income record
router.put('/:id', incomeController.updateIncome);

// DELETE /api/income/:id - Delete income record
router.delete('/:id', incomeController.deleteIncome);

export default router;
