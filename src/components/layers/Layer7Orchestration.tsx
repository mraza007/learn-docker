'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn } from '@/components/ui';
import { ComposeVisualizer } from '@/components/simulations/ComposeVisualizer';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Boxes, FileCode, Rocket } from 'lucide-react';

export function Layer7Orchestration() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && isUnlocked(7)) {
      const timer = setTimeout(() => {
        unlockLayer(8);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer]);

  if (!hydrated || !isUnlocked(7)) {
    return null;
  }

  return (
    <section id="layer-7" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            <span className="text-primary">Orchestration</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Real applications have multiple services. Docker Compose lets you define and run multi-container apps.
          </p>
        </FadeIn>

        {/* Why Compose */}
        <FadeIn delay={0.2} className="mb-16">
          <div className="bg-surface rounded-xl p-8 border border-muted/30">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Boxes className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-mono text-text mb-3">Why Docker Compose?</h3>
                <p className="text-muted mb-4">
                  Instead of running multiple <code className="text-secondary">docker run</code> commands with
                  complex options, define everything in a single YAML file. One command starts your entire stack.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <FileCode className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs text-muted">Declarative config</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Boxes className="w-5 h-5 mx-auto mb-1 text-secondary" />
                    <div className="text-xs text-muted">Multi-container</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Rocket className="w-5 h-5 mx-auto mb-1 text-warning" />
                    <div className="text-xs text-muted">One command</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Interactive compose */}
        <FadeIn delay={0.3} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Try It: Multi-Container App
          </h3>
          <ComposeVisualizer />
        </FadeIn>

        {/* Key features */}
        <FadeIn delay={0.4}>
          <div className="bg-terminal rounded-xl p-6 border border-muted/30">
            <h4 className="font-mono text-lg text-text mb-4">Compose Features</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-primary font-mono">depends_on</span>
                <p className="text-muted">Start services in the right order</p>
              </div>
              <div>
                <span className="text-primary font-mono">volumes</span>
                <p className="text-muted">Persist data and share between services</p>
              </div>
              <div>
                <span className="text-primary font-mono">networks</span>
                <p className="text-muted">Isolated communication between services</p>
              </div>
              <div>
                <span className="text-primary font-mono">environment</span>
                <p className="text-muted">Configure services with env variables</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
