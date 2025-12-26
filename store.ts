
import { create } from 'https://esm.sh/zustand';
import { CameraMode, AspectRatio, CameraFilter, CapturedImage } from './types';

interface VisionResult {
  text?: string;
  objects?: string[];
  faces?: string;
  qr?: string;
  raw?: string;
}

interface CameraState {
  images: CapturedImage[];
  mode: CameraMode;
  zoom: number;
  exposure: number;
  isCapturing: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  visionResult: VisionResult | null;
  videoSeconds: number;
  facingMode: 'user' | 'environment';
  showGallery: boolean;
  torch: boolean;
  hdr: boolean;
  timer: 0 | 3 | 10;
  countdown: number | null;
  aspectRatio: AspectRatio;
  filter: CameraFilter;
  showGrid: boolean;
  isSettingsOpen: boolean;

  // Actions
  setMode: (mode: CameraMode) => void;
  setZoom: (zoom: number) => void;
  setExposure: (exposure: number) => void;
  setIsCapturing: (val: boolean) => void;
  setIsRecording: (val: boolean) => void;
  setIsAnalyzing: (val: boolean) => void;
  setVisionResult: (res: VisionResult | null) => void;
  incrementVideoSeconds: () => void;
  resetVideoSeconds: () => void;
  toggleFacingMode: () => void;
  setShowGallery: (val: boolean) => void;
  setTorch: (val: boolean) => void;
  setHdr: (val: boolean) => void;
  setTimer: (val: 0 | 3 | 10) => void;
  setCountdown: (val: number | null) => void;
  setAspectRatio: (val: AspectRatio) => void;
  setFilter: (val: CameraFilter) => void;
  setShowGrid: (val: boolean) => void;
  setIsSettingsOpen: (val: boolean) => void;
  addImage: (img: CapturedImage) => void;
  deleteImage: (id: string) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  images: [],
  mode: CameraMode.PHOTO,
  zoom: 1,
  exposure: 0,
  isCapturing: false,
  isRecording: false,
  isAnalyzing: false,
  visionResult: null,
  videoSeconds: 0,
  facingMode: 'environment',
  showGallery: false,
  torch: false,
  hdr: false,
  timer: 0,
  countdown: null,
  aspectRatio: '4:3',
  filter: 'None',
  showGrid: true,
  isSettingsOpen: false,

  setMode: (mode) => set({ mode, aspectRatio: mode === CameraMode.SQUARE ? '1:1' : '4:3', visionResult: null }),
  setZoom: (zoom) => set({ zoom }),
  setExposure: (exposure) => set({ exposure }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setVisionResult: (visionResult) => set({ visionResult }),
  incrementVideoSeconds: () => set((state) => ({ videoSeconds: state.videoSeconds + 1 })),
  resetVideoSeconds: () => set({ videoSeconds: 0 }),
  toggleFacingMode: () => set((state) => ({ 
    facingMode: state.facingMode === 'environment' ? 'user' : 'environment',
    torch: false,
    zoom: 1,
    exposure: 0
  })),
  setShowGallery: (showGallery) => set({ showGallery }),
  setTorch: (torch) => set({ torch }),
  setHdr: (hdr) => set({ hdr }),
  setTimer: (timer) => set({ timer }),
  setCountdown: (countdown) => set({ countdown }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setFilter: (filter) => set({ filter }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  addImage: (img) => set((state) => ({ images: [img, ...state.images] })),
  deleteImage: (id) => set((state) => ({ images: state.images.filter(i => i.id !== id) })),
}));
