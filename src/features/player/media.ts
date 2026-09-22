import type { VideoSource } from 'expo-video';
import { ImageSourcePropType } from "react-native";

export type MediaItem =
  | { type: 'video'; source: Exclude<VideoSource, null> }
  | { type: 'image'; source: ImageSourcePropType; duration: number };

export const testMediaUris = [
  'https://s3.eu-central-003.backblazeb2.com/production--remote-webapp/videos/2216cf33-3c86-4cdc-ad99-7138d011eed8/20231014_152040.mp4',
  'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/208445601-besneeuwde-lekkernijen-kerst-winter-achtergrond-met-sneeuwpop-en-wazig-bokeh-prettige-kerstdagen.jpg',
  'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/beertje.jpg',
  'https://s3.eu-central-003.backblazeb2.com/production--remote-webapp/videos/0a6fa960-66e4-4805-87a2-b592e530e0e9/VID%20Rotate270gr.mp4',
  'https://s3.eu-central-003.backblazeb2.com/production--remote-webapp/videos/1755a007-b452-47a8-9611-1dcbf4086a31/CDP_Huisstijl-introductie-video-1920x1080.mp4',
  'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/sample%207.png',
  'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/sample%206.png',
  'https://s3.eu-central-003.backblazeb2.com/production--remote-webapp/videos/2eba793b-f285-44bc-9e3e-767744386aeb/gymna-launch.mp4',
  'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/roy-tsong-W0haDrVTW58-unsplash.jpg',
  // 'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/f7274a459393cea97c688db8d6cc02210effb31fd386f5b993f3701747b4d55c.jpg',
  // 'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/dwlly-Ai19ZIc3G7I-unsplash.jpg',
];

const getMediaItem = (uri: string): MediaItem => {
  const isVideoUri = /\.(mp4|mov|m4v|webm|avi)$/i.test(uri);
  const imageTestCase = 'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/beertje.jpg';

  if(uri === 'https://s3.eu-central-003.backblazeb2.com/bcm-test-stijn/images/beertje.jpg') {
    return {
      type: 'image',
      source: { uri },
      duration: 20000.0,
    }; 
  }

  if (isVideoUri) {
    return { type: 'video', source: uri };
  }

  return {
    type: 'image',
    source: { uri },
    duration: 5000.0,
  };
};

export const mediaItems: MediaItem[] = testMediaUris.map(getMediaItem);

export const initialVideoSource = mediaItems.find((item) => item.type === 'video')?.source ?? null;