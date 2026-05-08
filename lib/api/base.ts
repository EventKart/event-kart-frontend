import { Platform } from 'react-native';

// The host where your Proxy/Gateway is running
const host = Platform.select({
    android: '10.0.2.2',
    ios: '192.168.29.108',
    default: 'localhost' });

// The base URL of your API Gateway / Proxy
// In production, this would be something like 'https://api.eventkart.com'
const BASE_URL = process.env.API_URL ?? `http://${host}:8100`;

export const SERVICE_URLS = {
  user: `${BASE_URL}/user`,
  vendor: `${BASE_URL}/vendor`,
  media: `${BASE_URL}/media`,
  invitation: `${BASE_URL}/invitation`,
};
