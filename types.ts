
export interface CapturedImage {
  id: string;
  url: string;
  timestamp: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export enum CameraMode {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  SQUARE = 'SQUARE',
  PORTRAIT = 'PORTRAIT',
  NIGHT = 'NIGHT',
  VISION = 'VISION',
  TIMELAPSE = 'TIMELAPSE',
  SLOW_MOTION = 'SLOW_MOTION'
}

export type AspectRatio = '4:3' | '16:9' | '1:1';

export type CameraFilter = 'None' | 'Vivid' | 'Noir' | 'Silvertone' | 'Dramatic';

export interface CameraSettings {
  flash: boolean;
  hdr: boolean;
  grid: boolean;
  timer: 0 | 3 | 10;
  aspectRatio: AspectRatio;
  filter: CameraFilter;
  proRaw: boolean;
}
