import { z } from 'zod';

// Enums for validation
export const AccountType = z.enum(['checking', 'credit_card']);
export const PaymentType = z.enum(['automatic', 'manual']);
export const Frequency = z.enum(['monthly', 'quarterly', 'yearly', 'custom']);

// Create expense schema
export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  accountType: AccountType,
  paymentType: PaymentType,
  frequency: Frequency,
  activeMonths: z.array(z.number().min(1).max(12)).min(1, 'At least one month must be selected'),
  notes: z.string().optional(),
});

// Update expense schema (all fields optional except what's being updated)
export const updateExpenseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  accountType: AccountType.optional(),
  paymentType: PaymentType.optional(),
  frequency: Frequency.optional(),
  activeMonths: z.array(z.number().min(1).max(12)).min(1).optional(),
  notes: z.string().optional(),
  isArchived: z.boolean().optional(),
});

// Query filters schema
export const expenseFiltersSchema = z.object({
  category: z.string().optional(),
  accountType: AccountType.optional(),
  paymentType: PaymentType.optional(),
  isArchived: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;
