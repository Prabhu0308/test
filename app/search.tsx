import { collection, getDocs } from 'firebase/firestore';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../firebase/config';

type SearchItem = {
  id: string;
  type: 'Fan Post' | 'Prediction' | 'Team' | 'Match' | 'News' | 'Feature';
  title: string;
  subtitle: string;
  route?: string;
};

const localItems: SearchItem[] = [
  {
    id: 'team-usa',
    type: 'Team',
    title: 'Team USA',
    subtitle: 'National team, World Cup, matches, fan posts',
  },
  {
    id: 'team-brazil',
    type: 'Team',
    title: 'Brazil',
    subtitle: 'Brazil football, Neymar, World Cup, classic matches',
  },
  {
    id: 'team-argentina',
    type: 'Team',
    title: 'Argentina',
    subtitle: 'Argentina football, Messi, World Cup, predictions',
  },
  {
    id: 'team-england',
    type: 'Team',
    title: 'England',
    subtitle: 'England football, Premier League, international matches',
  },
  {
    id: 'team-france',
    type: 'Team',
    title: 'France',
    subtitle: 'France football, World Cup, top players',
  },
  {
    id: 'match-usa-mexico',
    type: 'Match',
    title: 'USA vs Mexico',
    subtitle: 'Featured rivalry match and prediction topic',
    route: '/prediction',
  },
  {
    id: 'match-argentina-brazil',
    type: 'Match',
    title: 'Argentina vs Brazil',
    subtitle: 'Classic rivalry match and fan prediction topic',
    route: '/prediction',
  },
  {
    id: 'feature-fan-wall',
    type: 'Feature',
    title: 'Fan Wall',
    subtitle: 'Search posts, reactions, comments, GIFs, and fan opinions',
    route: '/fan-wall',
  },
  {
    id: 'feature-prediction',
    type: 'Feature',
    title: 'Predictions',
    subtitle: 'Make predictions, earn Fan XP, and climb the leaderboard',
    route: '/prediction',
  },
  {
    id: 'feature-leaderboard',
    type: 'Feature',
    title: 'Leaderboard',
    subtitle: 'Top Soccer Daily Fan XP leaders',
    route: '/leaderboard',
  },
  {
    id: 'feature-notifications',
    type: 'Feature',
    title: 'Notifications',
    subtitle: 'Latest app alerts, fan activity, and prediction reminders',
    route: '/notifications',
  },
  {
    id: 'news-world-cup',
    type: 'News',
    title: 'World Cup',
    subtitle: 'World Cup news, matches, predictions, and fan discussions',
  },
  {
    id: 'news-transfer',
    type: 'News',
    title: 'Transfer News',
    subtitle: 'Player movement, rumors, and club updates',
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [remoteItems, setRemoteItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch() {
    const q = query.trim().toLowerCase();

    if (!q) {
      setRemoteItems([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const results: SearchItem[] = [];

      const fanSnap = await getDocs(collection(db, 'fanPosts'));

      fanSnap.docs.forEach((doc) => {
        const data: any = doc.data();

        const text = String(data.text || '');
        const user = String(data.user || data.displayName || data.userEmail || 'Fan');
        const badge = String(data.badge || 'Fan Post');

        const haystack = `${text} ${user} ${badge}`.toLowerCase();

        if (haystack.includes(q)) {
          results.push({
            id: `fan-${doc.id}`,
            type: 'Fan Post',
            title: text ? text.slice(0, 70) : 'Fan Wall post',
            subtitle: `${badge} • ${user}`,
            route: '/fan-wall',
          });
        }
      });

      const predictionSnap = await getDocs(collection(db, 'predictions'));

      predictionSnap.docs.forEach((doc) => {
        const data: any = doc.data();

        const match = String(data.match || '');
        const pick = String(data.pick || '');
        const user = String(data.displayName || data.user || data.userEmail || 'Fan');
        const reason = String(data.reason || '');

        const haystack = `${match} ${pick} ${user} ${reason}`.toLowerCase();

        if (haystack.includes(q)) {
          results.push({
            id: `prediction-${doc.id}`,
            type: 'Prediction',
            title: match || 'Prediction',
            subtitle: `Pick: ${pick || 'Unknown'} • ${user}`,
            route: '/prediction',
          });
        }
      });

      setRemoteItems(results.slice(0, 50));
    } catch (error) {
      console.log(error);
      setRemoteItems([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }

  const filteredLocalItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return localItems;

    return localItems.filter((item) => {
      const haystack = `${item.title} ${item.subtitle} ${item.type}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const allResults = query.trim()
    ? [...filteredLocalItems, ...remoteItems]
    : localItems;

  function openItem(item: SearchItem) {
    if (item.route) {
      router.push(item.route as any);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>🔍 Search</Text>
      <Text style={styles.subtitle}>
        Search teams, matches, Fan Wall posts, predictions, news, and Soccer Daily features.
      </Text>

      <View style={styles.searchCard}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search soccer..."
          placeholderTextColor="#7F8A9A"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={runSearch}
        />

        <Pressable style={styles.searchButton} onPress={runSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#FFD166" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : null}

      <View style={styles.quickRow}>
        {['USA', 'Brazil', 'World Cup', 'Fan Wall', 'Prediction'].map((word) => (
          <Pressable
            key={word}
            style={styles.quickPill}
            onPress={() => {
              setQuery(word);
              setTimeout(runSearch, 100);
            }}
          >
            <Text style={styles.quickText}>{word}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {query.trim() ? 'Results' : 'Popular Searches'}
      </Text>

      {allResults.length === 0 && hasSearched ? (
        <Text style={styles.emptyText}>No results found. Try another soccer word.</Text>
      ) : null}

      {allResults.map((item) => (
        <Pressable
          key={item.id}
          style={styles.resultCard}
          onPress={() => openItem(item)}
        >
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>

          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultSub}>{item.subtitle}</Text>

          {item.route ? (
            <Text style={styles.openText}>Tap to open →</Text>
          ) : null}
        </Pressable>
      ))}
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111C2E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  backText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  title: {
    color: '#FFD166',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },
  searchCard: {
    backgroundColor: '#111C2E',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22314A',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#07111F',
    color: 'white',
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#FFD166',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  loadingText: {
    color: '#A7B0C0',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  quickPill: {
    backgroundColor: '#111C2E',
    borderColor: '#22314A',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  quickText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#111C2E',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22314A',
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD166',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  typeText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  resultSub: {
    color: '#A7B0C0',
    lineHeight: 21,
  },
  openText: {
    color: '#FFD166',
    marginTop: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#A7B0C0',
    lineHeight: 22,
    marginBottom: 14,
  },
});
