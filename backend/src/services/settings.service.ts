import prisma from '../config/prisma';

export interface UpdateSettingsInput {
  splitRatioPerson1?: number;
  splitRatioPerson2?: number;
  autoCalculateSplitRatio?: boolean;
  person1Name?: string;
  person2Name?: string;
  authorizedEmails?: string[];
  checkingBalance?: number;
  creditCardBalance?: number;
  lineOfCreditBalance?: number;
  studentLineOfCreditBalance?: number;
  travelSavings?: number;
  homeSavings?: number;
  generalSavings?: number;
}

export const settingsService = {
  // Get user settings (create default if doesn't exist)
  async getSettings(userId: string) {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    // If no settings exist, create default ones
    if (!settings) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      settings = await prisma.settings.create({
        data: {
          userId,
          splitRatioPerson1: 60,
          splitRatioPerson2: 40,
          person1Name: 'Person 1',
          person2Name: 'Person 2',
          authorizedEmails: user?.email ? [user.email] : [],
        },
      });
    }

    return settings;
  },

  // Update user settings
  async updateSettings(userId: string, data: UpdateSettingsInput) {
    // Validate split ratios
    if (data.splitRatioPerson1 !== undefined && data.splitRatioPerson2 !== undefined) {
      const total = data.splitRatioPerson1 + data.splitRatioPerson2;
      if (total !== 100) {
        throw new Error('Split ratios must sum to 100');
      }
    }

    // Get existing settings
    const existing = await this.getSettings(userId);

    // Update settings
    const settings = await prisma.settings.update({
      where: { userId },
      data,
    });

    return settings;
  },
};
