import { Alert, Platform } from 'react-native';
import { SERVICE_URLS } from '@/lib/api/base';

export function describeError(e: any): string {
  if (e?.response) {
    const status = e.response.status;
    const data = e.response.data;
    const detail = typeof data === 'string' ? data : (data?.message ?? data?.error);
    return `Server returned ${status}${detail ? ` — ${detail}` : ''}.`;
  }
  if (e?.message?.includes('Network Error')) {
    return `Could not reach ${SERVICE_URLS.user}. Make sure the user-management service is running and reachable from this device.`;
  }
  if (e?.code === 'ECONNABORTED') {
    return 'Request timed out. Is the backend reachable from this device?';
  }
  return e?.message ?? 'Unknown error.';
}

export function showAlert(title: string, message: string, onConfirm?: () => void): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onConfirm?.();
    return;
  }
  Alert.alert(
    title,
    message,
    onConfirm ? [{ text: 'Continue', onPress: onConfirm }] : undefined,
  );
}
