import { create } from 'zustand';

interface LocationState {
  locationEnabled: boolean;
  currentCoords: { lat: number; lng: number } | null;

  setLocationEnabled: (val: boolean) => void;
  setCurrentCoords: (coords: { lat: number; lng: number } | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  locationEnabled: false,
  currentCoords: null,

  setLocationEnabled: (locationEnabled) => set({ locationEnabled }),
  setCurrentCoords: (currentCoords) => set({ currentCoords }),
}));