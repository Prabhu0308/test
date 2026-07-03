import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const labCards = [
  {
    emoji: '🎯',
    title: 'Skill Drills',
    text: 'Simple drills for passing, dribbling, shooting, first touch, and ball control.',
  },
  {
    emoji: '🏃',
    title: 'Fitness Lab',
    text: 'Speed, stamina, stretching, recovery, and basic injury-prevention ideas.',
  },
  {
    emoji: '🧠',
    title: 'Tactics Board',
    text: 'Learn formations, positions, pressing, defending, and attacking shape.',
  },
  {
    emoji: '📓',
    title: 'Player Journal',
    text: 'Write what you practiced, what improved, and what to work on next.',
  },
  {
    emoji: '🎥',
    title: '30-Second Challenge',
    text: 'Coming soon: upload short skill videos and get community feedback.',
  },
];

export default function SoccerLabScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SOCCER DAILY</Text>
        <Text style={styles.title}>⚽ Soccer Lab</Text>
        <Text style={styles.subtitle}>
          A learning space for young players, parents, coaches, and soccer fans.
        </Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Beta Goal</Text>
        <Text style={styles.noteText}>
          Soccer Lab will help players improve skills, understand tactics, and build better soccer habits.
        </Text>
      </View>

      {labCards.map((card) => (
        <View key={card.title} style={styles.card}>
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardText}>{card.text}</Text>
          </View>
        </View>
      ))}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>For Beta Testers</Text>
        <Text style={styles.footerText}>
          Tell us what Soccer Lab should include first: drills, tactics, fitness, or video challenges.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#07111F',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 14,
  },
  hero: {
    backgroundColor: '#07111F',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  noteTitle: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  noteText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  footerCard: {
    backgroundColor: '#FFD166',
    borderRadius: 22,
    padding: 18,
    marginTop: 6,
  },
  footerTitle: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  footerText: {
    color: '#07111F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
