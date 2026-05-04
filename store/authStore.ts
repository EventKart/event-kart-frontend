import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getCurrentUser } from '@/lib/api/auth';
import { isJwtExpired } from '@/lib/jwt';
import type { Role, User, Vendor } from '@/types';

const NATIVE_TOKEN_KEY = 'auth_token';
const WEB_TOKEN_KEY = 'ek_auth_token';

// expo-secure-store web module is a no-op stub — use localStorage on web instead.
async function persistToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (token) {
        localStorage.setItem(WEB_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(WEB_TOKEN_KEY);
      }
    } catch (e) {
      if (__DEV__) console.warn('[auth] localStorage persist failed', e);
    }
    return;
  }
  try {
    if (token) {
      await SecureStore.setItemAsync(NATIVE_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(NATIVE_TOKEN_KEY);
    }
  } catch (e) {
    if (__DEV__) console.warn('[auth] SecureStore persist failed', e);
  }
}

async function readPersistedToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(WEB_TOKEN_KEY);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(NATIVE_TOKEN_KEY);
  } catch {
    return null;
  }
}

interface AuthStore {
  hydrated: boolean;
  isAuthenticated: boolean;
  token: string | null;
  currentRole: Role | null;
  user: User | null;
  vendor: Vendor | null;
  pendingPhone: string | null;

  /** Restore auth state from SecureStore + fetch latest user from /me. */
  hydrate: () => Promise<void>;
  /** Re-fetch the current user via /me. Returns null on failure. */
  refreshUser: () => Promise<User | null>;

  setToken: (token: string | null) => void;
  setRole: (role: Role | null) => void;
  setUser: (user: User | null) => void;
  setVendor: (vendor: Vendor | null) => void;
  setPendingPhone: (phone: string | null) => void;
  signOut: () => void;
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
    const token = await readPersistedToken();

    // No token, or token expired locally — start fresh.
    if (!token || isJwtExpired(token)) {
      if (token) void persistToken(null);
      set({ hydrated: true, token: null, isAuthenticated: false });
      return;
    }

    // Valid-looking token. Set it now so the axios interceptor reads the
    // right value when we call /me.
    set({ token, isAuthenticated: true });

    try {
      const user = await getCurrentUser();
      if (__DEV__) console.log('[auth] hydrated user from /me', user.id);
      set({
        user,
        currentRole: get().currentRole ?? user.role,
      });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        // Server rejected the token — clear and force sign-in.
        if (__DEV__) console.log('[auth] token rejected by server, signing out');
        void persistToken(null);
        set({ token: null, isAuthenticated: false, user: null, currentRole: null });
      } else if (__DEV__) {
        // Network error etc. — keep the token, the UI can retry later.
        console.warn('[auth] hydrate /me failed (keeping token)', e?.message ?? e);
      }
    } finally {
      set({ hydrated: true });
    }
  },

  refreshUser: async () => {
    if (!get().token) return null;
    try {
      const user = await getCurrentUser();
      set({
        user,
        currentRole: get().currentRole ?? user.role,
      });
      return user;
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        get().signOut();
      }
      return null;
    }
  },

  // Synchronous state update + fire-and-forget persistence so callers never
  // get stuck awaiting SecureStore (which can hang on web in some browsers).
  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    void persistToken(token);
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

  signOut: () => {
    void persistToken(null);
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
