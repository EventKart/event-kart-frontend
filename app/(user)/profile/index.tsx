import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Briefcase,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  Shield,
} from 'lucide-react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSwitchToVendor = () => {
    setRole('VENDOR');
    router.replace('/');
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'You will need to sign in again to use EventKart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <Screen scroll padded={false}>
      <View className="px-5 pt-6 pb-10 gap-5">
        <View className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40">
          <View className="h-1.5 w-12 rounded-full bg-tertiary-container -mt-1 mb-3" />
          <View className="flex-row items-center gap-4">
            <Avatar name={user?.name ?? 'EventKart Member'} size={72} />
            <View className="flex-1">
              <Text className="font-serif-bold text-h3 text-surface-on">
                {user?.name ?? 'EventKart Member'}
              </Text>
              <Text className="font-sans text-body-sm text-surface-on-variant">
                Host · Planner
              </Text>
              <View className="flex-row mt-2">
                <Badge label="Member" tone="navy" />
              </View>
            </View>
          </View>

          <View className="gap-3 mt-5">
            {user?.phoneNumber ? (
              <Row icon={<Phone size={16} color="#735c00" />} label={user.phoneNumber} />
            ) : null}
            {user?.email ? (
              <Row icon={<Mail size={16} color="#735c00" />} label={user.email} />
            ) : null}
          </View>
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
          <Text className="font-sans-md text-label-md uppercase tracking-wider text-surface-on-variant px-5 pt-5">
            Quick switch
          </Text>
          <View className="px-5 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-tertiary-container items-center justify-center">
              <Briefcase size={18} color="#4e3d00" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-sb text-body-md text-surface-on">Become a Vendor</Text>
              <Text className="font-sans text-body-sm text-surface-on-variant">
                Showcase your services on EventKart.
              </Text>
            </View>
            <Pressable onPress={handleSwitchToVendor}>
              <Text className="font-sans-sb text-button text-tertiary-on-container uppercase">
                Switch
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
          <SettingRow icon={<Bell size={18} color="#1b1b1d" />} label="Notifications" />
          <SettingRow icon={<CreditCard size={18} color="#1b1b1d" />} label="Payment methods" />
          <SettingRow icon={<Shield size={18} color="#1b1b1d" />} label="Privacy & security" />
          <SettingRow icon={<HelpCircle size={18} color="#1b1b1d" />} label="Help center" last />
        </View>

        <Button
          variant="secondary"
          label="Sign Out"
          icon={<LogOut size={16} color="#ba1a1a" />}
          onPress={handleSignOut}
          className="border-error/30"
        />
      </View>
    </Screen>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="font-sans text-body-md text-surface-on">{label}</Text>
    </View>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  last?: boolean;
}

function SettingRow({ icon, label, last }: SettingRowProps) {
  return (
    <Pressable
      className={`flex-row items-center px-5 py-4 ${last ? '' : 'border-b border-outline-variant/40'} active:bg-surface-container-low`}
    >
      <View className="w-9 h-9 rounded-full bg-surface-container-low items-center justify-center mr-3">
        {icon}
      </View>
      <Text className="flex-1 font-sans-md text-body-md text-surface-on">{label}</Text>
      <ChevronRight size={18} color="#76777d" />
    </Pressable>
  );
}
