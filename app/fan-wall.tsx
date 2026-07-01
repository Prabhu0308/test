import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db, storage } from '../firebase/config';

type FanPost = {
  id: string;
  text?: string;
  badge?: string;
  user?: string;
  userEmail?: string;
  userId?: string;
  likes?: string[];
  comments?: any[];
  gifUrl?: string;
  imageUrl?: string;
  createdAt?: any;
  editedAt?: any;
};

type FanAccount = {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
  userEmail?: string;
  favoriteFanBadge?: string;
  favoriteFanClub?: string;
  favoriteFanCountry?: string;
};

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
};

const soccerGifs = [
  { label: 'Goal', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { label: 'Fire', url: 'https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif' },
  { label: 'Celebrate', url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif' },
  { label: 'Shocked', url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif' },
];

function countryLabel(country: string) {
  return country === 'SaudiArabia' ? 'Saudi Arabia' : country;
}

function roomsForCountry(country: string) {
  return [NATIONAL_TEAMS[country], ...COUNTRY_CLUBS[country]];
}

function extractGifUrl(value?: string) {
  if (!value) return '';
  const match = value.match(/https?:\/\/\S+?(?:\.gif|\.webp)(?:\?\S*)?/i);
  if (match?.[0]) return match[0].replace(/[),]+$/, '');

  const giphyMatch = value.match(/https?:\/\/(?:media\.)?giphy\.com\/\S+/i);
  if (giphyMatch?.[0]) return giphyMatch[0].replace(/[),]+$/, '');

  return '';
}

function removeGifUrl(value?: string) {
  if (!value) return '';
  const gif = extractGifUrl(value);
  if (!gif) return value;
  return value.replace(gif, '').trim();
}

function accountName(account: FanAccount) {
  return account.displayName || account.username || account.email || account.userEmail || 'Soccer Fan';
}

export default function FanWallScreen() {
  const params = useLocalSearchParams();
  const routeRoom = typeof params.room === 'string' ? params.room : '';

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentEmail = currentUser?.email || 'guest@soccerdaily.app';
  const currentUid = currentUser?.uid || '';

  const countries = Object.keys(COUNTRY_CLUBS);

  const [postText, setPostText] = useState('');
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [uploadingPostPhoto, setUploadingPostPhoto] = useState(false);
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [accounts, setAccounts] = useState<FanAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedFanBadge, setSavedFanBadge] = useState('');
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState(routeRoom);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showClubPicker, setShowClubPicker] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    if (routeRoom) setActiveRoom(routeRoom);
  }, [routeRoom]);

  useEffect(() => {
    loadFanMemory();

    const q = query(collection(db, 'fanWall'), orderBy('createdAt', 'desc'));

    const unsubscribePosts = onSnapshot(
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

    let unsubscribeAccounts: any = null;

    try {
      unsubscribeAccounts = onSnapshot(
        collection(db, 'userProfiles'),
        (snapshot) => {
          const list = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })) as FanAccount[];

          setAccounts(list);
        },
        (error) => {
          console.log('User profile search error:', error);
          setAccounts([]);
        }
      );
    } catch (error) {
      console.log('User profile listener error:', error);
    }

    return () => {
      unsubscribePosts();
      if (unsubscribeAccounts) unsubscribeAccounts();
    };
  }, []);

  async function loadFanMemory() {
    const saved = await AsyncStorage.getItem('favoriteFanBadge');
    const savedList = await AsyncStorage.getItem('followedFanTeams');

    setSavedFanBadge(saved || '');

    try {
      setFollowedTeams(savedList ? JSON.parse(savedList) : []);
    } catch {
      setFollowedTeams([]);
    }
  }

  async function saveFanTeam(country: string, room: string) {
    const badge = `${countryLabel(country)} - ${room}`;

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

    setSavedFanBadge(badge);
    setFollowedTeams(nextTeams);
    setActiveRoom(badge);
    setShowClubPicker(false);
    setSelectedCountry(null);
    setSearchText('');

    if (currentUid) {
      await setDoc(
        doc(db, 'userProfiles', currentUid),
        {
          email: currentEmail,
          userEmail: currentEmail,
          username: currentEmail.split('@')[0],
          favoriteFanBadge: badge,
          followedFanTeams: nextTeams,
          favoriteFanCountry: countryLabel(country),
          favoriteFanClub: room,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  }

  async function removeAllFavorites() {
    await AsyncStorage.removeItem('favoriteFanBadge');
    await AsyncStorage.removeItem('followedFanTeams');
    await AsyncStorage.removeItem('favoriteFanCountry');
    await AsyncStorage.removeItem('favoriteFanClub');

    setSavedFanBadge('');
    setFollowedTeams([]);
    setActiveRoom('');

    if (currentUid) {
      await setDoc(
        doc(db, 'userProfiles', currentUid),
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

  const allTeamRooms = useMemo(() => {
    return countries.flatMap((country) =>
      roomsForCountry(country).map((room: string) => ({
        country,
        room,
        badge: `${countryLabel(country)} - ${room}`,
      }))
    );
  }, []);

  const search = searchText.trim().toLowerCase();

  const teamSearchResults = search
    ? allTeamRooms.filter((item) =>
        `${item.badge} ${item.country} ${item.room}`.toLowerCase().includes(search)
      )
    : [];

  const accountSearchResults = search
    ? accounts.filter((account) =>
        `${accountName(account)} ${account.email || ''} ${account.userEmail || ''} ${account.favoriteFanBadge || ''}`
          .toLowerCase()
          .includes(search)
      )
    : [];

  const visiblePosts = posts.filter((post) => {
    const roomOk = activeRoom ? post.badge === activeRoom : true;

    const searchTarget = `${post.text || ''} ${post.user || ''} ${post.userEmail || ''} ${post.badge || ''} ${(post.comments || [])
      .map((c: any) => `${c.text || ''} ${c.userEmail || ''} ${c.badge || ''}`)
      .join(' ')}`.toLowerCase();

    const searchOk = search ? searchTarget.includes(search) : true;

    return roomOk && searchOk;
  });

  const countrySearchResults = search
    ? countries.filter((country) => countryLabel(country).toLowerCase().includes(search))
    : countries;

  const selectedRooms = selectedCountry ? roomsForCountry(selectedCountry) : [];

  const selectedRoomResults = selectedCountry
    ? selectedRooms.filter((room: string) =>
        `${countryLabel(selectedCountry)} ${room}`.toLowerCase().includes(search)
      )
    : [];

  async function pickFanPostPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to add a Fan Zone photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.75,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setSelectedImageUri(result.assets[0].uri);
    } catch (error) {
      console.log('Pick Fan Zone photo error:', error);
      Alert.alert('Photo error', 'Could not choose photo.');
    }
  }

  async function uploadFanPostPhoto() {
    if (!selectedImageUri) return '';

    if (!currentUid) {
      Alert.alert('Login required', 'Please login first to upload a photo.');
      return '';
    }

    try {
      setUploadingPostPhoto(true);

      const response = await fetch(selectedImageUri);
      const blob = await response.blob();

      const imageRef = ref(storage, `fan-wall/${currentUid}/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

      return await getDownloadURL(imageRef);
    } catch (error) {
      console.log('Upload Fan Zone photo error:', error);
      Alert.alert('Upload failed', 'Could not upload Fan Zone photo.');
      return '';
    } finally {
      setUploadingPostPhoto(false);
    }
  }

  async function submitPost() {
    const finalGifUrl = selectedGifUrl || extractGifUrl(postText);
    const cleanText = removeGifUrl(postText).trim();

    if (!cleanText && !finalGifUrl && !selectedImageUri) {
      Alert.alert('Empty Post', 'Please write something or choose a GIF first.');
      return;
    }

    const badge = activeRoom || savedFanBadge || 'General Fan Wall';
    const uploadedImageUrl = await uploadFanPostPhoto();

    if (selectedImageUri && !uploadedImageUrl) return;

    try {
      await addDoc(collection(db, 'fanWall'), {
        text: cleanText,
        gifUrl: finalGifUrl,
        imageUrl: uploadedImageUrl,
        userEmail: currentEmail,
        userId: currentUid,
        badge,
        user: currentEmail.split('@')[0],
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      setPostText('');
      setSelectedGifUrl('');
      setSelectedImageUri('');
    } catch (error) {
      console.log('Submit post error:', error);
      Alert.alert('Error', 'Could not submit post.');
    }
  }

  async function translateToEnglish(key: string, text?: string) {
    if (!text?.trim()) return;

    try {
      const url =
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' +
        encodeURIComponent(text);

      const response = await fetch(url);
      const data = await response.json();
      const translated = data?.[0]?.map((part: any) => part?.[0]).join('') || '';

      setTranslations((prev: any) => ({
        ...prev,
        [key]: translated || 'Translation unavailable',
      }));
    } catch (error) {
      console.log('Translate error:', error);
      setTranslations((prev: any) => ({
        ...prev,
        [key]: 'Translation unavailable',
      }));
    }
  }

  function startEdit(post: FanPost) {
    setEditingId(post.id);
    setEditText(post.text || '');
  }

  async function saveEdit(postId: string) {
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
  }

  function deletePost(post: FanPost) {
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
  }

  async function toggleLike(post: FanPost) {
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
  }

  async function submitComment(post: FanPost) {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please write a comment.');
      return;
    }

    await updateDoc(doc(db, 'fanWall', post.id), {
      comments: arrayUnion({
        text: commentText.trim(),
        userEmail: currentEmail,
        user: currentEmail.split('@')[0],
        badge: savedFanBadge || activeRoom || 'Fan',
        createdAt: new Date().toISOString(),
      }),
    });

    setCommentText('');
    setCommentPostId(null);
  }

  async function sharePost(post: FanPost) {
    try {
      await Share.share({
        message: `${post.text || ''}\n\nShared from Soccer Daily Fan Zone`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Fan Zone</Text>
      <Text style={styles.subtitle}>Fan Wall + Fans Club in one place</Text>

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search fans, account names, posts, clubs, countries..."
        placeholderTextColor="#6F7F9B"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        enablesReturnKeyAutomatically
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      <View style={styles.filterRow}>
        <Pressable style={[styles.filterChip, !activeRoom && styles.activeChip]} onPress={() => setActiveRoom('')}>
          <Text style={[styles.filterChipText, !activeRoom && styles.activeChipText]}>All Fan Wall</Text>
        </Pressable>

        <Pressable style={[styles.filterChip, showClubPicker && styles.activeChip]} onPress={() => setShowClubPicker(!showClubPicker)}>
          <Text style={[styles.filterChipText, showClubPicker && styles.activeChipText]}>Pick / Follow Club</Text>
        </Pressable>
      </View>

      {activeRoom ? (
        <View style={styles.roomHeaderBox}>
          <Text style={styles.roomHeaderText}>🏟️ {activeRoom}</Text>
          <Text style={styles.roomHeaderSubtext}>Room feed. Posts here also appear in the common Fan Wall.</Text>
        </View>
      ) : null}

      <View style={styles.myTeamsCard}>
        <View style={styles.myTeamsHeader}>
          <Text style={styles.myTeamsTitle}>⭐ My Teams</Text>
          {followedTeams.length ? (
            <Pressable onPress={removeAllFavorites}>
              <Text style={styles.removeText}>Remove all</Text>
            </Pressable>
          ) : null}
        </View>

        {followedTeams.length ? (
          <View style={styles.myTeamsList}>
            {followedTeams.map((team) => (
              <Pressable key={team} style={[styles.teamMiniChip, activeRoom === team && styles.activeMiniChip]} onPress={() => setActiveRoom(team)}>
                <Text style={[styles.teamMiniChipText, activeRoom === team && styles.activeMiniChipText]} numberOfLines={1}>
                  {team}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.mutedText}>No followed teams yet. Pick a country or club below.</Text>
        )}
      </View>

      {showClubPicker ? (
        <View style={styles.clubPickerCard}>
          {!selectedCountry ? (
            <>
              <Text style={styles.sectionTitle}>{search ? '🔎 Club / Country Results' : '🌎 Pick Country'}</Text>

              {countrySearchResults.map((country) => (
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
              ))}

              {teamSearchResults.slice(0, 15).map((item) => {
                const following = followedTeams.includes(item.badge);

                return (
                  <Pressable
                    key={item.badge}
                    style={[styles.roomButton, following && styles.followingButton]}
                    onPress={() => saveFanTeam(item.country, item.room)}
                  >
                    <Text style={styles.roomText}>{item.room}</Text>
                    <Text style={styles.roomSubtext}>
                      {item.badge} • {following ? 'Following ✓ Tap to make main' : followedTeams.length >= 3 ? 'Follow + replace oldest →' : 'Follow + open room →'}
                    </Text>
                  </Pressable>
                );
              })}

              {search && !countrySearchResults.length && !teamSearchResults.length ? (
                <Text style={styles.emptyText}>No country, club, or national team found.</Text>
              ) : null}
            </>
          ) : (
            <>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setSelectedCountry(null);
                  setSearchText('');
                }}
              >
                <Text style={styles.backText}>← Back to countries</Text>
              </Pressable>

              <Text style={styles.sectionTitle}>⚽ {countryLabel(selectedCountry)} Fan Rooms</Text>

              {selectedRoomResults.map((room: string) => {
                const badge = `${countryLabel(selectedCountry)} - ${room}`;
                const following = followedTeams.includes(badge);

                return (
                  <Pressable
                    key={room}
                    style={[styles.roomButton, following && styles.followingButton]}
                    onPress={() => saveFanTeam(selectedCountry, room)}
                  >
                    <Text style={styles.roomText}>{room}</Text>
                    <Text style={styles.roomSubtext}>
                      {following ? 'Following ✓ Tap to make main' : followedTeams.length >= 3 ? 'Follow + replace oldest →' : 'Follow + open room →'}
                    </Text>
                  </Pressable>
                );
              })}

              {!selectedRoomResults.length ? <Text style={styles.emptyText}>No club found.</Text> : null}
            </>
          )}
        </View>
      ) : null}

      {search && accountSearchResults.length ? (
        <View style={styles.searchResultCard}>
          <Text style={styles.sectionTitle}>👤 Fan Accounts</Text>
          {accountSearchResults.slice(0, 8).map((account) => (
            <View key={account.id} style={styles.accountRow}>
              <Text style={styles.accountName}>{accountName(account)}</Text>
              <Text style={styles.accountBadge}>{account.favoriteFanBadge || 'No fan badge yet'}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder={activeRoom ? `Post in ${activeRoom}...` : 'Write something for the common Fan Wall...'}
          placeholderTextColor="#718096"
          value={postText}
          onChangeText={setPostText}
          multiline
        />

        <View style={styles.photoComposerBox}>
          <Pressable style={styles.photoButton} onPress={pickFanPostPhoto} disabled={uploadingPostPhoto}>
            <Text style={styles.photoButtonText}>
              {uploadingPostPhoto ? 'Uploading photo...' : '🖼️ Add Photo'}
            </Text>
          </Pressable>

          {selectedImageUri ? (
            <View style={styles.photoPreviewBox}>
              <ExpoImage source={{ uri: selectedImageUri }} style={styles.photoPreview} contentFit="cover" />
              <Pressable style={styles.removePhotoButton} onPress={() => setSelectedImageUri('')}>
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.gifPickerCard}>
          <Text style={styles.gifTitle}>🎞️ Add GIF</Text>

          <View style={styles.gifRow}>
            {soccerGifs.map((gif) => (
              <Pressable
                key={gif.label}
                style={[styles.gifButton, selectedGifUrl === gif.url && styles.activeGifButton]}
                onPress={() => setSelectedGifUrl(gif.url)}
              >
                <Text style={[styles.gifButtonText, selectedGifUrl === gif.url && styles.activeGifButtonText]}>
                  {gif.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedGifUrl ? (
            <View>
              <ExpoImage source={{ uri: selectedGifUrl }} style={styles.selectedGifPreview} contentFit="cover" />
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
          <Text style={styles.loadingText}>Loading Fan Zone...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {visiblePosts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyText}>Try another search or be the first fan to post.</Text>
            </View>
          ) : (
            visiblePosts.map((post) => {
              const liked = post.likes?.includes(currentEmail);
              const likeCount = post.likes?.length || 0;
              const commentCount = post.comments?.length || 0;
              const isOwner = post.userEmail === currentEmail || post.userId === currentUid;

              return (
                <View key={post.id} style={styles.card}>
                  <Text style={styles.user}>{post.user || post.userEmail?.split('@')[0] || 'Soccer Fan'}</Text>
                  <Text style={styles.timeText}>{post.editedAt ? 'Edited' : 'Posted'} • Soccer Daily</Text>

                  {post.badge ? (
                    <View style={styles.teamBadgeBox}>
                      <Text style={styles.teamBadgeText}>🏟️ {post.badge}</Text>
                    </View>
                  ) : null}

                  {editingId === post.id ? (
                    <>
                      <TextInput style={styles.editInput} value={editText} onChangeText={setEditText} multiline />

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
                      {post.text ? (
                        <>
                          <Text style={styles.postText}>
                            {translations[`post-${post.id}`] || removeGifUrl(post.text)}
                          </Text>

                          <Pressable onPress={() => translateToEnglish(`post-${post.id}`, removeGifUrl(post.text))}>
                            <Text style={styles.translateText}>🌐 Translate to English</Text>
                          </Pressable>
                        </>
                      ) : null}
                    </>
                  )}

                  {(post.gifUrl || extractGifUrl(post.text)) ? (
                    <ExpoImage
                      source={{ uri: post.gifUrl || extractGifUrl(post.text) }}
                      style={styles.postGif}
                      contentFit="cover"
                    />
                  ) : null}

                  <View style={styles.actionRow}>
                    <Pressable onPress={() => toggleLike(post)}>
                      <Text style={liked ? styles.likedAction : styles.action}>
                        {liked ? '❤️' : '🤍'} {likeCount} Likes
                      </Text>
                    </Pressable>

                    <Pressable onPress={() => setCommentPostId(commentPostId === post.id ? null : post.id)}>
                      <Text style={styles.action}>💬 {commentCount} Comments</Text>
                    </Pressable>

                    {isOwner ? (
                      <>
                        <Pressable onPress={() => startEdit(post)}>
                          <Text style={styles.action}>✏️ Edit</Text>
                        </Pressable>

                        <Pressable onPress={() => deletePost(post)}>
                          <Text style={styles.deleteAction}>🗑 Delete</Text>
                        </Pressable>
                      </>
                    ) : null}

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
                      {post.comments.slice(-5).map((comment, index) => (
                        <View key={index} style={styles.commentCard}>
                          <Text style={styles.commentUser}>
                            {comment.user || comment.userEmail?.split('@')[0] || 'Fan'}
                          </Text>

                          {comment.badge ? (
                            <Text style={styles.commentBadge}>🏟️ {comment.badge}</Text>
                          ) : null}

                          <Text style={styles.commentText}>
                            {translations[`comment-${post.id}-${index}`] || comment.text}
                          </Text>

                          {comment.text ? (
                            <Pressable onPress={() => translateToEnglish(`comment-${post.id}-${index}`, comment.text)}>
                              <Text style={styles.translateText}>🌐 Translate to English</Text>
                            </Pressable>
                          ) : null}
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
  photoComposerBox: {
    marginTop: 12,
    marginBottom: 14,
  },
  photoButton: {
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 16,
  },
  photoPreviewBox: {
    marginTop: 12,
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#0F1B2D',
  },
  removePhotoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    color: '#FCA5A5',
    fontWeight: '900',
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    marginTop: 12,
    backgroundColor: '#0F1B2D',
  },
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: '#FFD166', fontSize: 34, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 14 },

  searchInput: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
  },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  filterChip: {
    flex: 1,
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeChip: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  filterChipText: { color: '#FFD166', fontSize: 13, fontWeight: '900' },
  activeChipText: { color: '#07111F' },

  roomHeaderBox: {
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  roomHeaderText: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  roomHeaderSubtext: { color: '#A7B0C0', fontSize: 13, marginTop: 4 },

  myTeamsCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  myTeamsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myTeamsTitle: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  myTeamsList: { gap: 8, marginTop: 10 },
  teamMiniChip: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeMiniChip: { backgroundColor: '#2A1F12', borderColor: '#FFD166' },
  teamMiniChipText: { color: '#A7B0C0', fontSize: 12, fontWeight: '800' },
  activeMiniChipText: { color: '#FFD166' },
  removeText: { color: '#FFD166', fontSize: 12, fontWeight: '900' },
  mutedText: { color: '#A7B0C0', marginTop: 8, fontSize: 13 },

  clubPickerCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  roomButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  followingButton: { borderColor: '#FFD166', backgroundColor: '#2A1F12' },
  roomText: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  roomSubtext: { color: '#A7B0C0', fontSize: 12, marginTop: 4 },
  backButton: { marginBottom: 12 },
  backText: { color: '#FFD166', fontSize: 15, fontWeight: '900' },

  searchResultCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  accountRow: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  accountName: { color: '#FFD166', fontWeight: '900', fontSize: 15 },
  accountBadge: { color: '#A7B0C0', fontSize: 12, marginTop: 4 },

  inputCard: { backgroundColor: '#111C2E', padding: 16, borderRadius: 18, marginBottom: 18 },
  input: { color: 'white', fontSize: 16, minHeight: 70, textAlignVertical: 'top' },
  postButton: { backgroundColor: '#FFD166', padding: 14, borderRadius: 14, marginTop: 12 },
  postButtonText: { color: '#07111F', textAlign: 'center', fontWeight: '900', fontSize: 16 },

  gifPickerCard: { marginTop: 12 },
  gifTitle: { color: '#FFD166', fontWeight: '900', marginBottom: 8 },
  gifRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gifButton: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeGifButton: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  gifButtonText: { color: '#FFD166', fontWeight: '800', fontSize: 12 },
  activeGifButtonText: { color: '#07111F' },
  selectedGifPreview: { width: '100%', height: 180, borderRadius: 14, marginTop: 12 },
  removeGifText: { color: '#FFD166', fontWeight: '900', marginTop: 8, textAlign: 'center' },

  loadingBox: { alignItems: 'center', marginTop: 30 },
  loadingText: { color: '#A7B0C0', marginTop: 10 },
  emptyCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: { color: '#FFD166', fontSize: 18, fontWeight: '900' },
  emptyText: { color: '#A7B0C0', marginTop: 8, fontSize: 14 },

  card: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  user: { color: '#FFD166', fontSize: 17, fontWeight: '900' },
  timeText: { color: '#8EA4C8', fontSize: 12, marginTop: 2 },
  teamBadgeBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  teamBadgeText: { color: '#FFD166', fontSize: 12, fontWeight: '900' },
  postText: { color: '#FFFFFF', fontSize: 16, lineHeight: 23 },
  translateText: { color: '#FFD166', fontSize: 12, fontWeight: '900', marginTop: 6 },
  postGif: { width: '100%', height: 220, borderRadius: 14, marginTop: 12, backgroundColor: '#07111F' },

  editInput: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#2B3D5E',
    borderRadius: 14,
    color: '#FFFFFF',
    minHeight: 70,
    padding: 12,
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  smallButton: { flex: 1, backgroundColor: '#FFD166', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  smallButtonText: { color: '#07111F', fontWeight: '900' },
  cancelButton: { flex: 1, backgroundColor: '#07111F', borderWidth: 1, borderColor: '#2B3D5E', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#A7B0C0', fontWeight: '900' },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  action: { color: '#A7B0C0', fontSize: 13, fontWeight: '800' },
  likedAction: { color: '#FFD166', fontSize: 13, fontWeight: '900' },
  deleteAction: { color: '#FF6B6B', fontSize: 13, fontWeight: '900' },

  commentBox: { marginTop: 14, backgroundColor: '#07111F', borderRadius: 14, padding: 12 },
  commentInput: { color: '#FFFFFF', minHeight: 45 },
  commentButton: { backgroundColor: '#FFD166', borderRadius: 12, paddingVertical: 10, marginTop: 8, alignItems: 'center' },
  commentButtonText: { color: '#07111F', fontWeight: '900' },
  commentsList: { marginTop: 12, gap: 8 },
  commentCard: { backgroundColor: '#07111F', borderRadius: 14, padding: 12 },
  commentUser: { color: '#FFD166', fontSize: 13, fontWeight: '900' },
  commentBadge: { color: '#FFD166', fontSize: 11, fontWeight: '800', marginTop: 3 },
  commentText: { color: '#D8DEE9', fontSize: 14, marginTop: 5, lineHeight: 20 },
});
