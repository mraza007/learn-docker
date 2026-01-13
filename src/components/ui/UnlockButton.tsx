'use client';

import { motion } from 'motion/react';
import { useProgressStore, LayerId } from '@/stores/progressStore';
import { ChevronDown } from 'lucide-react';

interface UnlockButtonProps {
  nextLayer: LayerId;
  label?: string;
  className?: string;
}

export function UnlockButton({ nextLayer, label = "Continue", className = '' }: UnlockButtonProps) {
  const unlockLayer = useProgressStore((state) => state.unlockLayer);

  const handleUnlock = () => {
    unlockLayer(nextLayer);

    // Scroll to the newly unlocked section after a brief delay
    setTimeout(() => {
      const element = document.getElementById(`layer-${nextLayer}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <motion.button
      onClick={handleUnlock}
      className={`group flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/50
        rounded-lg text-primary font-mono text-sm hover:bg-primary/20 hover:border-primary
        transition-colors ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
      <motion.span
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="w-4 h-4" />
      </motion.span>
    </motion.button>
  );
}
