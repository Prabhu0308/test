import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../firebase/config';

const COUNTRY_CLUBS: any = {
  USA: ['Inter Miami', 'LA Galaxy', 'LAFC', 'Atlanta United', 'Seattle Sounders', 'Austin FC', 'FC Dallas', 'Houston Dynamo', 'New York City FC', 'New York Red Bulls', 'Columbus Crew', 'Orlando City', 'Portland Timbers', 'Sporting KC'],
  Mexico: ['Club América', 'Chivas', 'Cruz Azul', 'Tigres', 'Monterrey', 'Pumas', 'Toluca', 'Pachuca', 'León', 'Santos Laguna', 'Atlas', 'Necaxa'],
  England: ['Arsenal', 'Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Tottenham', 'Newcastle United', 'Aston Villa', 'West Ham', 'Everton', 'Leeds United', 'Nottingham Forest'],
  Spain: ['Barcelona', 'Real Madrid', 'Atletico Madrid', 'Sevilla', 'Valencia', 'Villarreal', 'Real Sociedad', 'Athletic Club', 'Real Betis', 'Celta Vigo', 'Getafe', 'Espanyol'],
  Germany: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart', 'Werder Bremen', 'Wolfsburg', 'Borussia Monchengladbach', 'Freiburg'],
  France: ['PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Nice', 'Lens', 'Rennes', 'Nantes', 'Saint-Étienne'],
  Italy: ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Torino', 'Bologna', 'Genoa', 'Sampdoria'],
  Portugal: ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória SC', 'Boavista', 'Marítimo', 'Rio Ave'],
  Brazil: ['Flamengo', 'Palmeiras', 'Santos', 'São Paulo', 'Corinthians', 'Fluminense', 'Vasco da Gama', 'Botafogo', 'Grêmio', 'Internacional', 'Cruzeiro', 'Atlético Mineiro'],
  Argentina: ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo', 'Estudiantes', 'Vélez Sarsfield', 'Rosario Central', 'Newell’s Old Boys', 'Huracán'],
  SaudiArabia: ['Al Nassr', 'Al Hilal', 'Al Ittihad', 'Al Ahli', 'Al Shabab', 'Al Ettifaq', 'Al Taawoun', 'Al Fateh'],
  Nepal: ['Church Boys United', 'Machhindra FC', 'Manang Marshyangdi Club', 'Three Star Club', 'Nepal Police Club', 'APF Club', 'Tribhuvan Army FC'],
  India: ['Mohun Bagan Super Giant', 'East Bengal FC', 'Bengaluru FC', 'Mumbai City FC', 'Kerala Blasters FC', 'FC Goa', 'Chennaiyin FC', 'Shillong Lajong FC'],
};

const NATIONAL_TEAMS: any = {
  USA: '🇺🇸 USA National Team',
  Mexico: '🇲🇽 Mexico National Team',
  England: '🏴 England National Team',
  Spain: '🇪🇸 Spain National Team',
  Germany: '🇩🇪 Germany National Team',
  France: '🇫🇷 France National Team',
  Italy: '🇮🇹 Italy National Team',
  Portugal: '🇵🇹 Portugal National Team',
  Brazil: '🇧🇷 Brazil National Team',
  Argentina: '🇦🇷 Argentina National Team',
  SaudiArabia: '🇸🇦 Saudi Arabia National Team',
  Nepal: '🇳🇵 Nepal National Team',
  India: '🇮🇳 India National Team',
};

function countryLabel(country: string) {
  return country === 'SaudiArabia' ? 'Saudi Arabia' : country;
}

function roomsForCountry(country: string) {
  return [NATIONAL_TEAMS[country], ...COUNTRY_CLUBS[country]];
}

