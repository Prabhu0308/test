import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebase/config';

export default function PredictionHistoryScreen() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPredictions() {
    try {
      const user = getAuth().currentUser;
      const snap = await getDocs(collection(db, 'predictions'));

      const list = snap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item: any) => {
          if (!user) return false;
          return item.userId === user.uid || item.userEmail === user.email;
        })
        .sort((a: any, b: any) =>
          Number(b.createdAt || 0) - Number(a.createdAt || 0)
        );

      setPredictions(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPredictions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Prediction History</Text>

      {predictions.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.match}>{item.match}</Text>

          <Text style={styles.text}>
            Prediction: {item.winner}
          </Text>

          <Text style={styles.text}>
            Score: {item.scorePrediction}
          </Text>

          <Text style={styles.points}>
            +{item.pointsEarned || 0} pts
          </Text>

          <Text style={styles.status}>
            {item.resultChecked ? '✅ Checked' : '⏳ Pending'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 12 },
  match: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { color: '#A7B0C0', marginBottom: 4 },
  points: { color: '#FFD166', fontWeight: 'bold', marginTop: 6 },
  status: { color: 'white', marginTop: 4 },
});
