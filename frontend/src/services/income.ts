import api from './api';
import type { Income, CreateIncomeInput, UpdateIncomeInput } from '../types';

export const incomeService = {
  // Get all income records with optional month filter
  async getIncome(month?: string): Promise<Income[]> {
    const params = month ? `?month=${month}` : '';
    const response = await api.get(`/income${params}`);
    return response.data.income;
  },

  // Get a single income record by ID
  async getIncomeById(id: string): Promise<Income> {
    const response = await api.get(`/income/${id}`);
    return response.data.income;
  },

  // Create a new income record
  async createIncome(data: CreateIncomeInput): Promise<Income> {
    const response = await api.post('/income', data);
    return response.data.income;
  },

  // Update an income record
  async updateIncome(id: string, data: UpdateIncomeInput): Promise<Income> {
    const response = await api.put(`/income/${id}`, data);
    return response.data.income;
  },

  // Delete an income record
  async deleteIncome(id: string): Promise<void> {
    await api.delete(`/income/${id}`);
  },

  // Get summary for a specific month
  async getMonthSummary(month: string): Promise<{
    month: string;
    incomes: Income[];
    total: number;
  }> {
    const response = await api.get(`/income/summary/${month}`);
    return response.data;
  },

  // Apply inherited income from previous month to current month
  async applyInheritedIncome(month: string): Promise<Income[]> {
    const response = await api.post('/income/apply-inherited', { month });
    return response.data.income;
  },
};
