import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, type ViewStyle, View } from 'react-native';
import { auth } from '@/constants/authTheme';

interface Props extends TextInputProps {
  label: string;
  theme: 'dark' | 'light';
  /** Style applied to the outer label+input wrapper (e.g. `flex: 1` for row layouts). */
  containerStyle?: ViewStyle;
}

export const AuthInput = forwardRef<TextInput, Props>(
  ({ label, theme, containerStyle, style, ...rest }, ref) => {
    const isDark = theme === 'dark';
    return (
      <View style={containerStyle}>
        <Text style={isDark ? styles.darkLabel : styles.lightLabel}>{label}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af'}
          selectionColor={auth.gold}
          style={[isDark ? styles.darkInput : styles.lightInput, style]}
          {...rest}
        />
      </View>
    );
  },
);
AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  darkLabel: {
    fontFamily: auth.fontSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(203,167,47,0.9)',
    marginBottom: 6,
  },
  lightLabel: {
    fontFamily: auth.fontSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 6,
  },
  darkInput: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    fontFamily: auth.fontRegular,
    fontSize: 15,
    color: '#ffffff',
  },
  lightInput: {
    height: 50,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    fontFamily: auth.fontRegular,
    fontSize: 15,
    color: '#1b1b1d',
  },
});
