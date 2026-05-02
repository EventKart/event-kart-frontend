import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import type { Role, User, Vendor } from '@/types';

const TOKEN_KEY = 'auth_token';

interface AuthStore {
  hydrated: boolean;
  isAuthenticated: boolean;
  token: string | null;
  currentRole: Role | null;
  user: User | null;
  vendor: Vendor | null;
  pendingPhone: string | null;
  hydrate: () => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setRole: (role: Role | null) => void;
  setUser: (user: User | null) => void;
  setVendor: (vendor: Vendor | null) => void;
  setPendingPhone: (phone: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  hydrated: false,
  isAuthenticated: false,
  token: null,
  currentRole: null,
  user: null,
  vendor: null,
  pendingPhone: null,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      set({ token, isAuthenticated: !!token, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    set({ token, isAuthenticated: !!token });
  },

  setRole: (role) => set({ currentRole: role }),
  setUser: (user) => {
    set({ user });
    if (user?.role && !get().currentRole) {
      set({ currentRole: user.role });
    }
  },
  setVendor: (vendor) => set({ vendor }),
  setPendingPhone: (pendingPhone) => set({ pendingPhone }),

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({
      token: null,
      isAuthenticated: false,
      currentRole: null,
      user: null,
      vendor: null,
      pendingPhone: null,
    });
  },
}));
