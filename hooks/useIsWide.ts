import { Platform, useWindowDimensions } from 'react-native';

export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= 768;
}
