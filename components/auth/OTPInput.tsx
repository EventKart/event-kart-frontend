import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { auth } from '@/constants/authTheme';

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** 'dark' = mobile glass card; 'light' = web white card. */
  theme: 'dark' | 'light';
  length?: number;
  autoFocus?: boolean;
}

export function OTPInput({ value, onChange, theme, length = 6, autoFocus = false }: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => value[i] ?? ''),
  );

  useEffect(() => {
    const expected = Array.from({ length }, (_, i) => value[i] ?? '');
    setSlots((prev) => (prev.join('') === expected.join('') ? prev : expected));
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputs.current[0]?.focus(), 100);
  }, []);

  const commit = (next: string[]) => {
    setSlots(next);
    onChange(next.join(''));
  };

  const handleChange = (idx: number, text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = [...slots];
      let pos = idx;
      for (const d of digits) {
        if (pos >= length) break;
        next[pos++] = d;
      }
      commit(next);
      inputs.current[Math.min(pos, length - 1)]?.focus();
      return;
    }
    const ch = digits.slice(-1);
    const next = [...slots];
    next[idx] = ch;
    commit(next);
    if (ch && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const isDark = theme === 'dark';
  const emptyBorder = isDark ? 'rgba(255,255,255,0.12)' : '#c6c6cd';
  const emptyBg = isDark ? 'rgba(255,255,255,0.06)' : '#f9f9f9';
  const filledBg = isDark ? 'rgba(203,167,47,0.08)' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1b1b1d';
  const sepColor = isDark ? 'rgba(255,255,255,0.2)' : '#c6c6cd';

  return (
    <View style={styles.row}>
      {slots.map((char, idx) => (
        <View key={idx} style={styles.cell}>
          <TextInput
            ref={(el) => {
              inputs.current[idx] = el;
            }}
            value={char}
            onChangeText={(t) => handleChange(idx, t)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !char && idx > 0) {
                inputs.current[idx - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={Platform.OS === 'web' ? undefined : 1}
            selectionColor={auth.gold}
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: char ? filledBg : emptyBg,
                borderWidth: char ? 1.5 : 1,
                borderColor: char ? auth.gold : emptyBorder,
              },
              Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined,
            ]}
          />
          {idx === 2 && <View style={[styles.sep, { backgroundColor: sepColor }]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    width: 46,
    height: 56,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    borderRadius: 10,
  },
  sep: {
    width: 12,
    height: 1.5,
    marginHorizontal: 2,
  },
});
