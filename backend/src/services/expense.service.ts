import prisma from '../config/prisma';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseFilters } from '../models/expense.schema';

export const expenseService = {
  // Get all expenses for a user with optional filters
  async getExpenses(userId: string, filters: ExpenseFilters) {
    const where: any = {
      userId,
      isArchived: filters.isArchived ?? false,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.accountType) {
      where.accountType = filters.accountType;
    }

    if (filters.paymentType) {
      where.paymentType = filters.paymentType;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return expenses;
  },

  // Get a single expense by ID
  async getExpenseById(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    return expense;
  },

  // Create a new expense
  async createExpense(userId: string, data: CreateExpenseInput) {
    const expense = await prisma.expense.create({
      data: {
        ...data,
        userId,
      },
    });

    return expense;
  },

  // Update an expense
  async updateExpense(userId: string, expenseId: string, data: UpdateExpenseInput) {
    // First check if expense belongs to user
    const existing = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    if (!existing) {
      return null;
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data,
    });

    return expense;
  },

  // Delete (archive) an expense
  async deleteExpense(userId: string, expenseId: string) {
    // First check if expense belongs to user
    const existing = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    if (!existing) {
      return null;
    }

    // Soft delete by archiving
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: { isArchived: true },
    });

    return expense;
  },

  // Get all unique categories for a user
  async getCategories(userId: string) {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    return expenses.map(e => e.category);
  },
};
