import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Mail, MapPin, Phone, Share2, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useVendor } from '@/hooks/useVendors';
import { VENDOR_TYPE_META } from '@/constants/vendor';

export default function VendorDetailScreen() {
  const router = useRouter();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const { vendor, loading } = useVendor(vendorId);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#131b2e" />
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="font-serif-bold text-h3 text-surface-on">Vendor not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-sans-sb text-body-md text-tertiary-on-container">Back to search</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const meta = VENDOR_TYPE_META[vendor.type];
  const detailRows = detailRowsFor(vendor);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="h-72">
          <Image source={{ uri: meta.hero }} className="w-full h-full" resizeMode="cover" />
          <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0 px-5">
            <View className="flex-row justify-between">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest/90"
              >
                <ArrowLeft size={20} color="#1b1b1d" />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest/90">
                  <Share2 size={18} color="#1b1b1d" />
                </Pressable>
                <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest/90">
                  <Heart size={18} color="#1b1b1d" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View className="px-5 -mt-8">
          <View className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40">
            <View className="flex-row gap-2 mb-3">
              <Badge label={meta.label} tone="gold" />
              <Badge label={vendor.state} tone="navy" />
            </View>
            <Text className="font-serif-bold text-h2 text-surface-on">{vendor.name}</Text>
            <View className="flex-row items-center gap-3 mt-2">
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#735c00" fill="#735c00" />
                <Text className="font-sans-sb text-body-sm text-surface-on">4.8</Text>
                <Text className="font-sans text-body-sm text-surface-on-variant">(126)</Text>
              </View>
              <Text className="text-surface-on-variant">·</Text>
              <View className="flex-row items-center gap-1">
                <MapPin size={14} color="#76777d" />
                <Text className="font-sans text-body-sm text-surface-on-variant">
                  {vendor.address ?? 'Bengaluru, India'}
                </Text>
              </View>
            </View>
          </View>

          <SectionTitle>About</SectionTitle>
          <Text className="font-sans text-body-md text-surface-on leading-6">
            {meta.label}s with a refined eye for celebration. EventKart-verified and trusted by
            couples across India for elegant, unforgettable experiences.
          </Text>

          <SectionTitle>Specialty</SectionTitle>
          <View className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 gap-3">
            {detailRows.length === 0 ? (
              <Text className="font-sans text-body-sm text-surface-on-variant">
                Details available on request.
              </Text>
            ) : (
              detailRows.map((row) => (
                <View key={row.label} className="flex-row items-center justify-between">
                  <Text className="font-sans text-body-sm text-surface-on-variant">{row.label}</Text>
                  <Text className="font-sans-sb text-body-sm text-surface-on text-right flex-1 ml-3">
                    {row.value}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Service Packages */}
          <SectionTitle>Service Packages</SectionTitle>
          <View className="gap-3">
            {/* Essential Package */}
            <View className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5">
              <Text className="font-serif-bold text-h3 text-surface-on">The Essential</Text>
              <Text className="font-sans-sb text-body-lg text-surface-on-variant mt-1">₹ on request</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant mt-2">
                Perfect for intimate gatherings and focused coverage of the main events.
              </Text>
              <View className="gap-2 mt-3">
                {['6 hours of continuous coverage', '1 Lead Professional', 'Digital gallery delivery'].map((f) => (
                  <View key={f} className="flex-row items-start gap-2">
                    <Text className="text-tertiary-container mt-0.5">✓</Text>
                    <Text className="font-sans text-body-sm text-surface-on-variant flex-1">{f}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-4 border border-outline py-2.5 rounded items-center">
                <Text className="font-sans-sb text-button text-surface-on uppercase tracking-wide">
                  Select Package
                </Text>
              </View>
            </View>
            {/* Signature Package - highlighted */}
            <View className="bg-primary-container rounded-xl p-5 overflow-hidden">
              <View className="absolute top-0 right-0 bg-tertiary-container px-3 py-1 rounded-bl-xl">
                <Text className="font-sans-md text-label-md text-tertiary-on-container uppercase tracking-wider">
                  Most Popular
                </Text>
              </View>
              <Text className="font-serif-bold text-h3 text-white mt-4">The Signature</Text>
              <Text className="font-sans-sb text-body-lg text-primary-container/70 mt-1" style={{ color: '#bec6e0' }}>
                ₹ on request
              </Text>
              <Text className="font-sans text-body-sm text-primary-on-container mt-2" style={{ color: '#7c839b' }}>
                Comprehensive coverage ensuring every detail and emotion is captured.
              </Text>
              <View className="gap-2 mt-3">
                {['10 hours of continuous coverage', '2 Professional team members', 'Digital gallery (600+ deliverables)', 'Complimentary consultation'].map((f) => (
                  <View key={f} className="flex-row items-start gap-2">
                    <Text style={{ color: '#ffe088', marginTop: 2 }}>✓</Text>
                    <Text className="font-sans text-body-sm flex-1" style={{ color: '#7c839b' }}>{f}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-4 bg-white py-2.5 rounded items-center">
                <Text className="font-sans-sb text-button text-primary-container uppercase tracking-wide">
                  Select Package
                </Text>
              </View>
            </View>
          </View>

          <SectionTitle>Contact</SectionTitle>
          <View className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 gap-4">
            <View className="flex-row items-center gap-3">
              <Phone size={16} color="#735c00" />
              <Text className="font-sans text-body-md text-surface-on">{vendor.contactNumber}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Mail size={16} color="#735c00" />
              <Text className="font-sans text-body-md text-surface-on">{vendor.email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 inset-x-0 bg-surface-container-lowest border-t border-outline-variant">
        <View className="flex-row items-center px-5 py-3 gap-3">
          <View className="flex-1">
            <Text className="font-sans text-label-md text-surface-on-variant">Starting from</Text>
            <Text className="font-serif-bold text-h3 text-surface-on">₹ on request</Text>
          </View>
          <View className="flex-1">
            <Button label="Request Booking" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-serif-bold text-h3 text-surface-on mt-6 mb-3">{children}</Text>
  );
}

function detailRowsFor(v: ReturnType<typeof useVendor>['vendor']) {
  if (!v) return [];
  const rows: Array<{ label: string; value: string }> = [];
  switch (v.type) {
    case 'VENUE':
      if (v.capacity) rows.push({ label: 'Capacity', value: `${v.capacity} guests` });
      if (v.address) rows.push({ label: 'Address', value: v.address });
      rows.push({ label: 'Parking', value: v.hasParking ? 'Available' : 'Not available' });
      break;
    case 'CATERER':
      if (v.cuisines?.length) rows.push({ label: 'Cuisines', value: v.cuisines.join(', ') });
      rows.push({ label: 'Cutlery included', value: v.providesCutlery ? 'Yes' : 'No' });
      break;
    case 'DECORATOR':
      if (v.themes?.length) rows.push({ label: 'Themes', value: v.themes.join(', ') });
      rows.push({ label: 'Lighting', value: v.providesLighting ? 'Provided' : 'Not provided' });
      break;
    case 'PRIEST':
      if (v.languages?.length) rows.push({ label: 'Languages', value: v.languages.join(', ') });
      if (v.religion) rows.push({ label: 'Religion', value: v.religion });
      break;
    case 'PHOTOGRAPHER':
      rows.push({ label: 'Drone shoot', value: v.providesDroneShoot ? 'Yes' : 'No' });
      rows.push({ label: 'Videography', value: v.providesVideography ? 'Yes' : 'No' });
      break;
    case 'BAND':
      if (v.numberOfMembers) rows.push({ label: 'Members', value: `${v.numberOfMembers}` });
      if (v.instruments?.length) rows.push({ label: 'Instruments', value: v.instruments.join(', ') });
      break;
  }
  return rows;
}
