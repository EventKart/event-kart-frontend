import type { ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  helper,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  ...textInputProps
}: InputProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? (
        <Text className="text-surface-on-variant font-sans-md text-label-md uppercase tracking-wider">
          {label}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center bg-surface-container-lowest rounded-lg border ${
          error ? 'border-error' : 'border-outline-variant'
        } px-4 h-12`}
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor="#76777d"
          {...textInputProps}
          className="flex-1 font-sans text-body-md text-surface-on"
        />
        {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
      </View>
      {error ? (
        <Text className="text-error font-sans text-label-md">{error}</Text>
      ) : helper ? (
        <Text className="text-surface-on-variant font-sans text-label-md">{helper}</Text>
      ) : null}
    </View>
  );
}
