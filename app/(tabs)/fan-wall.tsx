import { getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../firebase/config';

function getName(email: string) {
  return email ? email.split('@')[0] : 'Soccer Fan';
}

function timeAgo(time: number) {
  if (!time) return '';
  const min = Math.floor((Date.now() - time) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? 's' : ''} ago`;
}

export default function FanWallScreen() {
  const [postText, setPostText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activePostId, setActivePostId] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'fanPosts'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      setPosts(list);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load posts');
    } finally {
      setLoading(false);
    }
  }

  async function createPost() {
    const user = getAuth().currentUser;
    if (!user) return Alert.alert('Please login first');
    if (!postText.trim()) return Alert.alert('Write something first');

    await addDoc(collection(db, 'fanPosts'), {
      text: postText.trim(),
      userEmail: user.email,
      userId: user.uid,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: Date.now(),
    });

    setPostText('');
    loadPosts();
  }

  async function likePost(post: any) {
    const user = getAuth().currentUser;
    if (!user) return Alert.alert('Please login first');

    const likedBy = post.likedBy || [];
    if (likedBy.includes(user.uid)) {
      return Alert.alert('Already liked');
    }

    await updateDoc(doc(db, 'fanPosts', post.id), {
      likes: Number(post.likes || 0) + 1,
      likedBy: [...likedBy, user.uid],
    });

    loadPosts();
  }

  async function addComment(post: any) {
    const user = getAuth().currentUser;
    if (!user) return Alert.alert('Please login first');
    if (!commentText.trim()) return Alert.alert('Write a comment first');

    await updateDoc(doc(db, 'fanPosts', post.id), {
      comments: arrayUnion({
        text: commentText.trim(),
        userEmail: user.email,
        userId: user.uid,
        createdAt: Date.now(),
      }),
    });

    setCommentText('');
    setActivePostId('');
    loadPosts();
  }


  async function deletePost(post: any) {
    const user = getAuth().currentUser;
    if (!user) return Alert.alert('Please login first');

    if (post.userId !== user.uid) {
      return Alert.alert('Not allowed', 'You can delete only your own post.');
    }

    Alert.alert(
      'Delete Post?',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'fanPosts', post.id));
            loadPosts();
          },
        },
      ]
    );
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
      <Text style={styles.subtitle}>Talk football with Soccer Daily fans</Text>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your soccer mind?"
          placeholderTextColor="#8FA3B8"
          value={postText}
          onChangeText={setPostText}
          multiline
        />
        <Pressable style={styles.postButton} onPress={createPost}>
          <Text style={styles.postButtonText}>Post to Fan Wall</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refresh} onPress={loadPosts}>
        <Text style={styles.refreshText}>Refresh Feed</Text>
      </Pressable>

      {posts.map((post) => {
        const name = getName(post.userEmail);
        const comments = post.comments || [];

        return (
          <View key={post.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.user}>{name}</Text>
                <Text style={styles.time}>{timeAgo(Number(post.createdAt || 0))}</Text>
              </View>
            </View>

            <Text style={styles.text}>{post.text}</Text>

            <View style={styles.actions}>
              <Pressable onPress={() => likePost(post)}>
                <Text style={styles.actionText}>❤️ Like {post.likes || 0}</Text>
              </Pressable>

              <Pressable onPress={() => setActivePostId(activePostId === post.id ? '' : post.id)}>
                <Text style={styles.actionText}>💬 Comment {comments.length}</Text>
              </Pressable>

              {post.userId === getAuth().currentUser?.uid ? (
                <Pressable onPress={() => deletePost(post)}>
                  <Text style={styles.deleteText}>🗑 Delete</Text>
                </Pressable>
              ) : (
                <Text style={styles.actionText}>↗ Share</Text>
              )}
            </View>

            {comments.length > 0 && (
              <View style={styles.commentsBox}>
                {comments.slice(-5).map((c: any, index: number) => (
                  <View key={index} style={styles.comment}>
                    <Text style={styles.commentUser}>{getName(c.userEmail)}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {activePostId === post.id && (
              <View style={styles.commentBox}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#8FA3B8"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <Pressable style={styles.commentButton} onPress={() => addComment(post)}>
                  <Text style={styles.commentButtonText}>Comment</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: '#07111F', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 12 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 20 },
  composer: { backgroundColor: '#111C2E', padding: 16, borderRadius: 20, marginBottom: 16 },
  input: { backgroundColor: '#07111F', color: 'white', padding: 14, borderRadius: 14, minHeight: 90, marginBottom: 12, fontSize: 16 },
  postButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14 },
  postButtonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  refresh: { backgroundColor: '#123C69', padding: 14, borderRadius: 14, marginBottom: 16 },
  refreshText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 20, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { backgroundColor: '#FFD166', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#07111F', fontSize: 22, fontWeight: 'bold' },
  user: { color: 'white', fontWeight: 'bold', fontSize: 17 },
  time: { color: '#8FA3B8', marginTop: 2 },
  text: { color: 'white', fontSize: 17, lineHeight: 25, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 22, borderTopWidth: 1, borderTopColor: '#22314A', paddingTop: 12 },
  actionText: { color: '#A7B0C0', fontWeight: 'bold' },
  deleteText: { color: '#FF6B6B', fontWeight: 'bold' },
  deleteText: { color: '#FF6B6B', fontWeight: 'bold' },
  commentsBox: { marginTop: 12, backgroundColor: '#07111F', padding: 12, borderRadius: 14 },
  comment: { marginBottom: 10 },
  commentUser: { color: '#FFD166', fontWeight: 'bold' },
  commentText: { color: 'white', marginTop: 3 },
  commentBox: { marginTop: 12, backgroundColor: '#07111F', padding: 12, borderRadius: 14 },
  commentInput: { backgroundColor: '#111C2E', color: 'white', padding: 12, borderRadius: 12, marginBottom: 10 },
  commentButton: { backgroundColor: '#FFD166', padding: 12, borderRadius: 12 },
  commentButtonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold' },
});
