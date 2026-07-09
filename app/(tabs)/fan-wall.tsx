import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Keyboard, Pressable, ScrollView, useWindowDimensions, Modal, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { db, storage } from '../../firebase/config';

type FanPost = {
  id: string;
  text?: string;
  badge?: string;
  tag?: string;
  taggedUsers?: string[];
  user?: string;
  userEmail?: string;
  userId?: string;
  likes?: string[];
  comments?: any[];
  gifUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: any;
  editedAt?: any;
};

type FanAccount = {
  id: string;
  username?: string;
  displayName?: string;
  userPhoto?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  photoURL?: string;
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
    England: '🇬🇧',
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

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;


  const [fullScreenPost, setFullScreenPost] = useState<FanPost | null>(null);
  const [selectedFanProfile, setSelectedFanProfile] = useState<FanPost | null>(null);
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState('');
  const [publicProfileByUserId, setPublicProfileByUserId] = useState<Record<string, any>>({});

  const [bookPageHint, setBookPageHint] = useState<'fanFeed' | 'matchRooms' | 'myTeams' | 'createPost'>('fanFeed');
  const [communityGuidelinesAccepted, setCommunityGuidelinesAccepted] = useState(false);

  async function handleAcceptCommunityGuidelines() {
    await AsyncStorage.setItem('soccerDailyCommunityGuidelinesAccepted', 'yes');
    setCommunityGuidelinesAccepted(true);
  }

  function handleShowCommunityGuidelines() {
    Alert.alert(
      'Community Guidelines',
      'Be respectful. No hate speech. No spam. No bullying. No unsafe or copyrighted match clips. Report anything harmful.',
      [
        {
          text: 'I Agree',
          onPress: handleAcceptCommunityGuidelines,
        },
      ],
      { cancelable: false }
    );
  }

  const fanScrollRef = useRef<any>(null);
  const fanFeedY = useRef(0);
  const matchRoomsY = useRef(0);
  const myTeamsY = useRef(0);
  const createPostY = useRef(0);

  function goToFanPage(page: 'fanFeed' | 'matchRooms' | 'myTeams' | 'createPost') {
    setBookPageHint(page);

    const target =
      page === 'fanFeed'
        ? fanFeedY.current
        : page === 'matchRooms'
          ? matchRoomsY.current
          : page === 'myTeams'
            ? myTeamsY.current
            : createPostY.current;

    setTimeout(() => {
      fanScrollRef.current?.scrollTo({
        y: Math.max(target - 24, 0),
        animated: true,
      });
    }, 50);
  }
  const params = useLocalSearchParams();
  const routeRoom = typeof params.room === 'string' ? params.room : '';

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentEmail = currentUser?.email || 'guest@soccerdaily.app';
  const currentUid = currentUser?.uid || '';

  const countries = Object.keys(COUNTRY_CLUBS);

  const FAN_POST_LIMIT = 500;
  const [postText, setPostText] = useState('');
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [selectedVideoUri, setSelectedVideoUri] = useState('');
  const [selectedVideoDuration, setSelectedVideoDuration] = useState(0);
  const [uploadingPostVideo, setUploadingPostVideo] = useState(false);
  const [uploadingPostPhoto, setUploadingPostPhoto] = useState(false);
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [accounts, setAccounts] = useState<FanAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedFanBadge, setSavedFanBadge] = useState('');
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showFollowedTeamsList, setShowFollowedTeamsList] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
  const [activeFanHub, setActiveFanHub] = useState('home');
  const [followerCounts, setFollowerCounts] = useState<any>({});
  const [activeRoom, setActiveRoom] = useState(routeRoom);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
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
        photoURL: currentProfilePhotoUrl,
        avatarUrl: currentProfilePhotoUrl,
        profileImageUrl: currentProfilePhotoUrl,
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


  useEffect(() => {
    async function syncFanZoneTeamWithFavoriteClub() {
      try {
        if (!savedFanBadge || savedFanBadge === 'General Fan Wall') return;

        await AsyncStorage.multiSet([
          ['favoriteClubTeam', savedFanBadge],
          ['soccerDailyFavoriteClub', savedFanBadge],
          ['savedFanBadge', savedFanBadge],
        ]);

        const user = getAuth().currentUser;

        if (user) {
          const favoriteData = {
            userId: user.uid,
            userEmail: user.email || '',
            favoriteClubTeam: savedFanBadge,
            savedFanBadge,
            updatedAt: serverTimestamp(),
          };

          await setDoc(doc(db, 'users', user.uid), favoriteData, { merge: true });
          await setDoc(doc(db, 'publicProfiles', user.uid), favoriteData, { merge: true });
        }
      } catch (error) {
        console.log('Fan Zone favorite team sync failed:', error);
      }
    }

    syncFanZoneTeamWithFavoriteClub();
  }, [savedFanBadge]);

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

  const visiblePosts = posts.filter(isPostVisibleForFanWall).filter((post) => {
    const roomOk = activeRoom ? post.badge === activeRoom : true;

    const searchTarget = `${post.text || ''} ${post.user || ''} ${post.userEmail || ''} ${post.badge || ''} ${(post.taggedUsers || []).join(' ')} ${post.tag || ''} ${(post.taggedUsers || []).join(' ')} ${(post.comments || [])
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

  
  async function uriToBlob(uri: string) {
    const response = await fetch(uri);

    if (!response.ok && Platform.OS === 'web') {
      throw new Error('Could not read selected file in browser.');
    }

    return await response.blob();
  }

async function uploadFanPostPhoto() {
    if (!selectedImageUri) return '';

    if (!currentUid) {
      Alert.alert('Login required', 'Please login first to upload a photo.');
      return '';
    }

    try {
      setUploadingPostPhoto(true);

      const blob = await uriToBlob(selectedImageUri);

      const imageRef = ref(storage, `fan-wall/${currentUid}/${Date.now()}-${Platform.OS}.jpg`);
      await uploadBytes(imageRef, blob, {
        contentType: blob.type || 'image/jpeg',
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

  async function pickFanPostVideo() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to choose a video.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.75,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const durationMs = asset.duration || 0;
      const durationSeconds = durationMs / 1000;

      if (durationMs && durationSeconds > 30) {
        Alert.alert('Video too long', 'Please choose a video that is 30 seconds or shorter.');
        return;
      }

      setSelectedImageUri('');
      setSelectedVideoUri('');
      setSelectedVideoDuration(0);
      setSelectedVideoUri(asset.uri);
      setSelectedVideoDuration(durationSeconds);
    } catch (error) {
      console.log('Pick video error:', error);
      Alert.alert('Error', 'Could not choose video.');
    }
  }

  async function uploadFanPostVideo() {
    if (!selectedVideoUri) return '';

    if (!currentUid) {
      Alert.alert('Login required', 'Please login first.');
      return '';
    }

    try {
      setUploadingPostVideo(true);

      const response = await fetch(selectedVideoUri);
      const blob = await response.blob();

      const videoRef = ref(storage, `fan-wall/${currentUid}/${Date.now()}.mp4`);
      await uploadBytes(videoRef, blob, {
        contentType: 'video/mp4',
      });

      return await getDownloadURL(videoRef);
    } catch (error) {
      console.log('Upload fan post video error:', error);
      Alert.alert('Upload failed', 'Could not upload video.');
      return '';
    } finally {
      setUploadingPostVideo(false);
    }
  }

  async function submitPost() {
    const finalGifUrl = selectedGifUrl || extractGifUrl(postText);
    const cleanText = removeGifUrl(postText).trim();

    if (cleanText.length > FAN_POST_LIMIT) {
      Alert.alert('Post too long', `Fan Wall posts can be up to ${FAN_POST_LIMIT} characters.`);
      return;
    }

    if (!cleanText && !finalGifUrl && !selectedImageUri && !selectedVideoUri) {
      Alert.alert('Empty Post', 'Please write something, add a photo, add a video, or choose a GIF first.');
      return;
    }

    const badge = activeRoom || savedFanBadge || 'General Fan Wall';
    const uploadedImageUrl = await uploadFanPostPhoto();
    const uploadedVideoUrl = await uploadFanPostVideo();

    if (selectedImageUri && !uploadedImageUrl) return;
    if (selectedVideoUri && !uploadedVideoUrl) return;

    try {
      await addDoc(collection(db, 'fanWall'), {
        text: cleanText,
        gifUrl: finalGifUrl,
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
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
      setSelectedVideoUri('');
      setSelectedVideoDuration(0);
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


  useEffect(() => {
    async function loadCurrentProfilePhotoForFanWall() {
      try {
        const user = getAuth().currentUser;
        const uid = currentUid || user?.uid || '';

        if (user?.photoURL) {
          setCurrentProfilePhotoUrl(user.photoURL);
          console.log('✅ Fan Wall avatar from Auth:', user.photoURL);
          return;
        }

        if (uid) {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data: any = userSnap.data();
            const photo = data.photoURL || data.photoUrl || data.profileImageUrl || '';
            if (photo) {
              setCurrentProfilePhotoUrl(photo);
              console.log('✅ Fan Wall avatar from users:', photo);
              return;
            }
          }

          const publicSnap = await getDoc(doc(db, 'publicProfiles', uid));
          if (publicSnap.exists()) {
            const data: any = publicSnap.data();
            const photo = data.photoURL || data.photoUrl || data.profileImageUrl || '';
            if (photo) {
              setCurrentProfilePhotoUrl(photo);
              console.log('✅ Fan Wall avatar from publicProfiles:', photo);
              return;
            }
          }
        }

        const keys = ['profilePhotoUrl', 'soccerDailyProfilePhoto', 'homePhotoUrl'];
        for (const key of keys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            setCurrentProfilePhotoUrl(value);
            console.log('✅ Fan Wall avatar from AsyncStorage:', key, value);
            return;
          }
        }

        console.log('⚠️ Fan Wall avatar not found, using initial.');
      } catch (error) {
        console.log('❌ Fan Wall avatar load failed:', error);
      }
    }

    loadCurrentProfilePhotoForFanWall();
  }, [currentEmail, currentUid]);




  useEffect(() => {
    let cancelled = false;

    async function loadPublicProfilesForVisiblePosts() {
      try {
        const ids = new Set<string>();

        visiblePosts.forEach((post) => {
          if (post.userId) ids.add(post.userId);

          (post.comments || []).forEach((comment: any) => {
            if (comment.userId) ids.add(comment.userId);
          });
        });

        const missingIds = Array.from(ids).filter((uid) => uid && !publicProfileByUserId[uid]);

        if (!missingIds.length) return;

        const updates: Record<string, any> = {};

        for (const uid of missingIds.slice(0, 40)) {
          try {
            const publicSnap = await getDoc(doc(db, 'publicProfiles', uid));

            if (publicSnap.exists()) {
              updates[uid] = publicSnap.data();
              continue;
            }

            const userSnap = await getDoc(doc(db, 'users', uid));

            if (userSnap.exists()) {
              updates[uid] = userSnap.data();
            }
          } catch (error) {
            console.log('Public profile lookup skipped:', uid, error);
          }
        }

        if (!cancelled && Object.keys(updates).length) {
          setPublicProfileByUserId((prev) => ({
            ...prev,
            ...updates,
          }));
        }
      } catch (error) {
        console.log('Load public profiles error:', error);
      }
    }

    loadPublicProfilesForVisiblePosts();

    return () => {
      cancelled = true;
    };
  }, [visiblePosts, publicProfileByUserId]);

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

  function openFollowingUsersList() {
    setShowFollowingList((prev) => !prev);
    setShowFollowedTeamsList(false);
    setShowClubPicker(false);
    setShowComposer(false);
    setShowMyPostsOnly(false);
    setShowMoreCountries(false);
    setActiveFanHub('following');
  }

  function openFollowedTeamsList() {
    setShowFollowedTeamsList((prev) => !prev);
    setShowFollowingList(false);
    setShowClubPicker(false);
    setShowComposer(false);
    setShowMyPostsOnly(false);
    setShowMoreCountries(false);
    setActiveFanHub('teams');
  }

  function openMyPostsList() {
    setShowMyPostsOnly((prev) => !prev);
  }


  
function openAllPostsPanel() {
    setActiveRoom('');
    setSelectedCountry(null);
    setSearchText('');
    setShowClubPicker(false);
    setShowComposer(false);
    setShowFollowedTeamsList(false);
    setShowFollowingList(false);
    setShowMyPostsOnly(false);
    setShowMoreCountries(false);
    setActiveFanHub('wall');
    setBookPageHint('');
  }

  function openWritePostPanel() {
    setShowComposer(true);
    setShowClubPicker(false);
    setShowFollowedTeamsList(false);
    setShowFollowingList(false);
    setShowMyPostsOnly(false);
    setShowMoreCountries(false);
    setActiveFanHub('write');
    setBookPageHint('createPost');
  }

  function openClubPickerPanel() {
    setShowClubPicker(true);
    setShowComposer(false);
    setShowFollowedTeamsList(false);
    setShowFollowingList(false);
    setShowMyPostsOnly(false);
    setShowMoreCountries(false);
    setActiveFanHub('clubs');
    setBookPageHint('clubs');
  }

  function openFanHub(section: string) {
    setActiveFanHub(section);
    setShowFollowedTeamsList(false);
    setShowFollowingList(false);
    setShowMyPostsOnly(false);

    if (section === 'home') {
      setActiveRoom('');
      setShowClubPicker(false);
      setSelectedCountry(null);
      return;
    }

    if (section === 'wall') {
      setActiveRoom('');
      setShowClubPicker(false);
      setSelectedCountry(null);
      return;
    }

    if (section === 'clubs') {
      setShowClubPicker(true);
      setSelectedCountry(null);
      return;
    }

    if (section === 'teams') {
      setShowFollowedTeamsList(true);
      return;
    }

    if (section === 'following') {
      setShowFollowingList(true);
      return;
    }

    if (section === 'posts') {
      setShowMyPostsOnly(true);
      setShowClubPicker(false);
      return;
    }

    if (section === 'rules') {
      router.push('/community-guidelines' as any);
    }
  }

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

  
  async function addMentionToPost(post: FanPost, rawMention: string) {
    const cleanMention = rawMention.trim().replace(/^@+/, '');

    if (!cleanMention) {
      Alert.alert('Tag someone', 'Please choose a username to tag.');
      return;
    }

    if (!currentEmail) {
      Alert.alert('Login required', 'Please login first.');
      return;
    }

    const currentTaggedUsers = post.taggedUsers || [];

    if (currentTaggedUsers.includes(cleanMention)) {
      Alert.alert('Already tagged', `@${cleanMention} is already tagged on this post.`);
      return;
    }

    if (currentTaggedUsers.length >= 10) {
      Alert.alert('Tag limit reached', 'You can tag up to 10 people in one post.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fanWall', post.id), {
        taggedUsers: arrayUnion(cleanMention),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Tag someone error:', error);
      Alert.alert('Tag failed', 'Could not tag this person.');
    }
  }

  function openTagSomeonePrompt(post: FanPost) {
    const candidateMap = new Map<string, string>();

    visiblePosts.forEach((item) => {
      const key = userFollowKey(item);
      const name = userDisplayName(item);
      if (key && key !== currentUid && key !== currentEmail) {
        candidateMap.set(name, name);
      }
    });

    followingUsers.forEach((item) => {
      const name = String(item).replace('email:', '').replace('uid:', '').split('@')[0];
      if (name && name !== currentEmail.split('@')[0]) {
        candidateMap.set(name, name);
      }
    });

    const suggestions = Array.from(candidateMap.values()).slice(0, 10);

    if (!suggestions.length) {
      Alert.alert(
        'Tag Someone',
        'No suggested fans yet. You can still type @username in a comment for now.'
      );
      return;
    }

    Alert.alert(
      'Tag Someone @',
      'Choose up to one fan to mention on this post.',
      [
        ...suggestions.map((name) => ({
          text: `@${name}`,
          onPress: () => addMentionToPost(post, name),
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  
  async function setFixedPostTag(post: FanPost, tag: string) {
    const isOwner = post.userEmail === currentEmail || post.userId === currentUid;

    if (!isOwner) {
      Alert.alert('Only post owner', 'Only the post owner can change this post tag.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fanWall', post.id), {
        tag,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Set post tag error:', error);
      Alert.alert('Tag failed', 'Could not update the post tag.');
    }
  }

  async function removeFixedPostTag(post: FanPost) {
    const isOwner = post.userEmail === currentEmail || post.userId === currentUid;

    if (!isOwner) {
      Alert.alert('Only post owner', 'Only the post owner can remove this post tag.');
      return;
    }

    try {
      await updateDoc(doc(db, 'fanWall', post.id), {
        tag: '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Remove post tag error:', error);
      Alert.alert('Tag failed', 'Could not remove the post tag.');
    }
  }

  function openFixedPostTagMenu(post: FanPost) {
    const isOwner = post.userEmail === currentEmail || post.userId === currentUid;

    if (!isOwner) {
      Alert.alert('Post Tag', 'Only the post owner can add or change this post tag.');
      return;
    }

    Alert.alert(
      'Add / Change Post Tag',
      'Choose one fixed tag for this post.',
      [
        ...FIXED_POST_TAGS.map((tag) => ({
          text: tag,
          onPress: () => setFixedPostTag(post, tag),
        })),
        ...(post.tag ? [{ text: 'Remove Tag', onPress: () => removeFixedPostTag(post), style: 'destructive' as const }] : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  }

function openPostOptions(post: FanPost) {
    if (Platform.OS === 'web') {
      setActivePostMenuId((current) => current === post.id ? null : post.id);
      return;
    }

    Alert.alert(
      'Post Menu',
      'Tag someone or report this post',
      [
        {
          text: 'Tag Someone @',
          onPress: () => openTagSomeonePrompt(post),
        },
        {
          text: 'Report',
          onPress: () => reportPost(post),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }


  async function toggleFullScreenLike(post: FanPost) {
    const wasLiked = post.likes?.includes(currentEmail) || false;

    await toggleLike(post);

    if (!currentEmail) return;

    setFullScreenPost((prev) => {
      if (!prev || prev.id !== post.id) return prev;

      const currentLikes = prev.likes || [];
      const nextLikes = wasLiked
        ? currentLikes.filter((email) => email !== currentEmail)
        : Array.from(new Set([...currentLikes, currentEmail]));

      return {
        ...prev,
        likes: nextLikes,
      };
    });
  }

  async function submitFullScreenComment(post: FanPost) {
    const cleanComment = commentText.trim();

    if (!cleanComment) {
      Alert.alert('Empty comment', 'Please write something first.');
      return;
    }

    await submitComment(post);

    if (!currentEmail) return;

    setFullScreenPost((prev) => {
      if (!prev || prev.id !== post.id) return prev;

      return {
        ...prev,
        comments: [
          ...(prev.comments || []),
          {
            text: cleanComment,
            userEmail: currentEmail,
            user: currentEmail.split('@')[0],
            badge: savedFanBadge || 'General Fan Wall',
            createdAt: Date.now(),
          },
        ],
      };
    });
  }



  function isPostVisibleForFanWall(post: any) {
    return !(
      post.hidden === true ||
      post.held === true ||
      post.status === 'held' ||
      post.status === 'hidden' ||
      post.moderationStatus === 'under_investigation'
    );
  }

  function fanAvatarUrl(post: FanPost) {
    const savedPostPhoto =
      post.photoURL ||
      post.avatarUrl ||
      post.profileImageUrl ||
      post.userPhoto ||
      '';

    if (savedPostPhoto) return savedPostPhoto;

    if (post.userId && publicProfileByUserId[post.userId]) {
      const publicProfile = publicProfileByUserId[post.userId];
      const publicPhoto =
        publicProfile.photoURL ||
        publicProfile.photoUrl ||
        publicProfile.profileImageUrl ||
        publicProfile.avatarUrl ||
        '';

      if (publicPhoto) return publicPhoto;
    }

    const isCurrentUserPost =
      post.userEmail === currentEmail ||
      post.userId === currentUid;

    if (isCurrentUserPost && currentProfilePhotoUrl) {
      return currentProfilePhotoUrl;
    }

    return '';
  }


  function commentPhotoUrl(comment: any) {
    const savedCommentPhoto =
      comment.photoURL ||
      comment.photoUrl ||
      comment.avatarUrl ||
      comment.profileImageUrl ||
      '';

    if (savedCommentPhoto) return savedCommentPhoto;

    if (comment.userId && publicProfileByUserId[comment.userId]) {
      const publicProfile = publicProfileByUserId[comment.userId];
      const publicPhoto =
        publicProfile.photoURL ||
        publicProfile.photoUrl ||
        publicProfile.profileImageUrl ||
        publicProfile.avatarUrl ||
        '';

      if (publicPhoto) return publicPhoto;
    }

    const isCurrentUserComment =
      comment.userEmail === currentEmail ||
      comment.userId === currentUid;

    if (isCurrentUserComment && currentProfilePhotoUrl) {
      return currentProfilePhotoUrl;
    }

    return '';
  }

  function fanInitial(post: FanPost) {
    const name = userDisplayName(post) || post.userEmail || 'Fan';
    return name.trim().charAt(0).toUpperCase() || 'F';
  }

  async function openFanProfileFromPost(post: FanPost) {
    try {
      let mergedProfile: FanPost = { ...post };

      if (post.userId) {
        let publicProfile = publicProfileByUserId[post.userId];

        if (!publicProfile) {
          const publicSnap = await getDoc(doc(db, 'publicProfiles', post.userId));

          if (publicSnap.exists()) {
            publicProfile = publicSnap.data();
          } else {
            const userSnap = await getDoc(doc(db, 'users', post.userId));
            publicProfile = userSnap.exists() ? userSnap.data() : null;
          }

          if (publicProfile) {
            setPublicProfileByUserId((prev) => ({
              ...prev,
              [post.userId as string]: publicProfile,
            }));
          }
        }

        if (publicProfile) {
          mergedProfile = {
            ...mergedProfile,
            displayName: publicProfile.displayName || mergedProfile.displayName,
            user: publicProfile.displayName || mergedProfile.user,
            photoURL:
              publicProfile.photoURL ||
              publicProfile.photoUrl ||
              publicProfile.profileImageUrl ||
              mergedProfile.photoURL,
            avatarUrl:
              publicProfile.avatarUrl ||
              publicProfile.photoURL ||
              publicProfile.photoUrl ||
              publicProfile.profileImageUrl ||
              mergedProfile.avatarUrl,
          };
        }
      }

      setSelectedFanProfile(mergedProfile);
    } catch (error) {
      console.log('Open public fan profile error:', error);
      setSelectedFanProfile(post);
    }
  }

async function sharePost(post: FanPost) {
    try {
      await Share.share({
        message: `${post.text || ''}\

const FIXED_POST_TAGS = [
  '🔥 Matchday',
  '⚽ Goal',
  '📰 News',
  '📸 Photo',
  '🎥 Video',
  '❓ Question',
  '⭐ Opinion',
  '😂 Meme',
];

n\nShared from Soccer Daily Fan Zone`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }

  return (
    <ScrollView ref={fanScrollRef} style={styles.container} contentContainerStyle={{ paddingTop: 30, paddingBottom: 180 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">

      <View pointerEvents="none" style={styles.fullStadiumBg}>
        <View style={styles.bgSkyGlow} />
        <View style={styles.bgLeftLight} />
        <View style={styles.bgRightLight} />

        <View style={styles.bgRoofArcOuter} />
        <View style={styles.bgRoofArcInner} />

        <View style={styles.bgLightBar}>
          <View style={styles.bgLightDot} />
          <View style={styles.bgLightDot} />
          <View style={styles.bgLightDot} />
          <View style={styles.bgLightDot} />
          <View style={styles.bgLightDot} />
        </View>

        <View style={styles.bgSeatBowlOne} />
        <View style={styles.bgSeatBowlTwo} />
        <View style={styles.bgSeatBowlThree} />

        <View style={styles.bgPitch}>
          <View style={styles.bgPitchHalfLine} />
          <View style={styles.bgPitchCircle} />
        </View>
      </View>

      <View style={styles.headerWrap}>
        <Text style={styles.title}>🏟️ Fan Wall</Text>
      </View>

      <View pointerEvents="none" style={[styles.futureStadium, styles.simpleHiddenSection]}>
        <View style={styles.stadiumRoofArc} />
        <View style={styles.stadiumRoofArcSmall} />

        <View style={styles.holoBoard}>
          <Text style={styles.holoBoardText}>SOCCER DAILY STADIUM 2056</Text>
          <Text style={styles.holoBoardSub}>LIVE FAN WALL</Text>
        </View>

        <View style={styles.floodLightRow}>
          <Text style={styles.floodLight}>✦</Text>
          <Text style={styles.floodLight}>✦</Text>
          <Text style={styles.floodLight}>✦</Text>
          <Text style={styles.floodLight}>✦</Text>
          <Text style={styles.floodLight}>✦</Text>
        </View>

        <View style={styles.crowdBowl}>
          <View style={styles.crowdRowOne} />
          <View style={styles.crowdRowTwo} />
          <View style={styles.crowdRowThree} />

          <View style={styles.neonPitch}>
            <View style={styles.pitchCenterCircle} />
            <View style={styles.pitchHalfLine} />
          </View>
        </View>
      </View>


      <View pointerEvents="none" style={[styles.stadiumScene, styles.simpleHiddenSection]}>
        <View style={styles.stadiumLightsRow}>
          <Text style={styles.stadiumLight}>✦</Text>
          <Text style={styles.stadiumLight}>✦</Text>
          <Text style={styles.stadiumLight}>✦</Text>
          <Text style={styles.stadiumLight}>✦</Text>
          <Text style={styles.stadiumLight}>✦</Text>
        </View>

        <View style={styles.stadiumStand}>
          <View style={styles.standRow} />
          <View style={styles.standRowSmall} />
          <View style={styles.pitchLine} />
        </View>
      </View>


      
      <View style={[styles.topFanRoomCard, styles.compactTopFanRoomCard, styles.stadiumTicketCard]}>
        <View pointerEvents="none" style={styles.topFanRoomGlow} />

        <View style={styles.topFanRoomRow}>
          {myFanPhotoUrl ? (
            <ExpoImage source={{ uri: myFanPhotoUrl }} style={styles.topFanAvatar} contentFit="cover" />
          ) : (
            <View style={styles.topFanAvatarFallback}>
              <Text style={styles.topFanAvatarText}>{myFanName.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.topFanInfo}>
            <Text style={styles.topFanKicker}>STADIUM ENTRANCE</Text>
            <Text style={styles.topFanName} numberOfLines={1}>General Fan Wall</Text>
            <Text style={styles.topFanRoomName} numberOfLines={1}>🏟️ All fans · all teams</Text>
          </View>
        </View>

        <View style={[styles.topFanStatsRow, styles.simpleHiddenSection]}>
          <Pressable style={styles.topFanStatBox} onPress={openFollowedTeamsList}>
            <Text style={styles.topFanStatNumber}>{followedTeams.length}</Text>
            <Text style={styles.topFanStatLabel}>Teams</Text>
          </Pressable>

          <Pressable style={styles.topFanStatBox} onPress={openFollowingUsersList}>
            <Text style={styles.topFanStatNumber}>{followingUsers.length}</Text>
            <Text style={styles.topFanStatLabel}>Following</Text>
          </Pressable>

          <Pressable style={styles.topFanStatBox} onPress={openMyPostsList}>
            <Text style={styles.topFanStatNumber}>{visiblePosts.length}</Text>
            <Text style={styles.topFanStatLabel}>Posts</Text>
          </Pressable>
        </View>

        <View style={[styles.topFanQuickRow, styles.simpleHiddenSection]}>
          <Pressable style={styles.topFanQuickButton} onPress={() => { setBookPageHint('myTeams'); setActiveFanHub('teams'); }}>
            <Text style={styles.topFanQuickText}>⭐ My Teams</Text>
          </Pressable>

          <Pressable style={styles.topFanQuickButton} onPress={openClubPickerPanel}>
            <Text style={styles.topFanQuickText}>🏟️ Pick Team</Text>
          </Pressable>

          <Pressable style={styles.topFanQuickButtonGold} onPress={openWritePostPanel}>
            <Text style={styles.topFanQuickTextDark}>✍️ Write Post</Text>
          </Pressable>
        </View>
      </View>

<View style={[styles.matchdayBook, styles.simpleHiddenSection]}>
        <View pointerEvents="none" style={styles.bookSpine} />
        <View pointerEvents="none" style={styles.bookFieldLine} />
        <View pointerEvents="none" style={styles.bookCenterCircle} />

        <Text style={styles.bookEyebrow}>MATCHDAY BOOK</Text>
        <Text style={styles.bookTitle}>Matchday Pages</Text>
        <Text style={styles.bookSubtitle}>
          Pick a page and the Fan Zone will change below.
        </Text>

        <View style={styles.bookPageGrid}>
          <Pressable style={[styles.bookPageButton, bookPageHint === 'fanFeed' && styles.bookPageButtonActive]} onPress={() => { setBookPageHint('fanFeed'); setActiveFanHub('wall'); }}>
            <Text style={styles.bookPageIcon}>💬</Text>
            <Text style={[styles.bookPageTitle, bookPageHint === 'fanFeed' && styles.bookPageTextActive]}>Fan Feed</Text>
            <Text style={styles.bookPageText}>{visiblePosts.length} posts live</Text>
              <Text style={styles.bookPageSubText}>Photos • videos • comments</Text>
          </Pressable>

          <Pressable style={[styles.bookPageButton, bookPageHint === 'matchRooms' && styles.bookPageButtonActive]} onPress={() => { setBookPageHint('matchRooms'); setActiveFanHub('clubs'); }}>
            <Text style={styles.bookPageIcon}>🏟️</Text>
            <Text style={[styles.bookPageTitle, bookPageHint === 'matchRooms' && styles.bookPageTextActive]}>Match Rooms</Text>
            <Text style={styles.bookPageText}>{activeRoom ? activeRoom : 'Choose a room'}</Text>
              <Text style={styles.bookPageSubText}>Country • club • match talk</Text>
          </Pressable>

          <Pressable style={[styles.bookPageButton, bookPageHint === 'myTeams' && styles.bookPageButtonActive]} onPress={() => { setBookPageHint('myTeams'); setActiveFanHub('teams'); }}>
            <Text style={styles.bookPageIcon}>⭐</Text>
            <Text style={[styles.bookPageTitle, bookPageHint === 'myTeams' && styles.bookPageTextActive]}>My Teams</Text>
            <Text style={styles.bookPageText}>{followedTeams.length} teams saved</Text>
              <Text style={styles.bookPageSubText}>{followedTeams.length > 0 ? String(followedTeams[0]) : 'Pick your main club'}</Text>
          </Pressable>

          <Pressable style={[styles.bookPageButton, bookPageHint === 'createPost' && styles.bookPageButtonActive]} onPress={openWritePostPanel}>
            <Text style={styles.bookPageIcon}>📸</Text>
            <Text style={[styles.bookPageTitle, bookPageHint === 'createPost' && styles.bookPageTextActive]}>Create Post</Text>
            <Text style={styles.bookPageText}>{activeRoom ? `Post in ${activeRoom}` : 'Post to Fan Wall'}</Text>
              <Text style={styles.bookPageSubText}>Text • photo • GIF • video</Text>
          </Pressable>
        </View>

        <View style={styles.bookInsidePage}>
          <Text style={styles.bookInsideKicker}>
            {bookPageHint === 'fanFeed'
              ? '💬 FAN FEED'
              : bookPageHint === 'matchRooms'
                ? '🏟️ MATCH ROOMS'
                : bookPageHint === 'myTeams'
                  ? '⭐ MY TEAMS'
                  : '📸 CREATE POST'}
          </Text>

          <Text style={styles.bookInsideTitle}>
            {bookPageHint === 'fanFeed'
              ? `${visiblePosts.length} Fan Zone posts`
              : bookPageHint === 'matchRooms'
                ? activeRoom || 'Choose a soccer room'
                : bookPageHint === 'myTeams'
                  ? `${followedTeams.length} followed teams`
                  : activeRoom ? `Post in ${activeRoom}` : 'Post to Fan Wall'}
          </Text>

          <Text style={styles.bookInsideText}>
            {bookPageHint === 'fanFeed'
              ? 'Recent fan posts, photos, videos, comments, and match reactions will appear in this page.'
              : bookPageHint === 'matchRooms'
                ? 'Use this page for country, club, and match-room conversations.'
                : bookPageHint === 'myTeams'
                  ? followedTeams.length > 0 ? `Main team: ${String(followedTeams[0])}` : 'Pick your club and build your soccer identity.'
                  : 'Create a post with text, photo, GIF, or video for other fans.'}
          </Text>

          <View style={styles.bookInsideRow}>
            <View style={styles.bookInsideStat}>
              <Text style={styles.bookInsideStatNumber}>{visiblePosts.length}</Text>
              <Text style={styles.bookInsideStatLabel}>Posts</Text>
            </View>
            <View style={styles.bookInsideStat}>
              <Text style={styles.bookInsideStatNumber}>{followedTeams.length}</Text>
              <Text style={styles.bookInsideStatLabel}>Teams</Text>
            </View>
            <View style={styles.bookInsideStat}>
              <Text style={styles.bookInsideStatNumber}>{followingUsers.length}</Text>
              <Text style={styles.bookInsideStatLabel}>Following</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={[styles.myFanRoomCard, styles.hiddenOldFanSection]}>
        <View pointerEvents="none" style={styles.myRoomPattern}>
          <Text style={[styles.myRoomBallBig, { top: -18, right: -12 }]}>⚽</Text>
          <Text style={[styles.myRoomBallSmall, { bottom: 18, left: 18 }]}>⚽</Text>
          <View style={styles.myRoomFieldLineOne} />
          <View style={styles.myRoomFieldLineTwo} />
          <View style={styles.myRoomCenterCircle} />
        </View>
        <View style={styles.myFanRoomTop}>
          {myFanPhotoUrl ? (
            <ExpoImage source={{ uri: myFanPhotoUrl }} style={styles.myFanAvatar} contentFit="cover" />
          ) : (
            <View style={styles.myFanAvatarFallback}>
              <Text style={styles.myFanAvatarText}>{myFanName.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.myFanInfo}>
            <View onLayout={(event) => { myTeamsY.current = event.nativeEvent.layout.y; }} />
            <Text style={styles.myFanLabel}>My Fan Ticket</Text>
            <Text style={styles.myFanName}>{myFanName}</Text>
            <Text style={styles.myFanBadge} numberOfLines={1}>🏟️ {myMainRoom}</Text>
          </View>
        </View>

        <View style={styles.myFanStatsRow}>
          <Pressable style={styles.myFanStatBox} onPress={openFollowedTeamsList}>
            <Text style={styles.myFanStatNumber}>{followedTeams.length}</Text>
            <Text style={styles.myFanStatLabel}>Teams {showFollowedTeamsList ? '▲' : '▼'}</Text>
          </Pressable>

          <Pressable style={styles.myFanStatBox} onPress={openFollowingUsersList}>
            <Text style={styles.myFanStatNumber}>{followingUsers.length}</Text>
            <Text style={styles.myFanStatLabel}>Following {showFollowingList ? '▲' : '▼'}</Text>
          </Pressable>

          <Pressable style={styles.myFanStatBox} onPress={openMyPostsList}>
            <Text style={styles.myFanStatNumber}>{visiblePosts.length}</Text>
            <Text style={styles.myFanStatLabel}>Posts {showMyPostsOnly ? '▲' : '▼'}</Text>
          </Pressable>
        </View>

        {showFollowedTeamsList ? (
          <View style={styles.compactFollowPanel}>
            <Text style={styles.compactFollowTitle}>⭐ Teams you follow</Text>
            {followedTeams.length ? (
              <View style={styles.compactChipWrap}>
                {followedTeams.map((team) => (
                  <Pressable
                    key={team}
                    style={[styles.compactTeamChip, activeRoom === team && styles.compactTeamChipActive]}
                    onPress={() => {
                      setActiveRoom(team);
                      setShowClubPicker(false);
                    }}
                  >
                    <Text
                      style={[styles.compactTeamChipText, activeRoom === team && styles.compactTeamChipTextActive]}
                      numberOfLines={1}
                    >
                      {team}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.compactEmptyText}>No followed teams yet. Tap Pick Club.</Text>
            )}
          </View>
        ) : null}

        {showFollowingList ? (
          <View style={styles.compactFollowPanel}>
            <Text style={styles.compactFollowTitle}>👤 Users you follow</Text>
            {followingUsers.length ? (
              <View style={styles.compactChipWrap}>
                {followingUsers.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.compactUserChip}>
                    <Text style={styles.compactUserText} numberOfLines={1}>
                      {String(item).replace('email:', '').replace('uid:', '')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.compactEmptyText}>You are not following anyone yet.</Text>
            )}
          </View>
        ) : null}

        {showMyPostsOnly ? (
          <View style={styles.compactFollowPanel}>
            <Text style={styles.compactFollowTitle}>📝 Posts</Text>
            <Text style={styles.compactEmptyText}>
              Tap All Fan Wall for all posts, or open your active room to see room posts below.
            </Text>
          </View>
        ) : null}

        <View style={styles.myFanActionsRow}>
        </View>
      </View>


      <View style={[styles.fanHubCard, styles.hiddenOldFanSection]}>
        <View style={styles.fanHubHeader}>
          <View>
            <View onLayout={(event) => { matchRoomsY.current = event.nativeEvent.layout.y; }} />
            <Text style={styles.fanHubEyebrow}>Fan Zone Control Room</Text>
            <Text style={styles.fanHubTitle}>Choose your space</Text>
          </View>
          <Text style={styles.fanHubSpark}>⚡</Text>
        </View>

        <Text style={styles.fanHubSubtitle}>
          Start with a clean fan room. Open only what you want to see.
        </Text>

        <View style={styles.fanHubGrid}>
          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'wall' && styles.fanHubButtonActive]}
            onPress={() => openFanHub('wall')}
          >
            <Text style={styles.fanHubIcon}>🧱</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'wall' && styles.fanHubLabelActive]}>For You</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'wall' && styles.fanHubMetaActive]}>Fan feed</Text>
          </Pressable>

          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'clubs' && styles.fanHubButtonActive]}
            onPress={openClubPickerPanel}
          >
            <Text style={styles.fanHubIcon}>🏟️</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'clubs' && styles.fanHubLabelActive]}>Clubs</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'clubs' && styles.fanHubMetaActive]}>Pick room</Text>
          </Pressable>

          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'teams' && styles.fanHubButtonActive]}
            onPress={() => openFanHub('teams')}
          >
            <Text style={styles.fanHubIcon}>⭐</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'teams' && styles.fanHubLabelActive]}>My Teams</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'teams' && styles.fanHubMetaActive]}>{followedTeams.length} saved</Text>
          </Pressable>

          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'following' && styles.fanHubButtonActive]}
            onPress={() => openFanHub('following')}
          >
            <Text style={styles.fanHubIcon}>👤</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'following' && styles.fanHubLabelActive]}>Following</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'following' && styles.fanHubMetaActive]}>{followingUsers.length} users</Text>
          </Pressable>

          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'posts' && styles.fanHubButtonActive]}
            onPress={() => openFanHub('posts')}
          >
            <Text style={styles.fanHubIcon}>📝</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'posts' && styles.fanHubLabelActive]}>My Posts</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'posts' && styles.fanHubMetaActive]}>{visiblePosts.length} posts</Text>
          </Pressable>

          <Pressable
            style={[styles.fanHubButton, activeFanHub === 'rules' && styles.fanHubButtonActive]}
            onPress={() => openFanHub('rules')}
          >
            <Text style={styles.fanHubIcon}>🛡️</Text>
            <Text style={[styles.fanHubLabel, activeFanHub === 'rules' && styles.fanHubLabelActive]}>Rules</Text>
            <Text style={[styles.fanHubMeta, activeFanHub === 'rules' && styles.fanHubMetaActive]}>Safety</Text>
          </Pressable>
        </View>
      </View>

      
      <Pressable
        style={styles.communityGuideCard}
        onPress={handleShowCommunityGuidelines}
      >
        <Text style={styles.communityGuideLine}>🛡️ Community Guidelines · Tap to read</Text>
      </Pressable>

<TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search posts, fans, teams..."
        placeholderTextColor="#6F7F9B"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        enablesReturnKeyAutomatically
        onSubmitEditing={() => Keyboard.dismiss()}
      
            blurOnSubmit={true}
          />

      <View style={styles.filterRow}>
        <Pressable style={[styles.filterChip, !showClubPicker && !showComposer && !activeRoom && styles.activeChip]} onPress={openAllPostsPanel}>
          <View onLayout={(event) => { fanFeedY.current = event.nativeEvent.layout.y; }} />
          <Text style={[styles.filterChipText, !showClubPicker && !showComposer && !activeRoom && styles.activeChipText]}>🏠 All Posts</Text>
        </Pressable>

        <Pressable style={[styles.filterChip, showClubPicker && styles.activeChip]} onPress={openClubPickerPanel}>
          <Text style={[styles.filterChipText, showClubPicker && styles.activeChipText]}>🏟️ Pick Team</Text>
        </Pressable>

        <Pressable style={[styles.filterChip, showComposer && styles.activeChip]} onPress={openWritePostPanel}>
          <Text style={[styles.filterChipText, showComposer && styles.activeChipText]}>✍️ Write Post</Text>
        </Pressable>
      </View>

      <View style={styles.miniAccessRow}>
        <Pressable
          style={[styles.miniAccessButton, showFollowingList && styles.miniAccessButtonActive]}
          onPress={openFollowingUsersList}
        >
          <Text style={[styles.miniAccessText, showFollowingList && styles.miniAccessTextActive]}>
            👤 Following
          </Text>
        </Pressable>

        <Pressable
          style={[styles.miniAccessButton, showFollowedTeamsList && styles.miniAccessButtonActive]}
          onPress={openFollowedTeamsList}
        >
          <Text style={[styles.miniAccessText, showFollowedTeamsList && styles.miniAccessTextActive]}>
            ⭐ My Teams
          </Text>
        </Pressable>
      </View>

      {showFollowingList ? (
        <View style={styles.miniPanelCard}>
          <Text style={styles.miniPanelTitle}>👤 Following Users</Text>
          {followingUsers.length ? (
            followingUsers.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.miniListRow}>
                <Text style={styles.miniListAvatar}>
                  {String(item).replace('email:', '').replace('uid:', '').charAt(0).toUpperCase()}
                </Text>
                <Text style={styles.miniListText} numberOfLines={1}>
                  {String(item).replace('email:', '').replace('uid:', '')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.miniEmptyText}>You are not following anyone yet. Tap Follow User + on another fan’s post.</Text>
          )}
        </View>
      ) : null}

      {showFollowedTeamsList ? (
        <View style={styles.miniPanelCard}>
          <Text style={styles.miniPanelTitle}>⭐ My Teams</Text>
          {followedTeams.length ? (
            <View style={styles.miniTeamWrap}>
              {followedTeams.map((team) => (
                <Pressable
                  key={team}
                  style={[styles.miniTeamChip, activeRoom === team && styles.miniTeamChipActive]}
                  onPress={() => {
                    setActiveRoom(team);
                    setShowClubPicker(false);
                    setShowComposer(false);
                    setShowFollowedTeamsList(false);
                    setShowFollowingList(false);
                  }}
                >
                  <Text style={[styles.miniTeamText, activeRoom === team && styles.miniTeamTextActive]} numberOfLines={1}>
                    {team}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.miniEmptyText}>No teams yet. Tap Pick Team and follow up to 3 teams.</Text>
          )}
        </View>
      ) : null}

      {activeRoom ? (
        <View style={styles.roomHeaderBox}>
          <Text style={styles.roomHeaderText}>🏟️ {activeRoom}</Text>
          <Text style={styles.roomHeaderSubtext}>Room feed. Posts here also appear in the common Fan Wall.</Text>
        </View>
      ) : null}

      <View style={[styles.myTeamsCard, styles.simpleHiddenSection]}>
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
          onPress={openFollowingUsersList}
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
                      {selectedCountry ? (
          <Pressable
            style={styles.clubBackButton}
            onPress={() => {
              setSelectedCountry(null);
              setShowClubPicker(true);
            }}
          >
            <Text style={styles.clubBackButtonText}>← Back to Countries</Text>
          </Pressable>
        ) : null}

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
                          {countryFlag(country)}
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
                    <Text style={[
                      styles.moreCountriesText,
                      {
                        color: '#FFD166',
                        fontSize: 16,
                        fontWeight: '900',
                      },
                    ]}>
                      🌎 More Countries {showMoreCountries ? '▲' : '▼'}
                    </Text>
                  </Pressable>

                  {showMoreCountries ? (
                    <View style={[
                        styles.countryChipWrap,
                        {
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 10,
                          marginTop: 14,
                          marginBottom: 6,
                        },
                      ]}>
                      {moreCountryResults.map((country) => (
                        <Pressable
                          key={country}
                          style={[
                            styles.countryChip,
                            {
                              backgroundColor: '#F8FAFC',
                              borderWidth: 1.3,
                              borderColor: '#FFD166',
                              borderRadius: 999,
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              marginBottom: 10,
                              shadowColor: '#FFD166',
                              shadowOpacity: 0.18,
                              shadowRadius: 5,
                              shadowOffset: { width: 0, height: 3 },
                              elevation: 3,
                            },
                          ]}
                          onPress={() => {
                            setSelectedCountry(country);
                            setSearchText('');
                          }}
                        >
                          <Text style={[
                              styles.countryChipText,
                              {
                                color: '#0B1526',
                                fontSize: 12,
                                fontWeight: '900',
                              },
                            ]}>
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
        style={[styles.composerToggle, styles.simpleHiddenSection]}
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
          onLayout={(event) => { createPostY.current = event.nativeEvent.layout.y; }}
          placeholder={activeRoom ? `Post in ${activeRoom}...` : 'Write something for the common Fan Wall...'}
          placeholderTextColor="#718096"
          maxLength={FAN_POST_LIMIT}
          value={postText}
          onChangeText={setPostText}
          multiline
          blurOnSubmit={false}
          returnKeyType="default"
        />
        <Text style={styles.postCounter}>
          {removeGifUrl(postText).trim().length}/{FAN_POST_LIMIT}
        </Text>


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

        <View style={styles.videoComposerBox}>
          <Pressable style={styles.videoButton} onPress={pickFanPostVideo} disabled={uploadingPostVideo}>
            <Text style={styles.videoButtonText}>
              {uploadingPostVideo ? 'Uploading video...' : '🎥 Add 30s Video'}
            </Text>
          </Pressable>

          {selectedVideoUri ? (
            <View style={styles.videoPreviewBox}>
              <Video
                source={{ uri: selectedVideoUri }}
                style={styles.videoPreview}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping={false}
              />
              <Text style={styles.videoLimitText}>
                {selectedVideoDuration ? `${Math.round(selectedVideoDuration)}s selected` : 'Video selected'}
              </Text>
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => {
                  setSelectedVideoUri('');
                  setSelectedVideoDuration(0);
                }}
              >
                <Text style={styles.removePhotoText}>Remove Video</Text>
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
          {!showClubPicker && !showComposer && !showFollowingList && !showFollowedTeamsList && visiblePosts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyText}>Try another search or be the first fan to post.</Text>
            </View>
          ) : (
            (!showClubPicker && !showComposer && !showFollowingList && !showFollowedTeamsList ? visiblePosts : []).map((post) => {
              const liked = post.likes?.includes(currentEmail);
              const likeCount = post.likes?.length || 0;
              const commentCount = (post.comments || []).filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here')).length;
              const isOwner = post.userEmail === currentEmail || post.userId === currentUid;

              return (
                <View key={post.id} style={styles.card}>
                {/* Soccer Daily post menu: Share / Tag Someone / Report */}
                <Pressable
                  style={[styles.postOptionsButton, styles.postOptionsButtonWebFix]}
                  hitSlop={10}
                  onPress={() => openPostOptions(post)}
                >
                  <Text style={[styles.postOptionsText, { color: '#FFFFFF' }]}>•••</Text>
                </Pressable>

                {Platform.OS === 'web' && activePostMenuId === post.id ? (
                  <View style={styles.webPostMenu}>
                    <Pressable
                      style={styles.webPostMenuItem}
                      onPress={() => {
                        setActivePostMenuId(null);
                        openTagSomeonePrompt(post);
                      }}
                    >
                      <Text style={styles.webPostMenuText}>Tag Someone @</Text>
                    </Pressable>

                    <Pressable
                      style={styles.webPostMenuItem}
                      onPress={() => {
                        setActivePostMenuId(null);
                        reportPost(post);
                      }}
                    >
                      <Text style={styles.webPostMenuDangerText}>Report</Text>
                    </Pressable>
                  </View>
                ) : null}

                <Pressable
                  style={styles.fullScreenPostButton}
                  onPress={() => setFullScreenPost(post)}
                  hitSlop={12}
                >
                  <Text style={styles.fullScreenPostButtonText}>⛶</Text>
                </Pressable>


                  <Pressable style={styles.postAuthorRow} onPress={() => openFanProfileFromPost(post)}>
                    {fanAvatarUrl(post) ? (
                      <ExpoImage
                        source={{ uri: fanAvatarUrl(post) }}
                        style={styles.postAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.postAvatarFallback}>
                        <Text style={styles.postAvatarInitial}>{fanInitial(post)}</Text>
                      </View>
                    )}

                    <View style={styles.postAuthorTextBox}>
                      <Text style={styles.user}>{userDisplayName(post)}</Text>
                    </View>
                  </Pressable>

                  {post.taggedUsers?.length ? (
                    <View style={styles.taggedUsersBox}>
                      <Text style={styles.taggedUsersText}>
                        Tagged: {post.taggedUsers.slice(0, 10).map((name) => `@${name}`).join(' ')}
                      </Text>
                    </View>
                  ) : null}
                  {false ? <Text style={styles.timeText}>{post.editedAt ? 'Edited' : 'Posted'} • Soccer Daily</Text> : null}

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

                  {post.badge ? (
                    <View style={styles.teamBadgeBox}>
                      <Text style={styles.teamBadgeText}>🏟️ {post.badge}</Text>
                    </View>
                  ) : null}

                  {post.tag ? (
                    <View style={styles.postTagBox}>
                      <Text style={styles.postTagText}>{post.tag}</Text>
                    </View>
                  ) : null}

                  {editingId === post.id ? (
                    <>
                      <TextInput style={styles.editInput} value={editText} onChangeText={setEditText} multiline 
          
          
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

                  {post.videoUrl ? (
                    <Video
                      source={{ uri: post.videoUrl }}
                      style={styles.postVideo}
                      useNativeControls
                      resizeMode={ResizeMode.COVER}
                      isLooping={false}
                    />
                  ) : null}

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

                  {(post.comments || []).filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here')).length > 0 ? (
                    <View style={styles.commentsList}>
                      {(post.comments || []).filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here')).slice(-5).map((comment: any, index: number) => (
                        <View key={index} style={styles.commentCard}>
                          <Pressable
                            style={styles.commentAuthorRow}
                            onPress={() =>
                              setSelectedFanProfile({
                                id: comment.userId || comment.userEmail || comment.user || 'comment-fan',
                                userId: comment.userId || '',
                                userEmail: comment.userEmail || '',
                                user: comment.user || comment.userEmail?.split('@')[0] || 'Fan',
                                displayName: comment.user || comment.userEmail?.split('@')[0] || 'Fan',
                                badge: comment.badge || '',
                                photoURL:
                                  comment.photoURL ||
                                  comment.photoUrl ||
                                  comment.avatarUrl ||
                                  comment.profileImageUrl ||
                                  ((comment.userEmail === currentEmail || comment.userId === currentUid) ? currentProfilePhotoUrl : ''),
                              } as FanPost)
                            }
                          >
                            {commentPhotoUrl(comment) ? (
                              <ExpoImage
                                source={{
                                  uri:
                                    comment.photoURL ||
                                    comment.photoUrl ||
                                    comment.avatarUrl ||
                                    comment.profileImageUrl ||
                                    currentProfilePhotoUrl,
                                }}
                                style={styles.commentAvatar}
                                contentFit="cover"
                              />
                            ) : (
                              <View style={styles.commentAvatarFallback}>
                                <Text style={styles.commentAvatarInitial}>
                                  {(comment.user || comment.userEmail?.split('@')[0] || 'Fan').charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            )}

                            <View style={styles.commentAuthorTextBox}>
                              <Text style={styles.commentUser}>
                                {comment.user || comment.userEmail?.split('@')[0] || 'Fan'}
                              </Text>

                              {comment.badge ? (
                                <Text style={styles.commentBadge}>🏟️ {comment.badge}</Text>
                              ) : null}
                            </View>
                          </Pressable>

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

      <Modal
        visible={!!fullScreenPost}
        animationType="slide"
        transparent={false}
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={() => setFullScreenPost(null)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.fullScreenTopBar}>
            <Text style={styles.fullScreenTitle}>Post View</Text>
            <Pressable style={styles.fullScreenCloseButton} onPress={() => setFullScreenPost(null)}>
              <Text style={styles.fullScreenCloseText}>Close ✕</Text>
            </Pressable>
          </View>

          {fullScreenPost ? (
            <ScrollView contentContainerStyle={[styles.fullScreenPostContent, isLandscape && styles.fullScreenPostContentLandscape]}
              keyboardShouldPersistTaps="handled">
              <View style={styles.fullScreenPostCard}>
                <Pressable style={styles.fullScreenAuthorRow} onPress={() => openFanProfileFromPost(fullScreenPost)}>
                  {fanAvatarUrl(fullScreenPost) ? (
                    <ExpoImage
                      source={{ uri: fanAvatarUrl(fullScreenPost) }}
                      style={styles.fullScreenAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.fullScreenAvatarFallback}>
                      <Text style={styles.fullScreenAvatarInitial}>{fanInitial(fullScreenPost)}</Text>
                    </View>
                  )}

                  <View style={styles.fullScreenAuthorTextBox}>
                    <Text style={styles.fullScreenUser}>{userDisplayName(fullScreenPost)}</Text>
                    <Text style={styles.fullScreenProfileHint}>View profile</Text>
                  </View>
                </Pressable>

                {fullScreenPost.taggedUsers?.length ? (
                  <Text style={styles.fullScreenTagged}>
                    Tagged: {fullScreenPost.taggedUsers.slice(0, 10).map((name) => `@${name}`).join(' ')}
                  </Text>
                ) : null}

                {fullScreenPost.badge ? (
                  <Text style={styles.fullScreenBadge}>🏟️ {fullScreenPost.badge}</Text>
                ) : null}

                {fullScreenPost.tag ? (
                  <Text style={styles.fullScreenTag}>{fullScreenPost.tag}</Text>
                ) : null}

                {fullScreenPost.text ? (
                  <Text style={styles.fullScreenPostText}>{removeGifUrl(fullScreenPost.text)}</Text>
                ) : null}

                {fullScreenPost.imageUrl ? (
                  <ExpoImage
                    source={{ uri: fullScreenPost.imageUrl }}
                    style={styles.fullScreenImage}
                    contentFit="cover"
                  />
                ) : null}

                {fullScreenPost.videoUrl ? (
                  <Video
                    source={{ uri: fullScreenPost.videoUrl }}
                    style={styles.fullScreenVideo}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                ) : null}

                <View style={styles.fullScreenActionRow}>
                  <Pressable style={styles.fullScreenActionButton} onPress={() => toggleFullScreenLike(fullScreenPost)}>
                    <Text style={fullScreenPost.likes?.includes(currentEmail) ? styles.fullScreenLikedText : styles.fullScreenActionText}>
                      {fullScreenPost.likes?.includes(currentEmail) ? '❤️' : '🤍'} {fullScreenPost.likes?.length || 0} Likes
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.fullScreenActionButton}
                    onPress={() => setCommentPostId(commentPostId === fullScreenPost.id ? null : fullScreenPost.id)}
                  >
                    <Text style={styles.fullScreenActionText}>
                      💬 {(fullScreenPost.comments || []).filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here')).length} Comments
                    </Text>
                  </Pressable>

                  <Pressable style={styles.fullScreenActionButton} onPress={() => sharePost(fullScreenPost)}>
                    <Text style={styles.fullScreenActionText}>↗ Share</Text>
                  </Pressable>

                  {(fullScreenPost.userEmail === currentEmail || fullScreenPost.userId === currentUid) ? (
                    <>
                      <Pressable
                        style={styles.fullScreenActionButton}
                        onPress={() => {
                          setFullScreenPost(null);
                          startEdit(fullScreenPost);
                        }}
                      >
                        <Text style={styles.fullScreenActionText}>✏️ Edit</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.fullScreenActionButton, styles.fullScreenDeleteButton]}
                        onPress={() => {
                          setFullScreenPost(null);
                          deletePost(fullScreenPost);
                        }}
                      >
                        <Text style={styles.fullScreenDeleteText}>🗑 Delete</Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>

                {commentPostId === fullScreenPost.id ? (
                  <View style={styles.fullScreenCommentBox}>
                    <TextInput
                      style={styles.fullScreenCommentInput}
                      placeholder="Write a comment..."
                      placeholderTextColor="#718096"
                      value={commentText}
                      onChangeText={setCommentText}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />

                    <Pressable style={styles.fullScreenCommentButton} onPress={() => submitFullScreenComment(fullScreenPost)}>
                      <Text style={styles.fullScreenCommentButtonText}>Comment</Text>
                    </Pressable>
                  </View>
                ) : null}

                {(fullScreenPost.comments || []).filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here')).length > 0 ? (
                  <View style={styles.fullScreenCommentsBox}>
                    <Text style={styles.fullScreenCommentsTitle}>Comments</Text>

                    {(fullScreenPost.comments || [])
                      .filter((comment: any) => comment.type !== 'mention' && !String(comment.text || '').toLowerCase().includes('mentioned here'))
                      .slice(-10)
                      .map((comment: any, index: number) => (
                        <View key={index} style={styles.fullScreenCommentCard}>
                          <Pressable
                            style={styles.fullScreenCommentAuthorRow}
                            onPress={() =>
                              setSelectedFanProfile({
                                id: comment.userId || comment.userEmail || comment.user || 'comment-fan',
                                userId: comment.userId || '',
                                userEmail: comment.userEmail || '',
                                user: comment.user || comment.userEmail?.split('@')[0] || 'Fan',
                                displayName: comment.user || comment.userEmail?.split('@')[0] || 'Fan',
                                badge: comment.badge || '',
                                photoURL:
                                  comment.photoURL ||
                                  comment.photoUrl ||
                                  comment.avatarUrl ||
                                  comment.profileImageUrl ||
                                  ((comment.userEmail === currentEmail || comment.userId === currentUid) ? currentProfilePhotoUrl : ''),
                              } as FanPost)
                            }
                          >
                            {commentPhotoUrl(comment) ? (
                              <ExpoImage
                                source={{
                                  uri:
                                    comment.photoURL ||
                                    comment.photoUrl ||
                                    comment.avatarUrl ||
                                    comment.profileImageUrl ||
                                    currentProfilePhotoUrl,
                                }}
                                style={styles.fullScreenCommentAvatar}
                                contentFit="cover"
                              />
                            ) : (
                              <View style={styles.fullScreenCommentAvatarFallback}>
                                <Text style={styles.fullScreenCommentAvatarInitial}>
                                  {(comment.user || comment.userEmail?.split('@')[0] || 'Fan').charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            )}

                            <View style={styles.fullScreenCommentAuthorTextBox}>
                              <Text style={styles.fullScreenCommentUser}>
                                {comment.user || comment.userEmail?.split('@')[0] || 'Fan'}
                              </Text>

                              {comment.badge ? (
                                <Text style={styles.fullScreenCommentBadge}>🏟️ {comment.badge}</Text>
                              ) : null}
                            </View>
                          </Pressable>

                          <Text style={styles.fullScreenCommentText}>{comment.text}</Text>
                        </View>
                      ))}
                  </View>
                ) : null}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>



      <Modal
        visible={!!selectedFanProfile}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedFanProfile(null)}
      >
        <View style={styles.fanProfileOverlay}>
          <View style={styles.fanProfileModal}>
            {selectedFanProfile ? (
              <>
                <Pressable style={styles.fanProfileClose} onPress={() => setSelectedFanProfile(null)}>
                  <Text style={styles.fanProfileCloseText}>✕</Text>
                </Pressable>

                {fanAvatarUrl(selectedFanProfile) ? (
                  <ExpoImage
                    source={{ uri: fanAvatarUrl(selectedFanProfile) }}
                    style={styles.fanProfileAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.fanProfileAvatarFallback}>
                    <Text style={styles.fanProfileAvatarInitial}>{fanInitial(selectedFanProfile)}</Text>
                  </View>
                )}

                <Text style={styles.fanProfileName}>{userDisplayName(selectedFanProfile)}</Text>

                {selectedFanProfile.badge ? (
                  <Text style={styles.fanProfileBadge}>🏟️ {selectedFanProfile.badge}</Text>
                ) : null}

                <Text style={styles.fanProfileComingSoon}>
                  Public fan profile page coming soon.
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

</ScrollView>
  );
}

const styles = StyleSheet.create({
  postOptionsButtonWebFix: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  postOptionsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 18,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  webPostMenu: {
    position: 'absolute',
    top: 58,
    right: 16,
    width: 170,
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 6,
    zIndex: 10000,
    elevation: 30,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  webPostMenuItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  webPostMenuText: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '900',
  },

  webPostMenuDangerText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '900',
  },



  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  commentAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarInitial: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
  },
  commentAuthorTextBox: {
    flex: 1,
  },



  fullScreenCommentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 7,
  },
  fullScreenCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  fullScreenCommentAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenCommentAvatarInitial: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
  },
  fullScreenCommentAuthorTextBox: {
    flex: 1,
  },



  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 82,
    marginBottom: 8,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10243A',
    borderWidth: 2,
    borderColor: '#FFD166',
  },
  postAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10243A',
    borderWidth: 2,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarInitial: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
  },
  postAuthorTextBox: {
    flex: 1,
  },



  fullScreenAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 10,
  },
  fullScreenAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10243A',
    borderWidth: 2,
    borderColor: '#FFD166',
  },
  fullScreenAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10243A',
    borderWidth: 2,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenAvatarInitial: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
  },
  fullScreenAuthorTextBox: {
    flex: 1,
  },
  fullScreenProfileHint: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  fanProfileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fanProfileModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#061526',
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  fanProfileClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10243A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanProfileCloseText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
  },
  fanProfileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#10243A',
    borderWidth: 3,
    borderColor: '#FFD166',
    marginBottom: 12,
  },
  fanProfileAvatarFallback: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#10243A',
    borderWidth: 3,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fanProfileAvatarInitial: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
  },
  fanProfileName: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  fanProfileBadge: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  fanProfileSubText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  fanProfileComingSoon: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },


  fullScreenLikedText: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
  },
  fullScreenCommentBox: {
    marginTop: 14,
    padding: 11,
    borderRadius: 18,
    backgroundColor: '#071A2D',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  fullScreenCommentInput: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    backgroundColor: '#0B2442',
    borderWidth: 1,
    borderColor: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  fullScreenCommentButton: {
    backgroundColor: '#FFD166',
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 9,
    alignItems: 'center',
  },
  fullScreenCommentButtonText: {
    color: '#07111F',
    fontSize: 13,
    fontWeight: '900',
  },


  fullScreenPostContentLandscape: {
    paddingHorizontal: 28,
    paddingBottom: 30,
  },


  fullScreenCommentText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },

  fullScreenCommentBadge: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3,
  },

  fullScreenCommentUser: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },

  fullScreenCommentCard: {
    padding: 11,
    borderRadius: 16,
    backgroundColor: '#071A2D',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },

  fullScreenCommentsTitle: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },

  fullScreenCommentsBox: {
    marginTop: 18,
    gap: 8,
  },

  fullScreenDeleteText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '900',
  },

  fullScreenDeleteButton: {
    borderColor: '#EF4444',
  },

  fullScreenActionText: {
    color: '#BFDBFE',
    fontSize: 13,
    fontWeight: '900',
  },

  fullScreenActionButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#2563EB',
  },

  fullScreenActionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  fullScreenStatText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '900',
  },

  fullScreenStatsRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },

  fullScreenPostCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: '#061526',
    borderWidth: 1,
    borderColor: '#2563EB',
  },

  fullScreenTitle: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '900',
  },

  fullScreenTopBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fullScreenPostButton: {
    position: 'absolute',
    top: 18,
    right: 58,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#102344',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 18,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  fullScreenPostButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 42,
  },
  fullScreenCloseButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFD166',
  },
  fullScreenCloseText: {
    color: '#07111F',
    fontSize: 13,
    fontWeight: '900',
  },
  fullScreenPostContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  fullScreenUser: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  fullScreenTagged: {
    color: '#BFDBFE',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
    lineHeight: 20,
  },
  fullScreenBadge: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  fullScreenTag: {
    alignSelf: 'flex-start',
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  fullScreenPostText: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 18,
  },
  fullScreenImage: {
    width: '100%',
    height: 420,
    borderRadius: 22,
    backgroundColor: '#071526',
  },
  fullScreenVideo: {
    width: '100%',
    height: 420,
    borderRadius: 22,
    backgroundColor: '#000',
    marginTop: 12,
  },


  taggedUsersBox: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#071A2D',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  taggedUsersLabel: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },
  taggedUsersText: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },


  postTagBox: {
    alignSelf: 'flex-start',
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#10243A',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  postTagText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
  },


  miniAccessRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
  },
  miniAccessButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#061B33',
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  miniAccessButtonActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  miniAccessText: {
    color: '#DBEAFE',
    fontSize: 13,
    fontWeight: '900',
  },
  miniAccessTextActive: {
    color: '#020617',
  },
  miniPanelCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#061B33',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  miniPanelTitle: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  miniListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  miniListAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD166',
    color: '#020617',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
  },
  miniListText: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '800',
  },
  miniEmptyText: {
    color: '#BFD7FF',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  miniTeamWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniTeamChip: {
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#0B2442',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  miniTeamChipActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  miniTeamText: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '900',
  },
  miniTeamTextActive: {
    color: '#020617',
  },


  headerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 18,
  },


  fullStadiumBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020817',
  },
  bgSkyGlow: {
    position: 'absolute',
    top: -70,
    left: 20,
    right: 20,
    height: 220,
    borderRadius: 160,
    backgroundColor: 'rgba(44,122,255,0.16)',
  },
  bgLeftLight: {
    position: 'absolute',
    top: 110,
    left: -70,
    width: 180,
    height: 330,
    borderRadius: 160,
    backgroundColor: 'rgba(0,180,255,0.11)',
  },
  bgRightLight: {
    position: 'absolute',
    top: 130,
    right: -80,
    width: 190,
    height: 350,
    borderRadius: 170,
    backgroundColor: 'rgba(255,210,90,0.11)',
  },
  bgRoofArcOuter: {
    position: 'absolute',
    top: 64,
    left: 14,
    right: 14,
    height: 210,
    borderTopLeftRadius: 210,
    borderTopRightRadius: 210,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(90,170,255,0.20)',
  },
  bgRoofArcInner: {
    position: 'absolute',
    top: 96,
    left: 38,
    right: 38,
    height: 150,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,210,90,0.16)',
  },
  bgLightBar: {
    position: 'absolute',
    top: 205,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bgLightDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD166',
    shadowColor: '#FFD166',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  bgSeatBowlOne: {
    position: 'absolute',
    top: 250,
    left: 28,
    right: 28,
    height: 76,
    borderRadius: 30,
    backgroundColor: 'rgba(10,40,85,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.14)',
  },
  bgSeatBowlTwo: {
    position: 'absolute',
    top: 345,
    left: 20,
    right: 20,
    height: 105,
    borderRadius: 36,
    backgroundColor: 'rgba(12,48,98,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.12)',
  },
  bgSeatBowlThree: {
    position: 'absolute',
    top: 470,
    left: 12,
    right: 12,
    height: 140,
    borderRadius: 42,
    backgroundColor: 'rgba(15,52,100,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.10)',
  },
  bgPitch: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 105,
    height: 270,
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    backgroundColor: 'rgba(18,120,68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(70,255,170,0.14)',
  },
  bgPitchHalfLine: {
    position: 'absolute',
    top: 70,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: 'rgba(220,255,235,0.25)',
  },
  bgPitchCircle: {
    position: 'absolute',
    top: 82,
    left: '50%',
    marginLeft: -38,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(220,255,235,0.28)',
  },


  futureStadium: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    height: 210,
    borderRadius: 32,
    backgroundColor: '#03101F',
    borderWidth: 1,
    borderColor: '#2563EB',
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  stadiumRoofArc: {
    position: 'absolute',
    top: -76,
    left: -30,
    right: -30,
    height: 150,
    borderBottomWidth: 3,
    borderColor: '#38BDF8',
    borderRadius: 180,
    opacity: 0.9,
  },
  stadiumRoofArcSmall: {
    position: 'absolute',
    top: -42,
    left: 28,
    right: 28,
    height: 95,
    borderBottomWidth: 2,
    borderColor: '#FFD166',
    borderRadius: 140,
    opacity: 0.85,
  },
  holoBoard: {
    position: 'absolute',
    top: 38,
    left: 32,
    right: 32,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 47, 73, 0.72)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  holoBoardText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  holoBoardSub: {
    color: '#FFD166',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 2,
  },
  floodLightRow: {
    position: 'absolute',
    top: 92,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floodLight: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: '#FFD166',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  crowdBowl: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
    height: 88,
    borderRadius: 26,
    backgroundColor: '#071A2D',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    paddingTop: 12,
    overflow: 'hidden',
  },
  crowdRowOne: {
    height: 9,
    marginHorizontal: 18,
    borderRadius: 99,
    backgroundColor: '#1E3A8A',
    marginBottom: 7,
  },
  crowdRowTwo: {
    height: 8,
    marginHorizontal: 34,
    borderRadius: 99,
    backgroundColor: '#0EA5E9',
    opacity: 0.55,
    marginBottom: 8,
  },
  crowdRowThree: {
    height: 7,
    marginHorizontal: 54,
    borderRadius: 99,
    backgroundColor: '#FFD166',
    opacity: 0.7,
    marginBottom: 10,
  },
  neonPitch: {
    height: 30,
    marginHorizontal: 38,
    borderRadius: 18,
    backgroundColor: '#052E16',
    borderWidth: 1,
    borderColor: '#22C55E',
    overflow: 'hidden',
  },
  pitchCenterCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    left: '50%',
    marginLeft: -14,
    top: 1,
  },
  pitchHalfLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: '#BBF7D0',
  },


  stadiumScene: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    padding: 14,
    backgroundColor: '#071A2D',
    borderWidth: 1,
    borderColor: '#21466E',
    overflow: 'hidden',
  },
  stadiumLightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  stadiumLight: {
    color: '#FFD166',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: '#FFD166',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stadiumStand: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#0B2238',
    borderWidth: 1,
    borderColor: '#31537E',
  },
  standRow: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#123A5C',
    marginBottom: 8,
  },
  standRowSmall: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#1B4B73',
    marginHorizontal: 26,
    marginBottom: 10,
  },
  pitchLine: {
    height: 4,
    borderRadius: 99,
    backgroundColor: '#22C55E',
    marginHorizontal: 44,
  },


  stadiumTicketCard: {
    padding: 14,
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFD166',
    backgroundColor: '#081B2F',
    shadowColor: '#FFD166',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },


  compactTopFanRoomCard: {
    padding: 14,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 24,
  },


  simpleHiddenSection: {
    display: 'none',
  },

  communityGuideCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(6, 25, 58, 0.86)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#246BFF',
    paddingVertical: 13,
    paddingHorizontal: 18,
    shadowColor: '#246BFF',
    shadowOpacity: 0.12,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,


    },
  communityGuideLine: {
    color: '#DCEBFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',

    },



  hiddenOldFanSection: {
    display: 'none',
  },

  topFanRoomCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#061B33',
    borderWidth: 2,
    borderColor: '#FFD166',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: 'hidden',
  },
  topFanRoomGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -60,
    top: -60,
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
  },
  topFanRoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  topFanAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#FFD166',
    backgroundColor: '#111827',
  },
  topFanAvatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#FFD166',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topFanAvatarText: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
  },
  topFanInfo: {
    flex: 1,
  },
  topFanKicker: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  topFanName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  topFanRoomName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  topFanStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  topFanStatBox: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    alignItems: 'center',
  },
  topFanStatNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  topFanStatLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  topFanQuickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  topFanQuickButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#253B5B',
    alignItems: 'center',
  },
  topFanQuickButtonGold: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: '#FFD166',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  topFanQuickText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
  },
  topFanQuickTextDark: {
    color: '#052E16',
    fontSize: 12,
    fontWeight: '900',
  },

  matchdayBook: {
    backgroundColor: '#07111F',
    borderRadius: 30,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FFD166',
    overflow: 'hidden',
    position: 'relative',
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#FFD166',
  },
  bookFieldLine: {
    position: 'absolute',
    top: 84,
    left: 10,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  bookCenterCircle: {
    position: 'absolute',
    top: 43,
    alignSelf: 'center',
    width: 92,
    height: 92,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  bookEyebrow: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 6,
    marginLeft: 8,
  },
  bookTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    marginLeft: 8,
  },
  bookSubtitle: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    alignSelf: 'center',
    textShadowColor: '#38BDF8',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  bookPageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginLeft: 8,
  },

  bookInsidePage: {
    marginTop: 22,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  bookInsideKicker: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  bookInsideTitle: {
    color: '#052E16',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  bookInsideText: {
    color: '#166534',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
  },
  bookInsideRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  bookInsideStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  bookInsideStatNumber: {
    color: '#065F46',
    fontSize: 20,
    fontWeight: '900',
  },
  bookInsideStatLabel: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  bookPageButton: {
    zIndex: 5,
    elevation: 5,
    width: '47%',
    backgroundColor: '#0B7A34',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },

  bookPageTextActive: {
    color: '#052E16',
  },
  bookPageSubTextActive: {
    color: '#065F46',
  },

  bookPageButtonActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFFFFF',
  },
  bookPageIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  bookPageTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 3,
  },

  bookOpenPage: {
    marginTop: 22,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#EAFBF0',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  bookOpenPageKicker: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  bookOpenPageTitle: {
    color: '#052E16',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  bookOpenPageText: {
    color: '#166534',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
  },
  bookOpenPageMiniRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  bookMiniStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  bookMiniStatNumber: {
    color: '#065F46',
    fontSize: 20,
    fontWeight: '900',
  },
  bookMiniStatLabel: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  bookPageText: {
    color: '#DCFCE7',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  bookPageSubText: {
    marginTop: 5,
    color: '#D1FAE5',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
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
    color: '#64748B',
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
    minHeight: 158,
    backgroundColor: '#F7FAFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0B1526',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
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
    fontSize: 24,
    marginBottom: 8,
  },
  countryTileName: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4C95D',
    color: '#0B1526',
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: '#D6A73A',
    shadowColor: '#7A5A12',
    shadowOpacity: 0.28,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  countryTileSub: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B1526',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#22314A',
  },
  moreCountriesButton: {
    backgroundColor: '#343C46',
    borderRadius: 999,
    borderWidth: 1.3,
    borderColor: 'rgba(255, 209, 102, 0.55)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
    marginTop: 14,
    marginBottom: 6,
  },
  moreCountryChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D6DCE8',
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 12,
    minWidth: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  moreCountryChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  myFanRoomCard: {
    backgroundColor: '#0B1526',
    borderRadius: 30,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  myRoomPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  myRoomBall: {
    position: 'absolute',
    fontSize: 34,
    opacity: 0.06,
  },

  myRoomPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  myRoomBallBig: {
    position: 'absolute',
    fontSize: 118,
    opacity: 0.16,
    transform: [{ rotate: '-14deg' }],
  },
  myRoomBallSmall: {
    position: 'absolute',
    fontSize: 58,
    opacity: 0.14,
    transform: [{ rotate: '12deg' }],
  },
  myRoomFieldLineOne: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: 58,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.13)',
    transform: [{ rotate: '-8deg' }],
  },
  myRoomFieldLineTwo: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 54,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.11)',
    transform: [{ rotate: '8deg' }],
  },
  myRoomCenterCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    right: 12,
    bottom: -48,
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
    backgroundColor: '#F3F6FB',
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  myFanName: {
    color: '#FFD166',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  myFanBadge: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  myFanStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  myFanStatBox: {
    flex: 1,
    backgroundColor: '#07111F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#24344F',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myFanStatNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  myFanStatLabel: {
    color: '#AAB6CA',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  compactFollowPanel: {
    backgroundColor: '#101C2E',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 16,
    padding: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  compactFollowTitle: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  compactChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  compactTeamChip: {
    maxWidth: '100%',
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  compactTeamChipActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  compactTeamChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  compactTeamChipTextActive: {
    color: '#07111F',
  },
  compactUserChip: {
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  compactUserText: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '800',
  },
  compactEmptyText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  myFanActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  myFanActionButton: {
    flex: 1,
    backgroundColor: '#2B3138',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myFanActionText: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '900',
  },
  videoComposerBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
  },
  videoButton: {
    backgroundColor: '#0B1526',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoButtonText: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
  },
  videoPreviewBox: {
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  videoPreview: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
  },
  videoLimitText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  postVideo: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    marginTop: 12,
    backgroundColor: '#000000',
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
    height: 230,
    borderRadius: 18,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#F3F6FB',
  },
  followingToggle: {
    backgroundColor: '#111C2E',
    borderWidth: 1.5,
    borderColor: '#FFD166',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 10,
    shadowColor: '#FFD166',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  followingHelp: {
    color: '#A7B0C0',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  followingListBox: {
    backgroundColor: '#F3F6FB',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 14,
    padding: 8,
    marginTop: 8,
    gap: 6,
  },
  followingPersonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#D8E0EC',
  },
  followingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  followingAvatarText: {
    color: '#07111F',
    fontSize: 12,
    fontWeight: '900',
  },
  followingPersonInfo: {
    flex: 1,
  },
  followingPersonName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  followingPersonSub: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F5F8FF',
    marginHorizontal: 18,
    marginBottom: 18,
    textShadowColor: 'rgba(120,190,255,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,

    },
  subtitle: {
    color: '#BFD7FF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 12,

    },

  fanHubCard: {
    backgroundColor: '#061A16',
    borderRadius: 28,
    borderWidth: 1.3,
    borderColor: 'rgba(52, 211, 153, 0.45)',
    padding: 16,
    marginBottom: 18,
    shadowColor: '#22C55E',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  fanHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fanHubEyebrow: {
    color: '#8FD8BD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  fanHubTitle: {
    color: '#D1FAE5',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 3,
  },
  fanHubSpark: {
    fontSize: 28,
  },
  fanHubSubtitle: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 14,
  },
  fanHubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fanHubButton: {
    width: '31.5%',
    minHeight: 102,
    borderRadius: 20,
    borderWidth: 1.2,
    paddingVertical: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fanHubButtonActive: {
    borderWidth: 1.8,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  fanHubIcon: {
    fontSize: 25,
    marginBottom: 7,
  },
  fanHubLabel: {
    color: '#F5F7FB',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  fanHubLabelActive: {
    color: '#FFFFFF',
  },
  fanHubMeta: {
    color: '#C3CEE1',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  fanHubMetaActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },

  searchInput: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(5, 18, 45, 0.93)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(70,140,255,0.45)',
    color: '#EAF2FF',
    fontSize: 17,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingVertical: 16,


    },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(3, 12, 31, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.30)',


    },
  filterChip: {
    flex: 1,
    backgroundColor: 'rgba(5, 18, 45, 0.95)',
    borderRadius: 19,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(80,140,255,0.32)',

    },
  activeChip: {
    backgroundColor: '#E3B94F',
    borderColor: '#F7D26A',
    shadowColor: '#F7D26A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,

    },
  filterChipText: {
    color: '#F4C95D',
    fontWeight: '900',
    fontSize: 14,

    },
  activeChipText: {
    color: '#071B3A',
    fontWeight: '900',
    fontSize: 14,

    },

  roomHeaderBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(5, 22, 52, 0.90)',
    borderWidth: 1,
    borderColor: '#E3B94F',


    },
  roomHeaderText: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  roomHeaderSubtext: { color: '#A7B0C0', fontSize: 13, marginTop: 4 },

  myTeamsCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 22, 52, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.35)',


    },
  myTeamsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myTeamsTitle: { color: '#FFD166', fontSize: 16, fontWeight: '900' },
  myTeamsList: { gap: 8, marginTop: 10 },
  teamMiniChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.4,
    borderColor: '#0B1526',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  activeMiniChip: { backgroundColor: '#2A1F12', borderColor: '#FFD166' },
  teamMiniChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  activeMiniChipText: { color: '#FFD166' },
  removeText: { color: '#FFD166', fontSize: 12, fontWeight: '900' },
  mutedText: { color: '#A7B0C0', marginTop: 8, fontSize: 13 },

  clubPickerCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  clubBackButton: {
    backgroundColor: '#FFD166',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D6A73A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#FFD166',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  clubBackButtonText: {
    color: '#07111F',
    fontSize: 14,
    fontWeight: '900',
  },

  roomButton: {
    backgroundColor: '#07111F',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 209, 102, 0.28)',
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  followingButton: {
    backgroundColor: '#112015',
    borderColor: '#34D399',
  },
  roomText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 7,
  },
  roomSubtext: {
    color: '#AAB6CA',
    fontSize: 13,
    fontWeight: '800',
  },
  backButton: { marginBottom: 12 },
  backText: { color: '#FFD166', fontSize: 15, fontWeight: '900' },

  searchResultCard: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#D8E0EC',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  accountRow: {
    backgroundColor: '#F3F6FB',
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
    backgroundColor: '#F3F6FB',
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
    borderColor: '#D8E0EC',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: { color: '#FFD166', fontSize: 18, fontWeight: '900' },
  emptyText: { color: '#A7B0C0', marginTop: 8, fontSize: 14 },

  card: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#061B33',
    borderWidth: 1,
    borderColor: '#234C78',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    position: 'relative',


    },
  user: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
    paddingRight: 38,
    marginBottom: 2,
  },
  timeText: {
    color: '#A9C4EA',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 8,

    },

  followUserButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#0B2442',
    borderWidth: 1,
    borderColor: '#38BDF8',


    },
  followingUserButton: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',

    },
  followUserText: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '900',

    },
  followingUserText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '900',

    },
  followerCountText: {
    color: '#8EA4C8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,

    },

  followingTitle: {
    color: '#FFD166',
    fontSize: 17,
    fontWeight: '900',
  },
  teamBadgeBox: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#0B2442',
    borderWidth: 1,
    borderColor: '#2563EB',

    },
  teamBadgeText: {
    color: '#CFE3FF',
    fontSize: 12,
    fontWeight: '900',

    },
  postCounter: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 8,
  },

  postText: {
    color: '#F8FAFC',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,


    },
  translateText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,

    },
  postGif: { width: '100%', height: 220, borderRadius: 14, marginTop: 12, backgroundColor: '#F3F6FB' },

  editInput: {
    backgroundColor: '#FFFFFF',
    color: '#07111F',
    borderWidth: 1.4,
    borderColor: '#CBD5E1',
    borderRadius: 18,
    minHeight: 110,
    padding: 16,
    fontSize: 16,
    fontWeight: '700',
    textAlignVertical: 'top',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',

    },
  smallButton: { flex: 1, backgroundColor: '#FFD166', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  smallButtonText: { color: '#07111F', fontWeight: '900' },
  cancelButton: { flex: 1, backgroundColor: '#F3F6FB', borderWidth: 1, borderColor: '#2B3D5E', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#A7B0C0', fontWeight: '900' },

  cleanLandingCard: {
    backgroundColor: '#061A16',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    padding: 18,
    marginBottom: 18,
  },
  cleanLandingTitle: {
    color: '#D1FAE5',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  cleanLandingText: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },

  postOptionsButton: {
    position: 'absolute',
    top: 18,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#102344',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  action: { color: '#A7B0C0', fontSize: 13, fontWeight: '800' },
  likedAction: { color: '#FFD166', fontSize: 13, fontWeight: '900' },
  deleteAction: { color: '#FF6B6B', fontSize: 13, fontWeight: '900' },

  commentBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#061526',
    borderWidth: 1,
    borderColor: '#1E3A5F',


    },
  commentInput: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#F8FAFC',
    backgroundColor: '#0B2442',
    borderWidth: 1,
    borderColor: '#2563EB',
    fontSize: 13,
    fontWeight: '700',

    },
  commentButton: {
    backgroundColor: '#FFD166',
    borderRadius: 13,
    paddingVertical: 9,
    marginTop: 8,
    alignItems: 'center',

    },
  commentButtonText: { color: '#07111F', fontWeight: '900' },
  commentsList: {
    marginTop: 10,
    gap: 7,

    },
  commentCard: {
    backgroundColor: '#071526',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#1E3A5F',

    },
  commentUser: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,

    },
  commentBadge: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3,

    },
  commentText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',

    },
});
