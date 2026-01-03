import prisma from '../config/prisma';

// Helper function to get previous month in YYYY-MM format
function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1); // monthNum - 1 because Date months are 0-indexed
  date.setMonth(date.getMonth() - 1);

  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');

  return `${prevYear}-${prevMonth}`;
}

export interface CreateIncomeInput {
  personName: string;
  amount: number;
  month: string; // Format: YYYY-MM
  paymentPeriod: 'part1' | 'part2';
}

export interface UpdateIncomeInput {
  personName?: string;
  amount?: number;
  month?: string;
  paymentPeriod?: 'part1' | 'part2';
}

export const incomeService = {
  // Get all income records for a user, with inheritance from previous month
  async getIncome(userId: string, month?: string) {
    const where: any = { userId };

    if (month) {
      where.month = month;
    }

    const income = await prisma.income.findMany({
      where,
      orderBy: [{ month: 'desc' }, { personName: 'asc' }, { paymentPeriod: 'asc' }],
    });

    // If a specific month is requested and no records exist, fetch previous month
    if (month && income.length === 0) {
      const previousMonth = getPreviousMonth(month);
      const previousIncome = await prisma.income.findMany({
        where: {
          userId,
          month: previousMonth,
        },
        orderBy: [{ personName: 'asc' }, { paymentPeriod: 'asc' }],
      });

      // Mark these as inherited and update the month reference
      return previousIncome.map(record => ({
        ...record,
        isInherited: true,
        originalMonth: record.month,
        month: month, // Set to requested month for display
      }));
    }

    return income.map(record => ({ ...record, isInherited: false }));
  },

  // Get income by ID
  async getIncomeById(userId: string, incomeId: string) {
    const income = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId,
      },
    });

    return income;
  },

  // Create income record
  async createIncome(userId: string, data: CreateIncomeInput) {
    const income = await prisma.income.create({
      data: {
        ...data,
        userId,
      },
    });

    return income;
  },

  // Update income record
  async updateIncome(userId: string, incomeId: string, data: UpdateIncomeInput) {
    // Check if income belongs to user
    const existing = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId,
      },
    });

    if (!existing) {
      return null;
    }

    const income = await prisma.income.update({
      where: { id: incomeId },
      data,
    });

    return income;
  },

  // Delete income record
  async deleteIncome(userId: string, incomeId: string) {
    // Check if income belongs to user
    const existing = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId,
      },
    });

    if (!existing) {
      return null;
    }

    await prisma.income.delete({
      where: { id: incomeId },
    });

    return existing;
  },

  // Get income summary for a specific month
  async getMonthSummary(userId: string, month: string) {
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        month,
      },
    });

    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    return {
      month,
      incomes,
      total,
    };
  },

  // Apply inherited income records from previous month to current month
  async applyInheritedIncome(userId: string, month: string) {
    const previousMonth = getPreviousMonth(month);

    // Get previous month's income
    const previousIncome = await prisma.income.findMany({
      where: {
        userId,
        month: previousMonth,
      },
    });

    if (previousIncome.length === 0) {
      return [];
    }

    // Create new records for the current month
    const newIncomes = await Promise.all(
      previousIncome.map(record =>
        prisma.income.create({
          data: {
            userId,
            personName: record.personName,
            amount: record.amount,
            month: month,
            paymentPeriod: record.paymentPeriod,
          },
        })
      )
    );

    return newIncomes;
  },
};
