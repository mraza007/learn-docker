'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { FadeIn } from '@/components/ui';
import { ContainerVsVM } from '@/components/simulations/ContainerVsVM';
import { InteractiveDockerRun } from '@/components/simulations/InteractiveDockerRun';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Package } from 'lucide-react';

export function Layer1Basics() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDockerRunComplete = () => {
    // Unlock next layer after the journey completes
    setTimeout(() => {
      unlockLayer(2);
    }, 1000);
  };

  // Animate the shipping container on mount
  useEffect(() => {
    if (!hydrated || !isUnlocked(1)) return;

    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        translateY: [0, -8, 0],
        duration: 2000,
        easing: 'easeInOutSine',
        loop: true,
      });
    }
  }, [hydrated, isUnlocked]);

  // Don't render if not unlocked or not hydrated
  if (!hydrated || !isUnlocked(1)) {
    return null;
  }

  return (
    <section id="layer-1" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            Container <span className="text-primary">Basics</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            A container packages your app with everything it needs to run.
          </p>
        </FadeIn>

        {/* Shipping container metaphor */}
        <FadeIn delay={0.2} className="mb-16">
          <div className="bg-surface rounded-xl p-8 border border-muted/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div
                  ref={containerRef}
                  className="w-32 h-24 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-primary/30 transition-colors"
                >
                  <Package className="w-12 h-12 text-primary" />
                  <div className="absolute -bottom-3 w-full h-2 bg-secondary/30 rounded-full blur-sm" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-mono text-text mb-2">
                  Think: Shipping Container
                </h3>
                <p className="text-muted">
                  Just like a shipping container holds everything needed for transport—
                  regardless of what ship carries it—a Docker container holds your app,
                  dependencies, and configuration. <span className="text-primary">Same container,
                  runs anywhere.</span>
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Container vs VM comparison */}
        <FadeIn delay={0.3} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Build Your Stack: VMs vs Containers
          </h3>
          <ContainerVsVM />
        </FadeIn>

        {/* Interactive Docker Run */}
        <FadeIn delay={0.4} className="mb-8">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Your First Container
          </h3>
          <InteractiveDockerRun onComplete={handleDockerRunComplete} />
        </FadeIn>
      </div>
    </section>
  );
}
