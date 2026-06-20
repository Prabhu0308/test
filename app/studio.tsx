import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function StudioScreen() {
  const [script, setScript] = useState(
    'Welcome to Soccer Daily. Today we are reviewing the match and bringing you the biggest football stories in one minute.'
  );

  const [fontSize, setFontSize] = useState(26);
  const [speed, setSpeed] = useState(30);
  const [playing, setPlaying] = useState(false);

  const teleRef = useRef<ScrollView>(null);
  const position = useRef(0);

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      position.current += speed;
      teleRef.current?.scrollTo({ y: position.current, animated: true });
    }, 1000);

    return () => clearInterval(timer);
  }, [playing, speed]);

  function resetTeleprompter() {
    position.current = 0;
    teleRef.current?.scrollTo({ y: 0, animated: true });
    setPlaying(false);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎬 Soccer Daily Studio</Text>
      <Text style={styles.subtitle}>Write scripts and practice with teleprompter.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Script Writer</Text>
        <TextInput
          style={styles.input}
          value={script}
          onChangeText={setScript}
          multiline
          placeholder="Write your script here..."
          placeholderTextColor="#8FA3B8"
        />
      </View>

      <View style={styles.teleprompter}>
        <Text style={styles.teleTitle}>🎤 Teleprompter</Text>

        <ScrollView ref={teleRef} style={styles.promptBox}>
          <Text style={[styles.promptText, { fontSize, lineHeight: fontSize + 16 }]}>
            {script}
          </Text>
        </ScrollView>

        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => setPlaying(true)}>
            <Text style={styles.buttonText}>▶ Start</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setPlaying(false)}>
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={resetTeleprompter}>
            <Text style={styles.buttonText}>↺ Reset</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.smallButton} onPress={() => setFontSize(Math.max(18, fontSize - 2))}>
            <Text style={styles.buttonText}>A-</Text>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={() => setFontSize(fontSize + 2)}>
            <Text style={styles.buttonText}>A+</Text>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={() => setSpeed(Math.max(10, speed - 10))}>
            <Text style={styles.buttonText}>🐢 Slow</Text>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={() => setSpeed(speed + 10)}>
            <Text style={styles.buttonText}>⚡ Fast</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>Soccer Daily Creator Studio</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07111F', padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A7B0C0', fontSize: 16, marginBottom: 20 },
  card: { backgroundColor: '#111C2E', padding: 18, borderRadius: 18, marginBottom: 18 },
  cardTitle: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: {
    color: 'white',
    backgroundColor: '#07111F',
    minHeight: 150,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  teleprompter: { backgroundColor: '#000', padding: 18, borderRadius: 18, marginBottom: 30 },
  teleTitle: { color: '#FFD166', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  promptBox: { height: 260, backgroundColor: '#050505', borderRadius: 14, padding: 14 },
  promptText: { color: 'white', fontWeight: 'bold' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  button: { backgroundColor: '#FFD166', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  smallButton: { backgroundColor: '#123C69', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  buttonText: { color: '#07111F', fontWeight: 'bold' },
  footer: { color: '#FFD166', textAlign: 'center', marginBottom: 40, fontWeight: 'bold' },
});
