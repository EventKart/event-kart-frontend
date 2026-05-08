import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Star } from 'lucide-react-native';
import Reanimated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { requestPhoneOtp } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useIsWide } from '@/hooks/useIsWide';
import { auth, authStyles, bokeh } from '@/constants/authTheme';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthButton } from '@/components/auth/AuthButton';
import { describeError } from '@/lib/auth/alerts';

export default function SignInScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const { width: winW, height: winH } = useWindowDimensions();
  const isWide = useIsWide();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const canSubmit = digits.length >= 7;

  const webCircles = useMemo(() => [
    { size: winW * 0.32, cx: winW * 0.08, cy: winH * 0.15, color: bokeh.gold(0.22), delay: 0 },
    { size: winW * 0.26, cx: winW * 0.92, cy: winH * 0.58, color: bokeh.gold(0.16), delay: 700 },
    { size: winW * 0.20, cx: winW * 0.55, cy: winH * 0.07, color: bokeh.navy(0.45), delay: 300 },
    { size: winW * 0.28, cx: winW * 0.28, cy: winH * 0.76, color: bokeh.deep(0.88), delay: 600 },
    { size: winW * 0.18, cx: winW * 0.72, cy: winH * 0.84, color: bokeh.gold(0.14), delay: 1000 },
  ], [winW, winH]);

  const mobCircles = useMemo(() => [
    { size: 340, cx: winW * 0.06 + 170, cy: 160,         color: bokeh.gold(0.22), delay: 0 },
    { size: 240, cx: winW * 0.88 + 120, cy: 300,         color: bokeh.gold(0.16), delay: 800 },
    { size: 180, cx: winW * 0.5,        cy: 60,          color: bokeh.navy(0.5),  delay: 300 },
    { size: 300, cx: winW * 0.1 + 150,  cy: winH * 0.65, color: bokeh.deep(0.9),  delay: 600 },
    { size: 220, cx: winW * 0.8 + 110,  cy: winH * 0.45, color: bokeh.gold(0.12), delay: 1200 },
    { size: 140, cx: winW * 0.3,        cy: winH * 0.8,  color: bokeh.gold(0.18), delay: 500 },
  ], [winW, winH]);

  const handleSendOtp = async () => {
    if (!canSubmit) {
      if (Platform.OS === 'web') window.alert('Please enter a valid phone number.');
      else Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${digits}`;
      const res = await requestPhoneOtp({ phoneNumber: fullNumber });
      setPendingPhone(fullNumber);
      router.push({ pathname: '/(auth)/otp-verify', params: { devOtp: res.devOtp ?? '' } });
    } catch (e: any) {
      const msg = describeError(e);
      if (Platform.OS === 'web') window.alert(`Could not send OTP — ${msg}`);
      else Alert.alert('Could not send OTP', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Web layout ──────────────────────────────────────────────────────────────
  if (isWide) {
    return (
      <AuthBackground
        variant="web"
        circles={webCircles}
      >
        <StatusBar style="light" />
        <View style={authStyles.webCentered}>
          <Reanimated.View entering={FadeIn.delay(100).duration(900)} style={web.brand}>
            <View style={web.badge}>
              <Star size={9} color={auth.gold} fill={auth.gold} />
              <Text style={web.badgeText}>EVENTKART</Text>
              <Star size={9} color={auth.gold} fill={auth.gold} />
            </View>
            <Text style={web.heroTitle}>{'Where Events\nCome Alive'}</Text>
            <Text style={web.heroSub}>Seamlessly discover, book & manage events</Text>
          </Reanimated.View>

          <Reanimated.View entering={FadeInUp.delay(280).duration(600)} style={authStyles.lightCard}>
            <Text style={web.cardTitle}>Sign In</Text>
            <Text style={web.cardSub}>Enter your phone number to continue</Text>

            <Text style={web.label}>PHONE NUMBER</Text>
            <View style={web.inputRow}>
              <View style={web.dialCode}>
                <Text style={web.dialCodeText}>+91</Text>
              </View>
              <TextInput
                style={[web.input, focused && web.inputFocused]}
                placeholder="000 0000000"
                placeholderTextColor="#c6c6cd"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor={auth.gold}
              />
            </View>

            <AuthButton
              label={loading ? 'Sending…' : 'Send Verification Code'}
              onPress={handleSendOtp}
              variant="navy"
              disabled={!canSubmit}
              loading={loading}
              iconRight={!loading ? <ArrowRight size={18} color="#ffffff" /> : undefined}
            />
          </Reanimated.View>
        </View>
      </AuthBackground>
    );
  }

  // ── Mobile layout ───────────────────────────────────────────────────────────
  return (
    <AuthBackground
      circles={mobCircles}
    >
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={mob.flex}
        >
          <Reanimated.View entering={FadeIn.delay(100).duration(900)} style={mob.hero}>
            <View style={mob.badge}>
              <Star size={9} color={auth.gold} fill={auth.gold} />
              <Text style={mob.badgeText}>EVENTKART</Text>
              <Star size={9} color={auth.gold} fill={auth.gold} />
            </View>
            <Text style={mob.heroTitle}>{'Where Events\nCome Alive'}</Text>
            <Text style={mob.heroSub}>Seamlessly discover, book & manage events</Text>
          </Reanimated.View>

          <Reanimated.View entering={FadeInUp.delay(280).duration(650)} style={mob.card}>
            <Text style={mob.cardTitle}>Sign In</Text>
            <Text style={mob.cardSubtitle}>Enter your phone number to continue</Text>

            <View style={mob.field}>
              <Text style={mob.fieldLabel}>PHONE NUMBER</Text>
              <View style={mob.inputRow}>
                <View style={mob.dialCode}>
                  <Text style={mob.dialCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[mob.input, focused && mob.inputFocused]}
                  placeholder="000 0000000"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  selectionColor={auth.gold}
                />
              </View>
            </View>

            <AuthButton
              label={loading ? 'Sending…' : 'Send Verification Code'}
              onPress={handleSendOtp}
              variant="gold"
              disabled={!canSubmit}
              loading={loading}
              iconRight={!loading ? <ArrowRight size={18} color={auth.navy} /> : undefined}
            />
          </Reanimated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

// ── Web styles ────────────────────────────────────────────────────────────────
const web = StyleSheet.create({
  brand: { alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(203,167,47,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.3)',
    marginBottom: 20,
  },
  badgeText: { fontSize: 11, color: auth.gold, letterSpacing: 2.5, fontWeight: '700' },
  heroTitle: {
    fontSize: 52,
    fontFamily: auth.fontSerif,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 10,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.2 },
  cardTitle: { fontSize: 22, fontFamily: auth.fontSerif, color: '#1b1b1d', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#45464d', marginBottom: 24 },
  label: { fontSize: 10, fontFamily: auth.fontSemiBold, color: '#45464d', letterSpacing: 2, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dialCode: {
    height: 50,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#c6c6cd',
    borderRadius: 10,
  },
  dialCodeText: { fontSize: 16, color: '#1b1b1d', fontWeight: '600' },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#c6c6cd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1b1b1d',
  },
  inputFocused: { borderColor: auth.gold, borderWidth: 1.5, backgroundColor: '#ffffff' },
});

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mob = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'space-between' },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(203,167,47,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.3)',
    marginBottom: 22,
  },
  badgeText: { fontSize: 11, color: auth.gold, letterSpacing: 2.5, fontWeight: '700' },
  heroTitle: {
    fontSize: 44,
    fontFamily: auth.fontSerif,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 54,
    marginBottom: 12,
  },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.2 },
  card: {
    ...authStyles.darkCard,
    marginHorizontal: 16,
    marginBottom: 28,
  },
  cardTitle: { fontSize: 22, fontFamily: auth.fontSerif, color: '#ffffff', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontFamily: auth.fontSemiBold, color: auth.gold, letterSpacing: 2, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  dialCode: {
    height: 50,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  dialCodeText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  inputFocused: { borderColor: auth.gold, backgroundColor: 'rgba(255,255,255,0.09)' },
});
