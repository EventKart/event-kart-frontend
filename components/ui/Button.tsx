import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-container active:opacity-90',
    text: 'text-primary-on',
  },
  gold: {
    container: 'bg-tertiary-container active:opacity-90',
    text: 'text-tertiary-on-container',
  },
  secondary: {
    container: 'bg-surface-container-lowest border border-outline-variant active:bg-surface-container-low',
    text: 'text-surface-on',
  },
  ghost: {
    container: 'bg-transparent active:bg-surface-container-low',
    text: 'text-surface-on',
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  iconRight,
  fullWidth = true,
  className = '',
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-lg px-6 h-12 ${
        fullWidth ? 'w-full' : ''
      } ${styles.container} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#1b1b1d'} size="small" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className={`${styles.text} font-sans-sb text-button uppercase`}>{label}</Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}
