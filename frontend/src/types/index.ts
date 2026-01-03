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

// Income types
export type PaymentPeriod = 'part1' | 'part2';

export interface Income {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  month: string; // Format: YYYY-MM
  paymentPeriod: PaymentPeriod;
  createdAt: string;
  updatedAt: string;
  isInherited?: boolean; // True if inherited from previous month
  originalMonth?: string; // The month it was originally created in
}

export interface CreateIncomeInput {
  personName: string;
  amount: number;
  month: string; // Format: YYYY-MM
  paymentPeriod: PaymentPeriod;
}

export interface UpdateIncomeInput {
  personName?: string;
  amount?: number;
  month?: string;
  paymentPeriod?: PaymentPeriod;
}

// Settings types
export interface Settings {
  id: string;
  userId: string;
  splitRatioPerson1: number;
  splitRatioPerson2: number;
  person1Name: string;
  person2Name: string;
  authorizedEmails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  splitRatioPerson1?: number;
  splitRatioPerson2?: number;
  person1Name?: string;
  person2Name?: string;
  authorizedEmails?: string[];
}
