import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  containerView: { flex: 1, width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backgroundVideo: { flex: 1, width: '100%', height: '100%' },
  startPlaybackButton: {
    position: 'absolute',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#000000cc',
  },
  startPlaybackText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});