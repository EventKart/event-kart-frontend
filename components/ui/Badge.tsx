import { Text, View } from 'react-native';

type Tone = 'gold' | 'navy' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

const TONE_STYLES: Record<Tone, { container: string; text: string }> = {
  gold: { container: 'bg-tertiary-fixed', text: 'text-tertiary-on-container' },
  navy: { container: 'bg-primary-container', text: 'text-primary-on' },
  success: { container: 'bg-secondary-container', text: 'text-secondary-on-container' },
  warning: { container: 'bg-tertiary-fixed-dim', text: 'text-tertiary-on-container' },
  error: { container: 'bg-error-container', text: 'text-error-on-container' },
  neutral: { container: 'bg-surface-container-high', text: 'text-surface-on-variant' },
};

export function Badge({ label, tone = 'gold', className = '' }: BadgeProps) {
  const styles = TONE_STYLES[tone];
  return (
    <View className={`px-2.5 py-1 rounded-full ${styles.container} ${className}`}>
      <Text className={`font-sans-sb text-label-md ${styles.text}`}>{label}</Text>
    </View>
  );
}
