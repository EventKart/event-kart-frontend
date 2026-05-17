import { Stack, useSegments } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = ['step-1-type', 'step-2-details', 'step-3-documents'] as const;

export default function VendorOnboardLayout() {
  const segments = useSegments();
  const last = segments[segments.length - 1];
  const currentIndex = Math.max(STEPS.indexOf(last as (typeof STEPS)[number]), 0);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="px-6 pt-2 pb-5">
        <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
          Vendor Setup · Step {currentIndex + 1} of {STEPS.length}
        </Text>
        <View className="h-1 w-full bg-surface-container-high rounded-full mt-2 overflow-hidden">
          <View
            style={{ width: `${progress}%` }}
            className="h-full bg-tertiary-container rounded-full"
          />
        </View>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fcf8fa' },
        }}
      />
    </SafeAreaView>
  );
}
