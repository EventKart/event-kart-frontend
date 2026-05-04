import { Pressable, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { Avatar } from './Avatar';
import { useAuthStore } from '@/store/authStore';

interface NavLink {
  label: string;
  href: string;
  match: string;
}

const USER_NAV: NavLink[] = [
  { label: 'Home', href: '/(user)/search', match: '/search' },
  { label: 'Events', href: '/(user)/invitations', match: '/invitations' },
  { label: 'Profile', href: '/(user)/profile', match: '/profile' },
];

const VENDOR_NAV: NavLink[] = [
  { label: 'Dashboard', href: '/(vendor)/dashboard', match: '/dashboard' },
  { label: 'Events', href: '/(vendor)/leads', match: '/leads' },
  { label: 'Portfolio', href: '/(vendor)/portfolio', match: '/portfolio' },
];

interface WebTopAppBarProps {
  variant?: 'user' | 'vendor';
}

export function WebTopAppBar({ variant = 'user' }: WebTopAppBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const vendor = useAuthStore((s) => s.vendor);
  const fullName =
    variant === 'vendor'
      ? (vendor?.name ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ?? 'Vendor')
      : ([user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Member');

  const links = variant === 'vendor' ? VENDOR_NAV : USER_NAV;

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#c6c6cd',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'sticky' as any,
        top: 0,
        zIndex: 50,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1280,
          marginHorizontal: 'auto',
          paddingHorizontal: 24,
          paddingVertical: 16,
          width: '100%',
        }}
      >
        {/* Brand */}
        <Text
          style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 24, color: '#131b2e', letterSpacing: -0.3 }}
        >
          EventKart
        </Text>

        {/* Nav links */}
        <View style={{ flexDirection: 'row', gap: 32 }}>
          {links.map((link) => {
            const active = pathname.includes(link.match);
            return (
              <Pressable key={link.label} onPress={() => router.push(link.href as any)}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 13,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: active ? '#cba72f' : '#76777d',
                    borderBottomWidth: active ? 1.5 : 0,
                    borderBottomColor: '#cba72f',
                    paddingBottom: active ? 2 : 0,
                  }}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Avatar */}
        <Avatar name={fullName} size={40} />
      </View>
    </View>
  );
}
