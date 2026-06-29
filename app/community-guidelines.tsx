import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const rules = [
  {
    title: '13+ Community',
    text: 'Fan Wall, comments, reactions, photo uploads, and video uploads are for users 13 years or older.',
    icon: '🔞',
  },
  {
    title: 'Respect Other Fans',
    text: 'Debate is welcome, but bullying, harassment, threats, hate speech, and personal attacks are not allowed.',
    icon: '🤝',
  },
  {
    title: 'Protect Privacy',
    text: 'Do not post phone numbers, home addresses, school addresses, private messages, or personal information about yourself or others.',
    icon: '🛡️',
  },
  {
    title: 'Only Upload Your Own Content',
    text: 'Do not upload TV match clips, copyrighted highlights, paid broadcast footage, or videos/photos you do not have permission to use.',
    icon: '🎥',
  },
  {
    title: 'Keep It Safe',
    text: 'Do not post sexual content, violent threats, dangerous challenges, scams, suspicious links, or harmful content.',
    icon: '✅',
  },
  {
    title: 'No Gambling Promotion',
    text: 'Prediction Wheel is for fan fun only. Do not promote betting, sell betting tips, or target minors with gambling content.',
    icon: '🎡',
  },
  {
    title: 'No Impersonation',
    text: 'Do not pretend to be a player, coach, club, journalist, admin, or another user.',
    icon: '🎭',
  },
  {
    title: 'Report Problems',
    text: 'If you see something unsafe or inappropriate, use the Report button. Soccer Daily may review and remove reported content.',
    icon: '🚩',
  },
  {
    title: 'Moderation',
    text: 'Soccer Daily may remove posts, comments, photos, videos, or accounts that break these guidelines.',
    icon: '⚖️',
  },
];

export default function CommunityGuidelinesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>⚽</Text>
        <Text style={styles.title}>Community Guidelines</Text>
        <Text style={styles.subtitle}>
          Soccer Daily is a fan community. Support your team, share your opinion,
          and keep the game respectful.
        </Text>
      </View>

      <View style={styles.agreementBox}>
        <Text style={styles.agreementTitle}>Before using Fan Wall</Text>
        <Text style={styles.agreementText}>
          By using Fan Wall, you confirm that you are 13 or older and agree to follow
          these Community Guidelines.
        </Text>
      </View>

      {rules.map((rule) => (
        <View key={rule.title} style={styles.ruleCard}>
          <Text style={styles.ruleIcon}>{rule.icon}</Text>
          <View style={styles.ruleTextBox}>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleText}>{rule.text}</Text>
          </View>
        </View>
      ))}

      <View style={styles.finalBox}>
        <Text style={styles.finalTitle}>Final Rule</Text>
        <Text style={styles.finalText}>
          Use Soccer Daily like a real soccer community: support your team, respect
          other fans, and keep the game beautiful.
        </Text>
      </View>
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
    paddingTop: 70,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginBottom: 18,
  },
  backText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  hero: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    color: '#FFD166',
    fontSize: 31,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  agreementBox: {
    backgroundColor: '#1A2A44',
    borderWidth: 1,
    borderColor: '#FFD166',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },
  agreementTitle: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  agreementText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
  },
  ruleCard: {
    flexDirection: 'row',
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
  },
  ruleIcon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  ruleTextBox: {
    flex: 1,
  },
  ruleTitle: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ruleText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 21,
  },
  finalBox: {
    backgroundColor: '#0B3B2E',
    borderWidth: 1,
    borderColor: '#22C55E',
    padding: 18,
    borderRadius: 20,
    marginTop: 6,
  },
  finalTitle: {
    color: '#BBF7D0',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  finalText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
  },
});
