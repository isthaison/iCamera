import { create } from 'zustand';
import { CameraMode, AspectRatio, CameraFilter } from '../types';

interface CameraSettingsState {
  mode: CameraMode;
  zoom: number;
  exposure: number;
  facingMode: 'user' | 'environment';
  torch: boolean;
  hdr: boolean;
  timer: 0 | 3 | 10;
  countdown: number | null;
  aspectRatio: AspectRatio;
  filter: CameraFilter;
  showGrid: boolean;

  setMode: (mode: CameraMode) => void;
  setZoom: (zoom: number) => void;
  setExposure: (exposure: number) => void;
  toggleFacingMode: () => void;
  setTorch: (val: boolean) => void;
  setHdr: (val: boolean) => void;
  setTimer: (val: 0 | 3 | 10) => void;
  setCountdown: (val: number | null) => void;
  setAspectRatio: (val: AspectRatio) => void;
  setFilter: (val: CameraFilter) => void;
  setShowGrid: (val: boolean) => void;
}

export const useCameraSettingsStore = create<CameraSettingsState>((set) => ({
  mode: CameraMode.PHOTO,
  zoom: 1,
  exposure: 0,
  facingMode: 'environment',
  torch: false,
  hdr: true,
  timer: 0,
  countdown: null,
  aspectRatio: '4:3',
  filter: 'None',
  showGrid: true,

  setMode: (mode) => set({ mode, aspectRatio: mode === CameraMode.SQUARE ? '1:1' : '4:3' }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.5), 10) }),
  setExposure: (exposure) => set({ exposure }),
  toggleFacingMode: () => set((state) => ({
    facingMode: state.facingMode === 'environment' ? 'user' : 'environment',
    torch: false,
    zoom: 1,
    exposure: 0
  })),
  setTorch: (torch) => set({ torch }),
  setHdr: (hdr) => set({ hdr }),
  setTimer: (timer) => set({ timer }),
  setCountdown: (countdown) => set({ countdown }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setFilter: (filter) => set({ filter }),
  setShowGrid: (showGrid) => set({ showGrid }),
}));