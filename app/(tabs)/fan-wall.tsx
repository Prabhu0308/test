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
import { db, storage } from '../../firebase/config';

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
  photoUrl?: string;
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
  Japan: ['Vissel Kobe', 'Urawa Red Diamonds', 'Yokohama F. Marinos', 'Kashima Antlers', 'FC Tokyo', 'Gamba Osaka', 'Cerezo Osaka'],
  SouthKorea: ['Jeonbuk Hyundai Motors', 'Ulsan HD', 'FC Seoul', 'Pohang Steelers', 'Suwon Samsung Bluewings'],
  China: ['Shanghai Port', 'Shanghai Shenhua', 'Beijing Guoan', 'Shandong Taishan', 'Guangzhou FC'],
  Morocco: ['Wydad AC', 'Raja CA', 'FAR Rabat', 'RS Berkane', 'FUS Rabat'],
  Netherlands: ['Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar', 'FC Utrecht', 'FC Twente'],
  Turkey: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'İstanbul Başakşehir'],
  Egypt: ['Al Ahly', 'Zamalek', 'Pyramids FC', 'Ismaily', 'Al Masry'],
  Ghana: ['Asante Kotoko', 'Hearts of Oak', 'Medeama SC', 'Aduana Stars'],
  Senegal: ['Casa Sports', 'ASC Diaraf', 'Teungueth FC', 'Génération Foot'],
  Australia: ['Sydney FC', 'Melbourne Victory', 'Melbourne City', 'Western Sydney Wanderers', 'Brisbane Roar'],
  Colombia: ['Atlético Nacional', 'Millonarios', 'América de Cali', 'Deportivo Cali', 'Junior'],
  Croatia: ['Dinamo Zagreb', 'Hajduk Split', 'Rijeka', 'Osijek'],
  Uruguay: ['Peñarol', 'Nacional', 'Defensor Sporting', 'Danubio'],
  Algeria: ['CR Belouizdad', 'MC Alger', 'JS Kabylie', 'USM Alger', 'ES Sétif'],
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
  Japan: '🇯🇵 Japan National Team',
  SouthKorea: '🇰🇷 South Korea National Team',
  China: '🇨🇳 China National Team',
  Morocco: '🇲🇦 Morocco National Team',
  Netherlands: '🇳🇱 Netherlands National Team',
  Turkey: '🇹🇷 Turkey National Team',
  Egypt: '🇪🇬 Egypt National Team',
  Ghana: '🇬🇭 Ghana National Team',
  Senegal: '🇸🇳 Senegal National Team',
  Australia: '🇦🇺 Australia National Team',
  Colombia: '🇨🇴 Colombia National Team',
  Croatia: '🇭🇷 Croatia National Team',
  Uruguay: '🇺🇾 Uruguay National Team',
  Algeria: '🇩🇿 Algeria National Team',
  SaudiArabia: '🇸🇦 Saudi Arabia National Team',
  Nepal: '🇳🇵 Nepal National Team',
  India: '🇮🇳 India National Team',
};

