import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import {collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { SOCIAL_LINKS } from '../../constants/socialLinks';
import { db, storage } from '../../firebase/config';

const ADMIN_EMAIL = 'prabhudevupadhyay@gmail.com';

export default function ProfileScreen() {
  const [profileNotificationCount, setProfileNotificationCount] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;
  const isAdminUser = user?.email === ADMIN_EMAIL;

  const [clubTeam, setClubTeam] = useState('');
  const [nationalTeam, setNationalTeam] = useState('');
  const [savedClub, setSavedClub] = useState('');
  const [savedNational, setSavedNational] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const displayName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Soccer Fan';

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    const club = await AsyncStorage.getItem('favoriteClubTeam');
    const national = await AsyncStorage.getItem('favoriteNationalTeam');

    setSavedClub(club || '');
    setSavedNational(national || '');
    setClubTeam(club || '');
    setNationalTeam(national || '');

    if (!user?.uid) return;

    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      const snap = await getDoc(profileRef);

      if (snap.exists()) {
        const data = snap.data();
        setPhotoUrl(data.photoUrl || '');
        setCoverPhotoUrl(data.coverPhotoUrl || '');

        if (data.favoriteClubTeam) {
          setSavedClub(data.favoriteClubTeam);
          setClubTeam(data.favoriteClubTeam);
        }

        if (data.favoriteNationalTeam) {
          setSavedNational(data.favoriteNationalTeam);
          setNationalTeam(data.favoriteNationalTeam);
        }
      }
    } catch {
      // Keep local profile working even if Firebase profile read fails
    }
  }

  async function saveFavoriteTeams() {
    const club = clubTeam.trim();
    const national = nationalTeam.trim();

    await AsyncStorage.setItem('favoriteClubTeam', club);
    await AsyncStorage.setItem('favoriteNationalTeam', national);

    setSavedClub(club);
    setSavedNational(national);

    if (user?.uid) {
      await setDoc(
        doc(db, 'userProfiles', user.uid),
        {
          displayName,
          email: user.email || '',
          favoriteClubTeam: club,
          favoriteNationalTeam: national,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    Alert.alert('Saved', 'Favorite teams saved.');
  }

  async function pickProfilePhoto() {
    if (!user?.uid) {
      Alert.alert('Login required', 'Please login first.');
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadingPhoto(true);

      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile-pictures/${user.uid}/profile.jpg`);
      await uploadBytes(imageRef, blob, {
        contentType: 'image/jpeg',
      });

      const downloadUrl = await getDownloadURL(imageRef);

      await setDoc(
        doc(db, 'userProfiles', user.uid),
        {
          displayName,
          email: user.email || '',
          photoUrl: downloadUrl,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      setPhotoUrl(downloadUrl);
      Alert.alert('Updated', 'Profile photo saved.');
    } catch (error) {
      Alert.alert('Upload failed', 'Could not upload profile photo. We may need to update Firebase Storage rules.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function openOfficialLink(url: string, title = 'Link not ready yet') {
    if (!url) {
      Alert.alert(title, 'We will add this official link soon.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open link', 'Please try again later.');
    }
  }

  async function performLogout() {
    try {
      await AsyncStorage.setItem('soccerDailyManualLogout', 'true');
      await signOut(auth);
      router.replace('/login' as any);
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Logout failed', 'Please try again.');
    }
  }

  async function handleLogout() {
    if (Platform.OS === 'web') {
      await performLogout();
      return;
    }

    Alert.alert('Log Out?', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  }

  async function loadProfileNotificationCount() {
    try {
      const q = query(
        collection(db, 'appNotifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snap = await getDocs(q);
      let unreadCount = 0;

      snap.docs.forEach((docSnap) => {
        const data: any = docSnap.data();
        if (!data.read) {
          unreadCount += 1;
        }
      });

      setProfileNotificationCount(unreadCount);
    } catch (error) {
      console.log('Profile notification count error:', error);
      setProfileNotificationCount(0);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProfileNotificationCount();
    }, [])
  );


  async function uploadCoverPhoto() {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        Alert.alert('Login required', 'Please login first.');
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile-covers/${user.uid}/${Date.now()}.jpg`);

      await uploadBytes(imageRef, blob, {
        contentType: 'image/jpeg',
      });

      const downloadUrl = await getDownloadURL(imageRef);

      await setDoc(
        doc(db, 'userProfiles', user.uid),
        {
          coverPhotoUrl: downloadUrl,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      setCoverPhotoUrl(downloadUrl);
      Alert.alert('Updated', 'Your Home background photo was updated.');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not upload cover photo.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your Soccer Daily account, tools, and testing shortcuts</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.coverPhotoBox}>
            {coverPhotoUrl ? (
              <Image source={{ uri: coverPhotoUrl }} style={styles.coverPhotoPreview} />
            ) : (
              <View style={styles.coverPhotoPlaceholder}>
                <Text style={styles.coverPhotoPlaceholderText}>🏟️ Home Background Photo</Text>
              </View>
            )}

            <Pressable style={styles.coverPhotoButton} onPress={uploadCoverPhoto}>
              <Text style={styles.coverPhotoButtonText}>Upload Home Background Photo</Text>
            </Pressable>
          </View>

          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSub}>Soccer Daily Fan</Text>
          </View>
        </View>

        <Pressable style={styles.photoButton} onPress={pickProfilePhoto} disabled={uploadingPhoto}>
          <Text style={styles.photoButtonText}>
            {uploadingPhoto ? 'Uploading...' : 'Change Profile Photo'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Favorite Teams</Text>

        <Text style={styles.label}>Favorite Club Team</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Manchester City, Barcelona, Inter Miami"
          placeholderTextColor="#94A3B8"
          value={clubTeam}
          onChangeText={setClubTeam}
        />

        <Text style={styles.label}>Favorite National Team</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: USA, Nepal, Argentina, Brazil"
          placeholderTextColor="#94A3B8"
          value={nationalTeam}
          onChangeText={setNationalTeam}
        />

        <Pressable style={styles.goldButton} onPress={saveFavoriteTeams}>
          <Text style={styles.goldButtonText}>Save Favorite Team</Text>
        </Pressable>

        <View style={styles.savedBox}>
          <Text style={styles.savedText}>⚽ Club: {savedClub || 'Not selected yet'}</Text>
          <Text style={styles.savedText}>🏆 National: {savedNational || 'Not selected yet'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Testing Shortcuts</Text>

        <Pressable style={styles.toolButton} onPress={() => router.push('/' as any)}>
          <Text style={styles.toolText}>🔎 Search / Home</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/leaderboard' as any)}>
          <Text style={styles.toolText}>🥇 Leaderboard</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/fan-wall' as any)}>
          <Text style={styles.toolText}>🧱 Fan Wall</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/notifications' as any)}>
          <Text style={styles.toolText}>🔔 Notifications {profileNotificationCount > 0 ? `(${profileNotificationCount})` : ''}</Text>
        </Pressable>

        {isAdminUser ? (
          <Pressable style={styles.adminButton} onPress={() => router.push('/admin' as any)}>
            <Text style={styles.adminText}>🛡️ Admin / Reports</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tools</Text>

        <Pressable style={styles.toolButton} onPress={() => router.push('/training' as any)}>
          <Text style={styles.toolText}>🏋️ Training & Fitness</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/studio' as any)}>
          <Text style={styles.toolText}>🎙️ Open Soccer Daily Studio</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/community-guidelines' as any)}>
          <Text style={styles.toolText}>🛡️ Community Rules</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/language' as any)}>
          <Text style={styles.toolText}>🌐 Language Center</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Official Soccer Daily Links</Text>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS.website)}>
          <Text style={styles.toolText}>🌐 Website</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS.email)}>
          <Text style={styles.toolText}>📧 Email Soccer Daily</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS.facebook)}>
          <Text style={styles.toolText}>📘 Facebook</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS.instagram)}>
          <Text style={styles.toolText}>📸 Instagram</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS.youtube, 'YouTube coming soon')}>
          <Text style={styles.toolText}>▶️ YouTube</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
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
    paddingTop: 70,
    paddingBottom: 150,
  },
  hero: {
    backgroundColor: '#0B1729',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#24344F',
    marginBottom: 18,
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 23,
  },
  card: {
    backgroundColor: '#0B1729',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24344F',
    marginBottom: 18,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#132238',
  },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#132238',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  avatarText: {
    color: '#FFD166',
    fontSize: 38,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFD166',
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 6,
  },
  profileSub: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '700',
  },
  photoButton: {
    backgroundColor: '#132238',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  photoButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#2A3B5F',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
  },
  goldButton: {
    backgroundColor: '#FFD166',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  goldButtonText: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
  },
  savedBox: {
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#24344F',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  savedText: {
    color: '#E5E7EB',
    fontSize: 17,
    lineHeight: 26,
  },
  toolButton: {
    backgroundColor: '#132238',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  toolText: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '900',
  },
  adminButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  adminText: {
    color: '#07111F',
    fontSize: 18,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  coverPhotoBox: {
    width: '100%',
    backgroundColor: '#111C2E',
    borderWidth: 1,
    borderColor: '#22314A',
    borderRadius: 20,
    padding: 12,
    marginBottom: 18,
  },
  coverPhotoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 10,
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: '#22314A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  coverPhotoPlaceholderText: {
    color: '#CBD5E1',
    fontWeight: '800',
  },
  coverPhotoButton: {
    backgroundColor: '#FFD166',
    padding: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  coverPhotoButtonText: {
    color: '#07111F',
    fontWeight: '900',
    fontSize: 14,
  },

});