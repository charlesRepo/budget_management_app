import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { z } from 'zod';

// Validation schema
const updateSettingsSchema = z.object({
  splitRatioPerson1: z.number().min(0).max(100).optional(),
  splitRatioPerson2: z.number().min(0).max(100).optional(),
  autoCalculateSplitRatio: z.boolean().optional(),
  person1Name: z.string().min(1).optional(),
  person2Name: z.string().min(1).optional(),
  authorizedEmails: z.array(z.string().email()).optional(),
  checkingBalance: z.number().optional(),
  creditCardBalance: z.number().optional(),
  lineOfCreditBalance: z.number().optional(),
  studentLineOfCreditBalance: z.number().optional(),
  travelSavings: z.number().min(0).optional(),
  homeSavings: z.number().min(0).optional(),
  generalSavings: z.number().min(0).optional(),
  travelSavingsAssignedTo: z.enum(['person1', 'person2', 'shared']).optional(),
  homeSavingsAssignedTo: z.enum(['person1', 'person2', 'shared']).optional(),
  generalSavingsAssignedTo: z.enum(['person1', 'person2', 'shared']).optional(),
}).refine(
  (data) => {
    // If both ratios are provided, they must sum to 100
    if (data.splitRatioPerson1 !== undefined && data.splitRatioPerson2 !== undefined) {
      return data.splitRatioPerson1 + data.splitRatioPerson2 === 100;
    }
    return true;
  },
  {
    message: 'Split ratios must sum to 100',
    path: ['splitRatioPerson1'],
  }
);

export const settingsController = {
  // GET /api/settings
  async getSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const settings = await settingsService.getSettings(userId);

      res.json({ settings });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  },

  // PUT /api/settings
  async updateSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data = updateSettingsSchema.parse(req.body);

      const settings = await settingsService.updateSettings(userId, data);

      res.json({ settings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid settings data', details: error.issues });
      }
      if (error instanceof Error && error.message === 'Split ratios must sum to 100') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  },
};
