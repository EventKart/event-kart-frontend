import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (val: string) => void;
  countryCode?: string;
  onCountryPress?: () => void;
}

export function PhoneInput({
  value,
  onChangeText,
  countryCode = '+91',
  onCountryPress,
}: PhoneInputProps) {
  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={onCountryPress}
        className="flex-row items-center justify-center bg-surface-container-lowest border border-outline-variant rounded-lg px-3 h-12 gap-1"
      >
        <Text className="font-sans-md text-body-md text-surface-on">{countryCode}</Text>
        <ChevronDown size={16} color="#45464d" />
      </Pressable>
      <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 h-12 justify-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="98765 43210"
          placeholderTextColor="#76777d"
          keyboardType="phone-pad"
          maxLength={15}
          className="font-sans text-body-md text-surface-on"
        />
      </View>
    </View>
  );
}
