import axios, { type AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SERVICE_URLS } from './base';

async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL, timeout: 10_000 });

  instance.interceptors.request.use(async (config) => {
    const token = await readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(
        `[api] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
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
      return Promise.reject(error);
    },
  );

  return instance;
}

export const userClient = createClient(SERVICE_URLS.user);
export const mediaClient = createClient(SERVICE_URLS.media);
