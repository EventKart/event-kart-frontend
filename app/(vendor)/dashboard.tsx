import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  ChevronRight,
  Eye,
  RefreshCcw,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/ui/Avatar';
import { WebTopAppBar } from '@/components/ui/WebTopAppBar';
import { useIsWide } from '@/hooks/useIsWide';
import { useAuthStore } from '@/store/authStore';
import { VENDOR_TYPE_META } from '@/constants/vendor';

const MOCK_REQUESTS = [
  {
    id: '1',
    title: 'The Sterling Wedding',
    category: 'Wedding',
    date: 'Oct 15, 2024',
    guests: 150,
    detail: 'Premium Plated Dinner',
  },
  {
    id: '2',
    title: 'Tech Innovators Summit',
    category: 'Conference',
    date: 'Nov 02, 2024',
    guests: 300,
    detail: 'Buffet Lunch & Breaks',
  },
];

const MOCK_SCHEDULE = [
  { day: '12', label: 'Tomorrow', title: 'Gala Dinner 2024', venue: 'Grand Ballroom', time: '6:00 PM', active: true },
  { day: '15', label: 'Thursday', title: 'Corporate Retreat', venue: 'Lake Estate', time: '9:00 AM', active: false },
  { day: '18', label: 'Sunday', title: 'Private Anniversary', venue: 'City Loft', time: '7:00 PM', active: false },
];

