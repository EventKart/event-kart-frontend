import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import Reanimated, { FadeIn, FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';

import { requestPhoneOtp, verifyPhoneOtp } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { isProfileComplete } from '@/types';
import { useIsWide } from '@/hooks/useIsWide';
import { auth, authStyles, mobileCardTheme } from '@/constants/authTheme';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthButton } from '@/components/auth/AuthButton';
import { OTPInput } from '@/components/auth/OTPInput';
import { describeError, showAlert } from '@/lib/auth/alerts';
import { useAuthBokeh } from '@/hooks/useAuthBokeh';

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ devOtp?: string }>();
  const phone = useAuthStore((s) => s.pendingPhone);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const isWide = useIsWide();
  const { web: webCircles, mob: mobCircles } = useAuthBokeh('otpVerify');

  const [otp, setOtp] = useState(params.devOtp ?? '');
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { top } = useSafeAreaInsets();
  const isDark = useColorScheme() !== 'light';
  const mt = mobileCardTheme(isDark);

  useEffect(() => {
    if (!phone) router.replace('/(auth)/sign-in');
  }, [phone, router]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const onHide = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleVerify = async () => {
    if (!phone) return;
    if (otp.length !== 6) {
      showAlert('Invalid code', 'Please enter the 6-digit OTP.');
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
      showAlert('Could not verify', describeError(e));
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
      showAlert('Could not resend', describeError(e));
    } finally {
      setResending(false);
    }
  };

  const masked =
    phone && phone.length > 4 ? `${phone.slice(0, 3)} ••• ${phone.slice(-3)}` : (phone ?? '');

  // ── Web layout ──────────────────────────────────────────────────────────────
  if (isWide) {
    return (
      <AuthBackground
        variant="web"
        circles={webCircles}
      >
        <StatusBar style="light" />
        <View style={authStyles.webCentered}>
          <Reanimated.View entering={FadeIn.delay(50).duration(600)} style={web.backRow}>
            <TouchableOpacity onPress={() => router.back()} style={web.backBtn} activeOpacity={0.7}>
              <ChevronLeft size={16} color="rgba(255,255,255,0.6)" />
              <Text style={web.backText}>Back</Text>
            </TouchableOpacity>
          </Reanimated.View>

          <Reanimated.View entering={FadeIn.delay(100).duration(900)} style={web.brand}>
            <View style={web.iconRing}>
              <ShieldCheck size={30} color={auth.gold} strokeWidth={1.5} />
            </View>
            <Text style={web.heroTitle}>{'Check your\nphone'}</Text>
            <Text style={web.heroSub}>
              We sent a 6-digit code to <Text style={web.heroPhone}>{masked}</Text>
            </Text>
          </Reanimated.View>

          <Reanimated.View entering={FadeInUp.delay(280).duration(600)} style={authStyles.lightCard}>
            <OTPInput value={otp} onChange={setOtp} theme="light" />
            <AuthButton
              label={loading ? 'Verifying…' : 'Verify & Continue'}
              onPress={handleVerify}
              variant="navy"
              loading={loading}
            />
            <ResendRow
              seconds={seconds}
              resending={resending}
              onResend={handleResend}
              light
            />
            {params.devOtp && <DevBanner otp={params.devOtp} light />}
          </Reanimated.View>
        </View>
      </AuthBackground>
    );
  }

  // ── Mobile layout ───────────────────────────────────────────────────────────
  return (
    <AuthBackground
      circles={mobCircles}
      isDark={isDark}
    >
      <StatusBar style={mt.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={mob.inner}
              keyboardVerticalOffset={top}
            >
              <Reanimated.View entering={FadeIn.delay(50).duration(600)} style={mob.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={mob.backBtn} activeOpacity={0.7}>
                  <ChevronLeft size={20} color={mt.backBtn} />
                  <Text style={[mob.backText, { color: mt.backBtn }]}>Back</Text>
                </TouchableOpacity>
              </Reanimated.View>

              <Reanimated.View entering={FadeIn.delay(100).duration(900)} layout={LinearTransition.springify()} style={mob.hero}>
                <View style={mob.iconRing}>
                  <ShieldCheck size={28} color={auth.gold} strokeWidth={1.5} />
                </View>
                {!keyboardVisible && (
                  <Reanimated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(180)} style={{ alignItems: 'center' }}>
                    <Text style={[mob.heroTitle, { color: mt.heroTitle }]}>{'Check your\nphone'}</Text>
                    <Text style={[mob.heroSub, { color: mt.heroSubtitle }]}>
                      {'We sent a 6-digit code to\n'}
                      <Text style={mob.heroPhone}>{masked}</Text>
                    </Text>
                  </Reanimated.View>
                )}
              </Reanimated.View>

              <Reanimated.View layout={LinearTransition.springify()} entering={FadeInUp.delay(280).duration(650)} style={[mt.card, mob.card]}>
                <OTPInput value={otp} onChange={setOtp} theme={mt.inputTheme} />
                <AuthButton
                  label={loading ? 'Verifying…' : 'Verify & Continue'}
                  onPress={handleVerify}
                  variant="gold"
                  loading={loading}
                />
                <ResendRow seconds={seconds} resending={resending} onResend={handleResend} light={!isDark} />
                {params.devOtp && <DevBanner otp={params.devOtp} light={!isDark} />}
              </Reanimated.View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </AuthBackground>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResendRow({
  seconds,
  resending,
  onResend,
  light,
}: {
  seconds: number;
  resending: boolean;
  onResend: () => void;
  light?: boolean;
}) {
  const labelColor = light ? '#45464d' : 'rgba(255,255,255,0.4)';
  return (
    <View style={sub.resendRow}>
      <Text style={[sub.resendLabel, { color: labelColor }]}>Didn't receive the code?</Text>
      {seconds > 0 ? (
        <Text style={[sub.resendLabel, { color: labelColor }]}>
          {' '}Resend in 00:{seconds.toString().padStart(2, '0')}
        </Text>
      ) : (
        <TouchableOpacity onPress={onResend} disabled={resending} activeOpacity={0.7}>
          <Text style={sub.resendLink}>{resending ? 'Resending…' : ' Resend Code'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DevBanner({ otp, light }: { otp: string; light?: boolean }) {
  return (
    <View style={[sub.devBanner, light ? sub.devBannerLight : sub.devBannerDark]}>
      <Text style={[sub.devTitle, { color: light ? '#7a5c00' : auth.gold }]}>Dev mode</Text>
      <Text style={[sub.devBody, { color: light ? '#5a4400' : 'rgba(255,255,255,0.5)' }]}>
        OTP <Text style={sub.devOtp}>{otp}</Text> autofilled above.
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const web = StyleSheet.create({
  brand: { alignItems: 'center' },
  backRow: { width: '100%', maxWidth: 480, alignItems: 'flex-start' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(203,167,47,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontFamily: auth.fontSerif,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 60,
    marginBottom: 10,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 24 },
  heroPhone: { color: auth.gold, fontWeight: '600' },
});

const mob = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'space-between' },
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(203,167,47,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 40,
    fontFamily: auth.fontSerif,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 14,
  },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
  heroPhone: { color: auth.gold, fontWeight: '600' },
  card: {
    marginHorizontal: 16,
    marginBottom: 28,
  },
});

const sub = StyleSheet.create({
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  resendLabel: { fontSize: 13 },
  resendLink: { fontSize: 13, color: auth.gold, fontWeight: '600' },
  devBanner: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  devBannerLight: { backgroundColor: '#fff8e1', borderColor: 'rgba(203,167,47,0.3)' },
  devBannerDark: { backgroundColor: 'rgba(203,167,47,0.1)', borderColor: 'rgba(203,167,47,0.25)' },
  devTitle: {
    fontSize: 10,
    fontFamily: auth.fontSemiBold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  devBody: { fontSize: 13, textAlign: 'center' },
  devOtp: { fontWeight: '700' },
});
