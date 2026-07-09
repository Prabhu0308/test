import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function EmojiIcon({ emoji, size }: { emoji: string; size: number }) {
  return <Text style={{ fontSize: size + 4 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFD166',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#07111F',
          borderTopColor: '#1F2A44',
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '900',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => <EmojiIcon emoji="🏠" size={size} />,
        }}
      />

      <Tabs.Screen
        name="academy"
        options={{
          title: 'Academy',
          tabBarIcon: ({ size }) => <EmojiIcon emoji="🎓" size={size} />,
        }}
      />

      <Tabs.Screen
        name="fan-wall"
        options={{
          title: 'Fan Zone',
          tabBarIcon: ({ size }) => <EmojiIcon emoji="💬" size={size} />,
        }}
      />

      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Prediction',
          tabBarIcon: ({ size }) => <EmojiIcon emoji="🔮" size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size }) => <EmojiIcon emoji="👤" size={size} />,
        }}
      />

      <Tabs.Screen name="scores" options={{ href: null }} />
      <Tabs.Screen name="news" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="leagues" options={{ href: null }} />
      <Tabs.Screen name="tv" options={{ href: null }} />
    </Tabs>
  );
}
