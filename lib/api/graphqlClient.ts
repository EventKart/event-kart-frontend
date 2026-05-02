import { GraphQLClient } from 'graphql-request';
import * as SecureStore from 'expo-secure-store';

import { SERVICE_URLS } from './base';

async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

function createGqlClient(url: string) {
  return new GraphQLClient(url, {
    requestMiddleware: async (req) => {
      const token = await readToken();
      const headers: Record<string, string> = { ...(req.headers as Record<string, string>) };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (__DEV__) console.log(`[gql] → ${url}`);
      return { ...req, headers };
    },
    responseMiddleware: (response) => {
      if (__DEV__) {
        if (response instanceof Error) {
          console.warn(`[gql] ✖ ${url}`, response.message);
        }
      }
    },
  });
}

export const userGql = createGqlClient(`${SERVICE_URLS.user}/graphql`);
export const vendorGql = createGqlClient(`${SERVICE_URLS.vendor}/graphql`);
export const invitationGql = createGqlClient(`${SERVICE_URLS.invitation}/graphql`);
