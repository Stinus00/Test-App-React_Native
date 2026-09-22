import { useVideoPlayer, type VideoPlayer, type VideoSource } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { downloadFile } from '../gather-files/get-new-files';
import { initialVideoSource, mediaItems, testMediaUris, type MediaItem } from './media';

export function useMediaPlayback(cachedVideoSource?: string) {
  const player1 = useVideoPlayer(initialVideoSource, configurePlayer);
  const player2 = useVideoPlayer(null, configurePlayer);

  const [playlist, setPlaylist] = useState(mediaItems);

  const [currentPlayer, setCurrentPlayer] = useState(player1);
  const [currentMedia, setCurrentMedia] = useState<MediaItem>(playlist[0] ?? null as never);

  const activePlayerIndex = useRef(0);
  const currentMediaIndex = useRef(0);
  const playerMediaIndexes = useRef<(number | null)[]>([0, null]);
  const loadingMediaIndexes = useRef<(number | null)[]>([0, null]);
  const preloadGenerations = useRef([0, 0]);
  const preloadPromises = useRef<(Promise<boolean> | null)[]>([null, null]);


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
    if (Platform.OS === 'web') return;

    let cancelled = false;
    void Promise.all(testMediaUris.map(async (remoteUri) => ({
      remoteUri,
      localUri: await downloadFile(remoteUri),
    }))).then((downloads) => {
      if (cancelled) return;

      setPlaylist((currentPlaylist) => currentPlaylist.map((media) => {
        const source = media.type === 'image' ? media.source : null;
        if (
          media.type !== 'image' ||
          typeof source !== 'object' ||
          source === null ||
          Array.isArray(source) ||
          !('uri' in source) ||
          typeof source.uri !== 'string'
        ) {
          return media;
        }

        const download = downloads.find(({ remoteUri }) => remoteUri === source.uri);
        return download?.localUri ? { ...media, source: { uri: download.localUri } } : media;
      }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    
    const preload = async (
      player: VideoPlayer,
      mediaIndex: number | null,
    ) => {
      if (mediaIndex === null) return false;

      const playerIndex = player === player1 ? 0 : 1;

      if (playerMediaIndexes.current[playerIndex] === mediaIndex) {
        return true;
      }

      const existing = preloadPromises.current[playerIndex];

      if (existing) {
        return existing;
      }

      const generation = ++preloadGenerations.current[playerIndex];

      const promise = (async () => {
        try {
          const media = playlist[mediaIndex];

          if (media.type !== 'video') {
            return false;
          }

          await player.replaceAsync(media.source as VideoSource);

          if (
            disposed ||
            generation !== preloadGenerations.current[playerIndex]
          ) {
            return false;
          }

          playerMediaIndexes.current[playerIndex] = mediaIndex;
          playerEnded.current[playerIndex] = false;

          return true;
        } catch {
          return false;
        }
      })();

      preloadPromises.current[playerIndex] = promise;

      promise.finally(() => {
        if (preloadPromises.current[playerIndex] === promise) {
          preloadPromises.current[playerIndex] = null;
        }
      });

      return promise;
    };

    const findNextVideoIndex = (startIndex: number) => {
      for (let offset = 0; offset < playlist.length; offset += 1) {
        const index = (startIndex + offset) % playlist.length;
        if (playlist[index].type === 'video') return index;
      }
      return null;
    };

    const releaseVideoPlayers = async () => {
      preloadGenerations.current[0] += 1;
      preloadGenerations.current[1] += 1;
      await Promise.all([
        player1.replaceAsync(null),
        player2.replaceAsync(null),
      ]);
      playerMediaIndexes.current = [null, null];
      playerEnded.current = [false, false];
    };

    const advance = async () => {
      if (advancing.current || disposed) return;
      advancing.current = true;

      const endedPlayerIndex = activePlayerIndex.current;
      playerEnded.current[endedPlayerIndex] = true;

      const nextMediaIndex = (currentMediaIndex.current + 1) % playlist.length;
      const nextMedia = playlist[nextMediaIndex];
      currentMediaIndex.current = nextMediaIndex;

      if (imageTimer.current) 
        clearTimeout(imageTimer.current);

      const activePlayer = endedPlayerIndex === 0 ? player1 : player2;
      activePlayer.pause();

      if (nextMedia.type === 'image') {
        // const inactivePlayer = endedPlayerIndex === 0 ? player2 : player1;
        // inactivePlayer.pause();
        await releaseVideoPlayers();
        setCurrentMedia(nextMedia);
        if (playlist[nextMediaIndex + 1].type === 'video') {
          void preload(activePlayer, findNextVideoIndex(nextMediaIndex + 1));
        }
        imageTimer.current = setTimeout(advance, nextMedia.duration);
        advancing.current = false;
        return;
      }

      const nextPlayerIndex = endedPlayerIndex === 0 ? 1 : 0;
      const nextPlayer = nextPlayerIndex === 0 ? player1 : player2;

      if (!(await preload(nextPlayer, nextMediaIndex)) || disposed) {
        advancing.current = false;
        return;
      }

      if (playerEnded.current[nextPlayerIndex]) 
        nextPlayer.replay();
      else 
        nextPlayer.play();
      playerEnded.current[nextPlayerIndex] = false;
      activePlayerIndex.current = nextPlayerIndex;

      setCurrentPlayer(nextPlayer);
      setCurrentMedia(nextMedia);

      if (playlist[nextMediaIndex + 1].type === 'video') {
          void preload(activePlayer, findNextVideoIndex(nextMediaIndex + 1));
      }
      advancing.current = false;
    };

    const subscription = player1.addListener('playToEnd', advance);
    const subscription2 = player2.addListener('playToEnd', advance);

    if (currentMedia.type === 'image') {
      void releaseVideoPlayers();
      imageTimer.current = setTimeout(advance, currentMedia.duration);
    } else {
      void preload(player2, findNextVideoIndex(1));
    }

    return () => {
      disposed = true;
      preloadGenerations.current[0] += 1;
      preloadGenerations.current[1] += 1;
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
    minBufferForPlayback: 1,
    preferredForwardBufferDuration: 12,
  };
}