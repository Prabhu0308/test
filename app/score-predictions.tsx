import { router } from 'expo-router';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { db } from '../firebase/config';

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';

export default function ScorePredictionsScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Ready to check prediction results.');

  async function checkResults() {
    try {
      setLoading(true);
      setMessage('Checking ESPN results...');

      const response = await fetch(ESPN_URL);
      const espnData = await response.json();

      const matches: any = {};

      (espnData.events || []).forEach((event: any) => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors || [];

        const home = competitors.find((t: any) => t.homeAway === 'home') || competitors[0];
        const away = competitors.find((t: any) => t.homeAway === 'away') || competitors[1];

        const homeScore = Number(home?.score || 0);
        const awayScore = Number(away?.score || 0);

        let actualWinner = 'Draw';
        if (homeScore > awayScore) actualWinner = home?.team?.displayName;
        if (awayScore > homeScore) actualWinner = away?.team?.displayName;

        matches[event.id] = {
          completed: competition?.status?.type?.completed || false,
          actualWinner,
          actualScore: `${homeScore}-${awayScore}`,
        };
      });

      const predictionSnap = await getDocs(collection(db, 'predictions'));

      let checked = 0;
      let awarded = 0;

      for (const item of predictionSnap.docs) {
        const prediction: any = item.data();

        if (prediction.resultChecked === true) continue;

        const match = matches[prediction.matchId];
        if (!match || !match.completed) continue;

        let points = 0;

        if (prediction.scorePrediction === match.actualScore) {
          points = 25;
        } else if (prediction.winner === match.actualWinner) {
          points = 10;
        }

        await updateDoc(doc(db, 'predictions', item.id), {
          resultChecked: true,
          pointsEarned: points,
          actualWinner: match.actualWinner,
          actualScore: match.actualScore,
        });

        const leaderId = prediction.userId || 'prabhu';
        const leaderRef = doc(db, 'leaderboard', leaderId);
        const leaderSnap = await getDoc(leaderRef);

        const allUserPredictions = predictionSnap.docs
          .map((docItem) => docItem.data())
          .filter((p: any) =>
            (p.userId === prediction.userId || p.userEmail === prediction.userEmail) &&
            p.resultChecked === true
          );

        const correctPredictions = allUserPredictions.filter((p: any) =>
          Number(p.pointsEarned || 0) > 0
        ).length;

        const totalChecked = allUserPredictions.length;
        const accuracy = totalChecked === 0 ? 0 : Math.round((correctPredictions / totalChecked) * 100);

        if (leaderSnap.exists()) {
          const currentPoints = Number(leaderSnap.data().points || 0);
          await updateDoc(leaderRef, {
            points: currentPoints + points,
            user: prediction.user || prediction.userEmail || 'User',
            accuracy,
            checkedPredictions: totalChecked,
            correctPredictions,
          });
        } else {
          await setDoc(leaderRef, {
            user: prediction.user || prediction.userEmail || 'User',
            points,
            accuracy,
            checkedPredictions: totalChecked,
            correctPredictions,
            rank: 1,
          });
        }

        checked += 1;
        awarded += points;
      }

      setMessage(`Checked ${checked} predictions. Awarded ${awarded} points.`);
      Alert.alert('Scoring Complete', `Checked ${checked} predictions.\nAwarded ${awarded} points.`);
    } catch (error: any) {
      Alert.alert('Scoring Error', error.message || 'Could not score predictions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Smart Scoring</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <Pressable style={styles.button} onPress={checkResults}>
        {loading ? (
          <ActivityIndicator color="#07111F" />
        ) : (
          <Text style={styles.buttonText}>Check Prediction Results</Text>
        )}
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 24, paddingTop: 70 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#FFD166', padding: 16, borderRadius: 14, marginBottom: 14 },
  buttonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  backButton: { backgroundColor: '#111C2E', padding: 16, borderRadius: 14 },
  backText: { color: '#FFD166', textAlign: 'center', fontWeight: 'bold' },
});
