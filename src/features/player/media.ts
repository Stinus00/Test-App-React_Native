export type MediaItem =
  | { type: 'video'; source: number | string }
  | { type: 'image'; source: number; duration: number };

export const mediaItems: MediaItem[] = [
  { type: 'video', source: require('@/assets/videos/test2.mp4') },
  { type: 'image', source: require('@/assets/images/test-image-1.jpg'), duration: 5000 },
  { type: 'video', source: require('@/assets/videos/test3.mp4') },
  { type: 'video', source: require('@/assets/videos/test6.mp4') },
  { type: 'video', source: require('@/assets/videos/test1.mp4') },
  { type: 'image', source: require('@/assets/images/test-image-2.jpg'), duration: 5000 },
  { type: 'video', source: require('@/assets/videos/test8.mp4') },
  { type: 'image', source: require('@/assets/images/test-image-3.jpg'), duration: 20000 },
  { type: 'video', source: require('@/assets/videos/test9.mp4') },
  { type: 'video', source: require('@/assets/videos/test10.mp4') },
];

export const initialVideoSource = mediaItems[0].type === 'video' ? mediaItems[0].source : null;