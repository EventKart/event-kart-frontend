import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { InvitationCard } from '@/components/invitation/InvitationCard';
import { RSVPProgress } from '@/components/invitation/RSVPProgress';
import { useInvitationStats, useInvitations } from '@/hooks/useInvitations';

export default function InvitationsScreen() {
  const router = useRouter();
  const { invitations, loading } = useInvitations();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const { stats, loading: statsLoading } = useInvitationStats(activeId);

  useEffect(() => {
    if (!activeId && invitations.length) setActiveId(invitations[0].id);
  }, [invitations, activeId]);

  const active = invitations.find((i) => i.id === activeId);

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-6 pb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
              Your events
            </Text>
            <Text className="font-serif-bold text-h2 text-surface-on mt-1">Invitations & RSVPs</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(user)/invitations/create')}
            className="w-11 h-11 items-center justify-center rounded-full bg-primary-container active:opacity-90"
          >
            <Plus size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View className="px-5 py-10 items-center">
          <ActivityIndicator color="#131b2e" />
        </View>
      ) : invitations.length === 0 ? (
        <View className="px-5 py-10 items-center">
          <Text className="font-serif-bold text-h3 text-surface-on text-center">
            No invitations yet
          </Text>
          <Text className="font-sans text-body-sm text-surface-on-variant mt-2 text-center">
            Create your first event to start tracking RSVPs.
          </Text>
          <View className="mt-6 w-full">
            <Button label="Create Invitation" onPress={() => router.push('/(user)/invitations/create')} />
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
          >
            {invitations.map((inv) => (
              <View key={inv.id} className="w-72">
                <InvitationCard
                  invitation={inv}
                  active={inv.id === activeId}
                  onPress={() => setActiveId(inv.id)}
                />
              </View>
            ))}
          </ScrollView>

          <View className="px-5 mt-2">
            {active ? (
              <View className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 gap-5">
                <View>
                  <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
                    RSVP tracker
                  </Text>
                  <Text className="font-serif-bold text-h3 text-surface-on mt-1">{active.title}</Text>
                  {active.date ? (
                    <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
                      {active.date}
                      {active.location ? ` · ${active.location}` : ''}
                    </Text>
                  ) : null}
                </View>

                {statsLoading ? (
                  <ActivityIndicator color="#131b2e" />
                ) : stats ? (
                  <RSVPProgress stats={stats} />
                ) : (
                  <Text className="font-sans text-body-sm text-surface-on-variant">
                    Stats will appear once invites are sent.
                  </Text>
                )}

                <View className="flex-row gap-3 mt-2">
                  <View className="flex-1">
                    <Button label="Send More" variant="secondary" onPress={() => router.push('/(user)/invitations/create')} />
                  </View>
                  <View className="flex-1">
                    <Button label="Share Link" variant="primary" />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </>
      )}
    </Screen>
  );
}
