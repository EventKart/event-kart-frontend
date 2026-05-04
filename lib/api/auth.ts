import { userClient } from './axiosClient';
import type { Role, User } from '@/types';

export interface PhoneOtpRequest {
  phoneNumber: string;
  name?: string;
  role?: Role;
}

export interface PhoneOtpResponse {
  message?: string;
  devOtp?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleAuthRequest {
  idToken: string;
  role?: Role;
}

export async function requestPhoneOtp(req: PhoneOtpRequest): Promise<PhoneOtpResponse> {
  const { data } = await userClient.post<PhoneOtpResponse>('/auth/phone/request-otp', req);
  return data;
}

export async function verifyPhoneOtp(req: VerifyOtpRequest): Promise<AuthResponse> {
  const { data } = await userClient.post<AuthResponse>('/auth/phone/verify-otp', req);
  return data;
}

export async function googleAuth(req: GoogleAuthRequest): Promise<AuthResponse> {
  const { data } = await userClient.post<AuthResponse>('/auth/google', req);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await userClient.get<User>('/api/users/me');
  return data;
}

export async function logoutUser(authToken: string): Promise<void> {
  await userClient.post('/auth/logout', null, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
}
