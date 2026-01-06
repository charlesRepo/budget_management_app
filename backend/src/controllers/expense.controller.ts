import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseFiltersSchema,
} from '../models/expense.schema';
import { z } from 'zod';

export const expenseController = {
  // GET /api/expenses
  async getExpenses(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate query parameters
      const filters = expenseFiltersSchema.parse(req.query);

      const expenses = await expenseService.getExpenses(userId, filters);

      res.json({ expenses });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid filters', details: error.issues });
      }
      console.error('Get expenses error:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  },

  // GET /api/expenses/:id
  async getExpenseById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const expense = await expenseService.getExpenseById(userId, id);

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ expense });
    } catch (error) {
      console.error('Get expense by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch expense' });
    }
  },

  // POST /api/expenses
  async createExpense(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate request body
      const data = createExpenseSchema.parse(req.body);

      const expense = await expenseService.createExpense(userId, data);

      res.status(201).json({ expense });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid expense data', details: error.issues });
      }
      console.error('Create expense error:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  },

  // PUT /api/expenses/:id
  async updateExpense(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Validate request body
      const data = updateExpenseSchema.parse(req.body);

      const expense = await expenseService.updateExpense(userId, id, data);

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ expense });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid expense data', details: error.issues });
      }
      console.error('Update expense error:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  },

  // DELETE /api/expenses/:id
  async deleteExpense(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const expense = await expenseService.deleteExpense(userId, id);

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense archived successfully', expense });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  },

  // GET /api/expenses/categories
  async getCategories(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const categories = await expenseService.getCategories(userId);

      res.json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },
};
