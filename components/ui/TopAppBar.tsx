import { Platform, StyleSheet, Text, View } from 'react-native';

interface TopAppBarProps {
  title?: string;
  variant?: 'light' | 'dark';
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function TopAppBar({ title = 'EventKart', variant = 'light', left, right }: TopAppBarProps) {
  const isDark = variant === 'dark';
  return (
    <View style={[styles.bar, isDark ? styles.barDark : styles.barLight]}>
      <View style={styles.slot}>{left ?? null}</View>
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>{title}</Text>
      <View style={[styles.slot, styles.slotRight]}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e4e2e4',
  },
  barDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#1e293b',
  },
  title: {
    fontFamily: Platform.select({ ios: 'NotoSerif-Bold', default: 'NotoSerif_700Bold' }),
    fontSize: 22,
    letterSpacing: -0.3,
  },
  titleLight: {
    color: '#131b2e',
  },
  titleDark: {
    color: '#ffffff',
  },
  slot: {
    width: 40,
    alignItems: 'flex-start',
  },
  slotRight: {
    alignItems: 'flex-end',
  },
});