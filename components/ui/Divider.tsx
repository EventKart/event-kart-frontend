import { Text, View } from 'react-native';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center gap-3 ${className}`}>
        <View className="flex-1 h-px bg-outline-variant" />
        <Text className="font-sans text-body-sm text-surface-on-variant">{label}</Text>
        <View className="flex-1 h-px bg-outline-variant" />
      </View>
    );
  }
  return <View className={`h-px bg-outline-variant ${className}`} />;
}
