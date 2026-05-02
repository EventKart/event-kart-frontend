import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { requestPhoneOtp } from '@/lib/api/auth';
import { SERVICE_URLS } from '@/lib/api/base';
import { useAuthStore } from '@/store/authStore';

function describeError(e: any): string {
  if (e?.response) {
    const status = e.response.status;
    const data = e.response.data;
    const detail = typeof data === 'string' ? data : data?.message ?? data?.error;
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

export default function SignInScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formattedNumber = phone.replace(/\D/g, '');

  const handleSendOtp = async () => {
    if (formattedNumber.length < 7) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${formattedNumber}`;
      const res = await requestPhoneOtp({ phoneNumber: fullNumber });
      setPendingPhone(fullNumber);
      router.push({
        pathname: '/(auth)/otp-verify',
        params: { devOtp: res.devOtp ?? '' },
      });
    } catch (e: any) {
      Alert.alert('Could not send OTP', describeError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert('Coming soon', 'Google sign-in will be enabled in the next build.');
  };

  return (
    <Screen scroll padded={false}>
      <View className="flex-1 px-6 pt-10 pb-6">
        <View className="h-2 w-12 rounded-full bg-tertiary-container mb-6" />
        <Text className="font-serif-bold text-h1 text-surface-on">Welcome to EventKart</Text>
        <Text className="font-sans text-body-md text-surface-on-variant mt-2">
          Plan unforgettable events or grow your services. Sign in with your phone to begin.
        </Text>

        <View className="mt-10 gap-2">
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
            Mobile Number
          </Text>
          <PhoneInput value={phone} onChangeText={setPhone} />
        </View>

        <View className="mt-6">
          <Button
            label="Send Verification Code"
            onPress={handleSendOtp}
            loading={loading}
            iconRight={<ArrowRight size={16} color="#ffffff" />}
          />
        </View>

        <Divider label="OR CONTINUE WITH" className="my-8" />

        <Pressable
          onPress={handleGoogle}
          className="flex-row items-center justify-center gap-3 h-12 rounded-lg border border-outline-variant bg-surface-container-lowest active:bg-surface-container-low"
        >
          <Image
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            style={{ width: 18, height: 18 }}
          />
          <Text className="font-sans-sb text-button text-surface-on">CONTINUE WITH GOOGLE</Text>
        </Pressable>

        <View className="mt-auto pt-10">
          <Text className="text-center font-sans text-body-sm text-surface-on-variant">
            By continuing you agree to EventKart's{' '}
            <Text className="text-tertiary-on-container font-sans-md">Terms</Text> and{' '}
            <Text className="text-tertiary-on-container font-sans-md">Privacy Policy</Text>.
          </Text>
          {__DEV__ ? (
            <Text className="text-center font-sans text-label-md text-surface-on-variant mt-3">
              API: {SERVICE_URLS.user}
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
