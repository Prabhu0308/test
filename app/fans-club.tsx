import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const COUNTRIES = [
  'USA Fans',
  'Mexico Fans',
  'Nepal Fans',
  'Argentina Fans',
  'Brazil Fans',
  'England Fans',
  'Spain Fans',
  'France Fans',
  'Germany Fans',
  'Portugal Fans',
  'Italy Fans',
  'Netherlands Fans',
  'Japan Fans',
  'South Korea Fans',
  'Morocco Fans',
  'Canada Fans',
];

const CLUBS = [
  'Arsenal Fans',
  'Manchester United Fans',
  'Manchester City Fans',
  'Liverpool Fans',
  'Chelsea Fans',
  'Tottenham Fans',
  'Barcelona Fans',
  'Real Madrid Fans',
  'Atletico Madrid Fans',
  'Bayern Munich Fans',
  'Dortmund Fans',
  'PSG Fans',
  'Juventus Fans',
  'AC Milan Fans',
  'Inter Milan Fans',
  'Napoli Fans',
  'Inter Miami Fans',
  'LA Galaxy Fans',
  'LAFC Fans',
  'Atlanta United Fans',
  'Seattle Sounders Fans',
  'Austin FC Fans',
  'FC Dallas Fans',
  'Houston Dynamo Fans',
  'Club América Fans',
  'Chivas Fans',
  'Cruz Azul Fans',
  'Tigres Fans',
  'Monterrey Fans',
  'Pumas Fans',
  'Al Nassr Fans',
  'Al Hilal Fans',
];

type Mode = 'main' | 'countries' | 'clubs';

export default function FansClubScreen() {
  const [mode, setMode] = useState<Mode>('main');

  function openRoom(room: string) {
    router.push({
      pathname: '/fan-wall',
      params: { room },
    } as any);
  }

  const rooms = mode === 'countries' ? COUNTRIES : CLUBS;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏟️ Fans Club</Text>
      <Text style={styles.subtitle}>
        Join your country or club fan room and talk soccer with real fans.
      </Text>

      {mode === 'main' ? (
        <View style={styles.card}>
          <Pressable style={styles.bigButton} onPress={() => setMode('countries')}>
            <Text style={styles.bigIcon}>🌎</Text>
            <Text style={styles.bigTitle}>Country Fans</Text>
            <Text style={styles.bigText}>USA, Mexico, Nepal, Brazil, Argentina and more</Text>
          </Pressable>

          <Pressable style={styles.bigButton} onPress={() => setMode('clubs')}>
            <Text style={styles.bigIcon}>⚽</Text>
            <Text style={styles.bigTitle}>Club Fans</Text>
            <Text style={styles.bigText}>Arsenal, Barcelona, Real Madrid, MLS, Liga MX and more</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Pressable style={styles.backButton} onPress={() => setMode('main')}>
            <Text style={styles.backText}>← Back to Fans Club</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>
            {mode === 'countries' ? '🌎 Country Fans' : '⚽ Club Fans'}
          </Text>

          <View style={styles.grid}>
            {rooms.map((room) => (
              <Pressable key={room} style={styles.roomButton} onPress={() => openRoom(room)}>
                <Text style={styles.roomText}>{room}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
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
    paddingBottom: 40,
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 20,
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 23,
  },
  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  bigButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  bigIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  bigTitle: {
    color: '#FFD166',
    fontSize: 26,
    fontWeight: '900',
  },
  bigText: {
    color: '#A7B0C0',
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  backButton: {
    marginBottom: 14,
  },
  backText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },
  grid: {
    gap: 10,
  },
  roomButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  roomText: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
  },
});
