import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
  View,
} from 'react-native';
import { auth } from '@/constants/authTheme';

type Variant = 'gold' | 'navy';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Icon rendered to the right of the label. */
  iconRight?: ReactNode;
  style?: ViewStyle;
}

export function AuthButton({
  label,
  onPress,
  variant = 'gold',
  disabled,
  loading,
  iconRight,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const isGold = variant === 'gold';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[isGold ? styles.gold : styles.navy, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={isGold ? auth.navy : '#ffffff'} size="small" />
      ) : (
        <View style={styles.row}>
          <Text style={isGold ? styles.goldText : styles.navyText}>{label}</Text>
          {iconRight}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gold: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#cba72f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#cba72f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  navy: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#131b2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#131b2e',
  },
  navyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
    color: '#ffffff',
  },
});
