import { Tabs } from 'expo-router';
import { Inbox, LayoutDashboard, Layers } from 'lucide-react-native';

export default function VendorLayout() {
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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
