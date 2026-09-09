import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { test, testWeb } from '../gather-files/get-new-files';
import { styles } from './media-player.styles';
import { useMediaPlayback } from './use-media-playback';

export function MediaPlayer() {
  const [cachedVideoSource, setCachedVideoSource] = useState<string>();

  useEffect(() => {
    void (Platform.OS === 'web' ? testWeb() : test()).then(setCachedVideoSource);
  }, []);

  const { currentPlayer, currentMedia, hasStartedPlayback, setHasStartedPlayback } = useMediaPlayback(cachedVideoSource);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const contentPlatformStyle = Platform.select({
    android: { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
    web: { paddingTop: 0 },
  });

  return (
    <ThemedView style={[{ backgroundColor: theme.background }, styles.containerView, styles.contentContainer, contentPlatformStyle]}>
      {currentMedia.type === 'image' ? (
        <Image source={currentMedia.source} contentFit="contain" style={styles.backgroundVideo} />
      ) : (
        <VideoView player={currentPlayer} nativeControls={false} playsInline contentFit="contain" style={styles.backgroundVideo} />
      )}
      {!hasStartedPlayback && (
        <Pressable accessibilityRole="button" onPress={() => setHasStartedPlayback(true)} style={styles.startPlaybackButton}>
          <Text style={styles.startPlaybackText}>Play videos</Text>
        </Pressable>
      )}
    </ThemedView>
  );
}