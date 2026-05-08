import { StyleSheet } from 'react-native';

/** Core palette tokens for auth screens. */
export const auth = {
  darkBg: '#0b1020',
  gold: '#cba72f',
  navy: '#131b2e',
  fontSerif: 'NotoSerif_700Bold',
  fontSemiBold: 'Inter_600SemiBold',
  fontRegular: 'Inter_400Regular',
} as const;

/** Rgba helpers for bokeh circles. Keeps screens readable: `bokeh.gold(0.22)`. */
export const bokeh = {
  gold: (a: number) => `rgba(203,167,47,${a})`,
  navy: (a: number) => `rgba(30,58,110,${a})`,
  deep: (a: number) => `rgba(19,27,46,${a})`,
  purple: (a: number) => `rgba(80,60,160,${a})`,
  blue: (a: number) => `rgba(60,80,200,${a})`,
} as const;

/**
 * Shared StyleSheet atoms for auth screens.
 * Use in arrays: `style={[authStyles.darkCard, localStyle]}`
 */
export const authStyles = StyleSheet.create({
  // ── Cards ────────────────────────────────────────────────────────────────
  darkCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(11,16,34,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(203,167,47,0.18)',
    shadowColor: '#cba72f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 14,
  },
  lightCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },

  // ── Web centered column ───────────────────────────────────────────────────
  webCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 32,
  },
});
