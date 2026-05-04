import { Redirect, Tabs } from 'expo-router';
import { CalendarClock, LayoutDashboard, User } from 'lucide-react-native';

import { useIsWide } from '@/hooks/useIsWide';
import { useAuthStore } from '@/store/authStore';

export default function VendorLayout() {
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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
