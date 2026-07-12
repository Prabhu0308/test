import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

const sections = [
  {
    icon: '⚽',
    title: 'Ball Mastery',
    text: 'First touch, dribbling, passing, shooting and ball control.',
    youtube: 'https://www.youtube.com/results?search_query=soccer+ball+mastery+training+drills',
  },
  {
    icon: '🏃',
    title: 'Speed & Agility',
    text: 'Acceleration, footwork, quick turns and explosive movement.',
    youtube: 'https://www.youtube.com/results?search_query=soccer+speed+agility+training+drills',
  },
  {
    icon: '💪',
    title: 'Strength Training',
    text: 'Core, legs, balance and injury-safe strength for players.',
    youtube: 'https://www.youtube.com/results?search_query=soccer+strength+training+for+players',
  },
  {
    icon: '🍎',
    title: 'Nutrition',
    text: 'Pre-match meals, recovery food, hydration and healthy snacks.',
    youtube: 'https://www.youtube.com/results?search_query=soccer+nutrition+pre+game+post+game+meals',
  },
  {
    icon: '🧘',
    title: 'Recovery',
    text: 'Stretching, mobility, sleep, rest days and injury prevention.',
    youtube: 'https://www.youtube.com/results?search_query=soccer+recovery+stretching+mobility+routine',
  },
  {
    icon: '⭐',
    title: 'Train Like a Pro',
    text: 'Messi-style control, Ronaldo conditioning, Mbappé speed and Haaland power.',
    youtube: 'https://www.youtube.com/results?search_query=train+like+professional+soccer+player',
  },
];

export default function FitnessScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏋️ Soccer Fitness</Text>
      <Text style={styles.subtitle}>Training • Nutrition • Recovery • Pro Habits</Text>

      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          General fitness information only. For injuries or medical concerns, ask a qualified professional.
        </Text>
      </View>

      <Pressable style={styles.challengeButton} onPress={() => router.push('/daily-challenge' as any)}>
        <Text style={styles.challengeButtonText}>🔥 Open Daily Challenge</Text>
      </Pressable>

      {sections.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.cardTitle}>{item.icon} {item.title}</Text>
          <Text style={styles.cardText}>{item.text}</Text>

          <Pressable style={styles.youtubeButton} onPress={() => Linking.openURL(item.youtube)}>
            <Text style={styles.youtubeText}>▶ Watch on YouTube</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { color: '#FFD166', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#FFFFFF', marginBottom: 18 },
  warningCard: {
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  warningText: { color: '#FFD166', fontSize: 13, lineHeight: 19 },
  challengeButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeButtonText: { color: '#07111F', fontWeight: 'bold', fontSize: 16 },
  card: {
    backgroundColor: '#111C2E',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  cardTitle: { color: '#FFD166', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, marginBottom: 14 },
  youtubeButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  youtubeText: { color: '#07111F', fontWeight: 'bold' },
});
