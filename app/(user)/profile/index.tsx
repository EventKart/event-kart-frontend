import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  CreditCard,
  Heart,
  History,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Shield,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/ui/Avatar';
import { WebTopAppBar } from '@/components/ui/WebTopAppBar';
import { useIsWide } from '@/hooks/useIsWide';
import { logoutUser } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const isWide = useIsWide();

  const [refreshing, setRefreshing] = useState(false);
  const [initialFetching, setInitialFetching] = useState(!user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (!cancelled) setInitialFetching(false);
    })();
    return () => { cancelled = true; };
  }, [refreshUser]);

  const onPullRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  const handleSwitchToVendor = () => {
    setRole('VENDOR');
    router.replace('/');
  };

  const handleSignOut = () => {
    const doSignOut = () => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) void logoutUser(currentToken).catch(() => {});
      signOut();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of EventKart? You will need to sign in again.')) doSignOut();
      return;
    }
    Alert.alert('Sign out', 'You will need to sign in again to use EventKart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: doSignOut },
    ]);
  };

  if (initialFetching && !user) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#131b2e" />
        <Text className="font-sans text-body-sm text-surface-on-variant mt-3">
          Loading your profile…
        </Text>
      </SafeAreaView>
    );
  }

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
          <View className="w-10" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} tintColor="#131b2e" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="mx-5 mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {/* Gold top accent */}
          <View style={{ height: 4, backgroundColor: '#cba72f' }} />
          <View className="p-5 items-center">
            <Avatar name={fullName || 'EventKart Member'} size={96} />
            <View className="items-center mt-4 gap-1">
              <Text className="font-serif-bold text-h2 text-surface-on text-center">
                {fullName || 'EventKart Member'}
              </Text>
              <Text className="font-sans text-body-md text-surface-on-variant">
                {user?.role === 'VENDOR' ? 'Vendor' : 'Host Member & Event Planner'}
              </Text>
              <Text className="font-sans text-body-sm text-surface-on-variant text-center mt-1 px-4">
                Curating unforgettable experiences with precision and modern elegance.
              </Text>
            </View>

            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={() => router.push('/(auth)/complete-profile' as any)}
                className="bg-primary-container px-5 py-2.5 rounded flex-row items-center gap-2 active:opacity-85"
              >
                <Text className="font-sans-sb text-button text-white uppercase tracking-wide">
                  Edit Profile
                </Text>
              </Pressable>
              <Pressable className="border border-outline px-5 py-2.5 rounded flex-row items-center gap-2 active:opacity-75">
                <Text className="font-sans-sb text-button text-surface-on uppercase tracking-wide">
                  Share Profile
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row mx-5 mt-4 gap-4">
          <View className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-secondary-container items-center justify-center">
              <Calendar size={22} color="#57657b" />
            </View>
            <View>
              <Text className="font-sans-md text-label-lg uppercase tracking-wider text-surface-on-variant">
                Active Events
              </Text>
              <Text className="font-serif-bold text-h2 text-surface-on mt-0.5">0</Text>
            </View>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-surface-container-high items-center justify-center">
              <History size={22} color="#1b1b1d" />
            </View>
            <View>
              <Text className="font-sans-md text-label-lg uppercase tracking-wider text-surface-on-variant">
                Past Events
              </Text>
              <Text className="font-serif-bold text-h2 text-surface-on mt-0.5">0</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="mx-5 mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <View className="flex-row items-center gap-2 pb-3 border-b border-surface-variant mb-4">
            <Text className="font-serif-bold text-h3 text-surface-on">Personal Information</Text>
          </View>
          <View className="gap-1">
            <InfoRow icon={<Mail size={18} color="#45464d" />} label="Email Address" value={user?.email ?? 'Not set'} />
            {user?.phoneNumber ? (
              <InfoRow icon={<Phone size={18} color="#45464d" />} label="Phone Number" value={user.phoneNumber} />
            ) : null}
            <InfoRow icon={<MapPin size={18} color="#45464d" />} label="Primary Location" value={user?.address ?? 'Not set'} />
          </View>
        </View>

        {/* Saved Vendors */}
        <Pressable className="mx-5 mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5 flex-row items-center active:bg-surface-container-low">
          <View className="w-12 h-12 rounded-full bg-error-container/50 items-center justify-center mr-4">
            <Heart size={22} color="#93000a" />
          </View>
          <View className="flex-1">
            <Text className="font-serif-bold text-h3 text-surface-on">Saved Vendors</Text>
            <Text className="font-sans text-body-sm text-surface-on-variant mt-0.5">
              Your bookmarked vendors
            </Text>
          </View>
          <ChevronRight size={20} color="#45464d" />
        </Pressable>

        {/* Account Settings */}
        <View className="mx-5 mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <View className="flex-row items-center gap-2 pb-3 border-b border-surface-variant mb-1">
            <Settings size={20} color="#45464d" />
            <Text className="font-serif-bold text-h3 text-surface-on">Account Settings</Text>
          </View>
          <SettingRow icon={<CreditCard size={18} color="#45464d" />} label="Payment Methods" />
          <SettingRow icon={<Bell size={18} color="#45464d" />} label="Notification Preferences" />
          <SettingRow icon={<Shield size={18} color="#45464d" />} label="Privacy & Security" last />
        </View>

        {/* Switch to Vendor */}
        {user?.role !== 'VENDOR' ? (
          <View className="mx-5 mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <Pressable
              onPress={handleSwitchToVendor}
              className="p-5 flex-row items-center active:bg-surface-container-low"
            >
              <View className="w-10 h-10 rounded-full bg-tertiary-container items-center justify-center mr-4">
                <Briefcase size={18} color="#4e3d00" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-sb text-body-md text-surface-on">Switch to Vendor</Text>
                <Text className="font-sans text-body-sm text-surface-on-variant">
                  Offer your services on EventKart
                </Text>
              </View>
              <ChevronRight size={18} color="#76777d" />
            </Pressable>
          </View>
        ) : null}

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mx-5 mt-4 bg-surface-container-lowest rounded-xl border border-error/20 shadow-sm p-5 flex-row items-center active:bg-error-container/30"
        >
          <View className="w-10 h-10 rounded-full bg-error-container/50 items-center justify-center mr-4">
            <LogOut size={18} color="#ba1a1a" />
          </View>
          <Text className="flex-1 font-sans-sb text-body-md text-error">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3 p-2 rounded active:bg-surface-container-low">
      <View className="mt-0.5">{icon}</View>
      <View>
        <Text className="font-sans-md text-label-md text-surface-on-variant">{label}</Text>
        <Text className="font-sans-md text-body-md text-surface-on mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label, last }: { icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Pressable
      className={`flex-row items-center p-2 rounded active:bg-surface-container-low ${last ? '' : 'mb-1'}`}
    >
      <View className="mr-3">{icon}</View>
      <Text className="flex-1 font-sans-md text-body-md text-surface-on">{label}</Text>
      <ChevronRight size={18} color="#76777d" />
    </Pressable>
  );
}
