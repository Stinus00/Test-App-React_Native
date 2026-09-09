import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { initialVideoSource, mediaItems, type MediaItem } from './media';

export function useMediaPlayback(cachedVideoSource?: string) {
  const player1 = useVideoPlayer(initialVideoSource, configurePlayer);
  const player2 = useVideoPlayer(null, configurePlayer);
  const [playlist, setPlaylist] = useState(mediaItems);
  const [currentPlayer, setCurrentPlayer] = useState(player1);
  const [currentMedia, setCurrentMedia] = useState<MediaItem>(playlist[0]);
  const activePlayerIndex = useRef(0);
  const currentMediaIndex = useRef(0);
  const playerMediaIndexes = useRef<(number | null)[]>([0, null]);
  const loadingMediaIndexes = useRef<(number | null)[]>([0, null]);
  const playerEnded = useRef([false, false]);
  const advancing = useRef(false);
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (currentMedia.type === 'video' && hasStartedPlayback) currentPlayer.play();
  }, [currentMedia, currentPlayer, hasStartedPlayback]);

  useEffect(() => {
    if (cachedVideoSource) {
      setPlaylist([...mediaItems, { type: 'video', source: cachedVideoSource }]);
    }
  }, [cachedVideoSource]);

  useEffect(() => {
    let disposed = false;
    const preload = async (player: typeof player1, mediaIndex: number | null) => {
      if (mediaIndex === null) return true;
      const playerIndex = player === player1 ? 0 : 1;
      if (playerMediaIndexes.current[playerIndex] === mediaIndex || loadingMediaIndexes.current[playerIndex] === mediaIndex) return true;
      loadingMediaIndexes.current[playerIndex] = mediaIndex;
      try {
        await player.replaceAsync(playlist[mediaIndex].source);
        if (disposed) return false;
        playerMediaIndexes.current[playerIndex] = mediaIndex;
        playerEnded.current[playerIndex] = false;
        return true;
      } catch {
        return false;
      } finally {
        if (loadingMediaIndexes.current[playerIndex] === mediaIndex) loadingMediaIndexes.current[playerIndex] = null;
      }
    };
    const findNextVideoIndex = (startIndex: number) => {
      for (let offset = 0; offset < playlist.length; offset += 1) {
        const index = (startIndex + offset) % playlist.length;
        if (playlist[index].type === 'video') return index;
      }
      return null;
    };
    const advance = async () => {
      if (advancing.current || disposed) return;
      advancing.current = true;
      const endedPlayerIndex = activePlayerIndex.current;
      playerEnded.current[endedPlayerIndex] = true;
      const nextMediaIndex = (currentMediaIndex.current + 1) % playlist.length;
      const nextMedia = playlist[nextMediaIndex];
      currentMediaIndex.current = nextMediaIndex;
      if (imageTimer.current) clearTimeout(imageTimer.current);
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
      if (!(await preload(nextPlayer, nextMediaIndex)) || disposed) {
        advancing.current = false;
        return;
      }
      if (playerEnded.current[nextPlayerIndex]) nextPlayer.replay();
      else nextPlayer.play();
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

    if (currentMedia.type === 'image') {
      imageTimer.current = setTimeout(advance, currentMedia.duration);
    }

    return () => {
      disposed = true;
      subscription.remove();
      subscription2.remove();
      if (imageTimer.current) clearTimeout(imageTimer.current);
    };
  }, [player1, player2, playlist]);

  return { currentPlayer, currentMedia, hasStartedPlayback, setHasStartedPlayback };
}

function configurePlayer(player: VideoPlayer) {
  player.muted = true;
  player.bufferOptions = {
    maxBufferBytes: 8 * 1024 * 1024,
    minBufferForPlayback: 1,
    preferredForwardBufferDuration: 8,
  };
}