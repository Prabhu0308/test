import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const YOUTUBE_URL = 'https://www.youtube.com/channel/UC-FNALunTqvcdrlFMo4nVfA';

export default function TVScreen() {
  const openYouTube = () => {
    Linking.openURL(YOUTUBE_URL);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📺 Soccer Daily TV</Text>
      <Text style={styles.subtitle}>
        Football shows, shorts, match previews, podcasts, and fan stories.
      </Text>

      <View style={styles.hero}>
        <Text style={styles.badge}>COMING SOON</Text>
        <Text style={styles.heroTitle}>🎙 Morning Kickoff</Text>
        <Text style={styles.heroText}>
          Daily football news, biggest matches, transfer updates, and predictions.
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>👥 12K</Text>
          <Text style={styles.stat}>🎥 250+</Text>
        </View>

        <Pressable style={styles.watchButton} onPress={openYouTube}>
          <Text style={styles.watchButtonText}>▶ Subscribe & Watch</Text>
        </Pressable>
      </View>

      <View style={styles.liveCard}>
        <Text style={styles.liveBadge}>🔴 LIVE NOW</Text>
        <Text style={styles.liveTitle}>No Live Show</Text>
        <Text style={styles.liveText}>Next Live</Text>
        <Text style={styles.nextLive}>USA vs Mexico Preview</Text>
        <Text style={styles.liveTime}>Starts in 2h 15m</Text>

        <Pressable style={styles.notifyButton}>
          <Text style={styles.notifyText}>Notify Me</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Browse by Category</Text>

      <View style={styles.grid}>
        {[
          '🔴 Live Shows',
          '⚽ Match Preview',
          '🔥 Goal Zone',
          '📰 Daily News',
          '🎙 Interviews',
          '📊 Analysis',
          '🏆 World Cup',
          '❤️ Fan Stories',
        ].map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.cardText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>🔥 Trending Today</Text>

      {[
        ['🇺🇸 USA vs Mexico Preview', '12K Views • 2 hours ago'],
        ['🔥 Top 10 Goals This Week', '35K Views • Yesterday'],
        ['🎙 Transfer Talk', '8K Views • Today'],
      ].map(([title, meta]) => (
        <View key={title} style={styles.videoCard}>
          <View style={styles.thumbnail}>
            <Text style={styles.play}>▶</Text>
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{title}</Text>
            <Text style={styles.videoMeta}>{meta}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Featured Programs</Text>

      <View style={styles.program}>
        <Text style={styles.programTitle}>☀️ Soccer Daily Morning</Text>
        <Text style={styles.programText}>Your daily football briefing in 3–5 minutes.</Text>
      </View>

      <View style={styles.program}>
        <Text style={styles.programTitle}>🔮 Weekend Predictions</Text>
        <Text style={styles.programText}>Score predictions, upset picks, and fan voting.</Text>
      </View>

      <View style={styles.program}>
        <Text style={styles.programTitle}>💬 Fan Voice</Text>
        <Text style={styles.programText}>Football fans share opinions, reactions, and match thoughts.</Text>
      </View>

      <Text style={styles.footer}>Powered by Soccer Daily Studios</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A7B0C0', fontSize: 16, lineHeight: 23, marginBottom: 20 },

  hero: { backgroundColor: '#123C69', padding: 20, borderRadius: 22, marginBottom: 20 },
  badge: { color: '#07111F', backgroundColor: '#FFD166', alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, fontWeight: 'bold', marginBottom: 12 },
  heroTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  heroText: { color: '#DDE7F0', fontSize: 16, lineHeight: 24, marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 18 },
  stat: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  watchButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 16 },
  watchButtonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  liveCard: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 22 },
  liveBadge: { color: '#FF4D4F', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  liveTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  liveText: { color: '#8FA3B8', fontSize: 16, marginTop: 8 },
  nextLive: { color: '#FFD166', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  liveTime: { color: '#8FA3B8', marginTop: 6 },
  notifyButton: { backgroundColor: '#FFD166', paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  notifyText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  section: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  card: { backgroundColor: '#111C2E', width: '48%', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

  videoCard: { flexDirection: 'row', backgroundColor: '#111C2E', borderRadius: 18, padding: 12, marginBottom: 14, alignItems: 'center' },
  thumbnail: { width: 110, height: 70, backgroundColor: '#1D4E89', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  play: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  videoInfo: { flex: 1, marginLeft: 14 },
  videoTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  videoMeta: { color: '#A7B0C0', marginTop: 6 },

  program: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 14 },
  programTitle: { color: '#FFD166', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  programText: { color: '#A7B0C0', fontSize: 16, lineHeight: 23 },

  footer: { color: '#FFD166', textAlign: 'center', marginTop: 12, marginBottom: 40, fontWeight: 'bold' },
});
