import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const leagues = [
  { name: 'Premier League', code: 'eng.1' },
  { name: 'La Liga', code: 'esp.1' },
  { name: 'Bundesliga', code: 'ger.1' },
  { name: 'Serie A', code: 'ita.1' },
  { name: 'Ligue 1', code: 'fra.1' },
  { name: 'MLS', code: 'usa.1' },
];

export default function StandingsScreen() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStandings(league = selectedLeague) {
    try {
      setLoading(true);

      const response = await fetch(
        `https://site.web.api.espn.com/apis/v2/sports/soccer/${league.code}/standings`
      );

      const data = await response.json();

      const entries =
        data?.children?.[0]?.standings?.entries ||
        data?.standings?.entries ||
        [];

      const cleanTeams = entries.map((entry: any, index: number) => {
        const stats = entry.stats || [];

        const getStat = (name: string) =>
          stats.find((s: any) => s.name === name)?.displayValue ||
          stats.find((s: any) => s.abbreviation === name)?.displayValue ||
          '0';

        return {
          id: entry.team?.id || String(index),
          rank: index + 1,
          name: entry.team?.displayName || entry.team?.name || 'Team',
          played: getStat('gamesPlayed'),
          wins: getStat('wins'),
          draws: getStat('ties'),
          losses: getStat('losses'),
          points: getStat('points'),
        };
      });

      setTeams(cleanTeams);
    } catch (error) {
      console.log(error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings(selectedLeague);
  }, [selectedLeague]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Standings</Text>
      <Text style={styles.subtitle}>League tables and team rankings</Text>

      <View style={styles.leagueRow}>
        {leagues.map((league) => (
          <Pressable
            key={league.code}
            style={[
              styles.leagueButton,
              selectedLeague.code === league.code && styles.selectedLeague,
            ]}
            onPress={() => setSelectedLeague(league)}
          >
            <Text
              style={[
                styles.leagueText,
                selectedLeague.code === league.code && styles.selectedLeagueText,
              ]}
            >
              {league.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerRank}>#</Text>
        <Text style={styles.headerTeam}>Team</Text>
        <Text style={styles.headerSmall}>P</Text>
        <Text style={styles.headerSmall}>W</Text>
        <Text style={styles.headerSmall}>D</Text>
        <Text style={styles.headerSmall}>L</Text>
        <Text style={styles.headerSmall}>Pts</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFD166" />
          <Text style={styles.loadingText}>Loading standings...</Text>
        </View>
      ) : teams.length === 0 ? (
        <Text style={styles.empty}>No standings found.</Text>
      ) : (
        teams.map((team) => (
          <View key={team.id} style={styles.teamRow}>
            <Text style={styles.rank}>{team.rank}</Text>
            <Text style={styles.team}>{team.name}</Text>
            <Text style={styles.small}>{team.played}</Text>
            <Text style={styles.small}>{team.wins}</Text>
            <Text style={styles.small}>{team.draws}</Text>
            <Text style={styles.small}>{team.losses}</Text>
            <Text style={styles.points}>{team.points}</Text>
          </View>
        ))
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 18, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 18 },
  leagueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  leagueButton: {
    backgroundColor: '#111C2E',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  selectedLeague: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  leagueText: { color: 'white', fontWeight: 'bold' },
  selectedLeagueText: { color: '#07111F' },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#123C69',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerRank: { color: '#FFD166', width: 30, fontWeight: 'bold' },
  headerTeam: { color: '#FFD166', flex: 1, fontWeight: 'bold' },
  headerSmall: { color: '#FFD166', width: 34, textAlign: 'center', fontWeight: 'bold' },
  teamRow: {
    flexDirection: 'row',
    backgroundColor: '#111C2E',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  rank: { color: '#FFD166', width: 30, fontWeight: 'bold' },
  team: { color: 'white', flex: 1, fontWeight: 'bold' },
  small: { color: '#A7B0C0', width: 34, textAlign: 'center' },
  points: { color: '#FFD166', width: 34, textAlign: 'center', fontWeight: 'bold' },
  loading: { padding: 30, alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 10 },
  empty: { color: '#A7B0C0', fontSize: 16, marginTop: 20 },
  backButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginTop: 18, marginBottom: 40 },
  backText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
});
