import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const challenges = [
  {
    title: '🎯 Predict Match Winner',
    desc: 'Choose the winner of today’s featured match.',
    reward: '+20 XP',
  },
  {
    title: '⚽ Predict Final Score',
    desc: 'Guess the exact score and earn bonus points.',
    reward: '+50 XP',
  },
  {
    title: '💬 Join Fan Wall',
    desc: 'Post your opinion about today’s biggest match.',
    reward: '+10 XP',
  },
  {
    title: '📺 Watch Soccer Daily TV',
    desc: 'Watch today’s match preview.',
    reward: '+5 XP',
  },
];

export default function DailyChallengeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Daily Challenge</Text>
      <Text style={styles.subtitle}>Complete challenges, earn XP, and climb the leaderboard</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY’S FEATURED MATCH</Text>
        <Text style={styles.heroTitle}>🇺🇸 USA vs 🇲🇽 Mexico</Text>
        <Text style={styles.heroText}>Complete all challenges today to earn up to 85 XP.</Text>
      </View>

      {challenges.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardText}>{item.desc}</Text>
          <Text style={styles.reward}>{item.reward}</Text>
        </View>
      ))}

      <Pressable style={styles.button} onPress={() => router.push('/(tabs)/prediction')}>
        <Text style={styles.buttonText}>Start Prediction Challenge</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, lineHeight: 23, marginBottom: 20 },
  hero: { backgroundColor: '#123C69', padding: 20, borderRadius: 22, marginBottom: 20 },
  heroLabel: { color: '#FFD166', fontWeight: 'bold', marginBottom: 10 },
  heroTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  heroText: { color: '#DDE7F0', marginTop: 10, lineHeight: 22 },
  card: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 12 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardText: { color: '#A7B0C0', lineHeight: 22 },
  reward: { color: '#FFD166', fontWeight: 'bold', marginTop: 10 },
  button: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginTop: 12 },
  buttonText: { color: '#07111F', fontWeight: 'bold', textAlign: 'center' },
  backButton: { padding: 14, marginBottom: 40 },
  backText: { color: '#A7B0C0', textAlign: 'center', fontWeight: 'bold' },
});
