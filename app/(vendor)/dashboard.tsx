import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarClock,
  Eye,
  RefreshCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ProfileCompletion } from '@/components/dashboard/ProfileCompletion';
import { useAuthStore } from '@/store/authStore';
import { VENDOR_TYPE_META } from '@/constants/vendor';

export default function VendorDashboard() {
  const router = useRouter();
  const vendor = useAuthStore((s) => s.vendor);
  const setRole = useAuthStore((s) => s.setRole);

  const completion = vendor ? completionPct(vendor) : 30;
  const meta = vendor ? VENDOR_TYPE_META[vendor.type] : null;

  const handleSwitch = () => {
    setRole('USER');
    router.replace('/');
  };

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-6 pb-10 gap-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant">
              Welcome back
            </Text>
            <Text className="font-serif-bold text-h2 text-surface-on mt-1" numberOfLines={1}>
              {vendor?.name ?? 'Your studio'}
            </Text>
          </View>
          <Avatar name={vendor?.name ?? 'EK Studio'} size={48} />
        </View>

        <Card className="bg-primary-container">
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-primary-on/70">
            Total Earnings · This Month
          </Text>
          <Text className="font-serif-bold text-display text-primary-on mt-1">₹ 2,48,000</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-row items-center gap-1 bg-tertiary-fixed rounded-full px-2 py-1">
              <TrendingUp size={12} color="#4e3d00" />
              <Text className="font-sans-sb text-label-md text-tertiary-on-container">+12%</Text>
            </View>
            <Text className="font-sans text-body-sm text-primary-on/80">vs last month</Text>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-4">
            <ProfileCompletion pct={completion} />
            <View className="flex-1 gap-1">
              <Text className="font-serif-bold text-h3 text-surface-on">Profile completion</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant">
                {completion < 100
                  ? 'Add a few more details to start receiving leads.'
                  : 'You are fully set up. Bookings will appear in Leads.'}
              </Text>
              <View className="flex-row gap-2 mt-1">
                {meta ? <Badge label={meta.label} tone="gold" /> : null}
                {vendor ? <Badge label={vendor.state} tone="navy" /> : null}
              </View>
            </View>
          </View>
        </Card>

        <Text className="font-serif-bold text-h3 text-surface-on">Today</Text>

        <Card>
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-tertiary-fixed items-center justify-center">
              <Sparkles size={18} color="#4e3d00" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-sb text-body-md text-surface-on">3 new inquiries</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
                Couples are asking about your December availability.
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
              <CalendarClock size={18} color="#57657b" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-sb text-body-md text-surface-on">Upcoming booking</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
                Aanya & Rohan's wedding · 12 Dec 2026
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center">
              <Eye size={18} color="#1b1b1d" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-sb text-body-md text-surface-on">Profile views</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant mt-1">
                184 views this week, up 22%.
              </Text>
            </View>
          </View>
        </Card>

        <Pressable
          onPress={handleSwitch}
          className="flex-row items-center justify-center gap-2 mt-3"
        >
          <RefreshCcw size={14} color="#76777d" />
          <Text className="font-sans-md text-body-sm text-surface-on-variant">
            Switch to Planner mode
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function completionPct(v: NonNullable<ReturnType<typeof useAuthStore.getState>['vendor']>) {
  const fields = [v.name, v.email, v.contactNumber, v.documents.aadhar];
  const filled = fields.filter(Boolean).length;
  return (filled / fields.length) * 100;
}
