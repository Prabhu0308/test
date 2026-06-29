
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TeleprompterScreen() {
  const [script, setScript] = useState('');
  const [running, setRunning] = useState(false);
  const [fontSize, setFontSize] = useState(32);
  const [duration, setDuration] = useState(30000);

  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadScript() {
      const saved = await AsyncStorage.getItem('studioScript');
      setScript(saved || 'No script found. Go back to Studio and write a script.');
    }

    loadScript();
  }, []);

  function start() {
    setRunning(true);
    scrollAnim.setValue(0);

    Animated.timing(scrollAnim, {
      toValue: -1000,
      duration,
      useNativeDriver: true,
    }).start(() => {
      setRunning(false);
    });
  }

  function pause() {
    scrollAnim.stopAnimation();
    setRunning(false);
  }

  function reset() {
    scrollAnim.stopAnimation();
    scrollAnim.setValue(0);
    setRunning(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Studio</Text>
        </Pressable>

        <Text style={styles.title}>📺 Teleprompter</Text>
      </View>

      <View style={styles.screen}>
        <Animated.Text
          style={[
            styles.promptText,
            {
              fontSize,
              lineHeight: fontSize + 16,
              transform: [{ translateY: scrollAnim }],
            },
          ]}
        >
          {script}
        </Animated.Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={start}>
            <Text style={styles.buttonText}>▶ Start</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={pause}>
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>🔄 Reset</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            style={styles.button}
            onPress={() => setFontSize((size) => size + 2)}
          >
            <Text style={styles.buttonText}>A+</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => setFontSize((size) => Math.max(18, size - 2))}
          >
            <Text style={styles.buttonText}>A-</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            style={styles.button}
          onPress={() => {
  setDuration((time) => Math.max(5000, time - 5000));
  reset();
}}
          >
            <Text style={styles.buttonText}>⚡ Faster</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => {
  setDuration((time) => time + 5000);
  reset();
}}
          >
            <Text style={styles.buttonText}>🐢 Slower</Text>
          </Pressable>
        </View>

        <Text style={styles.status}>
          Font: {fontSize} • Speed: {Math.round(duration / 1000)}s •{' '}
          {running ? 'Running' : 'Paused'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020812',
    paddingTop: 55,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  back: {
    color: '#FFD166',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    margin: 14,
    borderRadius: 18,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  promptText: {
    color: 'white',
    fontWeight: '600',
  },
  controls: {
    padding: 14,
    paddingBottom: 28,
    backgroundColor: '#07111F',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#123C69',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  status: {
    color: '#FFD166',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
