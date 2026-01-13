'use client';

import { motion } from 'motion/react';
import { useProgressStore, useHydrated, LAYERS, type LayerId } from '@/stores/progressStore';

export function ProgressBar() {
  const { unlockedLayers, currentLayer } = useProgressStore();
  const hydrated = useHydrated();
  const progress = (unlockedLayers.length / LAYERS.length) * 100;

  const scrollToSection = (layerId: LayerId) => {
    const element = document.getElementById(`layer-${layerId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="bg-surface/80 backdrop-blur-lg rounded-full px-6 py-3 border border-muted/30 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Layer dots */}
          {LAYERS.map((layer, index) => {
            const isUnlocked = unlockedLayers.includes(layer.id as LayerId);
            const isCurrent = currentLayer === layer.id;
            const isLast = index === LAYERS.length - 1;

            return (
              <div key={layer.id} className="flex items-center">
                {/* Dot */}
                <motion.button
                  onClick={() => isUnlocked && scrollToSection(layer.id as LayerId)}
                  className={`relative group ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  whileHover={isUnlocked ? { scale: 1.2 } : {}}
                  whileTap={isUnlocked ? { scale: 0.9 } : {}}
                >
                  {/* Glow effect for current */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* Dot itself */}
                  <motion.div
                    className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                      isUnlocked
                        ? isCurrent
                          ? 'bg-primary shadow-[0_0_12px_rgba(0,255,159,0.6)]'
                          : 'bg-primary/80'
                        : 'bg-muted/40 border border-muted/60'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05, type: 'spring' }}
                  />

                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <motion.div
                      className="bg-terminal px-3 py-2 rounded-lg whitespace-nowrap text-xs border border-muted/30 shadow-xl"
                      initial={{ y: -5 }}
                      whileInView={{ y: 0 }}
                    >
                      <span className={isUnlocked ? 'text-primary' : 'text-muted'}>
                        {layer.title}
                      </span>
                      {!isUnlocked && (
                        <span className="block text-muted/60 text-[10px] mt-0.5">Locked</span>
                      )}
                    </motion.div>
                    {/* Tooltip arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-terminal border-l border-t border-muted/30 rotate-45" />
                  </div>
                </motion.button>

                {/* Connector line */}
                {!isLast && (
                  <div className="relative w-6 h-0.5 mx-1">
                    <div className="absolute inset-0 bg-muted/30 rounded-full" />
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: unlockedLayers.includes((layer.id + 1) as LayerId) ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Progress percentage */}
          <motion.div
            className="ml-2 pl-3 border-l border-muted/30 text-xs font-mono tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="text-primary">{Math.round(progress)}</span>
            <span className="text-muted">%</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
