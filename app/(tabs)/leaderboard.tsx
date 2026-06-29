import { useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebase/config';

type Leader = {
  id: string;
  user: string;
  email: string;
  points: number;
  total: number;
  accuracy: number;
};

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, 'predictions'));

      const users: Record<string, Leader> = {};

      snap.docs.forEach((doc) => {
        const data: any = doc.data();

        const key =
          data.userEmail ||
          data.email ||
          data.user ||
          data.displayName ||
          'Guest';

        if (!users[key]) {
          users[key] = {
            id: key,
            user: data.displayName || data.user || key.split('@')[0] || 'Guest',
            email: data.userEmail || data.email || key,
            points: 0,
            total: 0,
            accuracy: 0,
          };
        }

        const rawPoints = Number(data.points || data.xp || 0);

        const points =
          rawPoints > 0
            ? rawPoints
            : Number(data.confidence || 0) >= 80
              ? 25
              : Number(data.confidence || 0) >= 60
                ? 15
                : 10;

        users[key].points += points;
        users[key].total += 1;
      });

      const list = Object.values(users)
        .map((user) => ({
          ...user,
          accuracy: user.total > 0 ? Math.round(user.points / user.total) : 0,
        }))
       .sort((a, b) => b.points - a.points)
.slice(0, 25);

      setLeaders(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
  useCallback(() => {
    loadLeaderboard();
  }, [])
);

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
    <Text style={styles.subtitle}>Top Soccer Daily Fan XP leaders</Text>

    <Pressable style={styles.refresh} onPress={loadLeaderboard}>
        <Text style={styles.refreshText}>Refresh Leaderboard</Text>
      </Pressable>

      {leaders.map((user, index) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.rank}>#{index + 1}</Text>

          <View style={styles.info}>
            <Text style={styles.name}>{user.user}</Text>
            <Text style={styles.accuracy}>Predictions: {user.total}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <Text style={styles.points}>{user.points} pts</Text>
        </View>
      ))}

      {leaders.length === 0 ? (
        <Text style={styles.empty}>No prediction data yet. Save a prediction first.</Text>
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
  email: { color: '#5F7187', marginTop: 3, fontSize: 12 },
  points: { color: '#FFD166', fontSize: 16, fontWeight: 'bold' },
  empty: { color: '#8FA3B8', fontSize: 16, marginTop: 20 },
});