import { MediaPlayer } from '@/features/player/media-player';
import { useKeepAwake } from 'expo-keep-awake';

export default function Index() {
  useKeepAwake();

  return (
      <MediaPlayer />
  );
  
}
