import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, Share, Image } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

type FanPost = {
  id: string;
  text?: string;
  user?: string;
  userEmail?: string;
  likes?: string[];
  comments?: any[];
  gifUrl?: string;
  createdAt?: any;
  editedAt?: any;
};


function extractGifUrl(value?: string) {
  if (!value) return '';

  const match = value.match(/https?:\/\/\S+?(?:\.gif|\.webp)(?:\?\S*)?/i);

  if (match?.[0]) {
    return match[0].replace(/[),]+$/, '');
  }

  const giphyMatch = value.match(/https?:\/\/(?:media\.)?giphy\.com\/\S+/i);

  if (giphyMatch?.[0]) {
    return giphyMatch[0].replace(/[),]+$/, '');
  }

  return '';
}

function removeGifUrl(value?: string) {
  if (!value) return '';

  const gif = extractGifUrl(value);

  if (!gif) return value;

  return value.replace(gif, '').trim();
}

export default function FanWallScreen() {
  const [postText, setPostText] = useState('');
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const auth = getAuth();
  const currentEmail = auth.currentUser?.email || 'guest@soccerdaily.app';


  const soccerGifs = [
    {
      label: 'Goal',
      url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    },
    {
      label: 'Fire',
      url: 'https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif',
    },
    {
      label: 'Celebrate',
      url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif',
    },
    {
      label: 'Shocked',
      url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif',
    },
  ];


  useEffect(() => {
    const q = query(collection(db, 'fanWall'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as FanPost[];

        setPosts(list);
        setLoading(false);
      },
      (error) => {
        console.log('Fan Wall error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const submitPost = async () => {
    const finalGifUrl = selectedGifUrl || extractGifUrl(postText);
    const cleanText = removeGifUrl(postText).trim();

    if (!cleanText && !finalGifUrl) {
      Alert.alert('Empty Post', 'Please write something or choose a GIF first.');
      return;
    }

    try {
      await addDoc(collection(db, 'fanWall'), {
        text: cleanText,
        gifUrl: finalGifUrl,
        userEmail: currentEmail,
        user: currentEmail.split('@')[0],
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      setPostText('');
      setSelectedGifUrl('');
    } catch (error) {
      console.log('Submit post error:', error);
      Alert.alert('Error', 'Could not submit post.');
    }
  };


  const startEdit = (post: FanPost) => {
    setEditingId(post.id);
    setEditText(post.text || '');
  };

  const saveEdit = async (postId: string) => {
    if (!editText.trim()) {
      Alert.alert('Empty Post', 'Post cannot be empty.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fanWall', postId), {
        text: editText.trim(),
        editedAt: serverTimestamp(),
      });

      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.log('Save edit error:', error);
      Alert.alert('Error', 'Could not update post.');
    }
  };

  const deletePost = async (post: FanPost) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'fanWall', post.id));
        },
      },
    ]);
  };

  const toggleLike = async (post: FanPost) => {
    const postRef = doc(db, 'fanWall', post.id);
    const likes = post.likes || [];

    if (likes.includes(currentEmail)) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentEmail),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentEmail),
      });
    }
  };

  const submitComment = async (post: FanPost) => {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please write a comment.');
      return;
    }

    await updateDoc(doc(db, 'fanWall', post.id), {
      comments: arrayUnion({
        text: commentText.trim(),
        userEmail: currentEmail,
        createdAt: new Date().toISOString(),
      }),
    });

    setCommentText('');
    setCommentPostId(null);
  };

  const sharePost = async (post: FanPost) => {
    try {
      await Share.share({
        message: `${post.text || ''}\n\nShared from Soccer Daily Fan Wall`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>💬 Fan Wall</Text>
      <Text style={styles.subtitle}>Share your football thoughts with other fans</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Write something about today’s match..."
          placeholderTextColor="#718096"
          value={postText}
          onChangeText={setPostText}
          multiline
        />

        
      <View style={styles.gifPickerCard}>
        <Text style={styles.gifTitle}>🎞️ Add GIF</Text>

        <View style={styles.gifRow}>
          {soccerGifs.map((gif) => (
            <Pressable
              key={gif.label}
              style={[
                styles.gifButton,
                selectedGifUrl === gif.url && styles.activeGifButton,
              ]}
              onPress={() => setSelectedGifUrl(gif.url)}
            >
              <Text
                style={[
                  styles.gifButtonText,
                  selectedGifUrl === gif.url && styles.activeGifButtonText,
                ]}
              >
                {gif.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedGifUrl ? (
          <View>
            <ExpoImage
              source={{ uri: selectedGifUrl }}
              style={styles.selectedGifPreview}
              resizeMode="cover"
            />

            <Pressable onPress={() => setSelectedGifUrl('')}>
              <Text style={styles.removeGifText}>Remove GIF</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

<Pressable style={styles.postButton} onPress={submitPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FFD166" />
          <Text style={styles.loadingText}>Loading Fan Wall...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {posts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first fan to post.</Text>
            </View>
          ) : (
            posts.map((post) => {
              const liked = post.likes?.includes(currentEmail);
              const likeCount = post.likes?.length || 0;
              const commentCount = post.comments?.length || 0;

              return (
                <View key={post.id} style={styles.card}>
                  <Text style={styles.user}>{post.user || 'Soccer Fan'}</Text>
                  <Text style={styles.timeText}>
                    {post.editedAt ? 'Edited' : 'Posted'} • Soccer Daily
                  </Text>

                  {editingId === post.id ? (
                    <>
                      <TextInput
                        style={styles.editInput}
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                      />

                      <View style={styles.row}>
                        <Pressable style={styles.smallButton} onPress={() => saveEdit(post.id)}>
                          <Text style={styles.smallButtonText}>Save</Text>
                        </Pressable>

                        <Pressable
                          style={styles.cancelButton}
                          onPress={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.postText}>{removeGifUrl(post.text)}</Text>

                      <Pressable style={styles.editBigButton} onPress={() => startEdit(post)}>
                        <Text style={styles.editBigButtonText}>✏️ Edit Post</Text>
                      </Pressable>
                    </>
                  )}

                  
          {post.gifUrl ? (
            <ExpoImage
              source={{ uri: post.gifUrl }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 14,
                marginTop: 12,
                backgroundColor: '#07111F',
              }}
              resizeMode="cover"
            />
          ) : null}


          {(post.gifUrl || extractGifUrl(post.text)) ? (
            <ExpoImage
              source={{ uri: post.gifUrl || extractGifUrl(post.text) }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 14,
                marginTop: 12,
                backgroundColor: '#07111F',
              }}
              resizeMode="cover"
            />
          ) : null}

<View style={styles.actionRow}>
                    <Pressable onPress={() => toggleLike(post)}>
                      <Text style={liked ? styles.likedAction : styles.action}>
                        {liked ? '❤️' : '🤍'} Like {likeCount}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setCommentPostId(commentPostId === post.id ? null : post.id)
                      }
                    >
                      <Text style={styles.action}>💬 Comment {commentCount}</Text>
                    </Pressable>

                    <Pressable onPress={() => startEdit(post)}>
                      <Text style={styles.action}>✏️ Edit</Text>
                    </Pressable>

                    <Pressable onPress={() => deletePost(post)}>
                      <Text style={styles.deleteAction}>🗑 Delete</Text>
                    </Pressable>

                    <Pressable onPress={() => sharePost(post)}>
                      <Text style={styles.action}>↗ Share</Text>
                    </Pressable>
                  </View>

                  {commentPostId === post.id ? (
                    <View style={styles.commentBox}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Write a comment..."
                        placeholderTextColor="#718096"
                        value={commentText}
                        onChangeText={setCommentText}
                      />

                      <Pressable style={styles.commentButton} onPress={() => submitComment(post)}>
                        <Text style={styles.commentButtonText}>Comment</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {post.comments && post.comments.length > 0 ? (
                    <View style={styles.commentsList}>
                      {post.comments.slice(-3).map((comment, index) => (
                        <View key={index} style={styles.commentCard}>
                          <Text style={styles.commentUser}>
                            {comment.userEmail?.split('@')[0] || 'Fan'}
                          </Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  backButton: { marginBottom: 14 },
  backText: { color: '#FFD166', fontSize: 16, fontWeight: '700' },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 18 },
  inputCard: { backgroundColor: '#111C2E', padding: 16, borderRadius: 18, marginBottom: 18 },
  input: { color: 'white', fontSize: 16, minHeight: 70, textAlignVertical: 'top' },
  postButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginTop: 12 },
  postButtonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  loadingBox: { marginTop: 60, alignItems: 'center' },
  loadingText: { color: '#A7B0C0', marginTop: 12 },
  emptyCard: { backgroundColor: '#111C2E', padding: 20, borderRadius: 18 },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#A7B0C0' },
  card: { backgroundColor: '#111C2E', padding: 16, borderRadius: 18, marginBottom: 14 },
  user: { color: '#FFD166', fontWeight: 'bold', marginBottom: 2 },
  timeText: { color: '#718096', fontSize: 12, marginBottom: 10 },
  postText: { color: 'white', fontSize: 16, lineHeight: 23, marginBottom: 12 },
  editBigButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  editBigButtonText: { color: '#07111F', fontWeight: 'bold' },
  editInput: {
    color: 'white',
    backgroundColor: '#07111F',
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 },
  action: { color: '#A7B0C0', fontWeight: '700' },
  likedAction: { color: '#FFD166', fontWeight: '700' },
  deleteAction: { color: '#FF6B6B', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  smallButton: { backgroundColor: '#FFD166', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  smallButtonText: { color: '#07111F', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#1F2A3D', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  cancelText: { color: 'white', fontWeight: 'bold' },
  commentBox: { marginTop: 14, backgroundColor: '#07111F', padding: 12, borderRadius: 14 },
  commentInput: { color: 'white', fontSize: 15, paddingVertical: 8 },
  commentButton: { backgroundColor: '#FFD166', padding: 10, borderRadius: 10, marginTop: 8 },
  commentButtonText: { color: '#07111F', fontWeight: 'bold', textAlign: 'center' },
  commentsList: { marginTop: 14, gap: 8 },
  commentCard: { backgroundColor: '#07111F', padding: 10, borderRadius: 12 },
  commentUser: { color: '#FFD166', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  commentText: { color: '#D8DEE9', fontSize: 14 },

  gifPickerCard: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  gifTitle: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gifRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gifButton: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 8,
  },
  activeGifButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  gifButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeGifButtonText: {
    color: '#07111F',
  },
  selectedGifPreview: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: '#111C2E',
  },
  removeGifText: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },

});
