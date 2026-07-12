import { ScrollView, StyleSheet, Text, View } from 'react-native';

const days = [
  ['Monday', '⚽ Ball Control', '10–20 minutes of first touch, juggling, close dribbling.'],
  ['Tuesday', '🏃 Speed & Agility', 'Short sprints, ladder footwork, quick turns.'],
  ['Wednesday', '💪 Strength', 'Core, legs, balance, bodyweight exercises.'],
  ['Thursday', '🎯 Passing', 'Wall passing, one-touch passing, weak-foot practice.'],
  ['Friday', '🥅 Shooting', 'Finishing, placement, power shots, free kicks.'],
  ['Saturday', '🏟️ Match Day', 'Play, compete, communicate, learn from mistakes.'],
  ['Sunday', '🧘 Recovery', 'Stretching, light walk, hydration, sleep, rest.'],
];

export default function WeeklyPlanScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📅 Weekly Training Plan</Text>
      <Text style={styles.subtitle}>A simple weekly soccer routine for steady improvement.</Text>

      {days.map(([day, title, text]) => (
        <View key={day} style={styles.card}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>{text}</Text>
        </View>
      ))}

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          Adjust intensity based on age, fitness level, and health. Rest when needed.
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
  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  day: { color: '#8EA4C8', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
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
