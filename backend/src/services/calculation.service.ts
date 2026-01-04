import prisma from '../config/prisma';
import type { Expense, Income, Settings } from '@prisma/client';

interface PersonContribution {
  part1: number;
  part2: number;
  total: number;
}

interface AccountCalculation {
  totalExpenses: number;
  person1Share: PersonContribution;
  person2Share: PersonContribution;
  automaticPayments: number;
  manualPayments: number;
  currentBalance: number;
  balanceAfterExpenses: number;
}

interface PersonCalculation {
  totalIncome: number;
  incomePart1: number;
  incomePart2: number;
  totalContribution: number;
  contributionPart1: number;
  contributionPart2: number;
  remaining: number;
  remainingAfterPart1: number;
  remainingAfterPart2: number;
}

interface MonthlyCalculation {
  month: string;
  checking: AccountCalculation;
  creditCard: AccountCalculation;
  lineOfCredit: AccountCalculation;
  studentLineOfCredit: AccountCalculation;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  person1: PersonCalculation;
  person2: PersonCalculation;
}

type AccountType = 'checking' | 'credit_card' | 'line_of_credit' | 'student_line_of_credit';

export const calculationService = {
  /**
   * Calculate prorated monthly amount for an expense based on frequency and active months
   */
  calculateProratedAmount(expense: Expense, month: number): number {
    const { amount, frequency, activeMonths } = expense;

    // Check if expense is active this month
    if (!activeMonths.includes(month)) {
      return 0;
    }

    switch (frequency) {
      case 'monthly':
        // Monthly expenses: full amount every month
        return amount;

      case 'yearly':
        // Yearly expenses: divide by 12, only in active month(s)
        return amount / 12;

      case 'quarterly':
        // Quarterly expenses: divide by 3
        // Amount should be spread across the months it's active
        return amount / 3;

      case 'custom':
        // Custom: divide by number of active months
        return amount / activeMonths.length;

      default:
        return amount;
    }
  },

  /**
   * Calculate total expenses for a specific account and month
   */
  calculateAccountTotal(
    expenses: Expense[],
    accountType: AccountType,
    month: number
  ): { total: number; automatic: number; manual: number } {
    let total = 0;
    let automatic = 0;
    let manual = 0;

    for (const expense of expenses) {
      if (expense.accountType !== accountType || expense.isArchived) {
        continue;
      }

      const proratedAmount = this.calculateProratedAmount(expense, month);

      total += proratedAmount;

      if (expense.paymentType === 'automatic') {
        automatic += proratedAmount;
      } else {
        manual += proratedAmount;
      }
    }

    return { total, automatic, manual };
  },

  /**
   * Calculate contribution split for one account based on settings and income
   */
  calculateAccountContributions(
    totalAmount: number,
    settings: Settings,
    person1IncomePart1: number,
    person1IncomePart2: number,
    person2IncomePart1: number,
    person2IncomePart2: number
  ): {
    person1: PersonContribution;
    person2: PersonContribution;
  } {
    // Calculate each person's total contribution to this account
    const person1Total = (totalAmount * settings.splitRatioPerson1) / 100;
    const person2Total = (totalAmount * settings.splitRatioPerson2) / 100;

    // Calculate total income for each person
    const person1TotalIncome = person1IncomePart1 + person1IncomePart2;
    const person2TotalIncome = person2IncomePart1 + person2IncomePart2;

    // Calculate Part 1 and Part 2 contributions based on income proportions
    // Person 1
    const person1Part1Ratio = person1TotalIncome > 0 ? person1IncomePart1 / person1TotalIncome : 0.5;
    const person1Part2Ratio = person1TotalIncome > 0 ? person1IncomePart2 / person1TotalIncome : 0.5;

    const person1Part1 = person1Total * person1Part1Ratio;
    const person1Part2 = person1Total * person1Part2Ratio;

    // Person 2
    const person2Part1Ratio = person2TotalIncome > 0 ? person2IncomePart1 / person2TotalIncome : 0.5;
    const person2Part2Ratio = person2TotalIncome > 0 ? person2IncomePart2 / person2TotalIncome : 0.5;

    const person2Part1 = person2Total * person2Part1Ratio;
    const person2Part2 = person2Total * person2Part2Ratio;

    return {
      person1: { part1: person1Part1, part2: person1Part2, total: person1Total },
      person2: { part1: person2Part1, part2: person2Part2, total: person2Total },
    };
  },

  /**
   * Get comprehensive financial calculations for a specific month
   */
  async getMonthCalculations(userId: string, monthStr: string): Promise<MonthlyCalculation> {
    // Parse month string (YYYY-MM) to get month number (1-12)
    const [year, monthNum] = monthStr.split('-').map(Number);

    // Fetch all required data
    const [expenses, incomes, settings] = await Promise.all([
      prisma.expense.findMany({
        where: { userId, isArchived: false },
      }),
      prisma.income.findMany({
        where: { userId, month: monthStr },
      }),
      prisma.settings.findUnique({
        where: { userId },
      }),
    ]);

    // Use default settings if none exist
    const effectiveSettings = settings || {
      id: '',
      userId,
      splitRatioPerson1: 50,
      splitRatioPerson2: 50,
      person1Name: 'Person 1',
      person2Name: 'Person 2',
      authorizedEmails: [],
      checkingBalance: 0,
      creditCardBalance: 0,
      lineOfCreditBalance: 0,
      studentLineOfCreditBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate income by person and payment period
    let person1IncomePart1 = 0;
    let person1IncomePart2 = 0;
    let person2IncomePart1 = 0;
    let person2IncomePart2 = 0;

    for (const income of incomes) {
      if (income.personName === effectiveSettings.person1Name) {
        if (income.paymentPeriod === 'part1') {
          person1IncomePart1 += income.amount;
        } else {
          person1IncomePart2 += income.amount;
        }
      } else if (income.personName === effectiveSettings.person2Name) {
        if (income.paymentPeriod === 'part1') {
          person2IncomePart1 += income.amount;
        } else {
          person2IncomePart2 += income.amount;
        }
      }
    }

    // Calculate account totals for all 4 accounts
    const checkingTotals = this.calculateAccountTotal(expenses, 'checking', monthNum);
    const creditCardTotals = this.calculateAccountTotal(expenses, 'credit_card', monthNum);
    const lineOfCreditTotals = this.calculateAccountTotal(expenses, 'line_of_credit', monthNum);
    const studentLineOfCreditTotals = this.calculateAccountTotal(expenses, 'student_line_of_credit', monthNum);

    // Calculate contributions for each account
    const checkingContributions = this.calculateAccountContributions(
      checkingTotals.total,
      effectiveSettings,
      person1IncomePart1,
      person1IncomePart2,
      person2IncomePart1,
      person2IncomePart2
    );

    const creditCardContributions = this.calculateAccountContributions(
      creditCardTotals.total,
      effectiveSettings,
      person1IncomePart1,
      person1IncomePart2,
      person2IncomePart1,
      person2IncomePart2
    );

    const lineOfCreditContributions = this.calculateAccountContributions(
      lineOfCreditTotals.total,
      effectiveSettings,
      person1IncomePart1,
      person1IncomePart2,
      person2IncomePart1,
      person2IncomePart2
    );

    const studentLineOfCreditContributions = this.calculateAccountContributions(
      studentLineOfCreditTotals.total,
      effectiveSettings,
      person1IncomePart1,
      person1IncomePart2,
      person2IncomePart1,
      person2IncomePart2
    );

    // Calculate total income
    const totalIncome = person1IncomePart1 + person1IncomePart2 + person2IncomePart1 + person2IncomePart2;

    // Calculate total expenses
    const totalExpenses =
      checkingTotals.total +
      creditCardTotals.total +
      lineOfCreditTotals.total +
      studentLineOfCreditTotals.total;

    // Calculate balance
    const balance = totalIncome - totalExpenses;

    // Calculate person totals
    const person1TotalIncome = person1IncomePart1 + person1IncomePart2;
    const person2TotalIncome = person2IncomePart1 + person2IncomePart2;

    const person1TotalContribution =
      checkingContributions.person1.total +
      creditCardContributions.person1.total +
      lineOfCreditContributions.person1.total +
      studentLineOfCreditContributions.person1.total;

    const person2TotalContribution =
      checkingContributions.person2.total +
      creditCardContributions.person2.total +
      lineOfCreditContributions.person2.total +
      studentLineOfCreditContributions.person2.total;

    const person1ContributionPart1 =
      checkingContributions.person1.part1 +
      creditCardContributions.person1.part1 +
      lineOfCreditContributions.person1.part1 +
      studentLineOfCreditContributions.person1.part1;

    const person1ContributionPart2 =
      checkingContributions.person1.part2 +
      creditCardContributions.person1.part2 +
      lineOfCreditContributions.person1.part2 +
      studentLineOfCreditContributions.person1.part2;

    const person2ContributionPart1 =
      checkingContributions.person2.part1 +
      creditCardContributions.person2.part1 +
      lineOfCreditContributions.person2.part1 +
      studentLineOfCreditContributions.person2.part1;

    const person2ContributionPart2 =
      checkingContributions.person2.part2 +
      creditCardContributions.person2.part2 +
      lineOfCreditContributions.person2.part2 +
      studentLineOfCreditContributions.person2.part2;

    // Calculate remaining amounts
    const person1Remaining = person1TotalIncome - person1TotalContribution;
    const person1RemainingAfterPart1 = person1IncomePart1 - person1ContributionPart1;
    const person1RemainingAfterPart2 = person1IncomePart2 - person1ContributionPart2;

    const person2Remaining = person2TotalIncome - person2TotalContribution;
    const person2RemainingAfterPart1 = person2IncomePart1 - person2ContributionPart1;
    const person2RemainingAfterPart2 = person2IncomePart2 - person2ContributionPart2;

    return {
      month: monthStr,
      checking: {
        totalExpenses: checkingTotals.total,
        person1Share: checkingContributions.person1,
        person2Share: checkingContributions.person2,
        automaticPayments: checkingTotals.automatic,
        manualPayments: checkingTotals.manual,
        currentBalance: effectiveSettings.checkingBalance,
        balanceAfterExpenses: effectiveSettings.checkingBalance - checkingTotals.total,
      },
      creditCard: {
        totalExpenses: creditCardTotals.total,
        person1Share: creditCardContributions.person1,
        person2Share: creditCardContributions.person2,
        automaticPayments: creditCardTotals.automatic,
        manualPayments: creditCardTotals.manual,
        currentBalance: effectiveSettings.creditCardBalance,
        balanceAfterExpenses: effectiveSettings.creditCardBalance - creditCardTotals.total,
      },
      lineOfCredit: {
        totalExpenses: lineOfCreditTotals.total,
        person1Share: lineOfCreditContributions.person1,
        person2Share: lineOfCreditContributions.person2,
        automaticPayments: lineOfCreditTotals.automatic,
        manualPayments: lineOfCreditTotals.manual,
        currentBalance: effectiveSettings.lineOfCreditBalance,
        balanceAfterExpenses: effectiveSettings.lineOfCreditBalance - lineOfCreditTotals.total,
      },
      studentLineOfCredit: {
        totalExpenses: studentLineOfCreditTotals.total,
        person1Share: studentLineOfCreditContributions.person1,
        person2Share: studentLineOfCreditContributions.person2,
        automaticPayments: studentLineOfCreditTotals.automatic,
        manualPayments: studentLineOfCreditTotals.manual,
        currentBalance: effectiveSettings.studentLineOfCreditBalance,
        balanceAfterExpenses: effectiveSettings.studentLineOfCreditBalance - studentLineOfCreditTotals.total,
      },
      totalIncome,
      totalExpenses,
      balance,
      person1: {
        totalIncome: person1TotalIncome,
        incomePart1: person1IncomePart1,
        incomePart2: person1IncomePart2,
        totalContribution: person1TotalContribution,
        contributionPart1: person1ContributionPart1,
        contributionPart2: person1ContributionPart2,
        remaining: person1Remaining,
        remainingAfterPart1: person1RemainingAfterPart1,
        remainingAfterPart2: person1RemainingAfterPart2,
      },
      person2: {
        totalIncome: person2TotalIncome,
        incomePart1: person2IncomePart1,
        incomePart2: person2IncomePart2,
        totalContribution: person2TotalContribution,
        contributionPart1: person2ContributionPart1,
        contributionPart2: person2ContributionPart2,
        remaining: person2Remaining,
        remainingAfterPart1: person2RemainingAfterPart1,
        remainingAfterPart2: person2RemainingAfterPart2,
      },
    };
  },
};
