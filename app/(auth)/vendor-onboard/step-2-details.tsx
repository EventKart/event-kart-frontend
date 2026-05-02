import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function VendorDetailsStep() {
  const router = useRouter();
  const s = useOnboardingStore();

  const valid = s.name.trim() && s.email.trim() && s.contactNumber.trim();

  return (
    <Screen scroll padded={false}>
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
          <Input
            label="Email"
            placeholder="hello@yourbusiness.in"
            keyboardType="email-address"
            autoCapitalize="none"
            value={s.email}
            onChangeText={(v) => s.set('email', v)}
          />
          <Input
            label="Contact Number"
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={s.contactNumber}
            onChangeText={(v) => s.set('contactNumber', v)}
          />
        </View>

        <View className="mt-2">
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant mb-3">
            Specialty Details
          </Text>
          <TypeFields />
        </View>

        <View className="mt-4">
          <Button label="Next" disabled={!valid} onPress={() => router.push('/(auth)/vendor-onboard/step-3-documents')} />
        </View>
      </View>
    </Screen>
  );
}

function TypeFields() {
  const s = useOnboardingStore();

  switch (s.type) {
    case 'VENUE':
      return (
        <View className="gap-4">
          <Input label="Address" value={s.address} onChangeText={(v) => s.set('address', v)} placeholder="Full venue address" />
          <Input label="Capacity (guests)" keyboardType="number-pad" value={s.capacity} onChangeText={(v) => s.set('capacity', v)} placeholder="350" />
          <Toggle label="Parking Available" value={s.hasParking} onChange={(v) => s.set('hasParking', v)} />
        </View>
      );
    case 'CATERER':
      return (
        <View className="gap-4">
          <Input label="Cuisines (comma-separated)" value={s.cuisines} onChangeText={(v) => s.set('cuisines', v)} placeholder="North Indian, Italian, Continental" />
          <Toggle label="Provides Cutlery" value={s.providesCutlery} onChange={(v) => s.set('providesCutlery', v)} />
        </View>
      );
    case 'DECORATOR':
      return (
        <View className="gap-4">
          <Input label="Themes (comma-separated)" value={s.themes} onChangeText={(v) => s.set('themes', v)} placeholder="Floral, Vintage, Modern" />
          <Toggle label="Provides Lighting" value={s.providesLighting} onChange={(v) => s.set('providesLighting', v)} />
        </View>
      );
    case 'PRIEST':
      return (
        <View className="gap-4">
          <Input label="Languages (comma-separated)" value={s.languages} onChangeText={(v) => s.set('languages', v)} placeholder="Sanskrit, Hindi" />
          <Input label="Religion" value={s.religion} onChangeText={(v) => s.set('religion', v)} placeholder="Hinduism" />
        </View>
      );
    case 'PHOTOGRAPHER':
      return (
        <View className="gap-4">
          <Toggle label="Drone Shoot" value={s.providesDroneShoot} onChange={(v) => s.set('providesDroneShoot', v)} />
          <Toggle label="Videography" value={s.providesVideography} onChange={(v) => s.set('providesVideography', v)} />
        </View>
      );
    case 'BAND':
      return (
        <View className="gap-4">
          <Input label="Instruments (comma-separated)" value={s.instruments} onChangeText={(v) => s.set('instruments', v)} placeholder="Guitar, Cello, Vocals" />
          <Input label="Number of Members" keyboardType="number-pad" value={s.numberOfMembers} onChangeText={(v) => s.set('numberOfMembers', v)} placeholder="4" />
        </View>
      );
    default:
      return null;
  }
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
