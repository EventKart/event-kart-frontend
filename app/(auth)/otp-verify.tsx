import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { requestPhoneOtp, verifyPhoneOtp } from '@/lib/api/auth';
import { SERVICE_URLS } from '@/lib/api/base';
import { useAuthStore } from '@/store/authStore';
import { isProfileComplete } from '@/types';

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

function showError(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function OTPBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const LENGTH = 6;
  const inputs = useRef<Array<TextInput | null>>([]);
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] ?? ''),
  );

  useEffect(() => {
    const expected = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');
    setSlots((prev) => (prev.join('') === expected.join('') ? prev : expected));
  }, [value]);

  useEffect(() => {
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, []);

  const commit = (next: string[]) => {
    setSlots(next);
    onChange(next.join(''));
  };

  const handleChange = (idx: number, text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = [...slots];
      let pos = idx;
      for (const d of digits) {
        if (pos >= LENGTH) break;
        next[pos++] = d;
      }
      commit(next);
      inputs.current[Math.min(pos, LENGTH - 1)]?.focus();
      return;
    }
    const ch = digits.slice(-1);
    const next = [...slots];
    next[idx] = ch;
    commit(next);
    if (ch && idx < LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  return (
    <View className="flex-row items-center justify-center gap-2">
      {slots.map((char, idx) => (
        <View key={idx} className="flex-row items-center gap-2">
          <TextInput
            ref={(el) => { inputs.current[idx] = el; }}
            value={char}
            onChangeText={(t) => handleChange(idx, t)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !char && idx > 0) {
                inputs.current[idx - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={Platform.OS === 'web' ? undefined : 1}
            style={[
              {
                width: 48,
                height: 56,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: '600',
                color: '#1b1b1d',
                backgroundColor: '#fcf8fa',
                borderRadius: 4,
                borderWidth: char ? 1.5 : 1,
                borderColor: char ? '#cba72f' : '#c6c6cd',
              },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined,
            ]}
          />
          {/* Separator between digit 3 and 4 */}
          {idx === 2 && (
            <View style={{ width: 16, height: 1.5, backgroundColor: '#c6c6cd', marginHorizontal: 2 }} />
          )}
        </View>
      ))}
    </View>
  );
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
      showError('Invalid code', 'Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    let res: Awaited<ReturnType<typeof verifyPhoneOtp>>;
    try {
      res = await verifyPhoneOtp({ phoneNumber: phone, otp });
      if (__DEV__) console.log('[auth] verify-otp succeeded', res);
    } catch (e: any) {
      if (__DEV__) console.warn('[auth] verify-otp failed', e?.response?.data ?? e?.message);
      setLoading(false);
      showError('Could not verify', describeError(e));
      return;
    }

    setToken(res.token);
    if (res.user) setUser(res.user);
    setLoading(false);

    const verifiedUser = res.user;
    if (!isProfileComplete(verifiedUser)) {
      router.replace('/complete-profile');
    } else if (verifiedUser?.role === 'VENDOR') {
      router.replace('/(vendor)/dashboard');
    } else {
      router.replace('/(user)/search');
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
      showError('Could not resend', describeError(e));
    } finally {
      setResending(false);
    }
  };

  const masked =
    phone && phone.length > 4 ? `${phone.slice(0, 3)} ••• ${phone.slice(-3)}` : phone ?? '';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {/* Top App Bar */}
      <View className="h-16 flex-row items-center justify-between px-6 bg-white/90 border-b border-outline-variant/60 shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#45464d" />
        </TouchableOpacity>
        <Text className="font-serif text-[18px] text-surface-on italic">EventKart</Text>
        <View className="w-10" />
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6 pb-10">
        <Text className="font-serif-bold text-h1 text-surface-on text-center">
          Verify Phone Number
        </Text>
        <Text className="font-sans text-body-md text-surface-on-variant text-center mt-3 px-4 leading-relaxed">
          Enter the 6-digit code sent to {masked}.
        </Text>

        <View className="mt-10 w-full">
          <OTPBoxes value={otp} onChange={setOtp} />
        </View>

        <View className="mt-8 w-full">
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.88}
            className="w-full bg-primary-container items-center justify-center py-4 rounded shadow-sm"
          >
            <Text className="font-sans-sb text-button text-white uppercase tracking-wide">
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center mt-6 gap-1">
          <Text className="font-sans text-body-sm text-surface-on-variant">
            Didn't receive the code?
          </Text>
          {seconds > 0 ? (
            <Text className="font-sans text-body-sm text-surface-on-variant">
              {'  '}Resend Code{' '}
              <Text className="font-sans text-body-sm text-surface-on-variant">
                00:{seconds.toString().padStart(2, '0')}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
              <Text className="font-sans-md text-body-sm text-tertiary-container ml-1">
                {resending ? 'Resending…' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {params.devOtp ? (
          <View className="mt-8 bg-tertiary-fixed rounded-lg p-4 w-full">
            <Text className="text-center font-sans-sb text-label-md uppercase tracking-wider text-tertiary-on-container">
              Dev mode
            </Text>
            <Text className="text-center font-sans text-body-sm text-tertiary-on-container mt-1">
              Backend returned OTP{' '}
              <Text className="font-sans-sb">{params.devOtp}</Text> — autofilled above.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
