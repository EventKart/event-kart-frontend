import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Search, Star, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { WebTopAppBar } from '@/components/ui/WebTopAppBar';
import { TypeFilter } from '@/components/vendor/TypeFilter';
import { VendorCard } from '@/components/vendor/VendorCard';
import { VENDOR_TYPE_META } from '@/constants/vendor';
import { useIsWide } from '@/hooks/useIsWide';
import { useSearchVendors } from '@/hooks/useVendors';
import { useAuthStore } from '@/store/authStore';
import type { VendorType } from '@/types';

// Static featured items (showcase curated content)
const FEATURED_MAIN = {
  heroUri: VENDOR_TYPE_META.VENUE.hero,
  badge: 'Premium Venue',
  name: 'The Sterling Atrium',
  rating: '4.9',
  reviews: '124',
  location: 'Bengaluru, India',
};
const FEATURED_SECONDARY = [
  {
    thumbUri: VENDOR_TYPE_META.CATERER.thumb,
    name: 'Culinary Canvas',
    subtitle: 'Artisan Catering',
  },
  {
    thumbUri: VENDOR_TYPE_META.PHOTOGRAPHER.thumb,
    name: 'Lumina Studios',
    subtitle: 'Fine Art Photography',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<VendorType | null>(null);

  // 400ms debounce before firing search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const isWide = useIsWide();
  const { vendors, loading, loadingMore, hasMore, loadMore } = useSearchVendors(
    debouncedQuery,
    type
  );

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Member';

  return (
    <SafeAreaView edges={isWide ? [] : ['top']} className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {/* ── Web TopAppBar (wide screens) / Mobile Header ── */}
      {isWide ? (
        <WebTopAppBar />
      ) : (
        <View
          className="bg-white border-b border-outline-variant/40 px-5 py-3 flex-row items-center justify-between"
          style={{ shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 }}
        >
          <Text
            style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 24, color: '#131b2e', letterSpacing: -0.3 }}
          >
            EventKart
          </Text>
          <Avatar name={fullName} size={34} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Search Bar ── */}
        <View className="px-4 pt-4 pb-2">
          <View
            className="flex-row items-center bg-surface-container-low border border-outline-variant rounded-full px-4 gap-3"
            style={{ height: 50 }}
          >
            <Search size={18} color="#76777d" />
            <TextInput
              style={{
                flex: 1,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: '#1b1b1d',
              }}
              placeholder="Search vendors, venues, and services..."
              placeholderTextColor="#76777d"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="never"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <X size={16} color="#76777d" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── Category Chips ── */}
        <View className="pb-5 pt-1">
          <TypeFilter value={type} onChange={setType} />
        </View>

        {/* ── Featured Experiences ── */}
        <View className="px-4 mb-6">
          <Text
            style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 28, color: '#131b2e', marginBottom: 14 }}
          >
            Featured Experiences
          </Text>

          {/* Main card */}
          <Pressable
            style={{ height: 260, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
            className="active:opacity-90"
          >
            <Image
              source={{ uri: FEATURED_MAIN.heroUri }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {/* Scrim */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.18)' }} />
            {/* Bottom overlay */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 150,
                backgroundColor: 'rgba(0,0,0,0.65)',
              }}
            />
            {/* Heart button */}
            <Pressable
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
              onPress={(e) => e.stopPropagation()}
              hitSlop={8}
            >
              <Heart size={18} color="#ffffff" />
            </Pressable>
            {/* Content */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
              <Badge label={FEATURED_MAIN.badge} tone="gold" />
              <Text
                style={{
                  fontFamily: 'NotoSerif_700Bold',
                  fontSize: 28,
                  color: '#ffffff',
                  lineHeight: 34,
                  marginTop: 8,
                }}
                numberOfLines={2}
              >
                {FEATURED_MAIN.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star size={13} color="#ffe088" fill="#ffe088" />
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                    {FEATURED_MAIN.rating} ({FEATURED_MAIN.reviews} reviews)
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MapPin size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    {FEATURED_MAIN.location}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Two secondary cards */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {FEATURED_SECONDARY.map((item) => (
              <Pressable
                key={item.name}
                style={{ flex: 1, height: 155, borderRadius: 12, overflow: 'hidden' }}
                className="active:opacity-90"
              >
                <Image
                  source={{ uri: item.thumbUri }}
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.28)' }} />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 85,
                    backgroundColor: 'rgba(0,0,0,0.68)',
                  }}
                />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 }}>
                  <Text
                    style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 15, color: '#ffffff' }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.80)',
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Curated for You ── */}
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 28, color: '#131b2e' }}
            >
              Curated for You
            </Text>
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
                {vendors.length} vendors
              </Text>
            ) : null}
          </View>

          {loading ? (
            <View className="py-16 items-center gap-3">
              <ActivityIndicator color="#131b2e" size="large" />
              <Text
                style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#76777d' }}
              >
                Finding vendors…
              </Text>
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
              {vendors.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <VendorCard
                    vendor={item}
                    onPress={() => router.push(`/(user)/search/${item.id}`)}
                  />
                </View>
              ))}

              {/* Load More */}
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
                    marginTop: 4,
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
                      Load More Vendors
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
}
