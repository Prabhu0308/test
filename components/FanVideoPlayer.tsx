import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';
import {
  useVideoPlayer,
  VideoView,
} from 'expo-video';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type FanVideoPlayerProps = {
  uri: string;
  style: StyleProp<ViewStyle>;
  contentFit?: 'contain' | 'cover' | 'fill';
};

let audioPreparation: Promise<void> | null = null;

async function prepareAudio(): Promise<void> {
  if (!audioPreparation) {
    audioPreparation = (async () => {
      await setIsAudioActiveAsync(true);

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
      });
    })().catch((error) => {
      audioPreparation = null;
      console.log('❌ Fan video audio setup failed:', error);
    });
  }

  await audioPreparation;
}

export default function FanVideoPlayer({
  uri,
  style,
  contentFit = 'cover',
}: FanVideoPlayerProps) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.volume = 1;
    videoPlayer.audioMixingMode = 'doNotMix';
  });

  useEffect(() => {
    void prepareAudio();

    const sourceSubscription = player.addListener(
      'sourceLoad',
      ({ availableAudioTracks }) => {
        player.muted = false;
        player.volume = 1;
        player.audioMixingMode = 'doNotMix';

        console.log(
          '✅ Fan video loaded. Audio tracks:',
          availableAudioTracks.length
        );
      }
    );

    const statusSubscription = player.addListener(
      'statusChange',
      ({ status, error }) => {
        if (error) {
          console.log('❌ Fan video playback error:', error);
        } else {
          console.log('Fan video status:', status);
        }
      }
    );

    return () => {
      sourceSubscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  return (
    <VideoView
      player={player}
      style={style}
      nativeControls
      fullscreenOptions={{ enable: true }}
      contentFit={contentFit}
    />
  );
}
