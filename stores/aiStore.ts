import { create } from 'zustand';

interface AIState {
  geminiApiKey: string;

  setGeminiApiKey: (key: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  geminiApiKey: '',

  setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
}));