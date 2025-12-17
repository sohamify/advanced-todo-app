import { create } from 'zustand';
import { authAPI } from '../services/api';
import type { LoginCredentials, RegisterCredentials } from '../types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('token', res.data.token);
    set({ token: res.data.token, isAuthenticated: true });
  },

  register: async (credentials) => {
    await authAPI.register(credentials);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },
}));