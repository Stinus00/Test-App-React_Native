import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

type MediaItem =
  | { type: 'video'; source: number }
  | { type: 'image'; source: number; duration: number };

const mediaItems: MediaItem[] = [
  // { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 4000},
  // { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 4000 },
  // { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 4000},
  // { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 4000 },
  { type: 'video', source: require('@/assets/videos/test2.mp4') },
  // { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 6000 },
  // { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 2000 },
  { type: 'video', source: require('@/assets/videos/test3.mp4') },
  { type: 'video', source: require('@/assets/videos/test6.mp4') },
  { type: 'video', source: require('@/assets/videos/test1.mp4') },
  { type: 'video', source: require('@/assets/videos/test8.mp4') },
  { type: 'video', source: require('@/assets/videos/test9.mp4') },
  { type: 'video', source: require('@/assets/videos/test10.mp4') },
];

const initialVideoSource = mediaItems[0].type === 'video' ? mediaItems[0].source : null;

export default function Testing3() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
  };
  const theme = useTheme();

  const player1 = useVideoPlayer(initialVideoSource, (player) => {
    player.muted = true;
    player.bufferOptions = {
      maxBufferBytes: 8 * 1024 * 1024,
      minBufferForPlayback: 1,
      preferredForwardBufferDuration: 8,
    };
  });
  const player2 = useVideoPlayer(null, (player) => {
    player.muted = true;
    player.bufferOptions = {
      maxBufferBytes: 8 * 1024 * 1024,
      minBufferForPlayback: 1,
      preferredForwardBufferDuration: 8,
    };
  });

  const [currentPlayer, setCurrentPlayer] = useState(player1);
  const [currentMedia, setCurrentMedia] = useState(mediaItems[0]);
  const activePlayerIndex = useRef(0);
  const currentMediaIndex = useRef(0);
  const playerMediaIndexes = useRef<(number | null)[]>([0, null]);
  const loadingMediaIndexes = useRef<(number | null)[]>([0, null]);
  const playerEnded = useRef([false, false]);
  const advancing = useRef(false);
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (currentMedia.type === 'video' && hasStartedPlayback) {
      currentPlayer.play();
    }
  }, [currentMedia, currentPlayer, hasStartedPlayback]);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    web: {
      paddingTop: 0,
    },
  });

  useEffect(() => {
    let disposed = false;

    const preload = async (player: typeof player1, mediaIndex: number | null) => {
      if (mediaIndex === null) {
        return true;
      }

      const playerIndex = player === player1 ? 0 : 1;
      if (
        playerMediaIndexes.current[playerIndex] === mediaIndex ||
        loadingMediaIndexes.current[playerIndex] === mediaIndex
      ) {
        return true;
      }

      loadingMediaIndexes.current[playerIndex] = mediaIndex;
      try {
        await player.replaceAsync(mediaItems[mediaIndex].source);
        if (disposed) {
          return false;
        }

        playerMediaIndexes.current[playerIndex] = mediaIndex;
        playerEnded.current[playerIndex] = false;
        return true;
      } catch {
        return false;
      } finally {
        if (loadingMediaIndexes.current[playerIndex] === mediaIndex) {
          loadingMediaIndexes.current[playerIndex] = null;
        }
      }
    };

    const findNextVideoIndex = (startIndex: number) => {
      for (let offset = 0; offset < mediaItems.length; offset += 1) {
        const index = (startIndex + offset) % mediaItems.length;
        if (mediaItems[index].type === 'video') {
          return index;
        }
      }

      return null;
    };

    const advance = async () => {
      if (advancing.current || disposed) {
        return;
      }

      advancing.current = true;
      const endedPlayerIndex = activePlayerIndex.current;
      playerEnded.current[endedPlayerIndex] = true;
      const nextMediaIndex = (currentMediaIndex.current + 1) % mediaItems.length;
      const nextMedia = mediaItems[nextMediaIndex];
      currentMediaIndex.current = nextMediaIndex;

      if (imageTimer.current) {
        clearTimeout(imageTimer.current);
        imageTimer.current = null;
      }

      const activePlayer = endedPlayerIndex === 0 ? player1 : player2;
      activePlayer.pause();

      if (nextMedia.type === 'image') {
        setCurrentMedia(nextMedia);
        imageTimer.current = setTimeout(advance, nextMedia.duration);
        void preload(activePlayer, findNextVideoIndex(nextMediaIndex + 1));
        advancing.current = false;
        return;
      }

      const nextPlayerIndex = endedPlayerIndex === 0 ? 1 : 0;
      const nextPlayer = nextPlayerIndex === 0 ? player1 : player2;
      const loaded = await preload(nextPlayer, nextMediaIndex);
      if (!loaded || disposed) {
        advancing.current = false;
        return;
      }

      if (playerEnded.current[nextPlayerIndex]) {
        nextPlayer.replay();
      } else {
        nextPlayer.play();
      }
      playerEnded.current[nextPlayerIndex] = false;
      activePlayerIndex.current = nextPlayerIndex;
      setCurrentPlayer(nextPlayer);
      setCurrentMedia(nextMedia);
      void preload(activePlayer, findNextVideoIndex(nextMediaIndex + 1));
      advancing.current = false;
    };

    const subscription = player1.addListener('playToEnd', advance);
    const subscription2 = player2.addListener('playToEnd', advance);

    void preload(player2, findNextVideoIndex(1));

    if (mediaItems[0].type === 'image') {
      imageTimer.current = setTimeout(advance, mediaItems[0].duration);
    }

    return () => {
      disposed = true;
      subscription.remove();
      subscription2.remove();
      if (imageTimer.current) {
        clearTimeout(imageTimer.current);
      }
    };
  }, [player1, player2]);

  return (
    <ThemedView
      style={[
        { backgroundColor: theme.background },
        styles.containerView,
        styles.contentContainer,
        contentPlatformStyle,
      ]}>
        {currentMedia.type === 'image' ? (
          <Image source={currentMedia.source} contentFit="contain" style={styles.backgroundVideo} />
        ) : (
          <VideoView
            player={currentPlayer}
            nativeControls={false}
            playsInline
            contentFit="contain"
            style={styles.backgroundVideo}
          />
        )}
        {!hasStartedPlayback && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setHasStartedPlayback(true)}
            style={styles.startPlaybackButton}>
            <Text style={styles.startPlaybackText}>Play videos</Text>
          </Pressable>
        )}
      </ThemedView>
    );
}

const styles = StyleSheet.create({
    fullView: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        aspectRatio: 1,
        },
    containerView: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        },
  contentContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  backgroundVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  startPlaybackButton: {
    position: 'absolute',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#000000cc',
  },
  startPlaybackText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
