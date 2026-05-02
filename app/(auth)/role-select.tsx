import { ImageBackground, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Briefcase, Sparkles } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

const PLANNER_HERO =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200';
const VENDOR_HERO =
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200';

export default function RoleSelectScreen() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);

  const choose = (role: Role) => {
    setRole(role);
    router.replace('/');
  };

  return (
    <Screen scroll padded={false}>
      <View className="flex-1 px-6 pt-10 pb-6">
        <View className="h-2 w-12 rounded-full bg-tertiary-container mb-6" />
        <Text className="font-serif-bold text-h1 text-surface-on">How will you use EventKart?</Text>
        <Text className="font-sans text-body-md text-surface-on-variant mt-2">
          You can switch later — your account works for both.
        </Text>

        <View className="mt-10 gap-5">
          <RoleCard
            tone="navy"
            image={PLANNER_HERO}
            title="Plan an Event"
            subtitle="Discover vendors, send invitations, and track RSVPs in one place."
            icon={<Sparkles size={20} color="#ffffff" />}
            onPress={() => choose('USER')}
          />
          <RoleCard
            tone="gold"
            image={VENDOR_HERO}
            title="Provide a Service"
            subtitle="Showcase your craft, manage bookings, and grow your business."
            icon={<Briefcase size={20} color="#4e3d00" />}
            onPress={() => choose('VENDOR')}
          />
        </View>
      </View>
    </Screen>
  );
}

interface RoleCardProps {
  tone: 'navy' | 'gold';
  image: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function RoleCard({ tone, image, title, subtitle, icon, onPress }: RoleCardProps) {
  return (
    <Pressable onPress={onPress} className="rounded-2xl overflow-hidden">
      <ImageBackground source={{ uri: image }} className="h-48 w-full" resizeMode="cover">
        <View
          className={`flex-1 p-5 ${
            tone === 'navy' ? 'bg-primary-container/80' : 'bg-tertiary-container/85'
          }`}
        >
          <View className="flex-row items-center gap-2">
            {icon}
            <Text
              className={`font-sans-sb text-label-lg uppercase ${
                tone === 'navy' ? 'text-primary-on' : 'text-tertiary-on-container'
              }`}
            >
              {tone === 'navy' ? 'Planner' : 'Vendor'}
            </Text>
          </View>
          <Text
            className={`font-serif-bold text-h2 mt-2 ${
              tone === 'navy' ? 'text-primary-on' : 'text-tertiary-on-container'
            }`}
          >
            {title}
          </Text>
          <Text
            className={`font-sans text-body-sm mt-1 ${
              tone === 'navy' ? 'text-primary-on/85' : 'text-tertiary-on-container/85'
            }`}
          >
            {subtitle}
          </Text>
          <View className="flex-row mt-auto justify-end">
            <ArrowRight size={20} color={tone === 'navy' ? '#ffffff' : '#4e3d00'} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
