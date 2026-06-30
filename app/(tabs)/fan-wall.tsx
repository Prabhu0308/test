import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {router, useLocalSearchParams} from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { db, storage } from '../../firebase/config';


const CLUB_FAN_ROOMS = [
  'Manchester United',
  'Manchester City',
  'Liverpool',
  'Arsenal',
  'Chelsea',
  'Tottenham',
  'Real Madrid',
  'Barcelona',
  'Bayern Munich',
  'PSG',
  'Juventus',
  'AC Milan',
  'Inter Miami',
  'Al Nassr',
];

type Reactions = {
  like?: string[];
  fire?: string[];
  goal?: string[];
  shocked?: string[];
};

type FanPost = {
  id: string;
  text?: string;
  badge?: string;
  displayName?: string;
  userEmail?: string;
  userId?: string;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  createdAt?: number;
  editedAt?: number;
  likes?: string[];
  comments?: any[];
  reactions?: Reactions;
  moderationStatus?: string;
};

const badges = ['🔥 Hot Take', '🔮 Prediction', '⚽ Match Reaction', '📰 News Reaction'];
const filters = ['All', 'Hot Takes', 'Predictions', 'Photos', 'Videos', 'My Posts'];
const topics = ['USA vs Mexico', 'World Cup', 'Transfer Talk', 'Messi', 'Mbappe', 'Premier League'];

