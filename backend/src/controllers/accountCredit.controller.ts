import { Request, Response } from 'express';
import { accountCreditService } from '../services/accountCredit.service';
import { z } from 'zod';

// Validation schemas
const createAccountCreditSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  accountType: z.enum(['checking', 'credit_card', 'line_of_credit', 'student_line_of_credit']),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

const updateAccountCreditSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  accountType: z.enum(['checking', 'credit_card', 'line_of_credit', 'student_line_of_credit']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const accountCreditController = {
  // GET /api/account-credits
  async getAccountCredits(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { month } = req.query;

      const credits = await accountCreditService.getAccountCredits(userId, month as string);

      res.json({ credits });
    } catch (error) {
      console.error('Get account credits error:', error);
      res.status(500).json({ error: 'Failed to fetch account credits' });
    }
  },

  // GET /api/account-credits/:id
  async getAccountCreditById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const credit = await accountCreditService.getAccountCreditById(userId, id);

      if (!credit) {
        return res.status(404).json({ error: 'Account credit not found' });
      }

      res.json({ credit });
    } catch (error) {
      console.error('Get account credit by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch account credit' });
    }
  },

  // POST /api/account-credits
  async createAccountCredit(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data = createAccountCreditSchema.parse(req.body);

      const credit = await accountCreditService.createAccountCredit(userId, data);

      res.status(201).json({ credit });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid account credit data', details: error.errors });
      }
      console.error('Create account credit error:', error);
      res.status(500).json({ error: 'Failed to create account credit' });
    }
  },

  // PUT /api/account-credits/:id
  async updateAccountCredit(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = updateAccountCreditSchema.parse(req.body);

      const credit = await accountCreditService.updateAccountCredit(userId, id, data);

      if (!credit) {
        return res.status(404).json({ error: 'Account credit not found' });
      }

      res.json({ credit });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid account credit data', details: error.errors });
      }
      console.error('Update account credit error:', error);
      res.status(500).json({ error: 'Failed to update account credit' });
    }
  },

  // DELETE /api/account-credits/:id
  async deleteAccountCredit(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const credit = await accountCreditService.deleteAccountCredit(userId, id);

      if (!credit) {
        return res.status(404).json({ error: 'Account credit not found' });
      }

      res.json({ message: 'Account credit deleted successfully', credit });
    } catch (error) {
      console.error('Delete account credit error:', error);
      res.status(500).json({ error: 'Failed to delete account credit' });
    }
  },
};
