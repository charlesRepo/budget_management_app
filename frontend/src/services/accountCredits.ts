import api from './api';
import type { AccountCredit, CreateAccountCreditInput, UpdateAccountCreditInput } from '../types';

interface GetAccountCreditsResponse {
  credits: AccountCredit[];
}

interface GetAccountCreditResponse {
  credit: AccountCredit;
}

interface CreateAccountCreditResponse {
  credit: AccountCredit;
}

interface UpdateAccountCreditResponse {
  credit: AccountCredit;
}

interface DeleteAccountCreditResponse {
  message: string;
  credit: AccountCredit;
}

export const accountCreditService = {
  // Get all account credits (optionally filtered by month)
  async getAccountCredits(month?: string): Promise<AccountCredit[]> {
    const params = month ? { month } : {};
    const response = await api.get<GetAccountCreditsResponse>('/account-credits', { params });
    return response.data.credits;
  },

  // Get a specific account credit by ID
  async getAccountCreditById(id: string): Promise<AccountCredit> {
    const response = await api.get<GetAccountCreditResponse>(`/account-credits/${id}`);
    return response.data.credit;
  },

  // Create a new account credit
  async createAccountCredit(data: CreateAccountCreditInput): Promise<AccountCredit> {
    const response = await api.post<CreateAccountCreditResponse>('/account-credits', data);
    return response.data.credit;
  },

  // Update an existing account credit
  async updateAccountCredit(id: string, data: UpdateAccountCreditInput): Promise<AccountCredit> {
    const response = await api.put<UpdateAccountCreditResponse>(`/account-credits/${id}`, data);
    return response.data.credit;
  },

  // Delete an account credit
  async deleteAccountCredit(id: string): Promise<AccountCredit> {
    const response = await api.delete<DeleteAccountCreditResponse>(`/account-credits/${id}`);
    return response.data.credit;
  },
};
