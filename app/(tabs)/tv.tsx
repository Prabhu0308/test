import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const YOUTUBE_CHANNEL_URL = 'https://youtube.com/@soccerdaily-e2y?si=yF_jsRricrrwqIK1';

export default function TVScreen() {
  async function openYouTube() {
    try {
      const canOpen = await Linking.canOpenURL(YOUTUBE_CHANNEL_URL);

      if (!canOpen) {
        Alert.alert('Could not open YouTube', 'Please try again later.');
        return;
      }

      await Linking.openURL(YOUTUBE_CHANNEL_URL);
    } catch {
      Alert.alert('Could not open YouTube', 'Please try again later.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.icon}>📺</Text>
        <Text style={styles.title}>Soccer Daily TV</Text>
        <Text style={styles.subtitle}>
          Watch Soccer Daily videos, fan reactions, match talk, and app updates on our YouTube channel.
        </Text>

        <Pressable style={styles.watchButton} onPress={openYouTube}>
          <Text style={styles.watchButtonText}>▶ Open Soccer Daily YouTube</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming on Soccer Daily TV</Text>
        <Text style={styles.line}>⚽ Match previews and reactions</Text>
        <Text style={styles.line}>🎡 Prediction Wheel videos</Text>
        <Text style={styles.line}>🔥 Fan Wall highlights</Text>
        <Text style={styles.line}>🎙️ Short soccer opinions</Text>
        <Text style={styles.line}>🏆 Tournament and team talk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fan Reminder</Text>
        <Text style={styles.line}>
          Subscribe to the channel and help Soccer Daily grow before public beta.
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  watchButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#07111F',
    fontSize: 17,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  line: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 7,
  },
});
