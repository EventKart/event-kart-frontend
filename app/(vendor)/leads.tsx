import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarDays, Check, MapPin, X } from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';

interface Lead {
  id: string;
  name: string;
  event: string;
  date: string;
  location: string;
  preferred: 'High' | 'Medium' | 'New';
}

const SEED: Lead[] = [
  {
    id: 'l1',
    name: 'Aanya Mehra',
    event: 'Wedding · 350 guests',
    date: '12 Dec 2026',
    location: 'The Marigold Estate, Bengaluru',
    preferred: 'High',
  },
  {
    id: 'l2',
    name: 'Rohan Kapoor',
    event: 'Engagement · 80 guests',
    date: '04 Aug 2026',
    location: 'Bandra, Mumbai',
    preferred: 'New',
  },
  {
    id: 'l3',
    name: 'Saanvi Iyer',
    event: 'Sangeet · 220 guests',
    date: '19 Nov 2026',
    location: 'Jubilee Hills, Hyderabad',
    preferred: 'Medium',
  },
];

const FILTERS = ['All', 'New', 'In progress', 'Confirmed'] as const;

export default function VendorLeads() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-6 pb-4">
        <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
          Inbox
        </Text>
        <Text className="font-serif-bold text-h2 text-surface-on mt-1">Booking leads</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 h-9 items-center justify-center rounded-full border ${
              filter === f
                ? 'bg-primary-container border-primary-container'
                : 'bg-surface-container-lowest border-outline-variant'
            }`}
          >
            <Text
              className={`font-sans-sb text-label-md ${
                filter === f ? 'text-primary-on' : 'text-surface-on'
              }`}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="px-5 pb-10 gap-3">
        {SEED.map((l) => (
          <Card key={l.id}>
            <View className="flex-row items-start gap-3">
              <Avatar name={l.name} size={48} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-serif-bold text-body-lg text-surface-on">{l.name}</Text>
                  <Badge
                    label={l.preferred}
                    tone={l.preferred === 'High' ? 'navy' : l.preferred === 'New' ? 'gold' : 'neutral'}
                  />
                </View>
                <Text className="font-sans text-body-sm text-surface-on-variant mt-1">{l.event}</Text>
                <View className="flex-row items-center gap-3 mt-2">
                  <View className="flex-row items-center gap-1">
                    <CalendarDays size={14} color="#76777d" />
                    <Text className="font-sans text-body-sm text-surface-on-variant">{l.date}</Text>
                  </View>
                  <View className="flex-row items-center gap-1 flex-1">
                    <MapPin size={14} color="#76777d" />
                    <Text className="font-sans text-body-sm text-surface-on-variant" numberOfLines={1}>
                      {l.location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3 mt-4">
              <Pressable className="flex-1 flex-row items-center justify-center h-11 rounded-lg border border-outline-variant active:bg-surface-container-low gap-2">
                <X size={16} color="#1b1b1d" />
                <Text className="font-sans-sb text-button text-surface-on uppercase">Decline</Text>
              </Pressable>
              <Pressable className="flex-1 flex-row items-center justify-center h-11 rounded-lg bg-primary-container active:opacity-90 gap-2">
                <Check size={16} color="#ffffff" />
                <Text className="font-sans-sb text-button text-primary-on uppercase">Accept</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
