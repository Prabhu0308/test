import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const headlines = [
  'Manchester City and Arsenal prepare for title showdown',
  'Real Madrid eye new superstar signing',
  'Champions League draw creates dream matchups',
];

const matches = [
  'Manchester City vs Arsenal • Today 3:00 PM',
  'Real Madrid vs Barcelona • Tomorrow 2:30 PM',
  'USA vs Mexico • Saturday 8:00 PM',
];

const trendingTeams = ['Real Madrid', 'Barcelona', 'Manchester City', 'Argentina', 'Japan'];
const players = ['Mbappé', 'Lamine Yamal', 'Haaland', 'Bellingham', 'Salah', 'Messi'];

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      const saved = await AsyncStorage.getItem('favoriteTeams');
      if (saved) setFavorites(JSON.parse(saved));
    }
    loadFavorites();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>⚽ Soccer Daily</Text>
      <Text style={styles.tagline}>News • Scores • Predictions • Fan Pulse</Text>

      <Text style={styles.section}>⭐ My Teams</Text>
      <View style={styles.grid}>
        {favorites.length === 0 ? (
          <Text style={styles.emptyText}>Choose teams in Settings</Text>
        ) : (
          favorites.map((team) => <Text key={team} style={styles.chip}>{team}</Text>)
        )}
      </View>

      <View style={styles.breaking}>
        <Text style={styles.breakingText}>🔥 BREAKING NEWS</Text>
        <Text style={styles.breakingTitle}>
          World football enters a new era as clubs prepare for a massive season.
        </Text>
      </View>

      <Text style={styles.section}>🗳️ Fan Poll of the Day</Text>
      <View style={styles.pollCard}>
        <Text style={styles.pollQuestion}>Who will win the Ballon d'Or?</Text>
        <Text style={styles.pollOption}>Mbappé — 34%</Text>
        <Text style={styles.pollOption}>Yamal — 29%</Text>
        <Text style={styles.pollOption}>Haaland — 22%</Text>
        <Text style={styles.pollOption}>Bellingham — 15%</Text>
        <Text style={styles.cardMeta}>12,543 votes</Text>
      </View>

      <Text style={styles.section}>📅 Upcoming Matches</Text>
      {matches.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item}</Text>
        </View>
      ))}

      <Text style={styles.section}>⭐ Player Watch</Text>
      <View style={styles.grid}>
        {players.map((player) => <Text key={player} style={styles.chip}>{player}</Text>)}
      </View>

      <Text style={styles.section}>🔥 Trending Teams</Text>
      <View style={styles.grid}>
        {trendingTeams.map((team, index) => (
          <Text key={team} style={styles.chip}>{index + 1}. {team}</Text>
        ))}
      </View>

      <Text style={styles.section}>Top Headlines</Text>
      {headlines.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{item}</Text>
          <Text style={styles.cardMeta}>Soccer Daily • Today</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  logo: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  tagline: { color: '#A7B0C0', fontSize: 16, marginTop: 6, marginBottom: 24 },
  breaking: { backgroundColor: '#123C69', padding: 20, borderRadius: 20, marginBottom: 24 },
  breakingText: { color: '#FFD166', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  breakingTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', lineHeight: 30 },
  section: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 14, marginTop: 8 },
  pollCard: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 18 },
  pollQuestion: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  pollOption: { color: 'white', backgroundColor: '#123C69', padding: 12, borderRadius: 12, marginBottom: 8, fontWeight: 'bold' },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { color: 'white', fontSize: 17, fontWeight: '600' },
  cardMeta: { color: '#8FA3B8', fontSize: 13, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  chip: { color: 'white', backgroundColor: '#1C2C44', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20, fontWeight: 'bold' },
  emptyText: { color: '#8FA3B8', fontSize: 16 },
});
