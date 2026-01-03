import { Request, Response } from 'express';
import { incomeService } from '../services/income.service';
import { z } from 'zod';

// Validation schemas
const createIncomeSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amount: z.number().positive('Amount must be positive'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  paymentPeriod: z.enum(['part1', 'part2'], { errorMap: () => ({ message: 'Payment period must be either part1 or part2' }) }),
});

const updateIncomeSchema = z.object({
  personName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  paymentPeriod: z.enum(['part1', 'part2']).optional(),
});

export const incomeController = {
  // GET /api/income
  async getIncome(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { month } = req.query;

      const income = await incomeService.getIncome(userId, month as string);

      res.json({ income });
    } catch (error) {
      console.error('Get income error:', error);
      res.status(500).json({ error: 'Failed to fetch income' });
    }
  },

  // GET /api/income/:id
  async getIncomeById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const income = await incomeService.getIncomeById(userId, id);

      if (!income) {
        return res.status(404).json({ error: 'Income record not found' });
      }

      res.json({ income });
    } catch (error) {
      console.error('Get income by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch income' });
    }
  },

  // POST /api/income
  async createIncome(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data = createIncomeSchema.parse(req.body);

      const income = await incomeService.createIncome(userId, data);

      res.status(201).json({ income });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid income data', details: error.errors });
      }
      console.error('Create income error:', error);
      res.status(500).json({ error: 'Failed to create income' });
    }
  },

  // PUT /api/income/:id
  async updateIncome(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = updateIncomeSchema.parse(req.body);

      const income = await incomeService.updateIncome(userId, id, data);

      if (!income) {
        return res.status(404).json({ error: 'Income record not found' });
      }

      res.json({ income });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid income data', details: error.errors });
      }
      console.error('Update income error:', error);
      res.status(500).json({ error: 'Failed to update income' });
    }
  },

  // DELETE /api/income/:id
  async deleteIncome(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const income = await incomeService.deleteIncome(userId, id);

      if (!income) {
        return res.status(404).json({ error: 'Income record not found' });
      }

      res.json({ message: 'Income deleted successfully', income });
    } catch (error) {
      console.error('Delete income error:', error);
      res.status(500).json({ error: 'Failed to delete income' });
    }
  },

  // GET /api/income/summary/:month
  async getMonthSummary(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { month } = req.params;

      const summary = await incomeService.getMonthSummary(userId, month);

      res.json(summary);
    } catch (error) {
      console.error('Get month summary error:', error);
      res.status(500).json({ error: 'Failed to fetch month summary' });
    }
  },

  // POST /api/income/apply-inherited
  async applyInheritedIncome(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { month } = req.body;

      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Valid month (YYYY-MM) is required' });
      }

      const incomes = await incomeService.applyInheritedIncome(userId, month);

      res.status(201).json({
        message: 'Inherited income applied successfully',
        income: incomes
      });
    } catch (error) {
      console.error('Apply inherited income error:', error);
      res.status(500).json({ error: 'Failed to apply inherited income' });
    }
  },
};
