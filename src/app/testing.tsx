import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useEffect, useState } from 'react';

export default function Testing() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  let index = 0;
  let images = [[require("@/assets/images/expo-badge.png"), 5000],
      [require("@/assets/images/react-logo.png"), 3000],
      [require("@/assets/images/splash-icon.png"), 2000]]
  let [currentImage, setCurrentImage] = useState(images[0])

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

const setImage = (i: any[]) => {
    setCurrentImage(i[0])
    }

useEffect(() => {
    let timeout: number | null | undefined;
    const switchImage = () => {
        if(images.length > 0) {
            if(index < images.length - 1) {
                index += 1
                setImage(images[index])
            } else {
                index = 0
                setImage(images[0])
            }
        }

        timeout = setTimeout(switchImage, images[index][1])
    }
    switchImage()
    return () => {
        clearTimeout(timeout)
        }
}, [])

  return (
    <ThemedView
      style={[{ backgroundColor: theme.backgroundColor}, styles.containerView]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
              <Image source={currentImage} style={styles.fullView} />
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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
});
