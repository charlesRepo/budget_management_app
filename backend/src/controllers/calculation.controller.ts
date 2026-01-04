import { Request, Response } from 'express';
import { calculationService } from '../services/calculation.service';

export const calculationController = {
  // GET /api/calculations/:month
  async getMonthCalculations(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { month } = req.params;

      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }

      const calculations = await calculationService.getMonthCalculations(userId, month);

      res.json({ calculations });
    } catch (error) {
      console.error('Get calculations error:', error);
      res.status(500).json({ error: 'Failed to fetch calculations' });
    }
  },
};
