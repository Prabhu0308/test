import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PredictionRulesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📘 Predictor League Rules</Text>
      <Text style={styles.subtitle}>
        Official Soccer Daily rules for GOAT, Diamond, Gold, Super, Rising, and Fan Predictors.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Weekly Season</Text>
        <Text style={styles.text}>• Weekly cycle runs Monday 00:00 UTC to next Monday 00:00 UTC.</Text>
        <Text style={styles.text}>• Greenwich / UTC time is the standard for all users worldwide.</Text>
        <Text style={styles.text}>• Only one user can be 🐐 GOAT Predictor each weekly cycle.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏳ When Points Count</Text>
        <Text style={styles.text}>• Saved prediction = pending, but user receives small participation points.</Text>
        <Text style={styles.text}>• Participation points keep users active even before the final result.</Text>
        <Text style={styles.text}>• Game starts = prediction locks.</Text>
        <Text style={styles.text}>• Game live = no leaderboard points yet.</Text>
        <Text style={styles.text}>• Game final = points are calculated.</Text>
        <Text style={styles.text}>• If a game is still live at weekly reset, it counts in the next cycle after final result.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧮 Scientific Point Formula</Text>
        <Text style={styles.text}>Correct winner: 60 points.</Text>
        <Text style={styles.text}>Correct draw: 70 points because draw is harder.</Text>
        <Text style={styles.text}>Confidence bonus: up to 20 points.</Text>
        <Text style={styles.text}>Difficulty / underdog bonus: up to 15 points.</Text>
        <Text style={styles.text}>Early pick bonus: up to 5 points.</Text>
        <Text style={styles.text}>Correct streak bonus: up to 10 points.</Text>
        <Text style={styles.text}>Participation points: 2 points per saved prediction.</Text>
        <Text style={styles.text}>Early prediction bonus: up to 5 points when prediction is made before kickoff.</Text>
        <Text style={styles.text}>Wrong prediction: keeps participation points, but gets 0 final-result points for beta.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🐐 Ranking Titles</Text>
        <Text style={styles.text}>🐐 GOAT Predictor = Rank #1 only.</Text>
        <Text style={styles.text}>💎 Diamond Predictor = Rank #2.</Text>
        <Text style={styles.text}>🥇 Gold Predictor = Rank #3.</Text>
        <Text style={styles.text}>🔥 Super Predictors = Rank #4–10.</Text>
        <Text style={styles.text}>⭐ Rising Predictors = Rank #11–25.</Text>
        <Text style={styles.text}>⚽ Fan Predictors = all active users after that.</Text>
        <Text style={styles.text}>Every participant can see their points even if they are not in GOAT, Diamond, Gold, Super, or Rising groups.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Tie-Breaker Rules</Text>
        <Text style={styles.text}>If two users have equal points, ranking is decided by:</Text>
        <Text style={styles.text}>1. Higher accuracy percentage.</Text>
        <Text style={styles.text}>2. More correct predictions.</Text>
        <Text style={styles.text}>3. More difficult picks / underdog points.</Text>
        <Text style={styles.text}>4. Earlier prediction behavior.</Text>
        <Text style={styles.text}>5. Longer correct streak.</Text>
        <Text style={styles.text}>6. User who reached the score first.</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          Soccer Daily predictions are for fun, fan engagement, and sports discussion only. Not betting advice.
        </Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Predictions</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },
  title: {
    color: '#FFD166',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#DDE7F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#111C2E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.16)',
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  text: {
    color: '#DDE7F0',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.28)',
  },
  warningText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#FFD166',
    borderRadius: 16,
    padding: 15,
  },
  backButtonText: {
    color: '#07111F',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
});
