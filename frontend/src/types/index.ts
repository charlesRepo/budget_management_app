export interface User {
  id: string;
  email: string;
  name: string | null;
}

export type AccountType = 'checking' | 'credit_card';
export type PaymentType = 'automatic' | 'manual';
export type Frequency = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface Expense {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  accountType: AccountType;
  paymentType: PaymentType;
  frequency: Frequency;
  activeMonths: number[];
  notes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  name: string;
  category: string;
  amount: number;
  accountType: AccountType;
  paymentType: PaymentType;
  frequency: Frequency;
  activeMonths: number[];
  notes?: string;
}

export interface UpdateExpenseInput {
  name?: string;
  category?: string;
  amount?: number;
  accountType?: AccountType;
  paymentType?: PaymentType;
  frequency?: Frequency;
  activeMonths?: number[];
  notes?: string;
  isArchived?: boolean;
}

export interface ExpenseFilters {
  category?: string;
  accountType?: AccountType;
  paymentType?: PaymentType;
  isArchived?: boolean;
  search?: string;
}
