import express from 'express';
import { expenseController } from '../controllers/expense.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All expense routes require authentication
router.use(requireAuth);

// GET /api/expenses/categories - Get all categories (must be before /:id)
router.get('/categories', expenseController.getCategories);

// GET /api/expenses - Get all expenses with optional filters
router.get('/', expenseController.getExpenses);

// GET /api/expenses/:id - Get single expense
router.get('/:id', expenseController.getExpenseById);

// POST /api/expenses - Create new expense
router.post('/', expenseController.createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', expenseController.updateExpense);

// DELETE /api/expenses/:id - Archive expense
router.delete('/:id', expenseController.deleteExpense);

export default router;
