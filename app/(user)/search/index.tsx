import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/ui/Avatar';
import { WebTopAppBar } from '@/components/ui/WebTopAppBar';
import { EventSearchBar } from '@/components/ui/EventSearchBar';
import { TypeFilter } from '@/components/vendor/TypeFilter';
import { VendorCard } from '@/components/vendor/VendorCard';
import { VendorCardSkeleton } from '@/components/vendor/VendorCardSkeleton';
import { useIsWide } from '@/hooks/useIsWide';
import { useSearchVendors } from '@/hooks/useVendors';
import { useAuthStore } from '@/store/authStore';
import type { VendorType } from '@/types';

const HORIZONTAL_PADDING = 16;
const COL_GAP = 12;
const ROW_GAP = 16;

export default function SearchScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [query, setQuery] = useState('');
  const [type, setType] = useState<VendorType | null>(null);

  const isWide = useIsWide();
  const { width } = useWindowDimensions();
  const { vendors, loading, loadingMore, hasMore, loadMore } = useSearchVendors(query, type);

  const cols = isWide ? 3 : 1;
  const cardWidth =
    (width - HORIZONTAL_PADDING * 2 - COL_GAP * (cols - 1)) / cols;

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Member';

  return (
    <SafeAreaView edges={isWide ? [] : ['top']} className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {isWide ? (
        <WebTopAppBar />
      ) : (
        <View
          className="bg-white border-b border-outline-variant/40 px-5 py-3 flex-row items-center justify-between"
          style={{ shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 }}
        >
          <Text style={styles.headerTitle}>
            EventKart
          </Text>
          <Avatar name={fullName} size={34} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Search Bar */}
        <EventSearchBar onQueryChange={setQuery} />

        {/* Category Chips */}
        <View className="pb-5 pt-1">
          <TypeFilter value={type} onChange={setType} />
        </View>

        {/* Vendor Grid */}
        <View className="px-4">
          {/*<View className="flex-row items-center justify-between mb-4">
            {vendors.length > 0 && !loading ? (
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  color: '#76777d',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {vendors.length} found
              </Text>
            ) : null}
          </View>*/}

          {loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP }}>
              {Array.from({ length: cols === 1 ? 3 : 6 }).map((_, i) => (
                <View key={i} style={{ width: cardWidth }}>
                  <VendorCardSkeleton />
                </View>
              ))}
            </View>
          ) : vendors.length === 0 ? (
            <View className="py-16 items-center gap-2">
              <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 20, color: '#45464d' }}>
                No vendors found
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: '#76777d',
                  textAlign: 'center',
                }}
              >
                {query.trim()
                  ? `No results for "${query}" — try a different search.`
                  : 'No vendors match the selected filter.'}
              </Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: COL_GAP, rowGap: ROW_GAP }}>
                {vendors.map((item) => (
                  <View key={item.id} style={{ width: cardWidth }}>
                    <VendorCard
                      vendor={item}
                      onPress={() => router.push(`/(user)/search/${item.id}`)}
                    />
                  </View>
                ))}
              </View>

              {hasMore ? (
                <Pressable
                  onPress={loadMore}
                  disabled={loadingMore}
                  style={{
                    height: 46,
                    borderRadius: 23,
                    borderWidth: 1,
                    borderColor: '#c6c6cd',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                  }}
                  className="active:bg-surface-container-low"
                >
                  {loadingMore ? (
                    <ActivityIndicator color="#131b2e" size="small" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 13,
                        color: '#131b2e',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                      }}
                    >
                      Load More
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    headerTitle: {
      fontSize: 30,
      fontWeight: '600',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: Platform.OS === 'ios' ? 'Noto Serif' : 'serif'
    }
});