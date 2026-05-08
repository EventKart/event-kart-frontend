import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { BokehCircle, type BokehConfig } from './BokehCircle';
import { auth } from '@/constants/authTheme';

interface Props {
  circles: BokehConfig[];
  children: ReactNode;
  /** Use position:fixed full-viewport layout for web. Default: flex:1 for mobile. */
  variant?: 'mobile' | 'web';
}

/**
 * Wrapped in memo — pass a stable `circles` ref (useMemo in the screen) to prevent
 * bokeh circles from remounting on every keystroke.
 */
export const AuthBackground = memo(function AuthBackground({
  circles,
  children,
  variant = 'mobile',
}: Props) {
  return (
    <View style={variant === 'web' ? styles.web : styles.mobile}>
      {circles.map((c, i) => (
        <BokehCircle key={i} {...c} />
      ))}
      <BlurView
        intensity={variant === 'web' ? 60 : 55}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  mobile: {
    flex: 1,
    backgroundColor: auth.darkBg,
  },
  web: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: auth.darkBg,
    overflow: 'hidden',
  },
});
