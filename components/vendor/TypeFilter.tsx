import { Pressable, ScrollView, Text } from 'react-native';

import { VENDOR_TYPE_META, VENDOR_TYPES } from '@/constants/vendor';
import type { VendorType } from '@/types';

interface TypeFilterProps {
  value: VendorType | null;
  onChange: (val: VendorType | null) => void;
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      <Chip label="All" active={value === null} onPress={() => onChange(null)} />
      {VENDOR_TYPES.map((t) => (
        <Chip
          key={t}
          label={VENDOR_TYPE_META[t].plural}
          active={value === t}
          onPress={() => onChange(t)}
        />
      ))}
    </ScrollView>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 h-9 items-center justify-center rounded-full border ${
        active
          ? 'bg-primary-container border-primary-container'
          : 'bg-surface-container-lowest border-outline-variant'
      }`}
    >
      <Text
        className={`font-sans-sb text-label-md ${
          active ? 'text-primary-on' : 'text-surface-on'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
