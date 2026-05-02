import { ImageBackground, Pressable, Text, View } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { VENDOR_TYPE_META } from '@/constants/vendor';
import type { Vendor } from '@/types';

interface VendorCardProps {
  vendor: Vendor;
  onPress?: () => void;
  variant?: 'feature' | 'list';
}

export function VendorCard({ vendor, onPress, variant = 'list' }: VendorCardProps) {
  const meta = VENDOR_TYPE_META[vendor.type];
  const subtitle = subtitleFor(vendor);

  if (variant === 'feature') {
    return (
      <Pressable onPress={onPress} className="rounded-2xl overflow-hidden h-56">
        <ImageBackground source={{ uri: meta.hero }} className="flex-1" resizeMode="cover">
          <View className="flex-1 bg-black/25 p-4 justify-between">
            <View className="self-start">
              <Badge label={meta.label.toUpperCase()} tone="gold" />
            </View>
            <View>
              <Text className="font-serif-bold text-h3 text-primary-on">{vendor.name}</Text>
              {subtitle ? (
                <Text className="font-sans text-body-sm text-primary-on/85 mt-1">{subtitle}</Text>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden"
    >
      <ImageBackground source={{ uri: meta.thumb }} className="h-40" resizeMode="cover">
        <View className="flex-1 p-3 justify-between">
          <View className="flex-row justify-between">
            <Badge label={meta.label} tone="gold" />
            <View className="flex-row items-center bg-surface-container-lowest/90 rounded-full px-2 py-1 gap-1">
              <Star size={12} color="#735c00" fill="#735c00" />
              <Text className="font-sans-sb text-label-md text-surface-on">4.8</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
      <View className="p-4 gap-1">
        <Text className="font-serif-bold text-body-lg text-surface-on">{vendor.name}</Text>
        {subtitle ? (
          <Text className="font-sans text-body-sm text-surface-on-variant" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-1 mt-1">
          <MapPin size={14} color="#76777d" />
          <Text className="font-sans text-body-sm text-surface-on-variant">
            {vendor.address ?? 'Bengaluru, India'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function subtitleFor(v: Vendor): string {
  switch (v.type) {
    case 'VENUE':
      return v.capacity ? `Hosts up to ${v.capacity} guests` : 'Premium venue';
    case 'CATERER':
      return v.cuisines?.slice(0, 3).join(' · ') ?? 'Multi-cuisine catering';
    case 'DECORATOR':
      return v.themes?.slice(0, 3).join(' · ') ?? 'Elegant decor';
    case 'PHOTOGRAPHER':
      return [v.providesDroneShoot && 'Drone', v.providesVideography && 'Video']
        .filter(Boolean)
        .join(' · ') || 'Wedding photography';
    case 'PRIEST':
      return v.languages?.slice(0, 3).join(' · ') ?? 'Vedic ceremonies';
    case 'BAND':
      return v.numberOfMembers ? `${v.numberOfMembers}-piece ensemble` : 'Live music';
    default:
      return '';
  }
}
