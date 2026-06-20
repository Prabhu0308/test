import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GNEWS_API_KEY } from '../../constants/api';
import { getText } from '../../constants/translations';
import { db } from '../../firebase/config';

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';

export default function HomeScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteNews, setFavoriteNews] = useState<any[]>([]);
  const [favoriteMatches, setFavoriteMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  async function loadHome() {
    try {
      setLoading(true);

      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) setLanguage(savedLanguage);

      const savedFavorites = await AsyncStorage.getItem('favoriteTeams');
      const parsedFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      setFavorites(parsedFavorites);

      const newsResponse = await fetch(
        `https://gnews.io/api/v4/search?q=soccer OR football&lang=en&max=5&apikey=${GNEWS_API_KEY}`
      );
      const newsData = await newsResponse.json();
      const allNews = newsData.articles || [];
      setNews(allNews);

      if (parsedFavorites.length > 0) {
        const filteredNews = allNews.filter((article: any) =>
          parsedFavorites.some((team: string) =>
            `${article.title} ${article.description || ''}`.toLowerCase().includes(team.toLowerCase())
          )
        );
        setFavoriteNews(filteredNews.slice(0, 3));
      } else {
        setFavoriteNews([]);
      }

      const scoreResponse = await fetch(ESPN_URL);
      const scoreData = await scoreResponse.json();

      const cleanMatches = (scoreData.events || []).slice(0, 3).map((event: any) => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors || [];
        const home = competitors.find((t: any) => t.homeAway === 'home') || competitors[0];
        const away = competitors.find((t: any) => t.homeAway === 'away') || competitors[1];

        return {
          id: event.id,
          home: home?.team?.displayName || 'Home',
          away: away?.team?.displayName || 'Away',
          homeScore: home?.score || '0',
          awayScore: away?.score || '0',
          status: competition?.status?.type?.shortDetail || 'Scheduled',
          time: event.date
            ? new Date(event.date).toLocaleString([], {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'Time TBD',
        };
      });

      setMatches(cleanMatches);

      if (parsedFavorites.length > 0) {
        const filteredMatches = cleanMatches.filter((match: any) =>
          parsedFavorites.some((team: string) =>
            `${match.home} ${match.away}`.toLowerCase().includes(team.toLowerCase())
          )
        );
        setFavoriteMatches(filteredMatches);
      } else {
        setFavoriteMatches([]);
      }

      const leaderSnap = await getDocs(collection(db, 'leaderboard'));
      const leaderList = leaderSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => Number(b.points || 0) - Number(a.points || 0))
        .slice(0, 3);

      setLeaders(leaderList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHome();
  }, []);

  const txt = getText(language);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading Soccer Daily...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>{txt.appName}</Text>
      <Text style={styles.tagline}>{txt.tagline}</Text>

<View style={styles.heroCard}>
  <Text style={styles.heroTitle}>⚽ Welcome to Soccer Daily</Text>

  <Text style={styles.heroSubtitle}>
    Live Scores • Breaking News • Soccer Daily TV • Predictions • Fan Community
  </Text>

  <View style={styles.heroStats}>
    <View style={styles.statBox}>
      <Text style={styles.statNumber}>120+</Text>
      <Text style={styles.statLabel}>Matches</Text>
    </View>

    <View style={styles.statBox}>
      <Text style={styles.statNumber}>24/7</Text>
      <Text style={styles.statLabel}>News</Text>
    </View>

    <View style={styles.statBox}>
      <Text style={styles.statNumber}>LIVE</Text>
      <Text style={styles.statLabel}>TV</Text>
    </View>
  </View>
</View>

      <Pressable style={styles.refresh} onPress={loadHome}>
        <Text style={styles.refreshText}>{txt.refreshHome}</Text>
      </Pressable>

      {matches.length > 0 && (
        <Pressable
          style={styles.matchOfDay}
          onPress={() =>
            router.push({
              pathname: '/match-details',
              params: matches[0],
            })
          }
        >
          <Text style={styles.matchOfDayLabel}>⭐ MATCH OF THE DAY</Text>
          <Text style={styles.matchOfDayTeams}>
            {matches[0].home} vs {matches[0].away}
          </Text>
          <Text style={styles.matchOfDayTime}>🕒 {matches[0].time}</Text>
          <Text style={styles.matchOfDayAction}>Tap for details</Text>
        </Pressable>
      )}

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>{txt.footballPulse}</Text>
        <Text style={styles.heroTitle}>{txt.heroText}</Text>
      </View>

      <Text style={styles.section}>⭐ Your Teams</Text>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Choose favorite teams in Settings.</Text>
      ) : (
        <View style={styles.grid}>
          {favorites.slice(0, 8).map((team) => (
            <Text key={team} style={styles.chip}>{team}</Text>
          ))}
        </View>
      )}

      <Text style={styles.section}>⚽ Your Matches</Text>
      {(favoriteMatches.length === 0 ? matches.slice(0, 1) : favoriteMatches).map((match) => (
        <Pressable
          key={match.id}
          style={styles.matchCard}
          onPress={() =>
            router.push({
              pathname: '/match-details',
              params: match,
            })
          }
        >
          <Text style={styles.matchTime}>
            {favoriteMatches.length === 0 ? '⚽ Upcoming Match' : '⭐ Your Team Match'} • 🕒 {match.time}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={styles.team}>{match.home}</Text>
            <Text style={styles.score}>{match.homeScore}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.team}>{match.away}</Text>
            <Text style={styles.score}>{match.awayScore}</Text>
          </View>
          <Text style={styles.cardMeta}>{match.status}</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>📰 Your Team News</Text>
      {favoriteNews.length === 0 ? (
        <Text style={styles.empty}>No favorite-team news found right now.</Text>
      ) : (
        favoriteNews.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.source?.name || 'Soccer Daily'}</Text>
          </View>
        ))
      )}

      <Text style={styles.section}>{txt.latestNews}</Text>
      {news.length === 0 ? (
        <Text style={styles.empty}>{txt.noNews}</Text>
      ) : (
        news.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.source?.name || 'Soccer Daily'}</Text>
          </View>
        ))
      )}

      <Text style={styles.section}>{txt.featuredMatches}</Text>
      {matches.length === 0 ? (
        <Text style={styles.empty}>{txt.noMatches}</Text>
      ) : (
        matches.map((match) => (
          <Pressable
            key={match.id}
            style={styles.matchCard}
            onPress={() =>
              router.push({
                pathname: '/match-details',
                params: match,
              })
            }
          >
            <Text style={styles.matchTime}>🕒 {match.time}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.team}>{match.home}</Text>
              <Text style={styles.score}>{match.homeScore}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.team}>{match.away}</Text>
              <Text style={styles.score}>{match.awayScore}</Text>
            </View>
            <Text style={styles.cardMeta}>{match.status}</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.section}>{txt.topPredictors}</Text>
      {leaders.length === 0 ? (
        <Text style={styles.empty}>{txt.noLeaderboard}</Text>
      ) : (
        leaders.map((user, index) => (
          <View key={user.id} style={styles.leaderCard}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.leaderName}>{user.user || 'User'}</Text>
            <Text style={styles.points}>{Number(user.points || 0)} pts</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  logo: { color: 'white', fontSize: 38, fontWeight: 'bold' },
  tagline: { color: '#A7B0C0', fontSize: 16, marginTop: 6, marginBottom: 18 },
  refresh: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginBottom: 18 },
  refreshText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
  matchOfDay: {
    backgroundColor: '#1C2C44',
    padding: 22,
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  matchOfDayLabel: { color: '#FFD166', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  matchOfDayTeams: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  matchOfDayTime: { color: '#A7B0C0', fontSize: 15, marginTop: 10 },
  matchOfDayAction: { color: '#FFD166', fontWeight: 'bold', marginTop: 12 },
  hero: { backgroundColor: '#123C69', padding: 22, borderRadius: 22, marginBottom: 24 },
  heroLabel: { color: '#FFD166', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  heroTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  section: { color: 'white', fontSize: 23, fontWeight: 'bold', marginTop: 8, marginBottom: 14 },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', lineHeight: 24 },
  cardMeta: { color: '#8FA3B8', fontSize: 13, marginTop: 8 },
  matchCard: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 12 },
  matchTime: { color: '#FFD166', fontWeight: 'bold', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  team: { color: 'white', fontSize: 17, fontWeight: '600', flex: 1 },
  score: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  leaderCard: {
    backgroundColor: '#111C2E',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: { color: '#FFD166', fontSize: 20, fontWeight: 'bold', width: 50 },
  leaderName: { color: 'white', fontSize: 17, fontWeight: 'bold', flex: 1 },
  points: { color: '#FFD166', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  chip: { color: 'white', backgroundColor: '#1C2C44', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, fontWeight: 'bold' },
  empty: { color: '#8FA3B8', fontSize: 16, marginBottom: 14 },

heroCard: {
  backgroundColor: '#123C69',
  borderRadius: 22,
  padding: 20,
  marginBottom: 20,
},

homeHeroTitle: {
  color: 'white',
  fontSize: 28,
  fontWeight: 'bold',
},

heroSubtitle: {
  color: '#DDE7F0',
  fontSize: 16,
  marginTop: 8,
  lineHeight: 24,
},

heroStats: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 22,
},

statBox: {
  flex: 1,
  alignItems: 'center',
},

statNumber: {
  color: '#FFD166',
  fontSize: 24,
  fontWeight: 'bold',
},

statLabel: {
  color: 'white',
  marginTop: 6,
},
});

