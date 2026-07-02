import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#07111F',
          borderTopColor: '#111C2E',
          height: 86,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFD166',
        tabBarInactiveTintColor: '#8FA3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="scores"
        options={{
          title: 'Scores',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚽" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="fan-wall"
        options={{
          title: 'Fan Zone',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔥" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Prediction',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔮" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />

      <Tabs.Screen name="news" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="leagues" options={{ href: null }} />
      <Tabs.Screen name="tv" options={{ href: null }} />
    </Tabs>
  );
}
