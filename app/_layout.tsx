import '../global.css';

import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
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

import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

function BrandLoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fcf8fa',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 36,
          fontWeight: '700',
          color: '#131b2e',
          letterSpacing: -0.5,
        }}
      >
        EventKart
      </Text>
      <ActivityIndicator color="#131b2e" style={{ marginTop: 16 }} />
    </View>
  );
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

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

  useEffect(() => {
    if ((fontsLoaded || fontError) && hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, hydrated]);

  // Block all screens until token has been read from storage and fonts are ready.
  // index.tsx handles the actual route decision synchronously once this unblocks.
  const ready = (fontsLoaded || fontError) && hydrated;
  if (!ready) return <BrandLoadingScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fcf8fa' },
      }}
    />
  );
}
