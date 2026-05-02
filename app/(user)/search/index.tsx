import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { TypeFilter } from '@/components/vendor/TypeFilter';
import { VendorCard } from '@/components/vendor/VendorCard';
import { useVendors } from '@/hooks/useVendors';
import type { VendorType } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<VendorType | null>(null);
  const { vendors, loading } = useVendors();

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (type && v.type !== type) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [vendors, type, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Screen padded={false}>
      <View className="px-5 pt-6 pb-4 gap-4">
        <View>
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
            Discover
          </Text>
          <Text className="font-serif-bold text-h2 text-surface-on mt-1">Curated for your celebration</Text>
        </View>
        <Input
          placeholder="Search venues, caterers, photographers…"
          value={query}
          onChangeText={setQuery}
          leftIcon={<SearchIcon size={18} color="#76777d" />}
        />
      </View>

      <TypeFilter value={type} onChange={setType} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#131b2e" />
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            featured ? (
              <View className="px-5 pb-4 pt-5">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-serif-bold text-h3 text-surface-on">Featured</Text>
                  <Text className="font-sans-md text-label-md uppercase text-tertiary-on-container">
                    Editor's pick
                  </Text>
                </View>
                <VendorCard
                  vendor={featured}
                  variant="feature"
                  onPress={() => router.push(`/(user)/search/${featured.id}`)}
                />
                <Text className="font-serif-bold text-h3 text-surface-on mt-6">Top vendors</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="px-5 pb-4">
              <VendorCard vendor={item} onPress={() => router.push(`/(user)/search/${item.id}`)} />
            </View>
          )}
          ListEmptyComponent={
            !featured ? (
              <View className="px-5 py-10 items-center">
                <Text className="font-sans text-body-md text-surface-on-variant">
                  No vendors match your filters yet.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </Screen>
  );
}
