import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProfileCompletionProps {
  pct: number;
  size?: number;
  stroke?: number;
}

export function ProfileCompletion({ pct, size = 96, stroke = 8 }: ProfileCompletionProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="#eae7e9"
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="#cba72f"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="font-serif-bold text-h3 text-surface-on">{Math.round(pct)}%</Text>
        <Text className="font-sans-md text-label-md uppercase text-surface-on-variant">Ready</Text>
      </View>
    </View>
  );
}
