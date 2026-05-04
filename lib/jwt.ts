// Lightweight JWT decoder. We never verify signatures on the client — that's
// the backend's job. We only read the payload to check `exp` and avoid making
// pointless requests with a stale token.

export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  role?: string;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json =
      typeof atob !== 'undefined'
        ? atob(padded)
        : (globalThis as any).Buffer?.from(padded, 'base64').toString('utf8') ?? '';
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns true if the token is missing `exp` or is past expiry (with optional skew). */
export function isJwtExpired(token: string | null | undefined, skewSeconds = 5): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return Date.now() / 1000 >= payload.exp - skewSeconds;
}
