import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import {
  deleteUser,
  getAuth,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useState, useEffect, useRef } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { SOCCER_DAILY_FACEBOOK, SOCCER_DAILY_INSTAGRAM } from '../../constants/socialLinks';
import { db, storage } from '../../firebase/config';

const ADMIN_EMAIL = 'prabhudevupadhyay@gmail.com';

export default function ProfileScreen() {

  const profileScrollRef = useRef<ScrollView | null>(null);

  // PROFILE_SCROLL_TO_TOP_FIX
  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() => {
        profileScrollRef.current?.scrollTo({
          y: 0,
          animated: false,
        });
      });

      return () => cancelAnimationFrame(frame);
    }, [])
  );

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
  const [deletingAccount, setDeletingAccount] = useState(false);

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
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const club = await AsyncStorage.getItem('favoriteClubTeam');
    const clubAlt = await AsyncStorage.getItem('soccerDailyFavoriteClub');
    const fanZoneClub = await AsyncStorage.getItem('savedFanBadge');

    const national = await AsyncStorage.getItem('favoriteNationalTeam');
    const nationalAlt = await AsyncStorage.getItem('soccerDailyFavoriteNational');

    const clubFromAnywhere = club || clubAlt || fanZoneClub || '';
    const nationalFromAnywhere = national || nationalAlt || '';

    setSavedClub(clubFromAnywhere);
    setSavedNational(nationalFromAnywhere);
    setClubTeam(clubFromAnywhere);
    setNationalTeam(nationalFromAnywhere);

    if (!currentUser?.uid) return;

    try {
      const uid = currentUser.uid;

      const localProfilePhoto =
        await AsyncStorage.getItem(`profilePhotoUrl:${uid}`) ||
        await AsyncStorage.getItem('profilePhotoUrl') ||
        await AsyncStorage.getItem('soccerDailyProfilePhoto') ||
        await AsyncStorage.getItem('homePhotoUrl') ||
        '';

      const localCoverPhoto =
        await AsyncStorage.getItem(`coverPhotoUrl:${uid}`) ||
        await AsyncStorage.getItem(`homeCoverPhotoUrl:${uid}`) ||
        await AsyncStorage.getItem('coverPhotoUrl') ||
        await AsyncStorage.getItem('homeCoverPhotoUrl') ||
        await AsyncStorage.getItem('soccerDailyCoverPhoto') ||
        '';

      let mergedData: any = {};

      for (const collectionName of ['users', 'publicProfiles', 'userProfiles']) {
        try {
          const snap = await getDoc(doc(db, collectionName, uid));
          if (snap.exists()) {
            mergedData = {
              ...mergedData,
              ...snap.data(),
            };
          }
        } catch (error) {
          console.log('Profile lookup skipped:', collectionName, error);
        }
      }

      const loadedPhoto =
        mergedData.photoURL ||
        mergedData.photoUrl ||
        mergedData.profileImageUrl ||
        mergedData.avatarUrl ||
        currentUser.photoURL ||
        localProfilePhoto ||
        '';

      const loadedCover =
        mergedData.coverPhotoUrl ||
        mergedData.homeCoverPhotoUrl ||
        mergedData.coverPhoto ||
        localCoverPhoto ||
        '';

      if (loadedPhoto) {
        setPhotoUrl(loadedPhoto);
        await AsyncStorage.multiSet([
          [`profilePhotoUrl:${uid}`, loadedPhoto],
          ['profilePhotoUrl', loadedPhoto],
          ['soccerDailyProfilePhoto', loadedPhoto],
          ['homePhotoUrl', loadedPhoto],
        ]);
      }

      if (loadedCover) {
        setCoverPhotoUrl(loadedCover);
        await AsyncStorage.multiSet([
          [`coverPhotoUrl:${uid}`, loadedCover],
          [`homeCoverPhotoUrl:${uid}`, loadedCover],
          ['coverPhotoUrl', loadedCover],
          ['homeCoverPhotoUrl', loadedCover],
          ['soccerDailyCoverPhoto', loadedCover],
        ]);
      }

      if (mergedData.favoriteClubTeam || mergedData.savedFanBadge) {
        const cloudClub = mergedData.favoriteClubTeam || mergedData.savedFanBadge || clubFromAnywhere;
        setSavedClub(cloudClub);
        setClubTeam(cloudClub);
      }

      if (mergedData.favoriteNationalTeam) {
        setSavedNational(mergedData.favoriteNationalTeam);
        setNationalTeam(mergedData.favoriteNationalTeam);
      }
    } catch (error) {
      console.log('Load profile failed:', error);
    }
  }

  async function saveFavoriteTeams() {
    const club = clubTeam.trim();
    const national = nationalTeam.trim();

    try {
      await AsyncStorage.multiSet([
        ['favoriteClubTeam', club],
        ['favoriteNationalTeam', national],
        ['soccerDailyFavoriteClub', club],
        ['soccerDailyFavoriteNational', national],
        ['savedFanBadge', club],
      ]);

      setSavedClub(club);
      setSavedNational(national);

      const user = getAuth().currentUser;

      if (user) {
        const favoriteData = {
          userId: user.uid,
          userEmail: user.email || '',
          favoriteClubTeam: club,
          favoriteNationalTeam: national,
          savedFanBadge: club,
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), favoriteData, { merge: true });
        await setDoc(doc(db, 'publicProfiles', user.uid), favoriteData, { merge: true });
      }

      Alert.alert('Saved', 'Favorite teams saved.');
    } catch (error) {
      console.log('Save favorite teams failed:', error);
      Alert.alert('Error', 'Could not save favorite teams.');
    }
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

  async function performDeleteAccount() {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      Alert.alert('Login required', 'Please log in again first.');
      return;
    }

    try {
      setDeletingAccount(true);

      const uid = currentUser.uid;

      await deleteUser(currentUser);

      await AsyncStorage.multiRemove([
        'soccerDailyUser',
        'soccerDailyManualLogout',
        'soccerDailyCommunityGuidelinesAccepted',
        'soccerDailyDateOfBirth',
        `soccerDailyDateOfBirth:${uid}`,
        `profilePhotoUrl:${uid}`,
        `coverPhotoUrl:${uid}`,
        `homeCoverPhotoUrl:${uid}`,
        'profilePhotoUrl',
        'coverPhotoUrl',
        'homeCoverPhotoUrl',
        'soccerDailyProfilePhoto',
        'soccerDailyCoverPhoto',
        'homePhotoUrl',
      ]);

      if (Platform.OS === 'web') {
        (globalThis as any).alert(
          'Account deleted. Your Soccer Daily login account has been permanently removed.'
        );
      } else {
        Alert.alert(
          'Account deleted',
          'Your Soccer Daily login account has been permanently removed.'
        );
      }

      router.replace('/login' as any);
    } catch (error: any) {
      console.log('Delete account error:', error);

      const message =
        error?.code === 'auth/requires-recent-login'
          ? 'For security, please log out, log in again, and then delete your account.'
          : 'Could not delete your account. Please try again.';

      if (Platform.OS === 'web') {
        (globalThis as any).alert(`Delete account failed\n\n${message}`);
      } else {
        Alert.alert('Delete account failed', message);
      }
    } finally {
      setDeletingAccount(false);
    }
  }

  async function handleDeleteAccount() {
    const warning =
      'This permanently deletes your Soccer Daily login account. This action cannot be undone.';

    if (Platform.OS === 'web') {
      const confirmed = (globalThis as any).confirm(
        `Delete Account?\n\n${warning}`
      );

      if (confirmed) {
        await performDeleteAccount();
      }

      return;
    }

    Alert.alert('Delete Account?', warning, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete Permanently',
        style: 'destructive',
        onPress: () => void performDeleteAccount(),
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

  useEffect(() => {
    async function saveProfilePhotoForFanWall() {
      try {
        if (!photoUrl) return;

        await AsyncStorage.setItem('profilePhotoUrl', photoUrl);
        await AsyncStorage.setItem('soccerDailyProfilePhoto', photoUrl);
        await AsyncStorage.setItem('homePhotoUrl', photoUrl);
      } catch (error) {
        console.log('Save profile photo for Fan Wall error:', error);
      }
    }

    saveProfilePhotoForFanWall();
  }, [photoUrl]);


  useEffect(() => {
    async function syncProfilePhotoEverywhereForFanWall() {
      try {
        if (!photoUrl) return;

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        await AsyncStorage.multiSet([
          [`profilePhotoUrl:${user.uid}`, photoUrl],
          ['profilePhotoUrl', photoUrl],
          ['soccerDailyProfilePhoto', photoUrl],
          ['homePhotoUrl', photoUrl],
        ]);

        const profileData = {
          userId: user.uid,
          userEmail: user.email || '',
          displayName: displayName || user.displayName || user.email?.split('@')[0] || 'Fan',
          photoUrl,
          photoURL: photoUrl,
          profileImageUrl: photoUrl,
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
        await setDoc(doc(db, 'publicProfiles', user.uid), profileData, { merge: true });
        await setDoc(doc(db, 'userProfiles', user.uid), profileData, { merge: true });

        if (photoUrl.startsWith('http')) {
          await updateProfile(user, { photoURL: photoUrl });
        }

        console.log('✅ Synced profile photo for Fan Wall:', photoUrl);
      } catch (error) {
        console.log('❌ Profile photo sync failed:', error);
      }
    }

    syncProfilePhotoEverywhereForFanWall();
  }, [photoUrl, displayName]);



  useEffect(() => {
    async function syncCoverPhotoEverywhereForHome() {
      try {
        if (!coverPhotoUrl) return;

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        await AsyncStorage.multiSet([
          [`coverPhotoUrl:${user.uid}`, coverPhotoUrl],
          [`homeCoverPhotoUrl:${user.uid}`, coverPhotoUrl],
          ['coverPhotoUrl', coverPhotoUrl],
          ['homeCoverPhotoUrl', coverPhotoUrl],
          ['soccerDailyCoverPhoto', coverPhotoUrl],
        ]);

        const coverData = {
          userId: user.uid,
          userEmail: user.email || '',
          coverPhotoUrl,
          homeCoverPhotoUrl: coverPhotoUrl,
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), coverData, { merge: true });
        await setDoc(doc(db, 'publicProfiles', user.uid), coverData, { merge: true });
        await setDoc(doc(db, 'userProfiles', user.uid), coverData, { merge: true });

        console.log('✅ Synced home background photo:', coverPhotoUrl);
      } catch (error) {
        console.log('❌ Home background photo sync failed:', error);
      }
    }

    syncCoverPhotoEverywhereForHome();
  }, [coverPhotoUrl]);


  return (
    <ScrollView
      ref={profileScrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
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

            <View style={styles.profilePhotoWrap}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>

            <Pressable style={styles.coverPhotoButton} onPress={uploadCoverPhoto}>
              <Text style={styles.coverPhotoButtonText}>Upload Home Background Photo</Text>
            </Pressable>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSub}>Soccer Daily Fan</Text>

            <View
              style={[
                styles.verificationCard,
                user?.emailVerified
                  ? styles.verificationCardVerified
                  : styles.verificationCardUnverified,
              ]}
            >
              <Text
                style={[
                  styles.verificationStatus,
                  user?.emailVerified
                    ? styles.verificationStatusVerified
                    : styles.verificationStatusUnverified,
                ]}
              >
                {user?.emailVerified
                  ? '✅ Email Verified'
                  : '⚠️ Email Not Verified'}
              </Text>

              {!user?.emailVerified ? (
                <>
                  <Text style={styles.verificationText}>
                    Verify your email before posting, commenting,
                    uploading media, or reporting content.
                  </Text>

                  <Pressable
                    style={styles.verificationButton}
                    onPress={async () => {
                      try {
                        if (!user) {
                          Alert.alert(
                            'Login required',
                            'Please log in first.'
                          );
                          return;
                        }

                        await sendEmailVerification(user);

                        Alert.alert(
                          'Verification sent',
                          'Please check your inbox and spam folder.'
                        );
                      } catch (error: any) {
                        const message =
                          error?.code === 'auth/too-many-requests'
                            ? 'Too many requests. Please wait and try again.'
                            : 'Could not send the verification email.';

                        Alert.alert('Verification failed', message);
                      }
                    }}
                  >
                    <Text style={styles.verificationButtonText}>
                      Resend Verification Email
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
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
          <Text style={styles.savedTitle}>Your Selected Teams</Text>
          <Text style={styles.savedText}>🏟️ Club: {savedClub || clubTeam || 'Not selected yet'}</Text>
          <Text style={styles.savedText}>🌎 National: {savedNational || nationalTeam || 'Not selected yet'}</Text>
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

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS?.website || 'https://soccerdailyapp.com')}>
          <Text style={styles.toolText}>🌐 Website</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS?.email || 'mailto:soccerdailyapp@gmail.com')}>
          <Text style={styles.toolText}>📧 Email Soccer Daily</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCCER_DAILY_FACEBOOK)}>
          <Text style={styles.toolText}>📘 Facebook</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCCER_DAILY_INSTAGRAM)}>
          <Text style={styles.toolText}>📸 Instagram</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => openOfficialLink(SOCIAL_LINKS?.youtube || 'https://www.youtube.com/@soccerdailyapp', 'YouTube coming soon')}>
          <Text style={styles.toolText}>▶️ YouTube</Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.deleteAccountButton,
          deletingAccount && styles.disabledAccountButton,
        ]}
        onPress={handleDeleteAccount}
        disabled={deletingAccount}
      >
        <Text style={styles.deleteAccountText}>
          {deletingAccount ? 'Deleting Account...' : 'Delete Account'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={deletingAccount}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  profilePhotoWrap: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,


    },

  deleteAccountButton: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  disabledAccountButton: {
    opacity: 0.55,
  },

  verificationCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  verificationCardVerified: {
    backgroundColor: '#123524',
    borderColor: '#22C55E',
  },
  verificationCardUnverified: {
    backgroundColor: '#3A2A00',
    borderColor: '#F59E0B',
  },
  verificationStatus: {
    fontSize: 16,
    fontWeight: '900',
  },
  verificationStatusVerified: {
    color: '#4ADE80',
  },
  verificationStatusUnverified: {
    color: '#FFD166',
  },
  verificationText: {
    color: '#E2E8F0',
    marginTop: 6,
    lineHeight: 19,
  },
  verificationButton: {
    marginTop: 10,
    backgroundColor: '#FFD166',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verificationButtonText: {
    color: '#000000',
    fontWeight: '900',
  },

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
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    width: '100%',

    },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10243A',
    borderWidth: 4,
    borderColor: '#FFD166',

    },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10243A',
    borderWidth: 4,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',

    },
  avatarText: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',

    },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,

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
    backgroundColor: '#071526',
    borderWidth: 2,
    borderColor: '#FFD166',
    borderRadius: 22,
    padding: 18,
    marginTop: 16,

    },
  savedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 8,

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
    borderRadius: 24,
    padding: 12,
    paddingBottom: 18,
    backgroundColor: '#071526',
    borderWidth: 1,
    borderColor: '#24344F',
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',

    },
  coverPhotoPreview: {
    width: '100%',
    height: 170,
    borderRadius: 20,
    backgroundColor: '#10243A',

    },
  coverPhotoPlaceholder: {
    width: '100%',
    height: 170,
    borderRadius: 20,
    backgroundColor: '#10243A',
    alignItems: 'center',
    justifyContent: 'center',

    },
  coverPhotoPlaceholderText: {
    color: '#CBD5E1',
    fontWeight: '800',
  },
  coverPhotoButton: {
    backgroundColor: '#FFD166',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 44,

    },
  coverPhotoButtonText: {
    color: '#07111F',
    fontWeight: '900',
    fontSize: 14,
  },

  savedTitle: {
    color: '#FFD166',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',


    },

});
