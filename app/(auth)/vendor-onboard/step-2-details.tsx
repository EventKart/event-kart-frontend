import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useVendorAttributeSchema } from '@/hooks/useVendors';
import type { VendorAttributeField } from '@/types';

export default function VendorDetailsStep() {
  const router = useRouter();
  const s = useOnboardingStore();
  const { fields, loading } = useVendorAttributeSchema(s.type);

  const valid =
    Boolean(s.name.trim()) &&
    !loading &&
    fields
      .filter((f) => f.required && f.type !== 'BOOLEAN')
      .every((f) => String((s as any)[f.key] ?? '').trim());

  return (
    <Screen scroll padded={false} edges={['bottom']}>
      <View className="px-6 pt-4 pb-10 gap-4">
        <Text className="font-serif-bold text-h2 text-surface-on">Business details</Text>
        <Text className="font-sans text-body-md text-surface-on-variant">
          Add your contact information so couples can reach out.
        </Text>

        <View className="gap-4 mt-2">
          <Input
            label="Business Name"
            placeholder="e.g. Petal & Paper Studio"
            value={s.name}
            onChangeText={(v) => s.set('name', v)}
          />
        </View>

        <View className="mt-2">
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant mb-3">
            Specialty Details
          </Text>
          {loading ? (
            <ActivityIndicator color="#cba72f" />
          ) : (
            <TypeFields fields={fields} />
          )}
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button label="Previous" variant="secondary" fullWidth={false} className="flex-1" onPress={() => router.back()} />
          <Button label="Next" fullWidth={false} className="flex-1" disabled={!valid} onPress={() => router.push('/(auth)/vendor-onboard/step-3-documents')} />
        </View>
      </View>
    </Screen>
  );
}

function TypeFields({ fields }: { fields: VendorAttributeField[] }) {
  const s = useOnboardingStore();

  if (!fields.length) return null;

  return (
    <View className="gap-4">
      {fields.map((field) => {
        const value = (s as any)[field.key];
        if (field.type === 'BOOLEAN') {
          return (
            <Toggle
              key={field.key}
              label={field.label}
              value={Boolean(value)}
              onChange={(v) => s.set(field.key as any, v)}
            />
          );
        }
        return (
          <Input
            key={field.key}
            label={field.label}
            value={String(value ?? '')}
            keyboardType={field.type === 'INTEGER' ? 'number-pad' : 'default'}
            onChangeText={(v) => s.set(field.key as any, v)}
          />
        );
      })}
    </View>
  );
}

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg px-4 h-12"
    >
      <Text className="font-sans-md text-body-md text-surface-on">{label}</Text>
      <View
        className={`w-6 h-6 rounded-md items-center justify-center ${
          value ? 'bg-tertiary-container' : 'bg-surface-container-high'
        }`}
      >
        {value ? <Check size={16} color="#4e3d00" /> : null}
      </View>
    </Pressable>
  );
}
