import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function ShimmerBox({ style }: { style?: object }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: '#e2e8f0', borderRadius: 8 }, animStyle, style]}
    />
  );
}

export function VendorCardSkeleton() {
  return (
    <View className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden">
      {/* Image */}
      <ShimmerBox style={{ height: 208, borderRadius: 0 }} />

      {/* Body */}
      <View className="p-5">
        {/* Name + rating chip */}
        <View className="flex-row items-center justify-between mb-3">
          <ShimmerBox style={{ height: 20, width: '58%', borderRadius: 6 }} />
          <ShimmerBox style={{ height: 26, width: 50, borderRadius: 8 }} />
        </View>

        {/* Subtitle lines */}
        <ShimmerBox style={{ height: 13, width: '80%', borderRadius: 6, marginBottom: 6 }} />
        <ShimmerBox style={{ height: 13, width: '60%', borderRadius: 6 }} />

        {/* Footer */}
        <View className="mt-4 pt-4 border-t border-outline-variant/30 flex-row items-center justify-between">
          <ShimmerBox style={{ height: 13, width: '45%', borderRadius: 6 }} />
          <ShimmerBox style={{ height: 22, width: 52, borderRadius: 99 }} />
        </View>
      </View>
    </View>
  );
}
