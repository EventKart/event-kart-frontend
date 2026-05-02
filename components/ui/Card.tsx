import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  padded?: boolean;
}

export function Card({ children, onPress, className = '', padded = true }: CardProps) {
  const styles = `rounded-xl bg-surface-container-lowest border border-outline-variant/40 ${
    padded ? 'p-5' : ''
  } ${className}`;
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${styles} active:opacity-90`}>
        {children}
      </Pressable>
    );
  }
  return <View className={styles}>{children}</View>;
}
