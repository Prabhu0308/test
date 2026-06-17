import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const userEmail = 'prabhudevupadhyay@gmail.com';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.title}>👤 Profile</Text>

      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>P</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Soccer Daily Fan</Text>
          <Text style={styles.email}>{userEmail}</Text>
          <Text style={styles.level}>🏆 Level 8 • Gold Predictor</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🏆 Points</Text>
          <Text style={styles.statNumber}>145</Text>
          <Text style={styles.statSmall}>XP earned</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🎯 Accuracy</Text>
          <Text style={styles.statNumber}>72%</Text>
          <Text style={styles.statSmall}>Excellent</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🔥 Streak</Text>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statSmall}>days active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>📈 Rank</Text>
          <Text style={styles.statNumber}>#18</Text>
          <Text style={styles.statSmall}>Top players</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Favorite Team</Text>
        <Text style={styles.cardText}>Manchester City</Text>
        <Text style={styles.cardSmall}>Premier League</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Last Prediction</Text>
        <Text style={styles.cardText}>Chelsea 2 - 1 Arsenal</Text>
        <Text style={styles.success}>✅ Correct Prediction • +20 pts</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏅 Badges</Text>
        <Text style={styles.badges}>🥇 ⚽ 🔥 🎯 🏆 🌎</Text>
        <Text style={styles.cardSmall}>First Win • 5 Day Streak • Top 100</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎖 Achievements</Text>
        <Text style={styles.achievement}>✓ First Prediction</Text>
        <Text style={styles.achievement}>✓ 100 Points Earned</Text>
        <Text style={styles.achievement}>✓ 5 Correct Predictions</Text>
        <Text style={styles.achievement}>✓ Favorite Team Selected</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>↻ Refresh Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 38, fontWeight: 'bold', marginBottom: 20 },
  heroCard: {
    backgroundColor: '#144A7A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#07111F', fontSize: 34, fontWeight: 'bold' },
  name: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  email: { color: '#B8C2D6', fontSize: 15, marginTop: 4 },
  level: { color: '#FFD166', fontSize: 15, marginTop: 8, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#111C2E', borderRadius: 18, padding: 18 },
  statLabel: { color: '#FFD166', fontSize: 17, fontWeight: 'bold' },
  statNumber: { color: 'white', fontSize: 38, fontWeight: 'bold', marginTop: 12 },
  statSmall: { color: '#A7B0C0', marginTop: 4, fontSize: 14 },
  card: { backgroundColor: '#111C2E', borderRadius: 18, padding: 20, marginBottom: 16 },
  cardTitle: { color: '#FFD166', fontSize: 25, fontWeight: 'bold', marginBottom: 10 },
  cardText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  cardSmall: { color: '#A7B0C0', fontSize: 16, marginTop: 6 },
  success: { color: '#7CFF9B', fontSize: 16, marginTop: 8, fontWeight: 'bold' },
  badges: { fontSize: 34, marginVertical: 8 },
  achievement: { color: '#D8E0EF', fontSize: 17, marginTop: 8 },
  button: { backgroundColor: '#FFD166', padding: 16, borderRadius: 18, marginTop: 8 },
  buttonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
});
