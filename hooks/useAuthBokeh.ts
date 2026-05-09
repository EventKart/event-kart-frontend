import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { type BokehConfig } from '@/components/auth/BokehCircle';
import { bokeh } from '@/constants/authTheme';

type Screen = 'signIn' | 'otpVerify' | 'completeProfile' | 'splash';

/**
 * Returns stable, memoized bokeh circle configs for each auth screen.
 * Calling this hook is all a screen needs — no useWindowDimensions or
 * useMemo boilerplate required.
 *
 * `web` uses viewport-proportional sizing.
 * `mob` uses fixed pixel sizes with viewport-relative positions.
 * `splash` is the same proportional array for all platforms.
 */
export function useAuthBokeh(screen: Screen): { web: BokehConfig[]; mob: BokehConfig[] } {
  const { width: w, height: h } = useWindowDimensions();

  return useMemo(() => {
    switch (screen) {
      case 'signIn':
        return {
          web: [
            { size: w * 0.32, cx: w * 0.08, cy: h * 0.15, color: bokeh.gold(0.22),  delay: 0 },
            { size: w * 0.26, cx: w * 0.92, cy: h * 0.58, color: bokeh.gold(0.16),  delay: 700 },
            { size: w * 0.20, cx: w * 0.55, cy: h * 0.07, color: bokeh.navy(0.45),  delay: 300 },
            { size: w * 0.28, cx: w * 0.28, cy: h * 0.76, color: bokeh.deep(0.88),  delay: 600 },
            { size: w * 0.18, cx: w * 0.72, cy: h * 0.84, color: bokeh.gold(0.14),  delay: 1000 },
          ],
          mob: [
            { size: 340, cx: w * 0.06 + 170, cy: 160,       color: bokeh.gold(0.22), delay: 0 },
            { size: 240, cx: w * 0.88 + 120, cy: 300,       color: bokeh.gold(0.16), delay: 800 },
            { size: 180, cx: w * 0.5,        cy: 60,        color: bokeh.navy(0.5),  delay: 300 },
            { size: 300, cx: w * 0.1 + 150,  cy: h * 0.65,  color: bokeh.deep(0.9),  delay: 600 },
            { size: 220, cx: w * 0.8 + 110,  cy: h * 0.45,  color: bokeh.gold(0.12), delay: 1200 },
            { size: 140, cx: w * 0.3,        cy: h * 0.8,   color: bokeh.gold(0.18), delay: 500 },
          ],
        };

      case 'otpVerify':
        return {
          web: [
            { size: w * 0.30, cx: w * 0.9,  cy: h * 0.15, color: bokeh.gold(0.2),  delay: 200 },
            { size: w * 0.24, cx: w * 0.1,  cy: h * 0.6,  color: bokeh.gold(0.15), delay: 900 },
            { size: w * 0.18, cx: w * 0.5,  cy: h * 0.06, color: bokeh.navy(0.45), delay: 400 },
            { size: w * 0.26, cx: w * 0.72, cy: h * 0.78, color: bokeh.deep(0.85), delay: 700 },
            { size: w * 0.16, cx: w * 0.25, cy: h * 0.88, color: bokeh.gold(0.13), delay: 1100 },
          ],
          mob: [
            { size: 280, cx: w * 0.9,  cy: 120,        color: bokeh.gold(0.18), delay: 200 },
            { size: 200, cx: w * 0.1,  cy: 280,        color: bokeh.gold(0.14), delay: 1000 },
            { size: 160, cx: w * 0.5,  cy: h * 0.15,   color: bokeh.navy(0.45), delay: 500 },
            { size: 320, cx: w * 0.85, cy: h * 0.6,    color: bokeh.deep(0.85), delay: 700 },
            { size: 180, cx: w * 0.2,  cy: h * 0.7,    color: bokeh.gold(0.15), delay: 300 },
          ],
        };

      case 'completeProfile':
        return {
          web: [
            { size: w * 0.28, cx: w * 0.19, cy: h * 0.24, color: bokeh.gold(0.2),    delay: 0 },
            { size: w * 0.22, cx: w * 0.83, cy: h * 0.16, color: bokeh.purple(0.25), delay: 600 },
            { size: w * 0.18, cx: w * 0.64, cy: h * 0.69, color: bokeh.gold(0.15),   delay: 1200 },
            { size: w * 0.24, cx: w * 0.22, cy: h * 0.77, color: bokeh.blue(0.2),    delay: 400 },
            { size: w * 0.16, cx: w * 0.9,  cy: h * 0.53, color: bokeh.gold(0.18),   delay: 900 },
          ],
          mob: [
            { size: 260, cx: 70,  cy: 210, color: bokeh.gold(0.22),   delay: 0 },
            { size: 200, cx: 320, cy: 260, color: bokeh.purple(0.28), delay: 700 },
            { size: 180, cx: 230, cy: 510, color: bokeh.gold(0.18),   delay: 1400 },
            { size: 220, cx: 70,  cy: 670, color: bokeh.blue(0.22),   delay: 400 },
            { size: 160, cx: 340, cy: 700, color: bokeh.gold(0.15),   delay: 1000 },
          ],
        };

      case 'splash': {
        // Proportional sizing works for all platforms — return the same set for both.
        const circles: BokehConfig[] = [
          { size: w * 0.55, cx: w * 0.08, cy: h * 0.12, color: bokeh.gold(0.2),    delay: 0 },
          { size: w * 0.42, cx: w * 0.92, cy: h * 0.55, color: bokeh.purple(0.22), delay: 500 },
          { size: w * 0.35, cx: w * 0.5,  cy: h * 0.04, color: bokeh.navy(0.4),    delay: 300 },
          { size: w * 0.48, cx: w * 0.15, cy: h * 0.78, color: bokeh.deep(0.85),   delay: 700 },
          { size: w * 0.30, cx: w * 0.82, cy: h * 0.82, color: bokeh.gold(0.15),   delay: 1000 },
        ];
        return { web: circles, mob: circles };
      }
    }
  }, [w, h, screen]);
}
