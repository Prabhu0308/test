import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CameraStudioScreen() {
  const cameraRef = useRef<CameraView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<any>(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(35);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [script, setScript] = useState('');

  const [fontSize, setFontSize] = useState(24);
  const [speed, setSpeed] = useState(35);
  const [boxHeight, setBoxHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    async function loadScript() {
      const saved = await AsyncStorage.getItem('studioScript');
      setScript(saved || 'Welcome to Soccer Daily');
    }

    loadScript();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera Permission Needed</Text>

        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.darkButtonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  function pausePrompt() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetPrompt() {
    pausePrompt();
    offsetRef.current = 0;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function startPrompt() {
    pausePrompt();

    if (boxHeight <= 0 || contentHeight <= 0) {
      Alert.alert('Teleprompter', 'Script is loading. Press Start again.');
      return;
    }

    const maxScroll = Math.max(0, contentHeight - boxHeight);

    if (maxScroll === 0) {
      Alert.alert('Teleprompter', 'Full script is already visible.');
      return;
    }

    timerRef.current = setInterval(() => {
      const currentMaxScroll = Math.max(0, contentHeight - boxHeight);

      const nextOffset = Math.min(
        currentMaxScroll,
        offsetRef.current + speedRef.current * 0.05
      );

      offsetRef.current = nextOffset;

      scrollRef.current?.scrollTo({
        y: nextOffset,
        animated: false,
      });

      if (nextOffset >= currentMaxScroll) {
        pausePrompt();
      }
    }, 50);
  }

  function makeFaster() {
    const nextSpeed = speed + 10;
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  }

  function makeSlower() {
    const nextSpeed = Math.max(5, speed - 10);
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  }

  async function startRecording() {
    if (!cameraRef.current || recording) return;

    setRecording(true);
    setVideoUri(null);
    resetPrompt();

    setTimeout(() => {
      startPrompt();
    }, 500);

    try {
      const video = await cameraRef.current.recordAsync();

      if (video?.uri) {
        setVideoUri(video.uri);
        Alert.alert('Recorded', 'Video is ready for preview.');
      } else {
        Alert.alert('Recorded', 'Video recorded, but no URI was returned.');
      }
    } catch (error) {
      Alert.alert('Recording Failed', JSON.stringify(error));
    } finally {
      pausePrompt();
      setRecording(false);
    }
  }

  function stopRecording() {
    pausePrompt();
    cameraRef.current?.stopRecording();
    setRecording(false);
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      />

      <View
        style={styles.promptBox}
        pointerEvents="none"
        onLayout={(event) => setBoxHeight(event.nativeEvent.layout.height)}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: boxHeight + 120,
          }}
        >
          <Text
            style={[
              styles.promptText,
              {
                fontSize,
                lineHeight: fontSize + 12,
              },
            ]}
          >
            {script}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.topText}>← Studio</Text>
        </Pressable>

        <Text style={styles.topTitle}>🎥 Camera Studio</Text>
      </View>

      {videoUri && !recording && (
        <View style={styles.videoBox}>
          <Text style={styles.videoText}>✅ Video Ready</Text>

          <Pressable
            style={styles.previewButton}
            onPress={() =>
              router.push({
                pathname: '/video-preview',
                params: { uri: videoUri },
              })
            }
          >
            <Text style={styles.darkButtonText}>▶ Preview Video</Text>
          </Pressable>
        </View>
      )}

      {!recording && (
        <View style={styles.promptControls}>
          <Text style={styles.speedText}>Speed: {speed}</Text>

          <View style={styles.controlRow}>
            <Pressable style={styles.controlButton} onPress={startPrompt}>
              <Text style={styles.controlText}>▶ Start</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={pausePrompt}>
              <Text style={styles.controlText}>⏸ Pause</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={resetPrompt}>
              <Text style={styles.controlText}>🔄 Reset</Text>
            </Pressable>
          </View>

          <View style={styles.controlRow}>
            <Pressable
              style={styles.controlButton}
              onPress={() => {
                setFontSize(fontSize + 2);
                resetPrompt();
              }}
            >
              <Text style={styles.controlText}>A+</Text>
            </Pressable>

            <Pressable
              style={styles.controlButton}
              onPress={() => {
                setFontSize(Math.max(16, fontSize - 2));
                resetPrompt();
              }}
            >
              <Text style={styles.controlText}>A-</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={makeFaster}>
              <Text style={styles.controlText}>⚡ Faster</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={makeSlower}>
              <Text style={styles.controlText}>🐢 Slower</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.smallButton}
          onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
        >
          <Text style={styles.whiteButtonText}>🔄 Flip</Text>
        </Pressable>

        {!recording ? (
          <Pressable style={styles.recordButton} onPress={startRecording}>
            <Text style={styles.whiteButtonText}>● Record</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.stopButton} onPress={stopRecording}>
            <Text style={styles.whiteButtonText}>■ Stop</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#07111F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  promptBox: {
    position: 'absolute',
    top: 100,
    left: 15,
    right: 15,
    bottom: 190,
    overflow: 'hidden',
  },
  promptText: {
    width: '100%',
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  topBar: {
    position: 'absolute',
    top: 55,
    left: 18,
    right: 18,
  },
  topText: {
    color: '#FFD166',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  topTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  videoBox: {
    position: 'absolute',
    bottom: 245,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 14,
    borderRadius: 14,
  },
  videoText: {
    color: '#FFD166',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  previewButton: {
    backgroundColor: '#FFD166',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  promptControls: {
    position: 'absolute',
    bottom: 105,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 14,
  },
  speedText: {
    color: '#FFD166',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#123C69',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 25,
    left: 18,
    right: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD166',
    padding: 15,
    borderRadius: 14,
    marginTop: 20,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#123C69',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  recordButton: {
    flex: 1,
    backgroundColor: '#D62828',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  whiteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  darkButtonText: {
    color: '#07111F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
