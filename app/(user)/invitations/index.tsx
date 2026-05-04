import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Link, Mail, Plus, QrCode, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { WebTopAppBar } from '@/components/ui/WebTopAppBar';
import { useInvitationStats, useInvitations } from '@/hooks/useInvitations';
import { useIsWide } from '@/hooks/useIsWide';

export default function InvitationsScreen() {
  const router = useRouter();
  const { invitations, loading } = useInvitations();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const { stats, loading: statsLoading } = useInvitationStats(activeId);

  useEffect(() => {
    if (!activeId && invitations.length) setActiveId(invitations[0].id);
  }, [invitations, activeId]);

  const active = invitations.find((i) => i.id === activeId);

  const handleShareLink = async () => {
    if (!active) return;
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(`https://eventkart.shop/rsvp/${active.id}`);
        window.alert('RSVP link copied to clipboard!');
      } else {
        await Share.share({ message: `https://eventkart.shop/rsvp/${active.id}` });
      }
    } catch {
      // ignore
    }
  };

  const totalInvited =
    stats
      ? stats.totalYes + stats.totalNo + stats.totalMaybe + stats.totalNotRsvped
      : 0;
  const responseRate = totalInvited > 0 ? Math.round(((stats!.totalYes + stats!.totalNo + stats!.totalMaybe) / totalInvited) * 100) : 0;
  const acceptedPct = totalInvited > 0 ? (stats!.totalYes / totalInvited) * 100 : 0;
  const pendingPct = totalInvited > 0 ? (stats!.totalNotRsvped / totalInvited) * 100 : 0;
  const declinedPct = totalInvited > 0 ? (stats!.totalNo / totalInvited) * 100 : 0;
  const isWide = useIsWide();

  return (
    <SafeAreaView edges={isWide ? [] : ['top', 'bottom']} className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {/* Top App Bar */}
      {isWide ? (
        <WebTopAppBar />
      ) : (
        <View className="h-16 flex-row items-center justify-between px-6 bg-white border-b border-outline-variant/60 shadow-sm">
          <View className="w-10" />
          <Text className="font-serif-bold text-[22px] text-surface-on">EventKart</Text>
          <TouchableOpacity
            onPress={() => router.push('/(user)/invitations/create')}
            className="w-10 h-10 items-center justify-center rounded-full bg-primary-container"
            activeOpacity={0.8}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Page Header */}
        <View className="px-5 pt-6 pb-2">
          <Text className="font-serif-bold text-h1 text-surface-on">Invitation & RSVP Center</Text>
          <Text className="font-sans text-body-lg text-surface-on-variant mt-2">
            Manage your guest communications and track responses.
          </Text>
        </View>

        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#131b2e" />
          </View>
        ) : invitations.length === 0 ? (
          <View className="mx-5 mt-6 items-center">
            <Text className="font-serif-bold text-h3 text-surface-on text-center">
              No invitations yet
            </Text>
            <Text className="font-sans text-body-sm text-surface-on-variant mt-2 text-center">
              Create your first event to start tracking RSVPs.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(user)/invitations/create')}
              className="mt-6 bg-primary-container px-8 py-3 rounded"
              activeOpacity={0.88}
            >
              <Text className="font-sans-sb text-button text-white uppercase tracking-wide">
                Create Invitation
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Invitation Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}
            >
              {invitations.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  onPress={() => setActiveId(inv.id)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    backgroundColor: inv.id === activeId ? '#131b2e' : '#ffffff',
                    borderWidth: 1,
                    borderColor: inv.id === activeId ? '#131b2e' : '#c6c6cd',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 12,
                      color: inv.id === activeId ? '#ffffff' : '#1b1b1d',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    {inv.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {active ? (
              <>
                {/* Quick Actions */}
                <View className="mx-5 mt-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <Text className="font-serif-bold text-h3 text-surface-on pb-3 border-b border-surface-variant mb-4">
                    Quick Actions
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    <ActionBtn
                      icon={<Mail size={22} color="#ffffff" />}
                      label="Send Email Invites"
                      primary
                      onPress={() => router.push('/(user)/invitations/create')}
                    />
                    <ActionBtn
                      icon={<Send size={22} color="#735c00" />}
                      label="WhatsApp Broadcast"
                      onPress={() => {}}
                    />
                    <ActionBtn
                      icon={<Link size={22} color="#1b1b1d" />}
                      label="Copy RSVP Link"
                      onPress={handleShareLink}
                    />
                    <ActionBtn
                      icon={<QrCode size={22} color="#1b1b1d" />}
                      label="Download QR"
                      onPress={() => {}}
                    />
                  </View>
                </View>

                {/* RSVP Tracker */}
                <View className="mx-5 mt-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <Text className="font-serif-bold text-h3 text-surface-on mb-4">
                    Real-time RSVP Tracker
                  </Text>

                  {statsLoading ? (
                    <ActivityIndicator color="#131b2e" />
                  ) : stats ? (
                    <>
                      <View className="flex-row gap-3 mb-4">
                        <StatBox
                          count={stats.totalYes}
                          label="Accepted"
                          bg="#131b2e"
                          textColor="#ffffff"
                        />
                        <StatBox
                          count={stats.totalNotRsvped}
                          label="Pending"
                          bg="#f0edef"
                          textColor="#1b1b1d"
                        />
                        <StatBox
                          count={stats.totalNo}
                          label="Declined"
                          bg="#ffdad6"
                          textColor="#93000a"
                        />
                      </View>

                      {/* Progress Bar */}
                      {totalInvited > 0 && (
                        <View>
                          <View
                            style={{
                              height: 8,
                              borderRadius: 9999,
                              backgroundColor: '#e4e2e4',
                              overflow: 'hidden',
                              flexDirection: 'row',
                            }}
                          >
                            <View style={{ width: `${acceptedPct}%`, backgroundColor: '#131b2e' }} />
                            <View style={{ width: `${pendingPct}%`, backgroundColor: '#dcd9db' }} />
                            <View style={{ width: `${declinedPct}%`, backgroundColor: '#ba1a1a' }} />
                          </View>
                          <View className="flex-row justify-between mt-1.5">
                            <Text className="font-sans text-label-md text-surface-on-variant">
                              {responseRate}% Response Rate
                            </Text>
                            <Text className="font-sans text-label-md text-surface-on-variant">
                              {totalInvited} Total Invited
                            </Text>
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <Text className="font-sans text-body-sm text-surface-on-variant">
                      Stats will appear once invites are sent.
                    </Text>
                  )}
                </View>

                {/* Guest List placeholder */}
                <View className="mx-5 mt-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                  <View className="p-5 flex-row items-center justify-between border-b border-surface-variant">
                    <Text className="font-serif-bold text-h3 text-surface-on">Guest List</Text>
                  </View>
                  <View className="p-5 items-center py-10">
                    <Text className="font-sans text-body-sm text-surface-on-variant text-center">
                      Guest list will appear here once invitations are sent.
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(user)/invitations/create')}
                      className="mt-4"
                    >
                      <Text className="font-sans-md text-body-sm text-tertiary-container">
                        Send Invitations
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionBtn({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        width: '47%',
        padding: 16,
        borderRadius: 8,
        backgroundColor: primary ? '#131b2e' : '#f0edef',
        borderWidth: primary ? 0 : 1,
        borderColor: '#c6c6cd',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          letterSpacing: 0.28,
          textAlign: 'center',
          color: primary ? '#ffffff' : '#1b1b1d',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatBox({
  count,
  label,
  bg,
  textColor,
}: {
  count: number;
  label: string;
  bg: string;
  textColor: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: bg === '#ffdad6' ? '#ffdad6' : '#c6c6cd',
      }}
    >
      <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 36, lineHeight: 40, color: textColor }}>
        {count}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          letterSpacing: 0.7,
          textTransform: 'uppercase',
          color: textColor,
          marginTop: 6,
          opacity: 0.85,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
