import { Tabs } from 'expo-router';
import { CalendarHeart, Compass, User } from 'lucide-react-native';

export default function UserLayout() {
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
        tabBarStyle: {
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
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
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
