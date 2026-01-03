import api from './api';
import type { Settings, UpdateSettingsInput } from '../types';

export const settingsService = {
  // Get user settings
  async getSettings(): Promise<Settings> {
    const response = await api.get('/settings');
    return response.data.settings;
  },

  // Update user settings
  async updateSettings(data: UpdateSettingsInput): Promise<Settings> {
    const response = await api.put('/settings', data);
    return response.data.settings;
  },
};
