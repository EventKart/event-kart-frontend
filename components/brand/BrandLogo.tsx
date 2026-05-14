import { StyleSheet, Text, View } from 'react-native';
import { Ticket } from 'lucide-react-native';
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { auth } from '@/constants/authTheme';

type Props = {
  color?: string;
  subtitleColor?: string;
  showTagline?: boolean;
  size?: 'default' | 'large';
};

export function BrandLogo({
  color = auth.gold,
  subtitleColor,
  showTagline = true,
  size = 'default',
}: Props) {
  const isLarge = size === 'large';
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <View style={isLarge ? styles.iconWrapLarge : styles.iconWrap}>
          <Ticket size={isLarge ? 46 : 34} color={auth.gold} strokeWidth={1.5} />
        </View>
        <Text style={[styles.wordmark, isLarge && styles.wordmarkLarge, { color }]}>EventKart</Text>
      </View>
      {showTagline && (
        <Reanimated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(180)}>
          <Text style={[styles.tagline, isLarge && styles.taglineLarge, subtitleColor ? { color: subtitleColor } : undefined]}>
            Seamlessly discover, book & manage events
          </Text>
        </Reanimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { marginBottom: 8 },
  iconWrapLarge: {},
  wordmark: {
    fontSize: 38,
    fontFamily: auth.fontSerif,
    letterSpacing: 1,
    lineHeight: 38,
    includeFontPadding: false,
  },
  wordmarkLarge: {
    fontSize: 52,
    lineHeight: 52,
  },
  tagline: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: 'rgba(19,27,46,0.55)',
  },
  taglineLarge: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
