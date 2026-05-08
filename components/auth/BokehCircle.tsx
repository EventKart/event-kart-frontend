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

  useEffect(() => {
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
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
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
