import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function IndexRedirect() {
  const { isAuthenticated, currentRole, vendor } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  if (!currentRole) {
    return <Redirect href="/(auth)/role-select" />;
  }
  if (currentRole === 'VENDOR' && !vendor) {
    return <Redirect href="/(auth)/vendor-onboard/step-1-type" />;
  }
  if (currentRole === 'VENDOR') {
    return <Redirect href="/(vendor)/dashboard" />;
  }
  return <Redirect href="/(user)/search" />;
}
