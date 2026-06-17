import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getTeamBadge } from '../../constants/teamLogos';

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';

export default function ScoresScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadScores() {
    try {
      setLoading(true);
      const response = await fetch(ESPN_URL);
      const data = await response.json();

      const cleanMatches = (data.events || []).map((event: any) => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors || [];

        const home = competitors.find((team: any) => team.homeAway === 'home') || competitors[0];
        const away = competitors.find((team: any) => team.homeAway === 'away') || competitors[1];

        return {
          id: event.id,
          league: competition?.altGameNote || 'Soccer',
          name: event.name,
          date: event.date,
          status: competition?.status?.type?.shortDetail || event.status?.type?.shortDetail || 'Scheduled',
          clock: competition?.status?.displayClock || '',
          homeName: home?.team?.displayName || 'Home',
          awayName: away?.team?.displayName || 'Away',
          homeScore: home?.score || '0',
          awayScore: away?.score || '0',
          venue: competition?.venue?.fullName || event.venue?.displayName || '',
          gameTime: event.date
            ? new Date(event.date).toLocaleString([], {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'Time TBD',
        };
      });

      setMatches(cleanMatches);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScores();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading live scores...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚽ Live Scores</Text>
      <Text style={styles.subtitle}>Real match data from ESPN</Text>

      <Pressable style={styles.refresh} onPress={loadScores}>
        <Text style={styles.refreshText}>Refresh Scores</Text>
      </Pressable>

      {matches.map((match) => (
        <View key={match.id} style={styles.card}>
          <Text style={styles.league}>{match.league}</Text>
          <Text style={styles.status}>{match.status} {match.clock ? `• ${match.clock}` : ''}</Text>
          <Text style={styles.time}>🕒 {match.gameTime}</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.badge}>{getTeamBadge(match.homeName)}</Text>
            <Text style={styles.team}>{match.homeName}</Text>
            <Text style={styles.score}>{match.homeScore}</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.badge}>{getTeamBadge(match.awayName)}</Text>
            <Text style={styles.team}>{match.awayName}</Text>
            <Text style={styles.score}>{match.awayScore}</Text>
          </View>

          {match.venue ? <Text style={styles.venue}>📍 {match.venue}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 18 },
  refresh: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginBottom: 18 },
  refreshText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 14 },
  league: { color: '#FFD166', fontWeight: 'bold', marginBottom: 6 },
  status: { color: '#8FA3B8', marginBottom: 6 },
  time: { color: '#FFD166', marginBottom: 14, fontWeight: 'bold' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badge: { color: '#07111F', backgroundColor: '#FFD166', width: 48, paddingVertical: 6, borderRadius: 20, textAlign: 'center', fontWeight: 'bold', marginRight: 10 },
  team: { color: 'white', fontSize: 18, fontWeight: '600', flex: 1 },
  score: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 12 },
  venue: { color: '#8FA3B8', marginTop: 8 },
});
