import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

const videoSources = [
  require('@/assets/videos/test2.mp4'),
  require('@/assets/videos/test3.mp4'),
  require('@/assets/videos/test1.mp4'),
  require('@/assets/videos/test.mp4'),
];

export default function Testing2() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const player1 = useVideoPlayer(videoSources[0], (player) => {
    player.muted = true;
    player.play();
  });
  const player2 = useVideoPlayer(videoSources[1], (player) => {
    player.muted = true;
  });

  const [currentPlayer, setCurrentPlayer] = useState(player1);
  const nextVideoIndex = useRef(2);

  useEffect(() => {
    currentPlayer.play();
  }, [currentPlayer]);

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
    const subscription = player1.addListener('playToEnd', () => {
      player1.pause();
      player2.play();
      player1.replaceAsync(videoSources[nextVideoIndex.current]);
      nextVideoIndex.current = (nextVideoIndex.current + 1) % videoSources.length;
      setCurrentPlayer(player2);
    });

    const subscription2 = player2.addListener('playToEnd', () => {
      player2.pause();
      player1.play();
      player2.replaceAsync(videoSources[nextVideoIndex.current]);
      nextVideoIndex.current = (nextVideoIndex.current + 1) % videoSources.length;
      setCurrentPlayer(player1);
    });

    return () => {
      subscription.remove();
      subscription2.remove();
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
        <VideoView
          player={currentPlayer}
          nativeControls={false}
          playsInline
          contentFit="contain"
          style={styles.backgroundVideo}
        />
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
