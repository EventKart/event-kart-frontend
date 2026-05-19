import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
  edges?: Edge[];
}

export function Screen({ children, scroll = false, padded = true, className = '', edges = ['top', 'bottom'] }: ScreenProps) {
  const inner = padded ? <View className="flex-1 px-5 py-4">{children}</View> : <>{children}</>;
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-bg ${className}`}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
