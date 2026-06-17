import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GNEWS_API_KEY } from '../../constants/api';

export default function NewsScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNews() {
    try {
      setLoading(true);
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=soccer OR football&lang=en&max=20&apikey=${GNEWS_API_KEY}`
      );
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading Soccer News...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📰 Soccer News</Text>
      <Text style={styles.subtitle}>Latest football headlines</Text>

      <Pressable style={styles.refresh} onPress={loadNews}>
        <Text style={styles.refreshText}>Refresh News</Text>
      </Pressable>

      {articles.map((article, index) => (
        <Pressable
          key={index}
          style={styles.card}
          onPress={() => article.url && Linking.openURL(article.url)}
        >
          <Text style={styles.headline}>{article.title}</Text>
          <Text style={styles.description}>{article.description || 'Tap to read more.'}</Text>
          <Text style={styles.source}>
            {article.source?.name || 'Soccer Daily'} • {article.publishedAt?.slice(0, 10) || ''}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 18 },
  refresh: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginBottom: 18 },
  refreshText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 16, marginBottom: 14 },
  headline: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#A7B0C0', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  source: { color: '#FFD166', fontSize: 13, fontWeight: 'bold' },
});
