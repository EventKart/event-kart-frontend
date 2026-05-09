import '../global.css';

import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSerif_400Regular,
  NotoSerif_600SemiBold,
  NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Star } from 'lucide-react-native';
import Reanimated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import { BokehCircle } from '@/components/auth/BokehCircle';
import { auth } from '@/constants/authTheme';
import { useAuthBokeh } from '@/hooks/useAuthBokeh';

SplashScreen.preventAutoHideAsync().catch(() => {});

// ── Pulsing dot (loading indicator) ─────────────────────────────────────────

function PulseDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 500 }), withTiming(0.3, { duration: 500 })),
        -1,
        true,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1.3, { duration: 500 }), withTiming(0.8, { duration: 500 })),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Reanimated.View
      style={[
        { width: 6, height: 6, borderRadius: 3, backgroundColor: auth.gold },
        style,
      ]}
    />
  );
}

// ── Splash screen ─────────────────────────────────────────────────────────────

function LaunchScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const { web: circles } = useAuthBokeh('splash');
  const fadeOut = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fadeOut.value }));

  useEffect(() => {
    if (!ready) return;
    // Brief hold so the user sees the brand, then smooth fade out
    fadeOut.value = withDelay(350, withTiming(0, { duration: 550 }));
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <Reanimated.View style={[StyleSheet.absoluteFill, styles.root, containerStyle]}>
      <StatusBar style="light" />

      {circles.map((c, i) => (
        <BokehCircle key={i} {...c} />
      ))}
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          {/* Badge */}
          <Reanimated.View entering={FadeIn.delay(80).duration(700)} style={styles.badge}>
            <Star size={9} color={auth.gold} fill={auth.gold} />
            <Text style={styles.badgeText}>EVENTKART</Text>
            <Star size={9} color={auth.gold} fill={auth.gold} />
          </Reanimated.View>

          {/* Brand name */}
          <Reanimated.Text
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.brandName}
          >
            EventKart
          </Reanimated.Text>

          {/* Tagline */}
          <Reanimated.Text
            entering={FadeInUp.delay(380).duration(700)}
            style={styles.tagline}
          >
            Where Events Come Alive
          </Reanimated.Text>

          {/* Gold ornament line */}
          <Reanimated.View entering={FadeIn.delay(560).duration(600)} style={styles.ornament}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDot} />
            <View style={styles.ornamentLine} />
          </Reanimated.View>

          {/* Loading dots */}
          <Reanimated.View entering={FadeIn.delay(700).duration(500)} style={styles.dotsRow}>
            <PulseDot delay={0} />
            <PulseDot delay={160} />
            <PulseDot delay={320} />
          </Reanimated.View>
        </View>
      </SafeAreaView>
    </Reanimated.View>
  );
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [splashDone, setSplashDone] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSerif_400Regular,
    NotoSerif_600SemiBold,
    NotoSerif_700Bold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Hide the native OS splash as soon as fonts are ready so our custom
  // launch screen takes over seamlessly.
  useEffect(() => {
    if (fontsLoaded || fontError != null) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const ready = (fontsLoaded || fontError != null) && hydrated;

  // While splash is still showing, render it as the sole screen so the Stack
  // doesn't flash underneath. Once splashDone, the Stack takes over.
  if (!splashDone) {
    return (
      <LaunchScreen
        ready={ready}
        onDone={() => setSplashDone(true)}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fcf8fa' },
      }}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    backgroundColor: auth.darkBg,
    // On web, absoluteFill works but we also want to cover scrollbars
    ...(Platform.OS === 'web' ? { position: 'fixed' as any } : {}),
    zIndex: 9999,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(203,167,47,0.1)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.3)',
    marginBottom: 28,
  },
  badgeText: {
    fontSize: 11,
    color: auth.gold,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  brandName: {
    fontFamily: auth.fontSerif,
    fontSize: 56,
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  tagline: {
    fontFamily: auth.fontRegular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 36,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  ornamentLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(203,167,47,0.4)',
  },
  ornamentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: auth.gold,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
