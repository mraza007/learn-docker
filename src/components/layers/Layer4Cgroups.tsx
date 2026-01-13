'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn } from '@/components/ui';
import { CgroupsSimulator } from '@/components/simulations/CgroupsSimulator';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Gauge, AlertTriangle } from 'lucide-react';

export function Layer4Cgroups() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && isUnlocked(4)) {
      const timer = setTimeout(() => {
        unlockLayer(5);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer]);

  if (!hydrated || !isUnlocked(4)) {
    return null;
  }

  return (
    <section id="layer-4" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            Resource <span className="text-primary">Control</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Cgroups (control groups) limit how much CPU, memory, and I/O a container can use.
          </p>
        </FadeIn>

        {/* Explanation */}
        <FadeIn delay={0.2} className="mb-16">
          <div className="bg-surface rounded-xl p-8 border border-muted/30">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-warning/20 rounded-xl flex items-center justify-center">
                  <Gauge className="w-8 h-8 text-warning" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-mono text-text mb-3">Why Limit Resources?</h3>
                <p className="text-muted mb-4">
                  Without limits, a single container could consume all system resources and starve others.
                  Cgroups enforce fair sharing and prevent &quot;noisy neighbor&quot; problems.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="font-mono text-warning text-sm">CPU</div>
                    <div className="text-xs text-muted">Throttled when over limit</div>
                  </div>
                  <div className="bg-background rounded-lg p-3">
                    <div className="font-mono text-danger text-sm">Memory</div>
                    <div className="text-xs text-muted">OOM killed when exceeded</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Interactive simulator */}
        <FadeIn delay={0.3} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Try It: Set Resource Limits
          </h3>
          <CgroupsSimulator />
        </FadeIn>

        {/* Warning callout */}
        <FadeIn delay={0.4}>
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="text-danger font-mono">Important:</span>
              <span className="text-muted"> Memory limits are hard limits. If a container exceeds its memory limit,
              the kernel&apos;s OOM killer terminates it immediately. Always set limits with some headroom!</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
