import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [acceptedFanZoneRules, setAcceptedFanZoneRules] = useState(false);
  const [busy, setBusy] = useState(false);

  async function saveLocalUser(displayName: string, userEmail: string) {
    await AsyncStorage.setItem(
      'soccerDailyUser',
      JSON.stringify({
        displayName,
        email: userEmail,
      })
    );
  }

  async function handleSubmit() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Missing information', 'Please enter email and password.');
      return;
    }

    if (mode === 'signup' && !cleanName) {
      Alert.alert('Name required', 'Please enter your name for testing.');
      return;
    }

    if (mode === 'signup') {
      const passwordProblems: string[] = [];

      if (cleanPassword.length < 10) {
        passwordProblems.push('at least 10 characters');
      }

      if (!/[A-Z]/.test(cleanPassword)) {
        passwordProblems.push('one uppercase letter');
      }

      if (!/[a-z]/.test(cleanPassword)) {
        passwordProblems.push('one lowercase letter');
      }

      if (!/[0-9]/.test(cleanPassword)) {
        passwordProblems.push('one number');
      }

      if (!/[^A-Za-z0-9]/.test(cleanPassword)) {
        passwordProblems.push('one symbol');
      }

      if (passwordProblems.length > 0) {
        Alert.alert(
          'Create a stronger password',
          `Your password still needs:\n\n• ${passwordProblems.join('\n• ')}`
        );
        return;
      }

      if (cleanPassword !== confirmPassword.trim()) {
        Alert.alert(
          'Passwords do not match',
          'Please enter the same password in both password fields.'
        );
        return;
      }
    }

    setBusy(true);

    try {
      const auth = getAuth();

      if (mode === 'signup') {
        if (!dateOfBirth.trim()) {
          Alert.alert('Date of birth required', 'Please enter your date of birth before creating an account.');
          return;
        }

        if (!acceptedGuidelines || !acceptedFanZoneRules) {
          Alert.alert(
            'Agreement required',
            'Please agree to the Community Guidelines and Fan Zone respectful-use rules before creating an account.'
          );
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);

        await AsyncStorage.setItem('soccerDailyCommunityGuidelinesAccepted', 'yes');
        await AsyncStorage.setItem('soccerDailyDateOfBirth', dateOfBirth.trim());
        await AsyncStorage.setItem(`soccerDailyDateOfBirth:${result.user.uid}`, dateOfBirth.trim());
        await AsyncStorage.removeItem('soccerDailyManualLogout');

        await updateProfile(result.user, {
          displayName: cleanName,
        });

        await saveLocalUser(cleanName, cleanEmail);

        Alert.alert('Account created', 'You are logged in now.');
        router.replace('/profile' as any);
      } else {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        await AsyncStorage.removeItem('soccerDailyManualLogout');

        await saveLocalUser(result.user.displayName || cleanEmail.split('@')[0], cleanEmail);

        Alert.alert('Logged in', 'Welcome back.');
        router.replace('/profile' as any);
      }
    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';

      if (error?.code === 'auth/email-already-in-use') {
        message = 'This email already has an account. Tap Login instead.';
      }

      if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
        message = 'Account not found or password is wrong. Tap Create Account for new testers.';
      }

      if (error?.code === 'auth/wrong-password') {
        message = 'Wrong password. Please try again.';
      }

      if (error?.code === 'auth/weak-password') {
        message =
          'Password must have at least 10 characters, uppercase, lowercase, a number, and a symbol.';
      }

      Alert.alert('Login error', message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Soccer Daily</Text>
        <Text style={styles.subtitle}>
          {mode === 'signup' ? 'Create tester account' : 'Login to your account'}
        </Text>

        <View style={styles.switchRow}>
          <Pressable
            style={[styles.switchButton, mode === 'signup' && styles.switchActive]}
            onPress={() => {
                setMode('signup');
                Alert.alert(
                  'Create Account',
                  'Please enter your date of birth and agree to the Community Guidelines before opening a Soccer Daily account.'
                );
              }}
          >
            <Text style={[styles.switchText, mode === 'signup' && styles.switchTextActive]}>
              Create Account
            </Text>
          </Pressable>

          <Pressable
            style={[styles.switchButton, mode === 'login' && styles.switchActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>
              Login
            </Text>
          </Pressable>
        </View>

        {mode === 'signup' ? (
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder={
            mode === 'signup'
              ? 'Create a strong password'
              : 'Password'
          }
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {mode === 'signup' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.passwordRequirements}>
              Password must have 10+ characters, uppercase, lowercase,
              number, and symbol.
            </Text>
          </>
        ) : null}

          {mode === 'signup' ? (
            <View style={styles.signupSafetyCard}>
              <Text style={styles.signupSafetyTitle}>Required before opening account</Text>

              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="Date of birth required (MM/DD/YYYY)"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />

              <Pressable
                style={styles.agreementRow}
                onPress={() => setAcceptedGuidelines((value) => !value)}
              >
                <Text style={styles.checkbox}>{acceptedGuidelines ? '☑' : '☐'}</Text>
                <Text style={styles.agreementText}>
                  I agree to Soccer Daily Community Guidelines.
                </Text>
              </Pressable>

              <Pressable
                style={styles.agreementRow}
                onPress={() => setAcceptedFanZoneRules((value) => !value)}
              >
                <Text style={styles.checkbox}>{acceptedFanZoneRules ? '☑' : '☐'}</Text>
                <Text style={styles.agreementText}>
                  I understand Fan Zone is for respectful soccer conversation.
                </Text>
              </Pressable>
            </View>
          ) : null}

<Pressable style={styles.goldButton} onPress={handleSubmit} disabled={busy}>
          {busy ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.goldText}>
              {mode === 'signup' ? 'Create Account & Enter' : 'Login'}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => router.replace('/' as any)}>
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>

        <Text style={styles.note}>
          Testing note: new testers should choose Create Account first. Use a unique, strong password and never share it.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  passwordRequirements: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  signupSafetyCard: {
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#253B5B',
  },
  signupSafetyTitle: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  checkbox: {
    color: '#FFD166',
    fontSize: 21,
    fontWeight: '900',
    marginTop: -2,
  },
  agreementText: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },

  container: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    backgroundColor: '#0B1729',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#24344F',
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 18,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#07111F',
    borderRadius: 18,
    padding: 5,
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#FFD166',
  },
  switchText: {
    color: '#CBD5E1',
    fontWeight: '800',
  },
  switchTextActive: {
    color: '#07111F',
  },
  input: {
    backgroundColor: '#111C2F',
    borderRadius: 16,
    padding: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24344F',
  },
  goldButton: {
    backgroundColor: '#FFD166',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  goldText: {
    color: '#07111F',
    fontSize: 17,
    fontWeight: '900',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '800',
  },
  note: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 18,
  },
});
