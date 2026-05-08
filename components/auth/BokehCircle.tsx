import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Reanimated from 'react-native-reanimated';

export type BokehConfig = {
  size: number;
  /** Center x position */
  cx: number;
  /** Center y position */
  cy: number;
  color: string;
  delay: number;
};

export function BokehCircle({ size, cx, cy, color, delay }: BokehConfig) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    // Pulse opacity
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800 }),
          withTiming(0.25, { duration: 2800 }),
        ),
        -1,
        true,
      ),
    );

    // Pulse scale
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 4000 }),
          withTiming(0.8, { duration: 4000 }),
        ),
        -1,
        true,
      ),
    );

    // Slow organic drift — each circle moves at a different phase
    const drift = size * 0.1;
    tx.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(drift, { duration: 5500 }),
          withTiming(-drift * 0.7, { duration: 6500 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(drift * 0.8, { duration: 7000 }),
          withTiming(-drift * 1.1, { duration: 5200 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateX: tx.value },
      { translateY: ty.value },
    ],
  }));

  return (
    <Reanimated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: cx - size / 2,
          top: cy - size / 2,
        },
        animStyle,
      ]}
    />
  );
}
