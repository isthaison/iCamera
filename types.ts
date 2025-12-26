
export interface CapturedImage {
  id: string;
  url: string;
  timestamp: number;
}

export enum CameraMode {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  SQUARE = 'SQUARE'
}

export interface CameraCapabilities {
  zoom?: { min: number; max: number; step: number };
  torch?: boolean;
  focusMode?: string[];
}
