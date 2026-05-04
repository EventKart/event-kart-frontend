import { Redirect, Tabs } from 'expo-router';
import { CalendarHeart, Search, User } from 'lucide-react-native';

import { useIsWide } from '@/hooks/useIsWide';
import { useAuthStore } from '@/store/authStore';

export default function UserLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isWide = useIsWide();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#131b2e',
        tabBarInactiveTintColor: '#76777d',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },
        tabBarStyle: isWide
          ? { display: 'none' }
          : {
              backgroundColor: '#ffffff',
              borderTopColor: '#e4e2e4',
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
            },
        sceneStyle: { backgroundColor: '#fcf8fa' },
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <CalendarHeart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
