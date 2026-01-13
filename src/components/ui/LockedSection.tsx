'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useProgressStore, LayerId } from '@/stores/progressStore';
import { Lock } from 'lucide-react';

interface LockedSectionProps {
  layerId: LayerId;
  children: React.ReactNode;
  className?: string;
}

export function LockedSection({ layerId, children, className = '' }: LockedSectionProps) {
  const isUnlocked = useProgressStore((state) => state.isUnlocked(layerId));

  return (
    <AnimatePresence mode="wait">
      {isUnlocked ? (
        <motion.div
          key="unlocked"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: 'auto',
            transition: {
              height: { type: 'spring', stiffness: 100, damping: 20 },
              opacity: { duration: 0.3, delay: 0.1 }
            }
          }}
          exit={{ opacity: 0, height: 0 }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="locked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`relative ${className}`}
        >
          {/* Blurred preview */}
          <div className="locked-blur opacity-30 pointer-events-none select-none">
            {children}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex flex-col items-center gap-3 bg-surface/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-muted/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Lock className="w-8 h-8 text-muted" />
              <span className="text-sm text-muted font-mono">
                Complete previous section to unlock
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
