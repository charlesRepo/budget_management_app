import api from './api';
import type { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilters } from '../types';

export const expenseService = {
  // Get all expenses with optional filters
  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.accountType) params.append('accountType', filters.accountType);
    if (filters?.paymentType) params.append('paymentType', filters.paymentType);
    if (filters?.isArchived !== undefined) params.append('isArchived', String(filters.isArchived));
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/expenses${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data.expenses;
  },

  // Get a single expense by ID
  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);
    return response.data.expense;
  },

  // Create a new expense
  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    const response = await api.post('/expenses', data);
    return response.data.expense;
  },

  // Update an expense
  async updateExpense(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data.expense;
  },

  // Delete (archive) an expense
  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/expenses/categories');
    return response.data.categories;
  },
};
