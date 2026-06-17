import { ScrollView, StyleSheet, Text, View } from 'react-native';

const tables = [
  {
    league: 'Premier League',
    teams: ['Liverpool', 'Arsenal', 'Manchester City', 'Chelsea'],
  },
  {
    league: 'La Liga',
    teams: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona'],
  },
  {
    league: 'Champions League',
    teams: ['Bayern Munich', 'PSG', 'Real Madrid', 'Manchester City'],
  },
];

export default function LeaguesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Leagues</Text>
      <Text style={styles.subtitle}>Tables, rankings, and top competitions</Text>

      {tables.map((table, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.league}>{table.league}</Text>

          {table.teams.map((team, teamIndex) => (
            <View key={teamIndex} style={styles.row}>
              <Text style={styles.rank}>{teamIndex + 1}</Text>
              <Text style={styles.team}>{team}</Text>
              <Text style={styles.points}>{30 - teamIndex * 3} pts</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 24 },
  card: { backgroundColor: '#111C2E', padding: 18, borderRadius: 16, marginBottom: 18 },
  league: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#22314A',
    borderBottomWidth: 1,
  },
  rank: { color: '#8FA3B8', width: 30, fontSize: 16 },
  team: { color: 'white', flex: 1, fontSize: 17, fontWeight: '600' },
  points: { color: '#A7B0C0', fontSize: 15 },
});
