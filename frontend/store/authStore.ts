import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setSession: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }

    set({ token, user, isAuthenticated: true });
  },
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }

    set({ token: null, user: null, isAuthenticated: false });
  }
}));
