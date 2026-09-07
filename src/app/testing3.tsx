import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

type MediaItem =
  | { type: 'video'; source: number }
  | { type: 'image'; source: number; duration: number };

const mediaItems: MediaItem[] = [
  { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 4000},
  { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 4000 },
  { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 4000},
  { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 4000 },
  { type: 'video', source: require('@/assets/videos/test2.mp4') },
  { type: 'image', source: require('@/assets/images/react-logo.png'), duration: 6000 },
  { type: 'image', source: require('@/assets/images/logo-glow.png'), duration: 2000 },
  { type: 'video', source: require('@/assets/videos/test3.mp4') },
  { type: 'video', source: require('@/assets/videos/test.mp4') },
];

const initialVideoSource = mediaItems[0].type === 'video' ? mediaItems[0].source : null;

export default function Testing3() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const player1 = useVideoPlayer(initialVideoSource, (player) => {
    player.muted = true;
  });
  const player2 = useVideoPlayer(null, (player) => {
    player.muted = true;
  });

  const [currentPlayer, setCurrentPlayer] = useState(player1);
  const [currentMedia, setCurrentMedia] = useState(mediaItems[0]);
  const activePlayerIndex = useRef(0);
  const currentMediaIndex = useRef(0);
  const playerMediaIndexes = useRef<(number | null)[]>([null, null]);
  const playerEnded = useRef([false, false]);
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentMedia.type === 'video') {
      currentPlayer.play();
    }
  }, [currentMedia, currentPlayer]);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  useEffect(() => {
    let disposed = false;

    const findNextVideoIndex = (startIndex: number) => {
      for (let offset = 0; offset < mediaItems.length; offset += 1) {
        const index = (startIndex + offset) % mediaItems.length;
        if (mediaItems[index].type === 'video') {
          return index;
        }
      }

      return null;
    };

    const preload = async (player: typeof player1, mediaIndex: number | null) => {
      if (mediaIndex === null || playerMediaIndexes.current.includes(mediaIndex)) {
        return;
      }

      await player.replaceAsync(mediaItems[mediaIndex].source);
      if (!disposed) {
        const playerIndex = player === player1 ? 0 : 1;
        playerMediaIndexes.current[playerIndex] = mediaIndex;
        playerEnded.current[playerIndex] = false;
      }
    };

    const advance = async () => {
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
        return;
      }

      const nextPlayerIndex = endedPlayerIndex === 0 ? 1 : 0;
      const nextPlayer = nextPlayerIndex === 0 ? player1 : player2;
      await preload(nextPlayer, nextMediaIndex);
      if (disposed) {
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
    };

    void preload(player2, findNextVideoIndex(1));

    const subscription = player1.addListener('playToEnd', advance);
    const subscription2 = player2.addListener('playToEnd', advance);

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
});