export default function FansClubScreen() {
  const countries = Object.keys(COUNTRY_CLUBS);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [favoriteBadge, setFavoriteBadge] = useState('');
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadFavorite();
    }, [])
  );

  async function loadFavorite() {
    const saved = await AsyncStorage.getItem('favoriteFanBadge');
    const savedList = await AsyncStorage.getItem('followedFanTeams');

    setFavoriteBadge(saved || '');

    try {
      setFollowedTeams(savedList ? JSON.parse(savedList) : []);
    } catch {
      setFollowedTeams([]);
    }
  }

  async function followAndOpen(country: string, room: string) {
    const badge = `${countryLabel(country)} - ${room}`;
    const user = getAuth().currentUser;

    let nextTeams = followedTeams.includes(badge)
      ? followedTeams
      : [...followedTeams, badge];

    if (nextTeams.length > 3) {
      nextTeams = [nextTeams[1], nextTeams[2], badge];
    }

    await AsyncStorage.setItem('favoriteFanBadge', badge);
    await AsyncStorage.setItem('followedFanTeams', JSON.stringify(nextTeams));
    await AsyncStorage.setItem('favoriteFanCountry', countryLabel(country));
    await AsyncStorage.setItem('favoriteFanClub', room);

    setFavoriteBadge(badge);
    setFollowedTeams(nextTeams);

    if (user?.uid) {
      await setDoc(
        doc(db, 'userProfiles', user.uid),
        {
          favoriteFanBadge: badge,
          followedFanTeams: nextTeams,
          favoriteFanCountry: countryLabel(country),
          favoriteFanClub: room,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    router.push({
      pathname: '/fan-wall',
      params: { room: badge },
    } as any);
  }

  async function removeFavorites() {
    const user = getAuth().currentUser;

    await AsyncStorage.removeItem('favoriteFanBadge');
    await AsyncStorage.removeItem('followedFanTeams');
    await AsyncStorage.removeItem('favoriteFanCountry');
    await AsyncStorage.removeItem('favoriteFanClub');

    setFavoriteBadge('');
    setFollowedTeams([]);

    if (user?.uid) {
      await setDoc(
        doc(db, 'userProfiles', user.uid),
        {
          favoriteFanBadge: '',
          followedFanTeams: [],
          favoriteFanCountry: '',
          favoriteFanClub: '',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  }

  const search = searchText.trim().toLowerCase();

  const countryResults = countries.filter((country) =>
    countryLabel(country).toLowerCase().includes(search)
  );

  const allRoomResults = countries.flatMap((country) =>
    roomsForCountry(country).map((room: string) => ({
      country,
      room,
      badge: `${countryLabel(country)} - ${room}`,
    }))
  );

  const globalRoomResults = search
    ? allRoomResults.filter((item) =>
        item.badge.toLowerCase().includes(search)
      )
    : [];

  const selectedRooms = selectedCountry ? roomsForCountry(selectedCountry) : [];

  const selectedRoomResults = selectedCountry
    ? selectedRooms.filter((room: string) =>
        `${countryLabel(selectedCountry)} ${room}`.toLowerCase().includes(search)
      )
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🏟️ Fans Club</Text>
      <Text style={styles.subtitle}>
        Search country, national team, or club. Follow up to 3 teams.
      </Text>

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={selectedCountry ? 'Search this country’s clubs...' : 'Search country, club, or national team...'}
        placeholderTextColor="#6F7F9B"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        enablesReturnKeyAutomatically
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      <View style={styles.favoriteCard}>
        <Text style={styles.favoriteTitle}>⭐ Main Fan Badge</Text>
        <Text style={styles.favoriteText}>{favoriteBadge || 'No favorite selected yet'}</Text>

        <Text style={styles.followedTitle}>Following up to 3 teams</Text>
        {followedTeams.length ? (
          followedTeams.map((team) => (
            <Text key={team} style={styles.followedTeam}>• {team}</Text>
          ))
        ) : (
          <Text style={styles.followedTeam}>No followed teams yet</Text>
        )}

        {followedTeams.length ? (
          <Pressable style={styles.removeButton} onPress={removeFavorites}>
            <Text style={styles.removeText}>Remove all favorites</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>🛡️ Community Safety</Text>
        <Text style={styles.noticeText}>
          Fans Club is 13+. Be respectful. No private information, hate speech, bullying, or TV match clips.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏆 Fan Base</Text>

        <Pressable style={styles.roomButton} onPress={() => router.push('/leaderboard' as any)}>
          <Text style={styles.roomText}>🥇 Fan Leaderboard</Text>
          <Text style={styles.roomSubtext}>See top fans, rankings, and activity →</Text>
        </Pressable>

        <Pressable style={styles.roomButton} onPress={() => router.push('/fan-wall' as any)}>
          <Text style={styles.roomText}>🧱 Fan Wall</Text>
          <Text style={styles.roomSubtext}>Join the main Soccer Daily discussion →</Text>
        </Pressable>
      </View>

      {!selectedCountry ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {search ? '🔎 Search Results' : '🌎 Pick Country'}
          </Text>

          {search ? (
            <>
              {countryResults.map((country) => (
                <Pressable
                  key={`country-${country}`}
                  style={styles.roomButton}
                  onPress={() => {
                    setSelectedCountry(country);
                    setSearchText('');
                  }}
                >
                  <Text style={styles.roomText}>🌎 {countryLabel(country)}</Text>
                  <Text style={styles.roomSubtext}>Open country clubs →</Text>
                </Pressable>
              ))}

              {globalRoomResults.map((item) => {
                const following = followedTeams.includes(item.badge);

                return (
                  <Pressable
                    key={item.badge}
                    style={[styles.roomButton, following && styles.followingButton]}
                    onPress={() => followAndOpen(item.country, item.room)}
                  >
                    <Text style={styles.roomText}>{item.room}</Text>
                    <Text style={styles.roomSubtext}>
                      {item.badge} • {following ? 'Following ✓ Tap to make main' : followedTeams.length >= 3 ? 'Follow + replace oldest →' : 'Follow + open room →'}
                    </Text>
                  </Pressable>
                );
              })}

              {!countryResults.length && !globalRoomResults.length ? (
                <Text style={styles.emptyText}>No country or club found.</Text>
              ) : null}
            </>
          ) : (
            countries.map((country) => (
              <Pressable
                key={country}
                style={styles.roomButton}
                onPress={() => {
                  setSelectedCountry(country);
                  setSearchText('');
                }}
              >
                <Text style={styles.roomText}>{countryLabel(country)}</Text>
                <Text style={styles.roomSubtext}>National team + clubs →</Text>
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setSelectedCountry(null);
              setSearchText('');
            }}
          >
            <Text style={styles.backText}>← Back to all countries</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>⚽ {countryLabel(selectedCountry)} Fan Rooms</Text>

          {selectedRoomResults.map((room: string) => {
            const badge = `${countryLabel(selectedCountry)} - ${room}`;
            const following = followedTeams.includes(badge);

            return (
              <Pressable
                key={room}
                style={[styles.roomButton, following && styles.followingButton]}
                onPress={() => followAndOpen(selectedCountry, room)}
              >
                <Text style={styles.roomText}>{room}</Text>
                <Text style={styles.roomSubtext}>
                  {following ? 'Following ✓ Tap to make main' : followedTeams.length >= 3 ? 'Follow + replace oldest →' : 'Follow + open room →'}
                </Text>
              </Pressable>
            );
          })}

          {!selectedRoomResults.length ? (
            <Text style={styles.emptyText}>No club found in this country.</Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { color: '#FFD166', fontSize: 34, fontWeight: '900' },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginTop: 8, marginBottom: 16, lineHeight: 23 },

  searchInput: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 14,
  },

  favoriteCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  favoriteTitle: { color: '#FFD166', fontWeight: '900', fontSize: 16 },
  favoriteText: { color: '#FFFFFF', marginTop: 6, fontSize: 15 },
  followedTitle: { color: '#FFD166', marginTop: 12, fontSize: 14, fontWeight: '900' },
  followedTeam: { color: '#A7B0C0', marginTop: 5, fontSize: 13 },

  removeButton: {
    marginTop: 12,
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  removeText: { color: '#FFD166', fontWeight: '900' },

  noticeCard: {
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  noticeTitle: { color: '#FFD166', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  noticeText: { color: '#FFD166', fontSize: 13, lineHeight: 19 },

  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 24,
    padding: 16,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginBottom: 14 },
  roomButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 10,
  },
  followingButton: { borderColor: '#FFD166', backgroundColor: '#2A1F12' },
  roomText: { color: '#FFD166', fontSize: 18, fontWeight: '900' },
  roomSubtext: { color: '#A7B0C0', fontSize: 13, marginTop: 4 },
  backButton: { marginBottom: 14 },
  backText: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  emptyText: { color: '#A7B0C0', fontSize: 15, marginTop: 10 },
});
