import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/authStore';
import { isProfileComplete } from '@/types';

// This renders only after _layout.tsx has confirmed fonts + token hydration are
// ready, so all store values are final — no async redirect races.
export default function IndexRedirect() {
  const { isAuthenticated, currentRole, vendor, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  if (!isProfileComplete(user)) {
    return <Redirect href="/complete-profile" />;
  }
  if (currentRole === 'VENDOR' && !vendor) {
    return <Redirect href="/(auth)/vendor-onboard/step-1-type" />;
  }
  if (currentRole === 'VENDOR') {
    return <Redirect href="/(vendor)/dashboard" />;
  }
  return <Redirect href="/(user)/search" />;
}