export default function VendorDashboard() {
  const router = useRouter();
  const vendor = useAuthStore((s) => s.vendor);
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);

  const firstName = user?.firstName ?? vendor?.name ?? 'there';
  const meta = vendor ? VENDOR_TYPE_META[vendor.type] : null;
  const isWide = useIsWide();

  const handleSwitch = () => {
    setRole('USER');
    router.replace('/');
  };

  return (
    <SafeAreaView edges={isWide ? [] : ['top', 'bottom']} className="flex-1 bg-bg">
      <StatusBar style="dark" />

      {/* Top App Bar */}
      {isWide ? (
        <WebTopAppBar variant="vendor" />
      ) : (
        <View className="h-16 flex-row items-center justify-between px-6 bg-white border-b border-outline-variant/60 shadow-sm">
          <View className="w-10" />
          <Text className="font-serif-bold text-[22px] text-surface-on">EventKart</Text>
          <Avatar name={vendor?.name ?? firstName} size={36} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 pt-6">

          {/* Welcome Header + Earnings */}
          <View className="mb-6">
            <Text className="font-serif-bold text-display text-surface-on leading-tight">
              Welcome back,{'\n'}{firstName}
            </Text>
            <Text className="font-sans text-body-lg text-surface-on-variant mt-2">
              {meta ? `Here is a summary of your ${meta.label.toLowerCase()} business performance.` : 'Here is a summary of your business performance.'}
            </Text>
          </View>

          {/* Earnings Card */}
          <View className="bg-white rounded-xl border border-outline-variant shadow-sm p-5 flex-row items-center gap-4 mb-6">
            <View className="w-12 h-12 rounded-full bg-primary-fixed items-center justify-center">
              <Wallet size={22} color="#131b2e" />
            </View>
            <View>
              <Text className="font-sans-md text-label-lg uppercase tracking-wider text-surface-on-variant">
                Total Earnings · This Month
              </Text>
              <Text className="font-serif-bold text-h2 text-surface-on mt-1">₹ 2,48,000</Text>
            </View>
          </View>

          {/* New Booking Requests */}
          <View className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-6">
            <View className="px-5 py-4 border-b border-outline-variant flex-row items-center justify-between bg-surface-container-lowest">
              <Text className="font-serif-bold text-h3 text-surface-on">New Booking Requests</Text>
              <View className="bg-error-container px-3 py-1 rounded-full">
                <Text className="font-sans-md text-label-md text-error-on-container">
                  {MOCK_REQUESTS.length} Pending
                </Text>
              </View>
            </View>
            {MOCK_REQUESTS.map((req, i) => (
              <View
                key={req.id}
                className={`p-5 ${i < MOCK_REQUESTS.length - 1 ? 'border-b border-outline-variant' : ''}`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="font-serif-bold text-[20px] text-surface-on flex-1 mr-2">
                    {req.title}
                  </Text>
                  <View className="bg-surface-container-high px-2 py-1 rounded">
                    <Text className="font-sans-md text-label-md text-surface-on-variant">
                      {req.category}
                    </Text>
                  </View>
                </View>
                <View className="gap-1.5 mb-4">
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#45464d" />
                    <Text className="font-sans text-body-sm text-surface-on-variant">{req.date}</Text>
                    <Text className="font-sans text-body-sm text-surface-on-variant ml-3">
                      {req.guests} Guests
                    </Text>
                  </View>
                  <Text className="font-sans text-body-sm text-surface-on-variant">{req.detail}</Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    activeOpacity={0.85}
                    className="flex-1 bg-primary-container items-center py-3 rounded-lg"
                  >
                    <Text className="font-sans-sb text-button text-white uppercase tracking-wide">
                      Accept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    className="flex-1 border border-outline items-center py-3 rounded-lg"
                  >
                    <Text className="font-sans-sb text-button text-surface-on uppercase tracking-wide">
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Performance Stats */}
          <Text className="font-serif-bold text-h3 text-surface-on mb-4">Performance Overview</Text>
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white rounded-xl border border-outline-variant shadow-sm p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Eye size={18} color="#cba72f" />
                <Text className="font-sans-md text-label-lg uppercase tracking-wider text-surface-on-variant">
                  Profile Views
                </Text>
              </View>
              <View className="flex-row items-end gap-3">
                <Text className="font-serif-bold text-[40px] leading-none text-surface-on">
                  1,248
                </Text>
                <View className="flex-row items-center gap-1 pb-1">
                  <TrendingUp size={14} color="#cba72f" />
                  <Text className="font-sans text-body-sm text-tertiary-container">+12%</Text>
                </View>
              </View>
            </View>
            <View className="flex-1 bg-white rounded-xl border border-outline-variant shadow-sm p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Calendar size={18} color="#131b2e" />
                <Text className="font-sans-md text-label-lg uppercase tracking-wider text-surface-on-variant">
                  Conversion
                </Text>
              </View>
              <View className="flex-row items-end gap-3">
                <Text className="font-serif-bold text-[40px] leading-none text-surface-on">
                  8.4%
                </Text>
                <Text className="font-sans text-body-sm text-surface-on-variant pb-1">
                  32 Bookings
                </Text>
              </View>
            </View>
          </View>

          {/* Upcoming Schedule */}
          <View className="bg-white rounded-xl border border-outline-variant shadow-sm p-5 mb-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-serif-bold text-h3 text-surface-on">Upcoming Schedule</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="font-sans-md text-label-lg uppercase tracking-wider text-tertiary-container">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {MOCK_SCHEDULE.map((item, idx) => (
                <View key={idx} className="flex-row items-center gap-4">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      item.active
                        ? 'border-2 border-tertiary-container bg-surface'
                        : 'border border-outline bg-surface'
                    }`}
                  >
                    <Text
                      className={`font-sans-md text-label-md ${
                        item.active ? 'text-tertiary-container' : 'text-surface-on'
                      }`}
                    >
                      {item.day}
                    </Text>
                  </View>
                  <View className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-3">
                    <Text
                      className={`font-sans-md text-label-md uppercase tracking-wider mb-0.5 ${
                        item.active ? 'text-tertiary-container' : 'text-surface-on-variant'
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text className="font-serif-bold text-[18px] text-surface-on">{item.title}</Text>
                    <Text className="font-sans text-body-sm text-surface-on-variant mt-0.5">
                      {item.venue} · {item.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Switch to Planner */}
          <TouchableOpacity
            onPress={handleSwitch}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-2"
          >
            <RefreshCcw size={14} color="#76777d" />
            <Text className="font-sans-md text-body-sm text-surface-on-variant">
              Switch to Planner mode
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
