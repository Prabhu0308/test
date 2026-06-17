import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../firebase/config';

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';

export default function PredictionScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [winner, setWinner] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadMatches() {
    try {
      setLoading(true);
      const response = await fetch(ESPN_URL);
      const data = await response.json();

      const cleanMatches = (data.events || []).map((event: any) => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors || [];

        const home = competitors.find((team: any) => team.homeAway === 'home') || competitors[0];
        const away = competitors.find((team: any) => team.homeAway === 'away') || competitors[1];

        return {
          id: event.id,
          home: home?.team?.displayName || 'Home',
          away: away?.team?.displayName || 'Away',
          time: competition?.status?.type?.shortDetail || 'Scheduled',
          league: competition?.altGameNote || 'Soccer',
        };
      });

      setMatches(cleanMatches);
      setSelectedMatch(cleanMatches[0] || null);
    } catch (error: any) {
      Alert.alert('Match Load Error', error.message || 'Could not load matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function submitPrediction() {
    if (!selectedMatch) {
      Alert.alert('No Match', 'Please select a match.');
      return;
    }

    if (!winner) {
      Alert.alert('Missing Winner', 'Please select a winner or draw.');
      return;
    }

    try {
      const data = {
       user: getAuth().currentUser?.email || 'Guest',
       userId: getAuth().currentUser?.uid || 'guest',
       userEmail: getAuth().currentUser?.email || 'guest',
        matchId: selectedMatch.id,
        match: `${selectedMatch.home} vs ${selectedMatch.away}`,
        league: selectedMatch.league,
        winner,
        scorePrediction: `${homeScore || '?'}-${awayScore || '?'}`,
        comment: comment || 'No comment',
        pointsEarned: 1,
        resultChecked: false,
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'predictions'), data);

      Alert.alert('Success', `Prediction saved\nID: ${docRef.id}`);
      setWinner('');
      setHomeScore('');
      setAwayScore('');
      setComment('');
    } catch (error: any) {
      Alert.alert('Firebase Error', error.message || 'Could not save prediction');
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading real matches...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔮 Predictions</Text>
      <Text style={styles.subtitle}>Predict real matches from ESPN data.</Text>

      <Pressable style={styles.refresh} onPress={loadMatches}>
        <Text style={styles.refreshText}>Refresh Matches</Text>
      </Pressable>

      {matches.map((match) => (
        <Pressable
          key={match.id}
          style={[styles.matchCard, selectedMatch?.id === match.id && styles.selectedCard]}
          onPress={() => {
            setSelectedMatch(match);
            setWinner('');
            setHomeScore('');
            setAwayScore('');
            setComment('');
          }}>
          <Text style={styles.league}>{match.league}</Text>
          <Text style={styles.match}>{match.home} vs {match.away}</Text>
          <Text style={styles.time}>{match.time}</Text>
          <Text style={styles.info}>🏟️ {match.stadium}</Text>
	  <Text style={styles.info}>📍 {match.city}</Text>
          <Text style={styles.info}>🕒 {match.date}</Text>	 
        </Pressable>
      ))}

      {selectedMatch ? (
        <View style={styles.predictCard}>
          <Text style={styles.sectionTitle}>{selectedMatch.home} vs {selectedMatch.away}</Text>

          <Pressable style={styles.button} onPress={() => setWinner(selectedMatch.home)}>
            <Text style={styles.buttonText}>{selectedMatch.home}</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setWinner('Draw')}>
            <Text style={styles.buttonText}>Draw</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setWinner(selectedMatch.away)}>
            <Text style={styles.buttonText}>{selectedMatch.away}</Text>
          </Pressable>

          <Text style={styles.selected}>Selected: {winner || 'None'}</Text>

          <View style={styles.scoreRow}>
            <TextInput style={styles.scoreInput} placeholder="0" placeholderTextColor="#8FA3B8" value={homeScore} onChangeText={setHomeScore} keyboardType="number-pad" />
            <Text style={styles.dash}>-</Text>
            <TextInput style={styles.scoreInput} placeholder="0" placeholderTextColor="#8FA3B8" value={awayScore} onChangeText={setAwayScore} keyboardType="number-pad" />
          </View>

          <TextInput style={styles.input} placeholder="Write your comment..." placeholderTextColor="#8FA3B8" value={comment} onChangeText={setComment} multiline />

          <Pressable style={styles.submit} onPress={submitPrediction}>
            <Text style={styles.submitText}>Submit Prediction</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.empty}>No matches found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 18 },
  refresh: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginBottom: 18 },
  refreshText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
  matchCard: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 12 },
  selectedCard: { borderColor: '#FFD166', borderWidth: 2 },
  league: { color: '#FFD166', fontWeight: 'bold', marginBottom: 6 },
  match: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  time: { color: '#8FA3B8', marginTop: 6 },
info: {
  color: '#cfd8e3',
  fontSize: 13,
  marginTop: 2,
},
  predictCard: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginTop: 12, marginBottom: 40 },
  sectionTitle: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  button: { backgroundColor: '#123C69', padding: 14, borderRadius: 12, marginBottom: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  selected: { color: '#FFD166', marginTop: 8, marginBottom: 14, fontWeight: 'bold' },
  scoreRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 14 },
  scoreInput: { backgroundColor: '#07111F', color: 'white', width: 70, padding: 14, borderRadius: 12, textAlign: 'center', fontSize: 20 },
  dash: { color: 'white', fontSize: 28 },
  input: { backgroundColor: '#07111F', color: 'white', padding: 14, borderRadius: 12, minHeight: 90, marginBottom: 14 },
  submit: { backgroundColor: '#FFD166', padding: 15, borderRadius: 12 },
  submitText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  empty: { color: '#8FA3B8', fontSize: 16 },
});
