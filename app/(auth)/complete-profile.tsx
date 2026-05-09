import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
import Reanimated, { FadeIn, FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';

import { updateUser } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';
import { useIsWide } from '@/hooks/useIsWide';
import { auth, authStyles } from '@/constants/authTheme';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { showAlert } from '@/lib/auth/alerts';
import { useAuthBokeh } from '@/hooks/useAuthBokeh';
import type { Role } from '@/types';

export default function CreateProfileScreen() {
  const router = useRouter();
  const isWide = useIsWide();
  const { web: webCircles, mob: mobCircles } = useAuthBokeh('completeProfile');

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setRoleInStore = useAuthStore((s) => s.setRole);

  const [roleChoice, setRoleChoice] = useState<Role>('USER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const onHide = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  const valid = firstName.trim().length >= 1 && lastName.trim().length >= 1;
  const ctaLabel = submitting ? 'Saving…' : roleChoice === 'VENDOR' ? 'Continue to Vendor Setup' : 'Get Started';

  const handleSubmit = async () => {
    if (!valid) {
      showAlert('Almost there', 'Please enter your first and last name to continue.');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setRoleInStore(roleChoice);

    const goNext = () => {
      if (roleChoice === 'VENDOR') router.replace('/(auth)/vendor-onboard/step-1-type');
      else router.replace('/(user)/search');
    };

    try {
      const updated = await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      setUser({ ...updated, role: roleChoice });
      goNext();
    } catch {
      setUser({
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || user.email,
        address: address.trim() || user.address,
        role: roleChoice,
      });
      showAlert(
        'Saved locally',
        'Could not sync to the server right now. Your profile has been saved on this device and will sync when the connection is restored.',
        goNext,
      );
    } finally {
      setSubmitting(false);
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
        <ScrollView
          contentContainerStyle={web.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Reanimated.View entering={FadeIn.delay(80).duration(800)} style={web.brand}>
            <View style={web.goldBar} />
            <Text style={web.brandTitle}>EventKart</Text>
            <Text style={web.brandSub}>Create your profile</Text>
          </Reanimated.View>

          <Reanimated.View entering={FadeInUp.delay(260).duration(600)} style={authStyles.lightCard}>
            <RoleToggle value={roleChoice} onChange={setRoleChoice} light />

            <View style={web.nameRow}>
              <AuthInput
                label="First Name"
                theme="light"
                placeholder="Sarah"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                autoFocus
                containerStyle={{ flex: 1 }}
              />
              <AuthInput
                ref={lastNameRef}
                label="Last Name"
                theme="light"
                placeholder="Jenkins"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                containerStyle={{ flex: 1 }}
              />
            </View>

            <AuthInput
              ref={emailRef}
              label="Email Address (optional)"
              theme="light"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
            />

            <AuthInput
              ref={addressRef}
              label="City / Address"
              theme="light"
              placeholder="Bengaluru, Karnataka"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {roleChoice === 'VENDOR' && <VendorHint light />}

            <AuthButton
              label={ctaLabel}
              onPress={handleSubmit}
              variant="navy"
              disabled={!valid}
              loading={submitting}
              style={{ marginTop: 4 }}
            />
          </Reanimated.View>
        </ScrollView>
      </AuthBackground>
    );
  }

  // ── Mobile layout ───────────────────────────────────────────────────────────
  return (
    <AuthBackground
      circles={mobCircles}
    >
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={top}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={mob.inner}>
              <Reanimated.View entering={FadeIn.delay(80).duration(700)} layout={LinearTransition.springify()} style={mob.header}>
                <View style={mob.goldBar} />
                {!keyboardVisible && (
                  <Reanimated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(180)}>
                    <Text style={mob.title}>{'Create your\nprofile'}</Text>
                    <Text style={mob.subtitle}>Tell us about yourself to get started on EventKart.</Text>
                  </Reanimated.View>
                )}
              </Reanimated.View>

              <Reanimated.View layout={LinearTransition.springify()} entering={FadeInUp.delay(240).duration(600)} style={mob.card}>
                <RoleToggle value={roleChoice} onChange={setRoleChoice} />

                <View style={mob.nameRow}>
                  <AuthInput
                    label="First Name"
                    theme="dark"
                    placeholder="Sarah"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    autoFocus
                    containerStyle={{ flex: 1 }}
                  />
                  <AuthInput
                    ref={lastNameRef}
                    label="Last Name"
                    theme="dark"
                    placeholder="Jenkins"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <AuthInput
                  ref={emailRef}
                  label="Email (optional)"
                  theme="dark"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => addressRef.current?.focus()}
                />

                <AuthInput
                  ref={addressRef}
                  label="City / Address"
                  theme="dark"
                  placeholder="Bengaluru, Karnataka"
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                {roleChoice === 'VENDOR' && <VendorHint />}

                <AuthButton
                  label={ctaLabel}
                  onPress={handleSubmit}
                  variant="gold"
                  disabled={!valid}
                  loading={submitting}
                  style={{ marginTop: 4 }}
                />
              </Reanimated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleToggle({
  value,
  onChange,
  light,
}: {
  value: Role;
  onChange: (r: Role) => void;
  light?: boolean;
}) {
  return (
    <View style={[role.row, light ? role.rowLight : role.rowDark]}>
      {(['USER', 'VENDOR'] as Role[]).map((r) => {
        const active = value === r;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={[role.tab, active && (light ? role.tabActiveLight : role.tabActiveDark)]}
          >
            <Text style={[role.text, active && (light ? role.textActiveLight : role.textActiveDark)]}>
              {r === 'USER' ? 'I am a Planner' : 'I am a Vendor'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function VendorHint({ light }: { light?: boolean }) {
  return (
    <View style={[hint.box, light ? hint.boxLight : hint.boxDark]}>
      <Text style={[hint.title, { color: light ? '#92400e' : auth.gold }]}>
        Next: Business details
      </Text>
      <Text style={[hint.body, { color: light ? '#78350f' : 'rgba(203,167,47,0.8)' }]}>
        After this step we'll walk you through your vendor profile, services, and documents.
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const web = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 28,
  },
  brand: { alignItems: 'center', gap: 6 },
  goldBar: { width: 32, height: 3, borderRadius: 2, backgroundColor: auth.gold, marginBottom: 2 },
  brandTitle: { fontFamily: auth.fontSerif, fontSize: 32, color: '#ffffff', letterSpacing: 0.5 },
  brandSub: { fontFamily: auth.fontRegular, fontSize: 15, color: 'rgba(255,255,255,0.55)' },
  nameRow: { flexDirection: 'row', gap: 14 },
});

const mob = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32, gap: 24 },
  header: { gap: 8 },
  goldBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: auth.gold, marginBottom: 4 },
  title: { fontFamily: auth.fontSerif, fontSize: 34, lineHeight: 42, color: '#ffffff', letterSpacing: 0.2 },
  subtitle: { fontFamily: auth.fontRegular, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 22, marginTop: 4 },
  card: { ...authStyles.darkCard, gap: 16 },
  nameRow: { flexDirection: 'row', gap: 12 },
});

const role = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: 10, padding: 4, gap: 4 },
  rowDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  rowLight: { backgroundColor: '#f3f4f6' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  tabActiveDark: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabActiveLight: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  text: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' },
  textActiveDark: { color: '#ffffff' },
  textActiveLight: { color: auth.navy },
});

const hint = StyleSheet.create({
  box: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 4 },
  boxDark: { backgroundColor: 'rgba(203,167,47,0.1)', borderColor: 'rgba(203,167,47,0.2)' },
  boxLight: { backgroundColor: '#fffbea', borderColor: '#fde68a' },
  title: { fontFamily: auth.fontSemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  body: { fontFamily: auth.fontRegular, fontSize: 13, lineHeight: 19 },
});
