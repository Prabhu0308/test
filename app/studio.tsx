import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function StudioScreen() {
  const [script, setScript] = useState('');

  useEffect(() => {
    async function loadScript() {
      const saved = await AsyncStorage.getItem('studioScript');
      setScript(saved || '');
    }

    loadScript();
  }, []);

  async function saveScript() {
    await AsyncStorage.setItem('studioScript', script);
    Alert.alert('Saved', 'Your script has been saved.');
  }

  async function openTeleprompter() {
    await AsyncStorage.setItem('studioScript', script);
    router.push('/teleprompter');
  }

  async function openCameraStudio() {
    await AsyncStorage.setItem('studioScript', script);
    router.push('/camera-studio');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>🎬 Soccer Daily Studio</Text>

          <Text style={styles.subtitle}>
            Write your script, save it, then open the teleprompter or camera studio.
          </Text>

          <View style={styles.topActions}>
            <Pressable style={styles.actionButton} onPress={saveScript}>
              <Text style={styles.actionText}>💾 Save Script</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={openTeleprompter}>
              <Text style={styles.actionText}>📜 Open Teleprompter</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={openCameraStudio}>
              <Text style={styles.actionText}>🎥 Open Camera Studio</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>📝 Script Editor</Text>

          <TextInput
            multiline
            value={script}
            onChangeText={setScript}
            placeholder="Write your soccer script here..."
            placeholderTextColor="#7F8A9A"
            style={styles.input}
            textAlignVertical="top"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
          />

          <Text style={styles.note}>
            Tip: Open Teleprompter and Open Camera Studio automatically save your latest script first.
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#132238',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  backText: {
    color: '#FFD166',
    fontWeight: '900',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  title: {
    color: '#FFD166',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: 'white',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 18,
  },
  topActions: {
    marginBottom: 22,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFD166',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#07111F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    color: '#FFD166',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#111C2E',
    color: 'white',
    minHeight: 520,
    borderRadius: 22,
    padding: 22,
    fontSize: 22,
    lineHeight: 34,
  },
  note: {
    color: '#A7B0C0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
});
