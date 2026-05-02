import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/auth/OTPInput';
import { requestPhoneOtp, verifyPhoneOtp } from '@/lib/api/auth';
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
    return `Could not reach ${SERVICE_URLS.user}. Check that the user-management service is running and reachable from this device.`;
  }
  return e?.message ?? 'Unknown error.';
}

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ devOtp?: string }>();
  const phone = useAuthStore((s) => s.pendingPhone);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [otp, setOtp] = useState(params.devOtp ?? '');
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // If the user reloads or deep-links here without a pending phone, send them back.
  useEffect(() => {
    if (!phone) router.replace('/(auth)/sign-in');
  }, [phone, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleVerify = async () => {
    if (!phone) return;
    if (otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPhoneOtp({ phoneNumber: phone, otp });
      await setToken(res.token);
      if (res.user) setUser(res.user);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Could not verify', describeError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    try {
      const res = await requestPhoneOtp({ phoneNumber: phone });
      if (res.devOtp) setOtp(res.devOtp);
      setSeconds(60);
    } catch (e: any) {
      Alert.alert('Could not resend', describeError(e));
    } finally {
      setResending(false);
    }
  };

  const masked = phone && phone.length > 4 ? `${phone.slice(0, 3)} ••• ${phone.slice(-3)}` : '';

  return (
    <Screen scroll padded={false}>
      <View className="flex-1 px-6 pt-6 pb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-low mb-6"
        >
          <ArrowLeft size={20} color="#1b1b1d" />
        </Pressable>

        <Text className="font-serif-bold text-h1 text-surface-on">Verify Phone</Text>
        <Text className="font-sans text-body-md text-surface-on-variant mt-2">
          Enter the 6-digit code sent to {masked}.
        </Text>

        <View className="mt-10">
          <OTPInput value={otp} onChange={setOtp} />
        </View>

        <View className="mt-8">
          <Button label="Verify & Continue" onPress={handleVerify} loading={loading} />
        </View>

        <View className="flex-row justify-center mt-6">
          {seconds > 0 ? (
            <Text className="font-sans text-body-sm text-surface-on-variant">
              Resend in 00:{seconds.toString().padStart(2, '0')}
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending}>
              <Text className="font-sans-sb text-body-sm text-tertiary-on-container">
                {resending ? 'Resending…' : 'Resend Code'}
              </Text>
            </Pressable>
          )}
        </View>

        {params.devOtp ? (
          <View className="mt-6 bg-tertiary-fixed rounded-lg p-3">
            <Text className="text-center font-sans-sb text-label-md uppercase tracking-wider text-tertiary-on-container">
              Dev mode
            </Text>
            <Text className="text-center font-sans text-body-sm text-tertiary-on-container mt-1">
              Backend returned OTP <Text className="font-sans-sb">{params.devOtp}</Text> — autofilled above. In production this would be sent via SMS.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
