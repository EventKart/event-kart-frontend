import axios, { type AxiosInstance } from 'axios';
import { Platform } from 'react-native';

import { SERVICE_URLS } from './base';
import { useAuthStore } from '@/store/authStore';

// Read directly from in-memory Zustand state (always up-to-date) — see
// graphqlClient.ts for the rationale.
function readToken(): string | null {
  return useAuthStore.getState().token;
}

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL, timeout: 10_000 });

  instance.interceptors.request.use((config) => {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(
        `[api] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        token ? 'with auth' : 'no auth',
      );
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(`[api] ← ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (__DEV__) {
        const status = error.response?.status ?? 'NETWORK';
        const url = error.config?.url ?? '?';
        const data = error.response?.data;
        console.warn(
          `[api] ✖ ${status} ${url}`,
          data ?? error.message,
          Platform.OS === 'web' ? '' : `(baseURL=${error.config?.baseURL})`,
        );
      }
      // Token expired or rejected — drop it so the user is sent back to sign-in.
      // Skip during the initial /me hydrate call; that flow handles 401 itself.
      const status = error.response?.status;
      const url: string = error.config?.url ?? '';
      if ((status === 401 || status === 403) && !url.includes('/api/users/me') && !url.includes('/auth/logout')) {
        useAuthStore.getState().signOut();
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const userClient = createClient(SERVICE_URLS.user);
export const mediaClient = createClient(SERVICE_URLS.media);
