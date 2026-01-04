import prisma from '../config/prisma';

export interface CreateAccountCreditInput {
  description: string;
  amount: number;
  accountType: 'checking' | 'credit_card' | 'line_of_credit' | 'student_line_of_credit';
  month: string; // YYYY-MM
}

export interface UpdateAccountCreditInput {
  description?: string;
  amount?: number;
  accountType?: 'checking' | 'credit_card' | 'line_of_credit' | 'student_line_of_credit';
  month?: string;
}

export const accountCreditService = {
  // Get all account credits for a user (optionally filtered by month)
  async getAccountCredits(userId: string, month?: string) {
    const where: any = { userId };
    if (month) {
      where.month = month;
    }

    return await prisma.accountCredit.findMany({
      where,
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });
  },

  // Get a specific account credit
  async getAccountCreditById(userId: string, id: string) {
    return await prisma.accountCredit.findFirst({
      where: { id, userId },
    });
  },

  // Create a new account credit
  async createAccountCredit(userId: string, data: CreateAccountCreditInput) {
    return await prisma.accountCredit.create({
      data: {
        userId,
        description: data.description,
        amount: data.amount,
        accountType: data.accountType,
        month: data.month,
      },
    });
  },

  // Update an existing account credit
  async updateAccountCredit(userId: string, id: string, data: UpdateAccountCreditInput) {
    // Check if the credit belongs to the user
    const credit = await prisma.accountCredit.findFirst({
      where: { id, userId },
    });

    if (!credit) {
      return null;
    }

    return await prisma.accountCredit.update({
      where: { id },
      data,
    });
  },

  // Delete an account credit
  async deleteAccountCredit(userId: string, id: string) {
    // Check if the credit belongs to the user
    const credit = await prisma.accountCredit.findFirst({
      where: { id, userId },
    });

    if (!credit) {
      return null;
    }

    return await prisma.accountCredit.delete({
      where: { id },
    });
  },

  // Get total credits by account type for a specific month
  async getTotalCreditsByAccount(userId: string, month: string) {
    const credits = await prisma.accountCredit.findMany({
      where: { userId, month },
    });

    return {
      checking: credits
        .filter(c => c.accountType === 'checking')
        .reduce((sum, c) => sum + c.amount, 0),
      creditCard: credits
        .filter(c => c.accountType === 'credit_card')
        .reduce((sum, c) => sum + c.amount, 0),
      lineOfCredit: credits
        .filter(c => c.accountType === 'line_of_credit')
        .reduce((sum, c) => sum + c.amount, 0),
      studentLineOfCredit: credits
        .filter(c => c.accountType === 'student_line_of_credit')
        .reduce((sum, c) => sum + c.amount, 0),
    };
  },
};
