import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MatchDetailsScreen() {
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚽ Match Details</Text>

      <View style={styles.card}>
        <Text style={styles.time}>🕒 {params.time || 'Time TBD'}</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.team}>{params.home}</Text>
          <Text style={styles.score}>{params.homeScore}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.team}>{params.away}</Text>
          <Text style={styles.score}>{params.awayScore}</Text>
        </View>

        <Text style={styles.status}>{params.status || 'Scheduled'}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/prediction')}>
        <Text style={styles.buttonText}>Make Prediction</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 24, paddingTop: 70 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#111C2E', padding: 22, borderRadius: 20, marginBottom: 18 },
  time: { color: '#FFD166', fontSize: 16, fontWeight: 'bold', marginBottom: 18 },
  scoreBox: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  team: { color: 'white', fontSize: 22, fontWeight: 'bold', flex: 1 },
  score: { color: '#FFD166', fontSize: 28, fontWeight: 'bold' },
  status: { color: '#A7B0C0', fontSize: 16, marginTop: 8 },
  button: { backgroundColor: '#FFD166', padding: 16, borderRadius: 14, marginBottom: 14 },
  buttonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  backButton: { backgroundColor: '#123C69', padding: 16, borderRadius: 14 },
  backText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
