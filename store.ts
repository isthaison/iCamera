
import { create } from 'zustand';
import { CameraMode, AspectRatio, CameraFilter, CapturedImage } from './types';

interface VisionResult {
  text?: string;
  objects?: string[];
  faces?: string;
  qr?: string;
  raw?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CameraState {
  images: CapturedImage[];
  mode: CameraMode;
  zoom: number;
  exposure: number;
  isCapturing: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  isBursting: boolean;
  burstCount: number;
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
  toasts: Toast[];
  
  // Location features
  locationEnabled: boolean;
  currentCoords: { lat: number; lng: number } | null;

  // Gemini AI features
  geminiApiKey: string;

  // Actions
  setMode: (mode: CameraMode) => void;
  setZoom: (zoom: number) => void;
  setExposure: (exposure: number) => void;
  setIsCapturing: (val: boolean) => void;
  setIsRecording: (val: boolean) => void;
  setIsAnalyzing: (val: boolean) => void;
  setIsBursting: (val: boolean) => void;
  setBurstCount: (val: number | ((prev: number) => number)) => void;
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
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  setLocationEnabled: (val: boolean) => void;
  setCurrentCoords: (coords: { lat: number; lng: number } | null) => void;
  setGeminiApiKey: (key: string) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  images: [],
  mode: CameraMode.PHOTO,
  zoom: 1,
  exposure: 0,
  isCapturing: false,
  isRecording: false,
  isAnalyzing: false,
  isBursting: false,
  burstCount: 0,
  visionResult: null,
  videoSeconds: 0,
  facingMode: 'environment',
  showGallery: false,
  torch: false,
  hdr: true,
  timer: 0,
  countdown: null,
  aspectRatio: '4:3',
  filter: 'None',
  showGrid: true,
  isSettingsOpen: false,
  toasts: [],
  locationEnabled: false,
  currentCoords: null,
  geminiApiKey: '',

  setMode: (mode) => set({ mode, aspectRatio: mode === CameraMode.SQUARE ? '1:1' : '4:3', visionResult: null, isSettingsOpen: false }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.5), 10) }),
  setExposure: (exposure) => set({ exposure }),
  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsBursting: (isBursting) => set({ isBursting, burstCount: isBursting ? 0 : 0 }),
  setBurstCount: (val) => set((state) => ({ burstCount: typeof val === 'function' ? val(state.burstCount) : val })),
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
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setLocationEnabled: (locationEnabled) => set({ locationEnabled }),
  setCurrentCoords: (currentCoords) => set({ currentCoords }),
  setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
}));
