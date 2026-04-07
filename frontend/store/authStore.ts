'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  clearError: () => void;
};

const normalizeError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setSession: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }

    set({ token, user, isAuthenticated: true, error: null });
  },
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    set({ token: null, user: null, isAuthenticated: false, error: null });
  },
  clearError: () => set({ error: null }),
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      set({
        token: data.accessToken,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: normalizeError(error, 'Unable to sign in. Please try again.') });
      return false;
    }
  },
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      set({
        token: data.accessToken,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: normalizeError(error, 'Unable to create account. Please try again.') });
      return false;
    }
  }
}));
