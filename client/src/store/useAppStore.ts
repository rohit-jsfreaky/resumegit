import { create } from 'zustand';
import { GitHubData, ResumeBullet, GenerateMode, AppState, AppError } from '../types';

interface AppStore {
  // State
  username: string;
  githubData: GitHubData | null;
  bullets: ResumeBullet[];
  editedBullets: Record<string, string>; // id -> edited text
  mode: GenerateMode;
  appState: AppState;
  error: AppError | null;
  
  // Actions
  setUsername: (username: string) => void;
  setGitHubData: (data: GitHubData | null) => void;
  setBullets: (bullets: ResumeBullet[]) => void;
  updateBulletText: (id: string, text: string) => void;
  setMode: (mode: GenerateMode) => void;
  setAppState: (state: AppState) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
  clearCache: () => void;
}

const initialState = {
  username: '',
  githubData: null,
  bullets: [],
  editedBullets: {},
  mode: 'standard' as GenerateMode,
  appState: 'idle' as AppState,
  error: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setUsername: (username) => set({ username }),
  
  setGitHubData: (data) => set({ githubData: data }),
  
  setBullets: (bullets) => set({ bullets, editedBullets: {} }),
  
  updateBulletText: (id, text) => set((state) => ({
    editedBullets: { ...state.editedBullets, [id]: text }
  })),
  
  setMode: (mode) => set({ mode }),
  
  setAppState: (appState) => set({ appState }),
  
  setError: (error) => set({ error, appState: error ? 'error' : 'idle' }),
  
  reset: () => set({ ...initialState }),
  
  clearCache: () => {
    // Clear all localStorage cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('resumegit:')) {
        localStorage.removeItem(key);
      }
    });
    set({ ...initialState });
  },
}));

// Helper to get the final bullet text (edited or original)
export const getBulletText = (bullet: ResumeBullet, editedBullets: Record<string, string>) => {
  return editedBullets[bullet.id] ?? bullet.text;
};
