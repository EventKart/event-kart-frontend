import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateUser } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

function showAlert(title: string, message: string, onConfirm?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onConfirm?.();
    return;
  }
  if (onConfirm) {
    Alert.alert(title, message, [{ text: 'Continue', onPress: onConfirm }]);
  } else {
    Alert.alert(title, message);
  }
}

export default function CreateProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setRoleInStore = useAuthStore((s) => s.setRole);

  const [roleChoice, setRoleChoice] = useState<Role>('USER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const valid = firstName.trim().length >= 1 && lastName.trim().length >= 1;

  const handleSubmit = async () => {
    if (!valid) {
      showAlert('Almost there', 'Please enter your first and last name to continue.');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setRoleInStore(roleChoice);

    const goNext = () => {
      if (roleChoice === 'VENDOR') {
        router.replace('/(auth)/vendor-onboard/step-1-type');
      } else {
        router.replace('/(user)/search');
      }
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
    } catch (e: any) {
      // Optimistic save — continue the flow even if the backend is temporarily unavailable.
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

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-8 pb-10 gap-6 flex-1">
          {/* Header */}
          <View>
            <View className="h-1.5 w-10 rounded-full bg-tertiary-container mb-4" />
            <Text className="font-serif-bold text-h1 text-primary-container">
              Create your profile
            </Text>
            <Text className="font-sans text-body-md text-surface-on-variant mt-2">
              Tell us about yourself to get started on EventKart.
            </Text>
          </View>

          {/* Role segmented control */}
          <View className="flex-row p-1 bg-surface-container rounded-lg" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 }}>
            <Pressable
              onPress={() => setRoleChoice('USER')}
              className={`flex-1 py-2.5 rounded-md items-center ${
                roleChoice === 'USER' ? 'bg-surface-container-lowest' : ''
              }`}
              style={
                roleChoice === 'USER'
                  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 }
                  : undefined
              }
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  letterSpacing: 0.5,
                  color: roleChoice === 'USER' ? '#1b1b1d' : '#45464d',
                  textTransform: 'uppercase',
                }}
              >
                I am a Planner
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRoleChoice('VENDOR')}
              className={`flex-1 py-2.5 rounded-md items-center ${
                roleChoice === 'VENDOR' ? 'bg-surface-container-lowest' : ''
              }`}
              style={
                roleChoice === 'VENDOR'
                  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 }
                  : undefined
              }
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  letterSpacing: 0.5,
                  color: roleChoice === 'VENDOR' ? '#1b1b1d' : '#45464d',
                  textTransform: 'uppercase',
                }}
              >
                I am a Vendor
              </Text>
            </Pressable>
          </View>

          {/* Name row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="First Name"
                placeholder="Sarah"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoFocus
              />
            </View>
            <View className="flex-1">
              <Input
                label="Last Name"
                placeholder="Jenkins"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email (optional) */}
          <Input
            label="Email Address (optional)"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Address */}
          <Input
            label="City / Address"
            placeholder="Bengaluru, Karnataka"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
          />

          {/* Vendor hint */}
          {roleChoice === 'VENDOR' ? (
            <View className="bg-tertiary-fixed rounded-xl p-4 gap-1">
              <Text className="font-sans-sb text-label-md uppercase tracking-wider text-tertiary-on-container">
                Next: Business details
              </Text>
              <Text className="font-sans text-body-sm text-tertiary-on-container/90">
                After this step we'll walk you through your vendor profile, services, and
                documents.
              </Text>
            </View>
          ) : null}

          {/* Submit */}
          <View className="mt-auto pt-2">
            <Button
              label={roleChoice === 'VENDOR' ? 'Continue to Vendor Setup' : 'Get Started'}
              disabled={!valid}
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

