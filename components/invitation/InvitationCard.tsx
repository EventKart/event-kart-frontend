import { Pressable, Text, View } from 'react-native';
import { Calendar, MapPin } from 'lucide-react-native';

import type { Invitation } from '@/types';

interface InvitationCardProps {
  invitation: Invitation;
  onPress?: () => void;
  active?: boolean;
}

export function InvitationCard({ invitation, onPress, active }: InvitationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl p-4 border ${
        active
          ? 'bg-primary-container border-primary-container'
          : 'bg-surface-container-lowest border-outline-variant/40'
      }`}
    >
      <Text
        className={`font-serif-bold text-body-lg ${
          active ? 'text-primary-on' : 'text-surface-on'
        }`}
        numberOfLines={1}
      >
        {invitation.title}
      </Text>
      <View className="flex-row items-center gap-3 mt-2">
        {invitation.date ? (
          <View className="flex-row items-center gap-1">
            <Calendar size={14} color={active ? '#dae2fd' : '#76777d'} />
            <Text
              className={`font-sans text-body-sm ${
                active ? 'text-primary-on/80' : 'text-surface-on-variant'
              }`}
            >
              {invitation.date}
            </Text>
          </View>
        ) : null}
        {invitation.location ? (
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color={active ? '#dae2fd' : '#76777d'} />
            <Text
              className={`font-sans text-body-sm ${
                active ? 'text-primary-on/80' : 'text-surface-on-variant'
              }`}
              numberOfLines={1}
            >
              {invitation.location}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