const soccerGifs = [
  { label: 'Goal', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { label: 'Fire', url: 'https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif' },
  { label: 'Celebrate', url: 'https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif' },
  { label: 'Shocked', url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif' },
];

function countryLabel(country: string) {
  const labels: any = {
    SaudiArabia: 'Saudi Arabia',
    SouthKorea: 'South Korea',
  };

  return labels[country] || country;
}

function roomsForCountry(country: string) {
  return [NATIONAL_TEAMS[country], ...COUNTRY_CLUBS[country]];
}

function countryFlag(country: string) {
  const flags: any = {
    USA: '🇺🇸',
    Mexico: '🇲🇽',
    England: '🏴',
    Spain: '🇪🇸',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Italy: '🇮🇹',
    Portugal: '🇵🇹',
    Brazil: '🇧🇷',
    Argentina: '🇦🇷',
    SaudiArabia: '🇸🇦',
    Nepal: '🇳🇵',
    India: '🇮🇳',
    Algeria: '🇩🇿',
    Uruguay: '🇺🇾',
    Croatia: '🇭🇷',
    Colombia: '🇨🇴',
    Australia: '🇦🇺',
    Senegal: '🇸🇳',
    Ghana: '🇬🇭',
    Egypt: '🇪🇬',
    Turkey: '🇹🇷',
    Netherlands: '🇳🇱',
    Morocco: '🇲🇦',
    China: '🇨🇳',
    SouthKorea: '🇰🇷',
    Japan: '🇯🇵',
  };

  return flags[country] || '🌎';
}

const POPULAR_COUNTRIES = ['USA', 'Mexico', 'England', 'Spain', 'Germany', 'France', 'Italy', 'Portugal', 'Brazil'];


function getCountryAccent(country: string) {
  const accents: Record<string, string> = {
    USA: '#6FA8FF',
    Mexico: '#33C27F',
    England: '#C7CEDA',
    Spain: '#F4B942',
    Germany: '#FF6B6B',
    France: '#5FA8FF',
    Italy: '#45C486',
    Portugal: '#57C785',
    Brazil: '#EAC54F',
    Argentina: '#8CC8FF',
    Nepal: '#8FA3B8',
    India: '#FFB347',
  };

  return accents[country] || '#FFD166';
}


function getCountryJerseyTheme(country: string) {
  const themes: Record<string, any> = {
    USA: { border: '#60A5FA', stripe: '#60A5FA', jersey: '🇺🇸' },
    Mexico: { border: '#34D399', stripe: '#34D399', jersey: '🇲🇽' },
    England: { border: '#E5E7EB', stripe: '#E5E7EB', jersey: '🏴' },
    Spain: { border: '#FBBF24', stripe: '#FBBF24', jersey: '🇪🇸' },
    Germany: { border: '#F87171', stripe: '#F87171', jersey: '🇩🇪' },
    France: { border: '#60A5FA', stripe: '#60A5FA', jersey: '🇫🇷' },
    Italy: { border: '#34D399', stripe: '#34D399', jersey: '🇮🇹' },
    Portugal: { border: '#34D399', stripe: '#34D399', jersey: '🇵🇹' },
    Brazil: { border: '#FACC15', stripe: '#FACC15', jersey: '🇧🇷' },
  };

  return themes[country] || {
    border: '#FFD166',
    stripe: '#FFD166',
    jersey: '⚽',
  };
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
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [followerCounts, setFollowerCounts] = useState<any>({});
  const [activeRoom, setActiveRoom] = useState(routeRoom);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);

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

    const unsubscribeFollowers = onSnapshot(
      collection(db, 'userFollowers'),
      (snapshot) => {
        const counts: any = {};
        snapshot.docs.forEach((item) => {
          const data: any = item.data();
          counts[item.id] = data.followers?.length || 0;
        });
        setFollowerCounts(counts);
      },
      (error) => {
        console.log('Follower count error:', error);
      }
    );

    return () => {
      unsubscribePosts();
      unsubscribeFollowers();
      if (unsubscribeAccounts) unsubscribeAccounts();
    };
  }, []);

  async function loadFanMemory() {
    const saved = await AsyncStorage.getItem('favoriteFanBadge');
    const savedList = await AsyncStorage.getItem('followedFanTeams');
    const savedUsers = await AsyncStorage.getItem('followingUsers');

    setSavedFanBadge(saved || '');

    try {
      setFollowedTeams(savedList ? JSON.parse(savedList) : []);
    } catch {
      setFollowedTeams([]);
    }

    try {
      setFollowingUsers(savedUsers ? JSON.parse(savedUsers) : []);
    } catch {
      setFollowingUsers([]);
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

  const popularCountryResults = countrySearchResults.filter((country) =>
    POPULAR_COUNTRIES.includes(country)
  );

  const moreCountryResults = countrySearchResults.filter((country) =>
    !POPULAR_COUNTRIES.includes(country)
  );

  function safeFollowId(value: string) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function userFollowKey(post: FanPost) {
    return post.userId || post.userEmail || post.user || '';
  }

  function userDisplayName(post: FanPost) {
    return post.user || post.userEmail?.split('@')[0] || 'Soccer Fan';
  }

  async function toggleFollowUser(post: FanPost) {
    const targetKey = userFollowKey(post);
    if (!targetKey) return;

    const myKey = currentUid || currentEmail;
    if (!myKey || targetKey === currentUid || targetKey === currentEmail) return;

    const isFollowing = followingUsers.includes(targetKey);
    const next = isFollowing
      ? followingUsers.filter((item) => item !== targetKey)
      : [...followingUsers, targetKey];

    setFollowingUsers(next);
    await AsyncStorage.setItem('followingUsers', JSON.stringify(next));

    const targetDocId = safeFollowId(targetKey);
    const myDocId = safeFollowId(myKey);

    if (currentUid) {
      await setDoc(
        doc(db, 'userFollows', currentUid),
        {
          userEmail: currentEmail,
          followingUsers: next,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    await setDoc(
      doc(db, 'userFollowing', myDocId),
      {
        userEmail: currentEmail,
        following: isFollowing ? arrayRemove(targetKey) : arrayUnion(targetKey),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, 'userFollowers', targetDocId),
      {
        targetUser: targetKey,
        followers: isFollowing ? arrayRemove(myKey) : arrayUnion(myKey),
        followerEmails: isFollowing ? arrayRemove(currentEmail) : arrayUnion(currentEmail),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    if (!isFollowing && post.userEmail) {
      await createAppNotification(
        post.userEmail,
        '👤 New follower',
        `${currentEmail.split('@')[0]} followed you.`,
        'follow',
        post.id
      );
    }
  }

  async function createAppNotification(targetEmail: string, title: string, body: string, type: string, postId?: string) {
    if (!targetEmail || targetEmail === currentEmail) return;

    try {
      await addDoc(collection(db, 'appNotifications'), {
        targetEmail,
        fromEmail: currentEmail,
        fromUser: currentEmail.split('@')[0],
        title,
        body,
        type,
        postId: postId || '',
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Create notification error:', error);
    }
  }

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
      await uploadBytes(imageRef, blob, {
        contentType: 'image/jpeg',
      });

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
      setShowComposer(false);
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

      await createAppNotification(
        post.userEmail || '',
        '❤️ New like',
        `${currentEmail.split('@')[0]} liked your post.`,
        'like',
        post.id
      );
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

    await createAppNotification(
      post.userEmail || '',
      '💬 New comment',
      `${currentEmail.split('@')[0]} commented on your post.`,
      'comment',
      post.id
    );

    setCommentText('');
    setCommentPostId(null);
  }

  const myFanAccount = accounts.find((account) =>
    account.id === currentUid ||
    account.email === currentEmail ||
    account.userEmail === currentEmail
  );

  const myFanName =
    currentUser?.displayName ||
    myFanAccount?.displayName ||
    myFanAccount?.username ||
    currentEmail.split('@')[0] ||
    'Soccer Fan';

  const myFanPhotoUrl = myFanAccount?.photoUrl || '';
  const myMainRoom = activeRoom || savedFanBadge || 'General Fan Wall';

  async function reportPost(post: FanPost) {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Login needed', 'Please login before reporting.');
      return;
    }

    async function submitReport(reason: string) {
      try {
        await addDoc(collection(db, 'reports'), {
          postId: post.id,
          postText: post.text || '',
          postImageUrl: post.imageUrl || '',
          postOwnerEmail: post.userEmail || '',
          postOwnerId: post.userId || '',
          reporterEmail: currentUser.email || '',
          reporterId: currentUser.uid,
          reason,
          status: 'active',
          createdAt: serverTimestamp(),
        });

        Alert.alert('Report submitted', 'Thanks. Our team will review this post.');
      } catch (error) {
        console.log('Report error:', error);
        Alert.alert('Error', 'Could not report this post.');
      }
    }

    function confirmReport(reason: string) {
      Alert.alert('Submit report?', `Reason: ${reason}`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: () => submitReport(reason),
        },
      ]);
    }

    Alert.alert('Post options', 'Choose an action for this post.', [
      {
        text: 'Report post',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Why are you reporting this post?', 'Choose the closest reason.', [
            { text: 'Harassment or hate', onPress: () => confirmReport('Harassment or hate') },
            { text: 'Spam or scam', onPress: () => confirmReport('Spam or scam') },
            { text: 'Private information', onPress: () => confirmReport('Private information') },
            { text: 'Inappropriate content', onPress: () => confirmReport('Inappropriate content') },
            { text: 'TV match clip / copyright', onPress: () => confirmReport('TV match clip / copyright') },
            { text: 'Other', onPress: () => confirmReport('Other') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 56, paddingBottom: 180 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🔥 Fan Zone</Text>
      <Text style={styles.subtitle}>Fan Wall + Fans Club in one place</Text>

      <View style={styles.myFanRoomCard}>
        <View style={styles.myFanRoomTop}>
          {myFanPhotoUrl ? (
            <ExpoImage source={{ uri: myFanPhotoUrl }} style={styles.myFanAvatar} contentFit="cover" />
          ) : (
            <View style={styles.myFanAvatarFallback}>
              <Text style={styles.myFanAvatarText}>{myFanName.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.myFanInfo}>
            <Text style={styles.myFanLabel}>My Fan Room</Text>
            <Text style={styles.myFanName}>{myFanName}</Text>
            <Text style={styles.myFanBadge} numberOfLines={1}>🏟️ {myMainRoom}</Text>
          </View>
        </View>

        <View style={styles.myFanStatsRow}>
          <View style={styles.myFanStatBox}>
            <Text style={styles.myFanStatNumber}>{followedTeams.length}</Text>
            <Text style={styles.myFanStatLabel}>Teams</Text>
          </View>

          <View style={styles.myFanStatBox}>
            <Text style={styles.myFanStatNumber}>{followingUsers.length}</Text>
            <Text style={styles.myFanStatLabel}>Following</Text>
          </View>

          <View style={styles.myFanStatBox}>
            <Text style={styles.myFanStatNumber}>{visiblePosts.length}</Text>
            <Text style={styles.myFanStatLabel}>Posts</Text>
          </View>
        </View>

        <View style={styles.myFanActionsRow}>
          <Pressable
            style={styles.myFanActionButton}
            onPress={() => {
              if (savedFanBadge) {
                setActiveRoom(savedFanBadge);
              } else {
                setShowClubPicker(true);
              }
            }}
          >
            <Text style={styles.myFanActionText}>⭐ My Room</Text>
          </Pressable>

          <Pressable
            style={styles.myFanActionButton}
            onPress={() => setShowClubPicker(true)}
          >
            <Text style={styles.myFanActionText}>🏟️ Pick Club</Text>
          </Pressable>

          <Pressable
            style={styles.myFanActionButton}
            onPress={() => router.push('/profile' as any)}
          >
            <Text style={styles.myFanActionText}>📸 Profile Photo</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.viewFollowingBigButton}
          onPress={() => setShowFollowingList(!showFollowingList)}
        >
          <Text style={styles.viewFollowingBigText}>
            👤 View Following Users ({followingUsers.length}) {showFollowingList ? '▲' : '▼'}
          </Text>
        </Pressable>
      </View>

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

        <Pressable
          style={styles.followingToggle}
          onPress={() => setShowFollowingList(!showFollowingList)}
        >
          <Text style={styles.followingTitle}>
            👤 Following Users ({followingUsers.length}) {showFollowingList ? '▲' : '▼'}
          </Text>
          <Text style={styles.followingHelp}>Tap to see who you follow</Text>
        </Pressable>

        {showFollowingList ? (
          <View style={styles.followingListBox}>
            {followingUsers.length ? (
              followingUsers.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.followingPersonBox}>
                  <View style={styles.followingAvatar}>
                    <Text style={styles.followingAvatarText}>
                      {String(item).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.followingPersonInfo}>
                    <Text style={styles.followingPersonName}>
                      {String(item).replace('email:', '').replace('uid:', '')}
                    </Text>
                    <Text style={styles.followingPersonSub}>Following</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.mutedText}>You are not following anyone yet.</Text>
            )}
          </View>
        ) : null}
        {followingUsers.length ? (
          <Text style={styles.mutedText}>{followingUsers.length} user(s) followed</Text>
        ) : (
          <Text style={styles.mutedText}>No followed users yet.</Text>
        )}
      </View>

      {showClubPicker ? (
        <View style={styles.clubPickerCard}>
          {!selectedCountry ? (
            <>
              <Text style={styles.sectionTitle}>{search ? '🔎 Club / Country Results' : '🌎 Pick Country'}</Text>

              {!search ? (
                <>
                  <Text style={styles.countryGroupLabel}>Popular Fan Countries</Text>
                  <View style={styles.countryGrid}>
                    {popularCountryResults.map((country) => (
                      <Pressable
                        key={country}
                        style={styles.countryTile}
                        onPress={() => {
                          setSelectedCountry(country);
                          setSearchText('');
                        }}
                      >
                        <View
                          style={[
                            styles.countryAccentBar,
                            { backgroundColor: getCountryAccent(country) },
                          ]}
                        />

                        <Text style={styles.countryTileFlag}>
                          {country === 'England' ? 'ENG' : countryFlag(country)}
                        </Text>

                        <Text style={styles.countryTileName} numberOfLines={1}>
                          {countryLabel(country)}
                        </Text>

                        <Text style={styles.countryTileSub}>Teams →</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    style={styles.moreCountriesButton}
                    onPress={() => setShowMoreCountries(!showMoreCountries)}
                  >
                    <Text style={styles.moreCountriesText}>
                      🌎 More Countries {showMoreCountries ? '▲' : '▼'}
                    </Text>
                  </Pressable>

                  {showMoreCountries ? (
                    <View style={styles.countryChipWrap}>
                      {moreCountryResults.map((country) => (
                        <Pressable
                          key={country}
                          style={styles.countryChip}
                          onPress={() => {
                            setSelectedCountry(country);
                            setSearchText('');
                          }}
                        >
                          <Text style={styles.countryChipText}>
                            {countryFlag(country)} {countryLabel(country)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : (
                countrySearchResults.map((country) => (
                  <Pressable
                    key={country}
                    style={styles.roomButton}
                    onPress={() => {
                      setSelectedCountry(country);
                      setSearchText('');
                    }}
                  >
                    <Text style={styles.roomText}>{countryFlag(country)} {countryLabel(country)}</Text>
                    <Text style={styles.roomSubtext}>National team + clubs →</Text>
                  </Pressable>
                ))
              )}

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

      <Pressable
        style={styles.composerToggle}
        onPress={() => setShowComposer(!showComposer)}
      >
        <Text style={styles.composerToggleText}>
          {showComposer ? 'Close Post Box ▲' : '✍️ Write a Fan Post'}
        </Text>
      </Pressable>

      {showComposer ? (
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder={activeRoom ? `Post in ${activeRoom}...` : 'Write something for the common Fan Wall...'}
          placeholderTextColor="#718096"
          value={postText}
          onChangeText={setPostText}
          multiline
          blurOnSubmit={false}
          returnKeyType="default"
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
      ) : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FFD166" />
          <Text style={styles.loadingText}>Loading Fan Zone...</Text>
        </View>
      ) : (
        <View>
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
                {/* Soccer Daily three dot report menu */}
                <Pressable
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#0B1526',
                    borderWidth: 1,
                    borderColor: '#FFD166',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    elevation: 10,
                  }}
                  onPress={() => reportPost(post)}
                >
                  <Text
                    style={{
                      color: '#FFD166',
                      fontSize: 28,
                      fontWeight: '900',
                      lineHeight: 28,
                    }}
                  >
                    ⋯
                  </Text>
                </Pressable>

                  <Text style={styles.user}>{userDisplayName(post)}</Text>
                  <Text style={styles.timeText}>{post.editedAt ? 'Edited' : 'Posted'} • Soccer Daily</Text>

                  {userFollowKey(post) && userFollowKey(post) !== currentUid && userFollowKey(post) !== currentEmail ? (
                    <Pressable
                      style={[
                        styles.followUserButton,
                        followingUsers.includes(userFollowKey(post)) && styles.followingUserButton,
                      ]}
                      onPress={() => toggleFollowUser(post)}
                    >
                      <Text
                        style={[
                          styles.followUserText,
                          followingUsers.includes(userFollowKey(post)) && styles.followingUserText,
                        ]}
                      >
                        {followingUsers.includes(userFollowKey(post)) ? 'Following ✓' : 'Follow User +'}
                      </Text>
                    </Pressable>
                  ) : null}

                  {userFollowKey(post) ? (
                    <Text style={styles.followerCountText}>
                      Followers: {followerCounts[safeFollowId(userFollowKey(post))] || 0}
                    </Text>
                  ) : null}

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
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
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
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  reportBigButton: {
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 77, 79, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.45)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  reportBigButtonText: {
    color: '#FFB4B4',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  reportBigSubText: {
    color: '#A7B0C0',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 3,
  },
  viewFollowingBigButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 209, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.38)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  viewFollowingBigText: {
    color: '#FFD166',
    fontWeight: '900',
    textAlign: 'center',
  },
  countryGroupLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 10,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  countryTile: {
    width: '31.5%',
    minHeight: 124,
    backgroundColor: '#07111F',
    borderRadius: 18,
    borderWidth: 1.4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  jerseyBadge: {
    width: 0,
    height: 0,
  },
  jerseyBadgeText: {
    fontSize: 0,
  },

  countryAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  countryJerseyStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  countryTileFlag: {
    fontSize: 22,
    marginBottom: 8,
  },
  countryTileName: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  countryTileSub: {
    color: '#DDE7F0',
    fontSize: 11,
    fontWeight: '800',
  },
  moreCountriesButton: {
    marginTop: 8,
    backgroundColor: '#2B3138',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCountriesText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  countryChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  countryChip: {
    backgroundColor: '#07111F',
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  countryChipText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '900',
  },
  myFanRoomCard: {
    backgroundColor: '#0F1B2D',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.28)',
  },
  myFanRoomTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  myFanAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#FFD166',
    backgroundColor: '#07111F',
  },
  myFanAvatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#FFD166',
    backgroundColor: '#17243A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myFanAvatarText: {
    color: '#FFD166',
    fontSize: 30,
    fontWeight: '900',
  },
  myFanInfo: {
    flex: 1,
  },
  myFanLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  myFanName: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
  },
  myFanBadge: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  myFanStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  myFanStatBox: {
    flex: 1,
    backgroundColor: '#07111F',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  myFanStatNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  myFanStatLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  myFanActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  myFanActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 209, 102, 0.14)',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  myFanActionText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
  },
  photoComposerBox: {
    marginTop: 10,
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: 'rgba(255, 209, 102, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.4)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 14,
  },
  photoPreviewBox: {
    marginTop: 12,
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#0F1B2D',
  },
  removePhotoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    color: '#FCA5A5',
    fontWeight: '800',
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#0F1B2D',
  },
  followingToggle: {
    backgroundColor: 'rgba(255, 209, 102, 0.10)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.25)',
  },
  followingHelp: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  followingListBox: {
    backgroundColor: '#101D31',
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
  },
  followingPersonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111C2E',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  followingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#243044',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  followingAvatarText: {
    color: '#FFD166',
    fontWeight: '900',
  },
  followingPersonInfo: {
    flex: 1,
  },
  followingPersonName: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  followingPersonSub: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 2,
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

  composerToggle: {
    backgroundColor: '#FFD166',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  composerToggleText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: '900',
  },

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

  followUserButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  followingUserButton: {
    backgroundColor: '#2A1F12',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  followUserText: {
    color: '#07111F',
    fontSize: 12,
    fontWeight: '900',
  },
  followingUserText: {
    color: '#FFD166',
  },
  followerCountText: {
    color: '#8EA4C8',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
  },

  followingTitle: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 14,
  },
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
