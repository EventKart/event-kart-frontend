import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';

const AUTH_MAX_WIDTH = 480;

export default function AuthLayout() {
  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fcf8fa' },
      }}
    />
  );

  // On web, constrain auth screens to a phone-like width so the sign-in,
  // OTP, verify, role-select, vendor-onboard, and complete-profile screens
  // don't stretch across a desktop viewport.
  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fcf8fa',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <View style={{ flex: 1, width: '100%', maxWidth: AUTH_MAX_WIDTH }}>
          {stack}
        </View>
      </View>
    );
  }

  return stack;
}
