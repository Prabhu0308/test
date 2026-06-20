import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const clubs = [
  'Real Madrid', 'Barcelona', 'Manchester United', 'Manchester City',
  'Liverpool', 'Arsenal', 'Chelsea', 'Bayern Munich',
  'PSG', 'Juventus', 'AC Milan', 'Inter Milan',
  'Atletico Madrid', 'Borussia Dortmund', 'Inter Miami', 'Al Nassr',
];

const nationalTeams = [
  'Argentina', 'Brazil', 'France', 'England', 'Spain', 'Germany',
  'Portugal', 'Italy', 'Netherlands', 'USA', 'Mexico', 'Canada',
  'Morocco', 'Senegal', 'Nigeria', 'Egypt', 'Algeria', 'South Africa',
  'Japan', 'South Korea', 'Saudi Arabia', 'Iran', 'Australia', 'Qatar',
  'India', 'Nepal',
];

export default function SettingsScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadFavorites();
    loadLanguage();
  }, []);

  async function loadFavorites() {
    const saved = await AsyncStorage.getItem('favoriteTeams');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }

  async function loadLanguage() {
    const saved = await AsyncStorage.getItem('language');
    if (saved) setLanguage(saved);
  }

  async function saveLanguage(code: string) {
    setLanguage(code);
    await AsyncStorage.setItem('language', code);
  }

  async function saveFavorites(updatedFavorites: string[]) {
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favoriteTeams', JSON.stringify(updatedFavorites));
  }

  function toggleTeam(team: string) {
    if (favorites.includes(team)) {
      saveFavorites(favorites.filter((item) => item !== team));
    } else {
      saveFavorites([...favorites, team]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      <Text style={styles.subtitle}>Choose your favorite clubs and national teams</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>⭐ My Favorite Teams</Text>
        <Text style={styles.summaryText}>
          {favorites.length === 0 ? 'No teams selected yet' : favorites.join(', ')}
        </Text>
      </View>

      <Text style={styles.section}>⭐ Favorite Clubs</Text>
      <View style={styles.grid}>
        {clubs.map((team) => (
          <Pressable
            key={team}
            style={[styles.chip, favorites.includes(team) && styles.selectedChip]}
            onPress={() => toggleTeam(team)}>
            <Text style={[styles.chipText, favorites.includes(team) && styles.selectedText]}>
              {favorites.includes(team) ? '✓ ' : ''}{team}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>🌎 Favorite National Teams</Text>
      <View style={styles.grid}>
        {nationalTeams.map((team) => (
          <Pressable
            key={team}
            style={[styles.chip, favorites.includes(team) && styles.selectedChip]}
            onPress={() => toggleTeam(team)}>
            <Text style={[styles.chipText, favorites.includes(team) && styles.selectedText]}>
              {favorites.includes(team) ? '✓ ' : ''}{team}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>🌎 App Language</Text>
      <View style={styles.grid}>
        {[
          { code: 'en', label: '🇺🇸 English' },
          { code: 'ne', label: '🇳🇵 Nepali' },
          { code: 'hi', label: '🇮🇳 Hindi' },
          { code: 'es', label: '🇪🇸 Spanish' },
          { code: 'fr', label: '🇫🇷 French' },
        ].map((item) => (
          <Pressable
            key={item.code}
            style={[styles.chip, language === item.code && styles.selectedChip]}
            onPress={() => saveLanguage(item.code)}>
            <Text style={[styles.chipText, language === item.code && styles.selectedText]}>
              {language === item.code ? '✓ ' : ''}{item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>⚽ Soccer Daily</Text>
        <Text style={styles.aboutText}>
          Your football news, scores, predictions, and fan intelligence platform.
        </Text>
        <Text style={styles.version}>Version 1.2</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 22 },
  summaryCard: { backgroundColor: '#123C69', padding: 18, borderRadius: 18, marginBottom: 22 },
  summaryTitle: { color: '#FFD166', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  summaryText: { color: 'white', fontSize: 16, lineHeight: 24 },
  section: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 14, marginTop: 8 },
grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 22,
},
  chip: {
  backgroundColor: '#111C2E',
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#22314A',
  minWidth: '48%',
  alignItems: 'center',
},
  selectedChip: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
 chipText: {
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: 15,
},
  selectedText: { color: '#07111F' },
  aboutCard: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 40 },
  aboutTitle: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  aboutText: { color: 'white', fontSize: 16, lineHeight: 24 },
  version: { color: '#A7B0C0', marginTop: 12 },
});
