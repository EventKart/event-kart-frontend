import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { createVendor } from '@/lib/api/vendors';

export default function VendorDocumentsStep() {
  const router = useRouter();
  const s = useOnboardingStore();
  const setVendor = useAuthStore((st) => st.setVendor);
  const reset = useOnboardingStore((st) => st.reset);
  const [submitting, setSubmitting] = useState(false);

  const valid = s.aadhar.trim().length >= 8;

  const handleSubmit = async () => {
    const input = s.toVendorInput();
    if (!input) {
      Alert.alert('Missing info', 'Please go back and complete the previous steps.');
      return;
    }
    setSubmitting(true);
    try {
      const vendor = await createVendor(input);
      setVendor(vendor);
      reset();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Could not create vendor profile', e?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll padded={false} edges={['bottom']}>
      <View className="px-6 pt-4 pb-10 gap-4">
        <Text className="font-serif-bold text-h2 text-surface-on">Verification documents</Text>
        <Text className="font-sans text-body-md text-surface-on-variant">
          We use these to verify your identity. They're never shown publicly.
        </Text>

        <View className="gap-4 mt-2">
          <Input
            label="Aadhar Number"
            placeholder="XXXX-XXXX-XXXX"
            value={s.aadhar}
            onChangeText={(v) => s.set('aadhar', v)}
            keyboardType="number-pad"
          />
          <Input
            label="GST Number (optional)"
            placeholder="22AAAAA0000A1Z5"
            autoCapitalize="characters"
            value={s.gst}
            onChangeText={(v) => s.set('gst', v)}
          />
        </View>

        <View className="bg-surface-container-low rounded-xl p-4 mt-2">
          <Text className="font-sans-md text-body-sm text-surface-on">
            What happens next?
          </Text>
          <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
            Your profile will be reviewed by the EventKart trust team. You'll be able to start
            uploading portfolio media right away.
          </Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button label="Previous" variant="secondary" fullWidth={false} className="flex-1" onPress={() => router.back()} />
          <Button label="Complete Setup" fullWidth={false} className="flex-1" disabled={!valid} loading={submitting} onPress={handleSubmit} />
        </View>
      </View>
    </Screen>
  );
}
