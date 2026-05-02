import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  Camera,
  ChefHat,
  Flower,
  Music,
  Sparkles,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { VendorType } from '@/types';

const TYPE_TILES: Array<{ type: VendorType; label: string; Icon: LucideIcon }> = [
  { type: 'VENUE', label: 'Venue', Icon: Building2 },
  { type: 'CATERER', label: 'Caterer', Icon: ChefHat },
  { type: 'DECORATOR', label: 'Decorator', Icon: Flower },
  { type: 'PHOTOGRAPHER', label: 'Photographer', Icon: Camera },
  { type: 'PRIEST', label: 'Priest', Icon: Sparkles },
  { type: 'BAND', label: 'Band', Icon: Music },
];

export default function VendorTypeStep() {
  const router = useRouter();
  const type = useOnboardingStore((s) => s.type);
  const setField = useOnboardingStore((s) => s.set);

  return (
    <Screen scroll padded={false}>
      <View className="flex-1 px-6 pt-4 pb-6">
        <Text className="font-serif-bold text-h2 text-surface-on">What service do you offer?</Text>
        <Text className="font-sans text-body-md text-surface-on-variant mt-2">
          Pick the category that best describes your business.
        </Text>

        <View className="flex-row flex-wrap mt-8 -mx-2">
          {TYPE_TILES.map(({ type: t, label, Icon }) => {
            const selected = type === t;
            return (
              <View key={t} className="w-1/2 px-2 mb-4">
                <Pressable
                  onPress={() => setField('type', t)}
                  className={`h-32 rounded-xl items-center justify-center border-2 ${
                    selected
                      ? 'bg-primary-container border-primary-container'
                      : 'bg-surface-container-lowest border-outline-variant'
                  }`}
                >
                  <Icon size={28} color={selected ? '#ffffff' : '#1b1b1d'} />
                  <Text
                    className={`mt-2 font-sans-sb text-body-md ${
                      selected ? 'text-primary-on' : 'text-surface-on'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View className="mt-auto pt-6">
          <Button
            label="Next"
            disabled={!type}
            onPress={() => router.push('/(auth)/vendor-onboard/step-2-details')}
          />
        </View>
      </View>
    </Screen>
  );
}
