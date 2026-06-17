import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

const hideTab = {
  href: null,
};

const labels: any = {
  en: {
    home: 'Home',
    scores: 'Scores',
    news: 'News',
    predict: 'Predict',
    profile: 'Profile',
    settings: 'Settings',
  },
  ne: {
    home: 'होम',
    scores: 'स्कोर',
    news: 'समाचार',
    predict: 'अनुमान',
    profile: 'प्रोफाइल',
    settings: 'सेटिङ्स',
  },
  hi: {
    home: 'होम',
    scores: 'स्कोर',
    news: 'समाचार',
    predict: 'अनुमान',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
  },
  es: {
    home: 'Inicio',
    scores: 'Resultados',
    news: 'Noticias',
    predict: 'Predecir',
    profile: 'Perfil',
    settings: 'Ajustes',
  },
};

export default function TabLayout() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    async function loadLanguage() {
      const saved = await AsyncStorage.getItem('language');
      if (saved) setLanguage(saved);
    }

    loadLanguage();
  }, []);

  const l = labels[language] || labels.en;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFD166',
        tabBarInactiveTintColor: '#8FA3B8',
        tabBarStyle: {
          backgroundColor: '#07111F',
          borderTopColor: '#111C2E',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: l.home }} />
      <Tabs.Screen name="scores" options={{ title: l.scores }} />
      <Tabs.Screen name="news" options={{ title: l.news }} />
      <Tabs.Screen name="prediction" options={{ title: l.predict }} />
      <Tabs.Screen name="profile" options={{ title: l.profile }} />
      <Tabs.Screen name="fan-wall" options={{ title: 'Fan Wall' }} />

      <Tabs.Screen name="leagues" options={hideTab} />
      <Tabs.Screen name="leaderboard" options={hideTab} />
      <Tabs.Screen name="login" options={hideTab} />
      <Tabs.Screen name="settings" options={{ title: l.settings }} />
    </Tabs>
  );
}
