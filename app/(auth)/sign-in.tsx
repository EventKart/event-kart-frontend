import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Star } from 'lucide-react-native';
import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { requestPhoneOtp } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useIsWide } from '@/hooks/useIsWide';
import { auth, authStyles, mobileCardTheme } from '@/constants/authTheme';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthButton } from '@/components/auth/AuthButton';
import { describeError } from '@/lib/auth/alerts';
import { useAuthBokeh } from '@/hooks/useAuthBokeh';

export default function SignInScreen() {
  const router = useRouter();
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const isWide = useIsWide();
  const { web: webCircles, mob: mobCircles } = useAuthBokeh('signIn');

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { top } = useSafeAreaInsets();
  const isDark = useColorScheme() !== 'light';
  const mt = mobileCardTheme(isDark);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const onHide = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  const digits = phone.replace(/\D/g, '');
  const canSubmit = digits.length >= 7;

  const handleSendOtp = async () => {
    if (!canSubmit) {
      if (Platform.OS === 'web') window.alert('Please enter a valid phone number.');
      else Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    Keyboard.dismiss();
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
            <Text style={web.heroTitle}>Seamlessly discover,{'\n'} book & manage events</Text>
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
      isDark={isDark}
    >
      <StatusBar style={mt.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={mob.flex}
              keyboardVerticalOffset={top}
            >
              <Reanimated.View entering={FadeIn.delay(100).duration(900)} layout={LinearTransition.springify()} style={mob.hero}>
                <View style={mob.badge}>
                  <Star size={11} color={mt.badgeColor} fill={mt.badgeColor} />
                  <Text style={[mob.badgeText, { color: mt.badgeColor }]}>EVENTKART</Text>
                  <Star size={11} color={mt.badgeColor} fill={mt.badgeColor} />
                </View>
                {!keyboardVisible && (
                  <Reanimated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(180)}
                    style={{ alignItems: 'center' }}
                  >
                    <Text style={[mob.heroTitle, { color: mt.heroTitle }]}>Seamlessly discover,{'\n'}book & manage events</Text>
                  </Reanimated.View>
                )}
              </Reanimated.View>

              <Reanimated.View layout={LinearTransition.springify()} entering={FadeInUp.delay(280).duration(650)} style={[mt.card, mob.card]}>
                <Text style={[mob.cardTitle, { color: mt.title }]}>Sign In</Text>
                <Text style={[mob.cardSubtitle, { color: mt.subtitle }]}>Enter your phone number to continue</Text>

                <View style={mob.field}>
                  <Text style={[mob.fieldLabel, { color: mt.label }]}>PHONE NUMBER</Text>
                  <View style={mob.inputRow}>
                    <View style={[mob.dialCode, { backgroundColor: mt.inputBg, borderColor: mt.inputBorder }]}>
                      <Text style={[mob.dialCodeText, { color: mt.inputText }]}>+91</Text>
                    </View>
                    <TextInput
                      style={[
                        mob.input,
                        { backgroundColor: mt.inputBg, borderColor: mt.inputBorder, color: mt.inputText },
                        focused && { borderColor: auth.gold, backgroundColor: mt.focusedBg },
                      ]}
                      placeholder="000 0000000"
                      placeholderTextColor={mt.placeholder}
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
          </View>
        </TouchableWithoutFeedback>
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
    gap: 8,
    backgroundColor: 'rgba(203,167,47,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(203,167,47,0.55)',
    marginBottom: 22,
  },
  badgeText: { fontSize: 13, fontFamily: auth.fontSemiBold, letterSpacing: 3 },
  heroTitle: {
    fontSize: 32,
    fontFamily: auth.fontSerif,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 12,
  },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: 0.2 },
  card: {
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
