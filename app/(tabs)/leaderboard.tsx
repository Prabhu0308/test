import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebase/config';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, 'leaderboard'));

      const list = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => Number(b.points || 0) - Number(a.points || 0));

      setLeaders(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Top Soccer Daily predictors</Text>

      <Pressable style={styles.refresh} onPress={loadLeaderboard}>
        <Text style={styles.refreshText}>Refresh Leaderboard</Text>
      </Pressable>

      {leaders.map((user, index) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.rank}>#{index + 1}</Text>

          <View style={styles.info}>
            <Text style={styles.name}>{user.user || user.email || 'Unknown User'}</Text>
            <Text style={styles.accuracy}>Accuracy: {user.accuracy || '0'}%</Text>
          </View>

          <Text style={styles.points}>{Number(user.points || 0)} pts</Text>
        </View>
      ))}

      {leaders.length === 0 ? (
        <Text style={styles.empty}>No leaderboard data yet.</Text>
      ) : null}
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
  card: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', width: 55 },
  info: { flex: 1 },
  name: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  accuracy: { color: '#8FA3B8', marginTop: 4 },
  points: { color: '#FFD166', fontSize: 16, fontWeight: 'bold' },
  empty: { color: '#8FA3B8', fontSize: 16, marginTop: 20 },
});
