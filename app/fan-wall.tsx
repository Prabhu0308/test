import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../firebase/config';

export default function FanWallScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'fanPosts'));

      const list = snap.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

      setPosts(list);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load fan posts');
    } finally {
      setLoading(false);
    }
  }

  async function createPost() {
    const user = getAuth().currentUser;

    if (!user) {
      Alert.alert('Please login first');
      return;
    }

    if (!postText.trim()) {
      Alert.alert('Write something first');
      return;
    }

    await addDoc(collection(db, 'fanPosts'), {
      text: postText.trim(),
      userEmail: user.email,
      userId: user.uid,
      likes: 0,
      createdAt: Date.now(),
    });

    setPostText('');
    loadPosts();
  }

  async function likePost(post: any) {
    const postRef = doc(db, 'fanPosts', post.id);
    await updateDoc(postRef, {
      likes: Number(post.likes || 0) + 1,
    });

    loadPosts();
  }

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFD166" />
        <Text style={styles.loadingText}>Loading Fan Wall...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💬 Fan Wall</Text>
      <Text style={styles.subtitle}>Talk football with other Soccer Daily fans</Text>

      <View style={styles.postBox}>
        <TextInput
          style={styles.input}
          placeholder="What's on your soccer mind?"
          placeholderTextColor="#8FA3B8"
          value={postText}
          onChangeText={setPostText}
          multiline
        />

        <Pressable style={styles.postButton} onPress={createPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refresh} onPress={loadPosts}>
        <Text style={styles.refreshText}>Refresh Feed</Text>
      </Pressable>

      {posts.length === 0 ? (
        <Text style={styles.empty}>No fan posts yet. Be the first!</Text>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <Text style={styles.user}>{post.userEmail || 'Fan'}</Text>
            <Text style={styles.text}>{post.text}</Text>

            <Pressable style={styles.likeButton} onPress={() => likePost(post)}>
              <Text style={styles.likeText}>❤️ {post.likes || 0}</Text>
            </Pressable>
          </View>
        ))
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 20 },
  postBox: { backgroundColor: '#111C2E', padding: 16, borderRadius: 18, marginBottom: 16 },
  input: {
    backgroundColor: '#07111F',
    color: 'white',
    padding: 14,
    borderRadius: 14,
    minHeight: 90,
    marginBottom: 12,
  },
  postButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14 },
  postButtonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
  refresh: { backgroundColor: '#123C69', padding: 14, borderRadius: 14, marginBottom: 16 },
  refreshText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 18, marginBottom: 12 },
  user: { color: '#FFD166', fontWeight: 'bold', marginBottom: 8 },
  text: { color: 'white', fontSize: 16, lineHeight: 23, marginBottom: 12 },
  likeButton: { alignSelf: 'flex-start', backgroundColor: '#1C2C44', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  likeText: { color: 'white', fontWeight: 'bold' },
  empty: { color: '#8FA3B8', fontSize: 16, marginBottom: 16 },
  backButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginTop: 10, marginBottom: 40 },
  backText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
});