function timeAgo(time?: number) {
  if (!time) return 'Just now';

  const min = Math.floor((Date.now() - time) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;

  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? 's' : ''} ago`;
}

function safeArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function getSafeDisplayName(name?: string, email?: string) {
  if (name && !name.includes('@') && name !== 'Soccer Fan') {
    return name;
  }

  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  return 'Soccer Fan';
}


function extractGifUrl(value?: string) {
  if (!value) return '';

  const urls = value.match(/https?:\/\/[^\s]+/gi) || [];

  const found = urls.find((url) => {
    const clean = url.replace(/[),.!?]+$/, '').toLowerCase();

    return (
      clean.includes('giphy.com') ||
      clean.endsWith('.gif') ||
      clean.endsWith('.webp')
    );
  });

  return found ? found.replace(/[),.!?]+$/, '') : '';
}

function removeGifUrl(value?: string) {
  if (!value) return '';

  const gif = extractGifUrl(value);

  if (!gif) return value;

  return value.replace(gif, '').trim();
}

export default function FanWallScreen() {
  const params = useLocalSearchParams();
  const [postText, setPostText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(badges[0]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [translatedPosts, setTranslatedPosts] = useState<{ [key: string]: string }>({});
  const [translatedComments, setTranslatedComments] = useState<{ [key: string]: string }>({});
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fanPosts'), (snapshot) => {
      const list = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<FanPost, 'id'>),
      }));

      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPosts((list as any[]).filter((p: any) => (p.status ?? 'approved') === 'approved') as any);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Hot Takes') return post.badge?.includes('Hot Take');
    if (selectedFilter === 'Predictions') return post.badge?.includes('Prediction');
    if (selectedFilter === 'Photos') return !!post.imageUrl;
    if (selectedFilter === 'Videos') return !!post.videoUrl;
    if (selectedFilter === 'My Posts') return currentUser?.uid === post.userId;
    return true;
  });

  useEffect(() => {
    const room = typeof params.room === 'string' ? params.room : '';
    if (room) {
      setActiveFilter(room);
    }
  }, [params.room]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function pickVideo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow video access to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const durationMs = asset.duration || 0;

      if (durationMs > 30000) {
        Alert.alert(
          'Video too long',
          'Please choose a video 30 seconds or shorter.'
        );
        return;
      }

      setVideoUri(asset.uri);
      setImageUri(null);
    }
  }

  async function uploadImage(uri: string) {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error('Could not read selected image.');
    }

    const blob = await response.blob();
    const fileName = `fan-wall/${Date.now()}.jpg`;
    const imageRef = ref(storage, fileName);
    
   const user = auth.currentUser;

if (!user) {
  Alert.alert('Login required', 'Please login first.');
  return;
}

console.log('Current User:', user.uid);
    await uploadBytes(imageRef, blob, {
      contentType: 'image/jpeg',
    });

    return await getDownloadURL(imageRef);
  }

  async function uploadVideo(uri: string) {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error('Could not read selected video.');
    }

    const blob = await response.blob();
    const fileName = `fan-wall/${Date.now()}.mp4`;
    const videoRef = ref(storage, fileName);

    await uploadBytes(videoRef, blob, {
      contentType: 'video/mp4',
    });

    return await getDownloadURL(videoRef);
  }

  async function createPost() {
    if (!currentUser) {
      Alert.alert('Login needed', 'Please login before posting.');
      return;
    }

    const finalGifUrl = extractGifUrl(postText);
    const cleanPostText = removeGifUrl(postText).trim();

    if (!cleanPostText && !finalGifUrl && !imageUri && !videoUri) {
      Alert.alert('Empty post', 'Write something or add a photo first.');
      return;
    }

    setPosting(true);

    try {
      let imageUrl = '';
      let videoUrl = '';

      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      if (videoUri) {
        videoUrl = await uploadVideo(videoUri);
      }

      await addDoc(collection(db, 'fanPosts'), {
      status: 'approved',
        text: cleanPostText,
        gifUrl: finalGifUrl,
        badge: selectedBadge,
        displayName: getSafeDisplayName(currentUser.displayName || '', currentUser.email || ''),
        userEmail: currentUser.email || '',
        userId: currentUser.uid,
        imageUrl,
        videoUrl,
        createdAt: Date.now(),
        moderationStatus: 'active',
        likes: [],
        comments: [],
        reactions: {
          like: [],
          fire: [],
          goal: [],
          shocked: [],
        },
      });

      setPostText('');
      setImageUri(null);
      setVideoUri(null);
      setSelectedBadge(badges[0]);
      setShowComposer(false);
    } catch (error: any) {
      console.log('POST ERROR:', error);
      Alert.alert(
        'Post failed',
        error?.message || JSON.stringify(error) || 'Something went wrong while posting.'
      );
    } finally {
      setPosting(false);
    }
  }

  async function toggleReaction(post: FanPost, reactionKey: keyof Reactions) {
    if (!currentUser) {
      Alert.alert('Login needed', 'Please login before reacting.');
      return;
    }

    const postRef = doc(db, 'fanPosts', post.id);
    const currentReactionArray = safeArray(post.reactions?.[reactionKey]);
    const alreadyReacted = currentReactionArray.includes(currentUser.uid);

    if (alreadyReacted) {
      await updateDoc(postRef, {
        [`reactions.${reactionKey}`]: arrayRemove(currentUser.uid),
      });
    } else {
      await updateDoc(postRef, {
        [`reactions.${reactionKey}`]: arrayUnion(currentUser.uid),
      });

      await createFanWallNotification(
        post,
        'reaction',
        `${getSafeDisplayName(currentUser.displayName || '', currentUser.email || '')} reacted to your post.`
      );
    }
  }


  async function createFanWallNotification(
    post: FanPost,
    type: 'reaction' | 'comment',
    message: string
  ) {
    try {
      if (!currentUser) return;
      if (!post.userId) return;
      if (post.userId === currentUser.uid) return;

      const fromName = getSafeDisplayName(
        currentUser.displayName || '',
        currentUser.email || ''
      );

      await addDoc(collection(db, 'appNotifications'), {
        type,
        screen: 'fan-wall',
        toUserId: post.userId,
        fromUserId: currentUser.uid,
        fromName,
        postId: post.id,
        postText: post.text || '',
        title:
          type === 'comment'
            ? 'New comment on your Fan Wall post'
            : 'New reaction on your Fan Wall post',
        message,
        read: false,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.log('Fan Wall notification create error:', error);
    }
  }

  async function addComment(post: FanPost) {
    if (!currentUser) {
      Alert.alert('Login needed', 'Please login before commenting.');
      return;
    }

    const text = commentTexts[post.id]?.trim();
    if (!text) return;

    const comment = {
      id: Date.now().toString(),
      text,
      displayName: getSafeDisplayName(currentUser.displayName || '', currentUser.email || ''),
      userId: currentUser.uid,
      createdAt: Date.now(),
    };

    await updateDoc(doc(db, 'fanPosts', post.id), {
      comments: arrayUnion(comment),
    });

    await createFanWallNotification(
      post,
      'comment',
      `${comment.displayName} commented: ${text.length > 80 ? text.slice(0, 80) + '...' : text}`
    );

    setCommentTexts({
      ...commentTexts,
      [post.id]: '',
    });
  }



  async function translateTextToEnglish(originalText: string) {
    const cleanText = originalText.trim();

    if (!cleanText) return '';

    try {
      const url =
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' +
        encodeURIComponent(cleanText);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();

      const translated =
        Array.isArray(data?.[0])
          ? data[0].map((part: any) => part?.[0] || '').join('')
          : '';

      return translated || `Translation unavailable. Original message: ${cleanText}`;
    } catch (error) {
      console.log('Translate to English error:', error);
      return `Translation unavailable now. Original message: ${cleanText}`;
    }
  }

  async function translatePostToEnglish(post: FanPost) {
    const originalText = removeGifUrl(post.text || '').trim();

    if (!originalText) return;

    if (translatedPosts[post.id]) {
      const next = { ...translatedPosts };
      delete next[post.id];
      setTranslatedPosts(next);
      return;
    }

    setTranslatedPosts({
      ...translatedPosts,
      [post.id]: 'Translating to English...',
    });

    const english = await translateTextToEnglish(originalText);

    setTranslatedPosts((prev) => ({
      ...prev,
      [post.id]: english,
    }));
  }


  async function translateCommentToEnglish(commentKey: string, text?: string) {
    const originalText = (text || '').trim();

    if (!originalText) return;

    if (translatedComments[commentKey]) {
      const next = { ...translatedComments };
      delete next[commentKey];
      setTranslatedComments(next);
      return;
    }

    setTranslatedComments({
      ...translatedComments,
      [commentKey]: 'Translating to English...',
    });

    const english = await translateTextToEnglish(originalText);

    setTranslatedComments((prev) => ({
      ...prev,
      [commentKey]: english,
    }));
  }

  function startEdit(post: FanPost) {
    setEditingPostId(post.id);
    setEditingText(post.text || '');
  }

  async function saveEdit(post: FanPost) {
    if (!editingText.trim()) {
      Alert.alert('Empty edit', 'Post cannot be empty.');
      return;
    }

    await updateDoc(doc(db, 'fanPosts', post.id), {
      text: editingText.trim(),
      editedAt: Date.now(),
    });

    setEditingPostId(null);
    setEditingText('');
  }

  async function deletePost(post: FanPost) {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'fanPosts', post.id));
        },
      },
    ]);
  }

  async function submitReportWithReason(post: FanPost, reason: string) {
    if (!currentUser) {
      Alert.alert('Login needed', 'Please login before reporting.');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        postId: post.id,
        reason,
        status: 'new',
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email || '',
        reportedBy: getSafeDisplayName(currentUser.displayName || '', currentUser.email || ''),
        postText: post.text || '',
        postImageUrl: post.imageUrl || '',
        postVideoUrl: post.videoUrl || '',
        postOwnerEmail: post.userEmail || '',
        postOwnerId: post.userId || '',
        createdAt: Date.now(),
      });

      Alert.alert('Report sent', 'Thank you. Our team will review this post.');
    } catch (error) {
      console.log('Report post error:', error);
      Alert.alert('Report failed', 'Please try again.');
    }
  }

  async function reportPost(post: FanPost) {
    Alert.alert(
      'Why are you reporting this post?',
      'Choose the closest reason.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => submitReportWithReason(post, 'Spam'),
        },
        {
          text: 'Abuse / hate',
          onPress: () => submitReportWithReason(post, 'Abuse / hate'),
        },
        {
          text: 'Bad language',
          onPress: () => submitReportWithReason(post, 'Bad language'),
        },
        {
          text: 'Wrong content',
          onPress: () => submitReportWithReason(post, 'Wrong content'),
        },
        {
          text: 'Other',
          onPress: () => submitReportWithReason(post, 'Other'),
        },
      ]
    );
  }


  async function sharePost(post: FanPost) {
    await Share.share({
      message: `${post.badge || '⚽ Fan Post'}\n\n${post.text || ''}\n\nShared from Soccer Daily`,
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Pressable
        onPress={() => router.push('/community-guidelines' as any)}
        style={{
          backgroundColor: '#1A2A44',
          borderWidth: 1,
          borderColor: '#FFD166',
          padding: 14,
          borderRadius: 16,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: '#FFD166', fontWeight: 'bold', fontSize: 16 }}>
          ⚽ Fan Wall Rules: 13+ • Be respectful • No private info • No TV clips
        </Text>
        <Text style={{ color: '#A7B0C0', marginTop: 5, lineHeight: 20 }}>
          Tap here to read Soccer Daily Community Guidelines.
        </Text>
      </Pressable>

      <Text style={styles.title}>🔥 Fan Wall</Text>
        <Text style={styles.subtitle}>
          A soccer-only social feed for match reactions, predictions, photos, and hot takes.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {posts.filter((p) => p.badge?.includes('Prediction')).length}
            </Text>
            <Text style={styles.statLabel}>Predictions</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {posts.filter((p) => !!p.videoUrl).length}
            </Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
        </View>
      </View>

      <View style={styles.createCard}>
        <View style={styles.createTop}>
          <View>
            <Text style={styles.createTitle}>Share your soccer take</Text>
            <Text style={styles.createSub}>Post like a fan, not like a news page.</Text>
          </View>

          <Pressable
            style={styles.createButton}
            onPress={() => setShowComposer(!showComposer)}
          >
            <Text style={styles.createButtonText}>
              {showComposer ? 'Close' : '+ Post'}
            </Text>
          </Pressable>
        </View>

        {showComposer && (
          <View style={styles.composer}>
            <View style={styles.badgeWrap}>
              {badges.map((badge) => (
                <Pressable
                  key={badge}
                  style={[
                    styles.badgeButton,
                    selectedBadge === badge && styles.activeBadgeButton,
                  ]}
                  onPress={() => setSelectedBadge(badge)}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      selectedBadge === badge && styles.activeBadgeText,
                    ]}
                  >
                    {badge}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={postText}
              onChangeText={setPostText}
              placeholder="What happened in the match? What is your take?"
              placeholderTextColor="#7F8A9A"
              multiline
              style={styles.input}
            />

            {imageUri && (
              <View style={styles.previewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />

                <Pressable
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.removeImageText}>Remove Image</Text>
                </Pressable>
              </View>
            )}

            {videoUri && (
              <View style={styles.previewBox}>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.previewVideo}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />

                <Pressable
                  style={styles.removeImageButton}
                  onPress={() => setVideoUri(null)}
                >
                  <Text style={styles.removeImageText}>Remove Video</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.composerActions}>
              <Pressable style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>🖼 Photo</Text>
              </Pressable>

              <Pressable style={styles.photoButton} onPress={pickVideo}>
                <Text style={styles.photoButtonText}>🎥 Video</Text>
              </Pressable>

              <Pressable style={styles.postButton} onPress={createPost} disabled={posting}>
                {posting ? (
                  <ActivityIndicator color="#07111F" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Trending Topics</Text>

        <View style={styles.topicWrap}>
          {Array.from(new Set([...topics, ...CLUB_FAN_ROOMS])).map((topic) => (
            <View key={topic} style={styles.topicPill}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {Array.from(new Set([...filters, ...CLUB_FAN_ROOMS])).map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterPill,
              selectedFilter === filter && styles.activeFilterPill,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.feedTitle}>⚽ Fan Feed</Text>

      {loading ? (
        <ActivityIndicator color="#FFD166" size="large" />
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No posts here yet</Text>
          <Text style={styles.emptyText}>
            Start the conversation with your first soccer take.
          </Text>
        </View>
      ) : (
        filteredPosts.map((post) => {
          const isOwner = currentUser?.uid === post.userId;
          const commentsArray = safeArray(post.comments);

          const likeArray = safeArray(post.reactions?.like);
          const fireArray = safeArray(post.reactions?.fire);
          const goalArray = safeArray(post.reactions?.goal);
          const shockedArray = safeArray(post.reactions?.shocked);

          const displayName = getSafeDisplayName(post.displayName, post.userEmail);

          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>⚽</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.displayName}>{displayName}</Text>
                  <Text style={styles.metaText}>
                    Soccer Fan • {post.badge || '⚽ Fan Post'} • {timeAgo(post.createdAt)}
                  </Text>
                </View>

                <Pressable onPress={() => reportPost(post)}>
                  <Text style={styles.moreText}>⋯</Text>
                </Pressable>
              </View>

              {editingPostId === post.id ? (
                <View>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    multiline
                    style={styles.editInput}
                  />

                  <View style={styles.editRow}>
                    <Pressable style={styles.saveEditButton} onPress={() => saveEdit(post)}>
                      <Text style={styles.saveEditText}>Save</Text>
                    </Pressable>

                    <Pressable
                      style={styles.cancelEditButton}
                      onPress={() => {
                        setEditingPostId(null);
                        setEditingText('');
                      }}
                    >
                      <Text style={styles.cancelEditText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  {removeGifUrl(post.text) ? (
                    <>
                      <Text style={styles.postText}>{removeGifUrl(post.text)}</Text>

                      <Pressable
                        style={styles.translateButton}
                        onPress={() => translatePostToEnglish(post)}
                      >
                        <Text style={[styles.translateButtonText, { color: '#FFD166', fontWeight: '900' }]}>
                          🌐 {translatedPosts[post.id] ? 'Hide English' : 'English'}
                        </Text>
                      </Pressable>

                      {translatedPosts[post.id] ? (
                        <View style={styles.translationBox}>
                          <Text style={[styles.translationLabel, { color: '#FFD166', fontWeight: '900' }]}>English</Text>
                          <Text style={[styles.translationText, { color: '#FFFFFF' }]}>{translatedPosts[post.id]}</Text>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                </>
              )}

              {!!post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
              )}

              {!!post.videoUrl && (
                <Video
                  source={{ uri: post.videoUrl }}
                  style={styles.postVideo}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
              )}

              
              {(post.gifUrl || extractGifUrl(post.text)) ? (
                <ExpoImage
                  source={{ uri: post.gifUrl || extractGifUrl(post.text) }}
                  style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 18,
                    marginTop: 12,
                    backgroundColor: '#07111F',
                  }}
                  contentFit="cover"
                />
              ) : null}

<View style={styles.reactionRow}>
                <Pressable onPress={() => toggleReaction(post, 'like')}>
                  <Text style={styles.reactionText}>❤️ {likeArray.length}</Text>
                </Pressable>

                <Pressable onPress={() => toggleReaction(post, 'fire')}>
                  <Text style={styles.reactionText}>🔥 {fireArray.length}</Text>
                </Pressable>

                <Pressable onPress={() => toggleReaction(post, 'goal')}>
                  <Text style={styles.reactionText}>⚽ {goalArray.length}</Text>
                </Pressable>

                <Pressable onPress={() => toggleReaction(post, 'shocked')}>
                  <Text style={styles.reactionText}>😮 {shockedArray.length}</Text>
                </Pressable>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() =>
                    setCommentPostId(commentPostId === post.id ? null : post.id)
                  }
                >
                  <Text style={styles.action}>💬 Comment {commentsArray.length}</Text>
                </Pressable>

                <Pressable onPress={() => sharePost(post)}>
                  <Text style={styles.action}>↗ Share</Text>
                </Pressable>

              </View>

              {isOwner && (
                <View style={styles.ownerRow}>
                  <Pressable onPress={() => startEdit(post)}>
                    <Text style={styles.ownerAction}>✏️ Edit</Text>
                  </Pressable>

                  <Pressable onPress={() => deletePost(post)}>
                    <Text style={styles.deleteAction}>🗑 Delete</Text>
                  </Pressable>
                </View>
              )}

              {post.editedAt && (
                <Text style={styles.editedText}>Edited</Text>
              )}

              {commentPostId === post.id && (
                <View style={styles.commentBox}>
                  <TextInput
                    value={commentTexts[post.id] || ''}
                    onChangeText={(text) =>
                      setCommentTexts({
                        ...commentTexts,
                        [post.id]: text,
                      })
                    }
                    placeholder="Write a comment..."
                    placeholderTextColor="#7F8A9A"
                    style={styles.commentInput}
                  />

                  <Pressable style={styles.commentButton} onPress={() => addComment(post)}>
                    <Text style={styles.commentButtonText}>Send Comment</Text>
                  </Pressable>

                  {commentsArray.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Text style={styles.commentName}>
                        {getSafeDisplayName(comment.displayName, comment.userEmail)}
                      </Text>
                      <Text style={styles.commentText}>{comment.text}</Text>

                      <Pressable
                        style={styles.commentTranslateButton}
                        onPress={() =>
                          translateCommentToEnglish(`${post.id}-${comment.id}`, comment.text)
                        }
                      >
                        <Text style={[styles.commentTranslateText, { color: '#FFD166', fontWeight: '900' }]}>
                          🌐 {translatedComments[`${post.id}-${comment.id}`] ? 'Hide English' : 'English'}
                        </Text>
                      </Pressable>

                      {translatedComments[`${post.id}-${comment.id}`] ? (
                        <View style={styles.commentTranslationBox}>
                          <Text style={[styles.translationLabel, { color: '#FFD166', fontWeight: '900' }]}>English</Text>
                          <Text style={[styles.translationText, { color: '#FFFFFF' }]}>
                            {translatedComments[`${post.id}-${comment.id}`]}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })
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
    paddingTop: 90,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#111C2E',
    padding: 22,
    borderRadius: 26,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  title: {
    color: '#FFD166',
    fontSize: 38,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#A7B0C0',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 3,
  },
  createCard: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  createTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  createTitle: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
  },
  createSub: {
    color: '#A7B0C0',
    marginTop: 5,
  },
  createButton: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },
  createButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
  },
  composer: {
    marginTop: 16,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badgeButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
  },
  activeBadgeButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeBadgeText: {
    color: '#07111F',
  },
  input: {
    backgroundColor: '#07111F',
    color: 'white',
    minHeight: 120,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  previewBox: {
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 230,
    borderRadius: 18,
  },
  previewVideo: {
    width: '100%',
    height: 230,
    borderRadius: 18,
    backgroundColor: '#000',
  },
  removeImageButton: {
    marginTop: 9,
    alignSelf: 'center',
  },
  removeImageText: {
    color: '#FFD166',
    fontWeight: 'bold',
  },
  composerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#123C69',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postButton: {
    flex: 1,
    backgroundColor: '#FFD166',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  cardTitle: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  topicWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  topicPill: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  topicText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 9,
  },
  activeFilterPill: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#07111F',
  },
  feedTitle: {
    color: '#FFD166',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#111C2E',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#A7B0C0',
    marginTop: 8,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#111C2E',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#07111F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  avatarText: {
    fontSize: 24,
  },
  displayName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metaText: {
    color: '#A7B0C0',
    fontSize: 13,
    marginTop: 3,
  },
  moreText: {
    color: '#A7B0C0',
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  postText: {
    color: 'white',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 12,
  },
  postImage: {
    marginTop: 14,
    width: '100%',
    height: 280,
    borderRadius: 20,
    marginBottom: 14,
  },
  postVideo: {
    marginTop: 14,
    width: '100%',
    height: 280,
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: '#000',
  },
  reactionRow: {
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#24344F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#22314A',
    paddingTop: 12,
  },
  action: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  ownerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerAction: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  deleteAction: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '900',
  },
  editedText: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#07111F',
    color: 'white',
    minHeight: 90,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  saveEditButton: {
    flex: 1,
    backgroundColor: '#FFD166',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveEditText: {
    color: '#07111F',
    fontWeight: 'bold',
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: '#123C69',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelEditText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#22314A',
    paddingTop: 12,
  },
  commentInput: {
    backgroundColor: '#07111F',
    color: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentButton: {
    backgroundColor: '#FFD166',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  commentButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
  },
  commentItem: {
    backgroundColor: '#07111F',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  commentName: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: 'white',
    lineHeight: 20,
  },
});
