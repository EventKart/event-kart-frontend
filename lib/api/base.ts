import { Platform } from 'react-native';

const host = Platform.select({ android: '10.0.2.2', default: 'localhost' });

export const SERVICE_URLS = {
  user: process.env.EXPO_PUBLIC_USER_API_URL ?? `http://${host}:8081`,
  vendor: process.env.EXPO_PUBLIC_VENDOR_API_URL ?? `http://${host}:8082`,
  media: process.env.EXPO_PUBLIC_MEDIA_API_URL ?? `http://${host}:8083`,
  invitation: process.env.EXPO_PUBLIC_INVITATION_API_URL ?? `http://${host}:8084`,
};
