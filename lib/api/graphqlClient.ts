import { SERVICE_URLS } from './base';
import { useAuthStore } from '@/store/authStore';

// Read the current auth token straight from the in-memory Zustand store.
// We avoid expo-secure-store here because its setItemAsync is fire-and-forget,
// so SecureStore can lag behind the in-memory state after sign-in.
function readToken(): string | null {
  return useAuthStore.getState().token;
}

export interface GraphQLClientError extends Error {
  response?: { errors?: any[]; status?: number; data?: any };
}

/**
 * Minimal GraphQL client over fetch. Built directly to avoid graphql-request
 * v7's header-merge behaviour, which was emitting duplicate Content-Type
 * values ("application/json, application/json") that Spring rejects.
 */
class GraphQLClient {
  constructor(private readonly url: string) {}

  async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const token = readToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    if (__DEV__) console.log(`[gql] → ${this.url}`, token ? 'with auth' : 'no auth', JSON.stringify(variables, null, 2));

    let response: Response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });
    } catch (e: any) {
      const err: GraphQLClientError = new Error(e?.message ?? 'Network Error');
      err.response = { status: 0 };
      if (__DEV__) console.warn(`[gql] ✖ ${this.url}`, err.message);
      throw err;
    }

    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // non-JSON body
    }

    if (!response.ok) {
      const err: GraphQLClientError = new Error(
        body?.message ?? body?.error ?? `HTTP ${response.status}`,
      );
      err.response = { status: response.status, data: body, errors: body?.errors };
      if (__DEV__) console.warn(`[gql] ✖ ${this.url} HTTP ${response.status}`, body);
      throw err;
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      const err: GraphQLClientError = new Error(body.errors[0]?.message ?? 'GraphQL error');
      err.response = { status: response.status, errors: body.errors, data: body.data };
      if (__DEV__) console.warn(`[gql] ✖ ${this.url}`, body.errors);
      throw err;
    }

    if (__DEV__) console.log(`[gql] ← ${this.url}`, body?.data);

    return body?.data as T;
  }
}

export const userGql = new GraphQLClient(`${SERVICE_URLS.user}/graphql`);
export const vendorGql = new GraphQLClient(`${SERVICE_URLS.vendor}/graphql`);
export const invitationGql = new GraphQLClient(`${SERVICE_URLS.invitation}/graphql`);
