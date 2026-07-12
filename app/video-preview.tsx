import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function VideoPreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const videoSource = typeof uri === 'string' ? uri : null;
  const player = useVideoPlayer(videoSource);

  async function saveToPhotos() {
    if (!uri) return;

    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      alert('Photo permission is required.');
      return;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    alert('Video saved to Photos!');
  }

  async function shareVideo() {
    if (!uri) return;

    const available = await Sharing.isAvailableAsync();

    if (!available) {
      alert('Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(uri);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Camera</Text>
      </Pressable>

      <Text style={styles.title}>▶ Video Preview</Text>

      {uri ? (
        <>
          <VideoView
            player={player}
            style={styles.video}
            nativeControls
            contentFit="contain"
          />

          <Pressable style={styles.button} onPress={saveToPhotos}>
            <Text style={styles.buttonText}>💾 Save to Photos</Text>
          </Pressable>

          <Pressable style={styles.shareButton} onPress={shareVideo}>
            <Text style={styles.shareText}>📤 Share Video</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.empty}>No video found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20,
    paddingTop: 60,
  },
  back: {
    color: '#FFD166',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: 500,
    backgroundColor: '#000',
    borderRadius: 18,
  },
  button: {
    backgroundColor: '#FFD166',
    padding: 15,
    borderRadius: 14,
    marginTop: 18,
  },
  shareButton: {
    backgroundColor: '#123C69',
    padding: 15,
    borderRadius: 14,
    marginTop: 12,
  },
  buttonText: {
    color: '#07111F',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  shareText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  empty: {
    color: 'white',
    fontSize: 18,
  },
});