import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

export type LayerId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface ProgressState {
  unlockedLayers: LayerId[];
  currentLayer: LayerId;
  unlockLayer: (layer: LayerId) => void;
  setCurrentLayer: (layer: LayerId) => void;
  isUnlocked: (layer: LayerId) => boolean;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      unlockedLayers: [0, 1, 2, 3, 4, 5, 6, 7, 8], // All layers unlocked - users can scroll freely
      currentLayer: 0,

      unlockLayer: (layer: LayerId) => {
        const { unlockedLayers } = get();
        if (!unlockedLayers.includes(layer)) {
          set({
            unlockedLayers: [...unlockedLayers, layer].sort((a, b) => a - b),
            currentLayer: layer,
          });
        }
      },

      setCurrentLayer: (layer: LayerId) => {
        const { unlockedLayers } = get();
        if (unlockedLayers.includes(layer)) {
          set({ currentLayer: layer });
        }
      },

      isUnlocked: (layer: LayerId) => {
        return get().unlockedLayers.includes(layer);
      },

      resetProgress: () => {
        set({
          unlockedLayers: [0],
          currentLayer: 0,
        });
      },
    }),
    {
      name: 'docker-tutorial-progress',
      version: 2,
      migrate: () => ({
        unlockedLayers: [0, 1, 2, 3, 4, 5, 6, 7, 8] as LayerId[],
        currentLayer: 0 as LayerId,
      }),
    }
  )
);

// Hook to handle hydration - returns false during SSR, then actual state after mount
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

// Layer metadata
export const LAYERS = [
  { id: 0, title: "The Problem", description: "Why containers exist" },
  { id: 1, title: "Container Basics", description: "What is a container vs VM" },
  { id: 2, title: "Images & Layers", description: "How images are built" },
  { id: 3, title: "Isolation", description: "Namespaces explained" },
  { id: 4, title: "Resource Control", description: "Cgroups and limits" },
  { id: 5, title: "Storage", description: "Union filesystems and volumes" },
  { id: 6, title: "Networking", description: "Container communication" },
  { id: 7, title: "Orchestration", description: "Multi-container apps" },
  { id: 8, title: "The Full Picture", description: "Docker architecture" },
] as const;
