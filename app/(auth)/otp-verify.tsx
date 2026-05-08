import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TopAppBar } from '@/components/ui/TopAppBar';
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

function OTPBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
    <View style={styles.otpRow}>
      {slots.map((char, idx) => (
        <View key={idx} style={styles.otpCell}>
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
              styles.otpInput,
              char ? styles.otpInputFilled : styles.otpInputEmpty,
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined,
            ]}
          />
          {idx === 2 && <View style={styles.otpSeparator} />}
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
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="dark-content" />

      <View style={styles.borderView}>
        <TopAppBar variant="dark" />

          <View style={styles.content}>
            <Text style={styles.heading}>Verify Phone Number</Text>
            <Text style={styles.subheading}>Enter the 6-digit code sent to {masked}.</Text>

            <View style={styles.otpWrapper}>
              <OTPBoxes value={otp} onChange={setOtp} />
            </View>

            <View style={styles.actionWrapper}>
              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.88}
                style={styles.verifyButton}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              {seconds > 0 ? (
                <Text style={styles.resendTimer}>
                  {'  '}Resend in 00:{seconds.toString().padStart(2, '0')}
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>{resending ? 'Resending…' : 'Resend Code'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {params.devOtp ? (
              <View style={styles.devBanner}>
                <Text style={styles.devBannerTitle}>Dev mode</Text>
                <Text style={styles.devBannerBody}>
                  Backend returned OTP <Text style={styles.devBannerOtp}>{params.devOtp}</Text> — autofilled above.
                </Text>
              </View>
            ) : null}
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    backgroundColor: '#fcf8fa', // bg-background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 36,
    lineHeight: 44,
    color: '#1b1b1d',
    textAlign: 'center',
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#45464d',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  otpWrapper: {
    marginTop: 40,
    width: '100%',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otpCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1b1b1d',
    backgroundColor: '#fcf8fa',
    borderRadius: 4,
  },
  otpInputEmpty: {
    borderWidth: 1,
    borderColor: '#c6c6cd',
  },
  otpInputFilled: {
    borderWidth: 1.5,
    borderColor: '#cba72f',
  },
  otpSeparator: {
    width: 16,
    height: 1.5,
    backgroundColor: '#c6c6cd',
    marginHorizontal: 2,
  },
  actionWrapper: {
    marginTop: 32,
    width: '100%',
  },
  verifyButton: {
    backgroundColor: '#131b2e',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.28,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  resendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#45464d',
  },
  resendTimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#45464d',
  },
  resendLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#cba72f',
    marginLeft: 4,
  },
  devBanner: {
    marginTop: 32,
    backgroundColor: '#ffe088',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  devBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#4e3d00',
    textAlign: 'center',
  },
  devBannerBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#4e3d00',
    textAlign: 'center',
    marginTop: 4,
  },
  devBannerOtp: {
    fontFamily: 'Inter_600SemiBold',
  },
  borderView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c6c6cd',
    borderRadius: 8,
    marginHorizontal: 16,
  },
});