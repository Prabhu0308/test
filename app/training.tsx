import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const weeklyPlan = [
  {
    day: 'Monday',
    title: 'Ball Control Day',
    icon: '⚽',
    plan: [
      'Warm-up: 5 minutes',
      'Dribbling touches: 15 minutes',
      'Cone control: 10 minutes',
      'Weak foot practice: 10 minutes',
      'Cooldown: 5 minutes',
    ],
  },
  {
    day: 'Tuesday',
    title: 'Speed & Agility',
    icon: '⚡',
    plan: [
      'Warm-up jog: 5 minutes',
      'Quick feet drills: 10 minutes',
      'Sprint intervals: 10 minutes',
      'Change of direction: 10 minutes',
      'Stretching: 5 minutes',
    ],
  },
  {
    day: 'Wednesday',
    title: 'Passing & First Touch',
    icon: '🎯',
    plan: [
      'Wall passes: 15 minutes',
      'One-touch passing: 10 minutes',
      'First touch control: 10 minutes',
      'Both feet practice: 10 minutes',
    ],
  },
  {
    day: 'Thursday',
    title: 'Shooting Practice',
    icon: '🥅',
    plan: [
      'Warm-up: 5 minutes',
      'Inside-foot shooting: 10 minutes',
      'Power shots: 10 minutes',
      'Weak foot shots: 10 minutes',
      'Finishing angles: 10 minutes',
    ],
  },
  {
    day: 'Friday',
    title: 'Fitness & Stamina',
    icon: '💪',
    plan: [
      'Light jog: 8 minutes',
      'Bodyweight squats: 3 sets',
      'Lunges: 3 sets',
      'Core plank: 3 rounds',
      'Cooldown walk: 5 minutes',
    ],
  },
  {
    day: 'Saturday',
    title: 'Match Day / Small Game',
    icon: '🏟️',
    plan: [
      'Easy warm-up: 10 minutes',
      'Small-sided game or match',
      'Practice teamwork and positioning',
      'Post-game stretching',
    ],
  },
  {
    day: 'Sunday',
    title: 'Recovery Day',
    icon: '🧘',
    plan: [
      'Light walk: 15 minutes',
      'Stretching: 10 minutes',
      'Hydration focus',
      'Sleep and recovery',
    ],
  },
];

const SOCCER_DAILY_YOUTUBE = 'https://www.youtube.com/channel/UC-FNALunTqvcdrlFMo4nVfA';

async function openSoccerDailyYouTube() {
  try {
    const canOpen = await Linking.canOpenURL(SOCCER_DAILY_YOUTUBE);
    if (!canOpen) {
      console.log('YouTube link could not open:', SOCCER_DAILY_YOUTUBE);
      return;
    }

    await Linking.openURL(SOCCER_DAILY_YOUTUBE);
  } catch (error) {
    console.log('YouTube link could not open:', SOCCER_DAILY_YOUTUBE);
  }
}

export default function TrainingScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Soccer Daily</Text>
        <Text style={styles.title}>Training & Fitness</Text>

      <View style={styles.youtubeCard}>
        <Text style={styles.youtubeTitle}>📺 Soccer Daily Training Videos</Text>
        <Text style={styles.youtubeText}>
          Watch Soccer Daily videos on YouTube for training, fitness, match ideas, and fan content.
        </Text>
        <Pressable
          style={styles.youtubeButton}
          onPress={openSoccerDailyYouTube}
        >
          <Text style={styles.youtubeButtonText}>Open Soccer Daily YouTube</Text>
        </Pressable>
      </View>


        <Text style={styles.subtitle}>
          Weekly soccer training, fitness, food, hydration, and recovery tips for everyday players.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚽ Weekly Soccer Training Plan</Text>
        <Text style={styles.sectionText}>
          A simple weekly plan for ball control, speed, passing, shooting, fitness, match day, and recovery.
        </Text>
      </View>

      {weeklyPlan.map((item) => (
        <View key={item.day} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.day}>{item.day}</Text>
              <Text style={styles.dayTitle}>{item.title}</Text>
            </View>
          </View>

          {item.plan.map((line) => (
            <Text key={line} style={styles.planLine}>• {line}</Text>
          ))}
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🥗 Soccer Food & Hydration</Text>
        <Text style={styles.sectionText}>
          Before training: simple carbs, water, and light food. After training: protein, healthy carbs, and hydration.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎥 Training Videos</Text>
        <Text style={styles.sectionText}>
          Open Soccer Daily TV for training videos, food tips, recovery ideas, and official app updates.
        </Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Safety Disclaimer</Text>
        <Text style={styles.warningText}>
          General soccer training, fitness, food, and hydration content only. Not medical or diet advice. Train safely and consult a coach, doctor, dietitian, or parent/guardian if needed.
        </Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
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
    padding: 18,
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#0F1B2D',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.25)',
  },
  kicker: {
    color: '#FFD166',
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#0F1B2D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  sectionText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
  dayCard: {
    backgroundColor: '#102033',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dayIcon: {
    fontSize: 30,
  },
  day: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  planLine: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 23,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 209, 102, 0.1)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  warningTitle: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  warningText: {
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#FFD166',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: '900',
  },

  youtubeCard: {
    backgroundColor: '#111C2E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  youtubeTitle: {
    color: '#FFD166',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  youtubeText: {
    color: '#DDE7F0',
    lineHeight: 22,
    marginBottom: 12,
  },
  youtubeButton: {
    backgroundColor: '#FFD166',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  youtubeButtonText: {
    color: '#07111F',
    fontWeight: '900',
    textAlign: 'center',
  },
});
