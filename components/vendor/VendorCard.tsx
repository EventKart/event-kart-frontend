import { ImageBackground, Pressable, Text, View } from 'react-native';
import { Heart, MapPin, Star } from 'lucide-react-native';

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

  // ── "Curated for You" card style ──
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden active:opacity-95"
    >
      {/* Card image */}
      <ImageBackground source={{ uri: meta.thumb }} className="h-52" resizeMode="cover">
        <View className="flex-1 p-3 flex-row items-start justify-between">
          {/* Vendor type badge — top left */}
          <View className="bg-surface-container-lowest/90 rounded-lg px-2.5 py-1 border border-outline-variant/30">
            <Text
              style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#131b2e' }}
            >
              {meta.label}
            </Text>
          </View>

          {/* Heart button — top right */}
          <Pressable
            className="w-8 h-8 bg-surface-container-lowest/80 rounded-full items-center justify-center border border-outline-variant/30"
            hitSlop={8}
            onPress={(e) => e.stopPropagation()}
          >
            <Heart size={15} color="#45464d" />
          </Pressable>
        </View>
      </ImageBackground>

      {/* Card body */}
      <View className="p-5">
        {/* Name + rating row */}
        <View className="flex-row items-start justify-between gap-2 mb-2">
          <Text
            className="flex-1 font-serif-bold text-h3 text-primary-container leading-tight"
            numberOfLines={1}
          >
            {vendor.name}
          </Text>
          <View className="flex-row items-center bg-surface-container px-2 py-1 rounded-lg gap-1 mt-1">
            <Star size={12} color="#735c00" fill="#735c00" />
            <Text
              style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1b1b1d' }}
            >
              4.8
            </Text>
          </View>
        </View>

        {/* Subtitle / description */}
        {subtitle ? (
          <Text
            className="font-sans text-body-sm text-surface-on-variant"
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}

        {/* Footer */}
        <View className="mt-4 pt-4 border-t border-outline-variant/30 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#76777d" />
            <Text className="font-sans text-body-sm text-surface-on-variant">
              {(vendor.attributes?.['address'] as string | undefined) ?? 'Bengaluru, India'}
            </Text>
          </View>
          <View
            className={`px-2 py-0.5 rounded-full ${
              vendor.state === 'ACTIVE'
                ? 'bg-tertiary-fixed'
                : 'bg-surface-container'
            }`}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 11,
                color: vendor.state === 'ACTIVE' ? '#4e3d00' : '#45464d',
              }}
            >
              {vendor.state === 'ACTIVE' ? 'Active' : vendor.state}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function subtitleFor(v: Vendor): string {
  const a = v.attributes ?? {};
  switch (v.type) {
    case 'VENUE': {
      const capacity = a['capacity'] as number | undefined;
      return capacity ? `Hosts up to ${capacity} guests` : 'Premium event venue';
    }
    case 'CATERER': {
      const cuisines = a['cuisines'] as string[] | undefined;
      return cuisines?.slice(0, 3).join(' · ') ?? 'Multi-cuisine catering';
    }
    case 'DECORATOR': {
      const themes = a['themes'] as string[] | undefined;
      return themes?.slice(0, 3).join(' · ') ?? 'Elegant event décor';
    }
    case 'PHOTOGRAPHER':
      return [a['providesDroneShoot'] && 'Drone shoot', a['providesVideography'] && 'Videography']
        .filter(Boolean)
        .join(' · ') || 'Wedding & event photography';
    case 'PRIEST': {
      const languages = a['languages'] as string[] | undefined;
      return languages?.slice(0, 3).join(' · ') ?? 'Vedic & traditional ceremonies';
    }
    case 'BAND': {
      const numberOfMembers = a['numberOfMembers'] as number | undefined;
      return numberOfMembers ? `${numberOfMembers}-piece live ensemble` : 'Live music & entertainment';
    }
    default:
      return '';
  }
}
