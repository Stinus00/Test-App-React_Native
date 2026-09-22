import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './media-player.styles';
import { useMediaPlayback } from './use-media-playback';

export function MediaPlayer() {
  const [cachedVideoSource, setCachedVideoSource] = useState<string>();
  // useEffect(() => {
  //   void (Platform.OS === 'web' ? testWeb() : test()).then(setCachedVideoSource);
  // }, []);

  // downloadFile('https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/208445601-besneeuwde-lekkernijen-kerst-winter-achtergrond-met-sneeuwpop-en-wazig-bokeh-prettige-kerstdagen.jpg');

  const { currentPlayer, currentMedia, hasStartedPlayback, setHasStartedPlayback } = useMediaPlayback(cachedVideoSource);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const contentPlatformStyle = Platform.select({
    android: { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
    web: { paddingTop: 0 },
  });

  return (
    <ThemedView style={[{ backgroundColor: '#0ADD08' }, styles.containerView, styles.contentContainer, contentPlatformStyle]}>
      {currentMedia.type === 'image' ? (
        <Image key={currentMedia.source.toString()} source={currentMedia.source} contentFit="contain" style={styles.backgroundVideo} />
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