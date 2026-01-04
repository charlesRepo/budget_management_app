import api from './api';
import type { MonthlyCalculation } from '../types';

export const calculationService = {
  // Get financial calculations for a specific month
  async getMonthCalculations(month: string): Promise<MonthlyCalculation> {
    const response = await api.get(`/calculations/${month}`);
    return response.data.calculations;
  },
};
