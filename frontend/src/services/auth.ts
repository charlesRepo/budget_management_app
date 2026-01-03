import api from './api';
import type { User } from '../types';

export type { User };

export const authService = {
  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Initiate Google OAuth login
  loginWithGoogle: () => {
    window.location.href = '/api/auth/google';
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the request fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  // Store auth token
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
