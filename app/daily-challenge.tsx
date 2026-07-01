import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DailyChallengeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔥 Daily Soccer Challenge</Text>
      <Text style={styles.subtitle}>Train smarter every day: skill, fitness, food, and recovery.</Text>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightTitle}>Today’s Focus</Text>
        <Text style={styles.highlightText}>First touch + short sprint conditioning</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🟢 Beginner</Text>
        <Text style={styles.cardText}>10 minutes ball control using both feet. Keep the ball close.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🟡 Intermediate</Text>
        <Text style={styles.cardText}>5 rounds: 30 seconds dribbling + 30 seconds sprint recovery walk.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔴 Pro Challenge</Text>
        <Text style={styles.cardText}>3 sets: cone dribble, quick turn, 10-meter sprint, controlled finish.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍎 Food Tip</Text>
        <Text style={styles.cardText}>Before training: carbs + protein + water. Example: banana, eggs, rice, yogurt, or oatmeal.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧘 Recovery Tip</Text>
        <Text style={styles.cardText}>After training, stretch calves, hamstrings, hips, and lower back for 5 minutes.</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          General fitness information only. Stop if you feel pain and ask a qualified professional if needed.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { color: '#FFD166', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#FFFFFF', marginBottom: 20 },
  highlightCard: {
    backgroundColor: '#FFD166',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  highlightTitle: { color: '#07111F', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  highlightText: { color: '#07111F', fontSize: 18, fontWeight: 'bold' },
  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { color: '#FFD166', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  warningCard: {
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  warningText: { color: '#FFD166', fontSize: 13, lineHeight: 19 },
});
