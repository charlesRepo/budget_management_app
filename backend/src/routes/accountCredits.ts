import express from 'express';
import { accountCreditController } from '../controllers/accountCredit.controller';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All account credit routes require authentication
router.use(requireAuth);

// GET /api/account-credits - Get all account credits (optionally filtered by month)
router.get('/', accountCreditController.getAccountCredits);

// GET /api/account-credits/:id - Get a specific account credit
router.get('/:id', accountCreditController.getAccountCreditById);

// POST /api/account-credits - Create a new account credit
router.post('/', accountCreditController.createAccountCredit);

// PUT /api/account-credits/:id - Update an account credit
router.put('/:id', accountCreditController.updateAccountCredit);

// DELETE /api/account-credits/:id - Delete an account credit
router.delete('/:id', accountCreditController.deleteAccountCredit);

export default router;
