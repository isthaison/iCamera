import { create } from 'zustand';
import { CapturedImage } from '../types';

interface GalleryState {
  images: CapturedImage[];
  showGallery: boolean;

  setShowGallery: (val: boolean) => void;
  addImage: (img: CapturedImage) => void;
  deleteImage: (id: string) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  images: [],
  showGallery: false,

  setShowGallery: (showGallery) => set({ showGallery }),
  addImage: (img) => set((state) => ({ images: [img, ...state.images] })),
  deleteImage: (id) => set((state) => ({ images: state.images.filter(i => i.id !== id) })),
}));