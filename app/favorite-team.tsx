import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { db } from '../firebase/config';

const teams = [
  'Real Madrid',
  'Barcelona',
  'Manchester City',
  'Liverpool',
  'Arsenal',
  'Nepal',
  'India',
  'USA',
  'Argentina',
  'Brazil',
];

export default function FavoriteTeamScreen() {
  async function saveTeam(team: string) {
    const user = getAuth().currentUser;

    if (!user) {
      Alert.alert('Please login first');
      return;
    }

    await setDoc(
      doc(db, 'users', user.uid),
      {
        favoriteTeam: team,
        email: user.email,
      },
      { merge: true }
    );

    Alert.alert('Success', `${team} saved as favorite team`);
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⭐ Select Favorite Team</Text>

      {teams.map((team) => (
        <Pressable key={team} style={styles.button} onPress={() => saveTeam(team)}>
          <Text style={styles.buttonText}>{team}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#111C2E', padding: 18, borderRadius: 16, marginBottom: 12 },
  buttonText: { color: '#FFD166', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
