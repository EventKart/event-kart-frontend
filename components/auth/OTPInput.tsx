import { useEffect, useRef, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export function OTPInput({ value, onChange, length = 6, autoFocus = true }: OTPInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);

  // Internal positional state — fixes the shift bug when digits are deleted
  const [slots, setSlots] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => value[i] ?? ''),
  );

  // Sync external value (e.g., autofill from devOtp) into slots
  useEffect(() => {
    const expected = Array.from({ length }, (_, i) => value[i] ?? '');
    setSlots((prev) => (prev.join('') === expected.join('') ? prev : expected));
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string[]) => {
    setSlots(next);
    onChange(next.join(''));
  };

  const handleChange = (idx: number, text: string) => {
    const digits = text.replace(/\D/g, '');

    // Pasted multiple digits — distribute starting at idx
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

    // Single digit or empty (backspace clear)
    const ch = digits.slice(-1);
    const next = [...slots];
    next[idx] = ch;
    commit(next);
    if (ch && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  return (
    <View className="flex-row justify-between gap-2">
      {slots.map((char, idx) => (
        <TextInput
          key={idx}
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
          // Allow paste on web (multiple chars accepted, then handleChange distributes)
          maxLength={Platform.OS === 'web' ? undefined : 1}
          className={`w-12 h-14 rounded-lg text-center font-sans-sb text-h3 text-surface-on bg-surface-container-lowest border ${
            char ? 'border-tertiary-container' : 'border-outline-variant'
          }`}
        />
      ))}
    </View>
  );
}
