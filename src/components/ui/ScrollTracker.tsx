'use client';

import { useEffect } from 'react';
import { useProgressStore, useHydrated, LAYERS, type LayerId } from '@/stores/progressStore';

export function ScrollTracker() {
  const { setCurrentLayer, unlockedLayers } = useProgressStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      // Find which section is currently in view
      for (let i = LAYERS.length - 1; i >= 0; i--) {
        const layer = LAYERS[i];
        const element = document.getElementById(`layer-${layer.id}`);

        if (element && unlockedLayers.includes(layer.id as LayerId)) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          if (scrollPosition >= elementTop) {
            setCurrentLayer(layer.id as LayerId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hydrated, setCurrentLayer, unlockedLayers]);

  return null;
}
