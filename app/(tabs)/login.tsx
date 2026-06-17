import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../firebase/config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signup() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created!');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    }
  }

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in!');
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    }
  }

  async function logout() {
    await signOut(auth);
    Alert.alert('Logged out');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Login</Text>
      <Text style={styles.subtitle}>Create or access your Soccer Daily account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8FA3B8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8FA3B8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={signup}>
        <Text style={styles.secondaryText}>Create Account</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 24, paddingTop: 80 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 28 },
  input: {
    backgroundColor: '#111C2E',
    color: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#22314A',
  },
  button: { backgroundColor: '#FFD166', padding: 16, borderRadius: 14, marginBottom: 12 },
  buttonText: { color: '#07111F', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: '#123C69', padding: 16, borderRadius: 14, marginBottom: 12 },
  secondaryText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { padding: 16 },
  logoutText: { color: '#FFD166', textAlign: 'center', fontWeight: 'bold' },
});
