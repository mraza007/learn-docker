'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn } from '@/components/ui';
import { NetworkVisualizer } from '@/components/simulations/NetworkVisualizer';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Network, Link, Shield } from 'lucide-react';

export function Layer6Networking() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && isUnlocked(6)) {
      const timer = setTimeout(() => {
        unlockLayer(7);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer]);

  if (!hydrated || !isUnlocked(6)) {
    return null;
  }

  return (
    <section id="layer-6" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            Container <span className="text-primary">Networking</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Docker creates virtual networks so containers can communicate with each other and the outside world.
          </p>
        </FadeIn>

        {/* Network modes explanation */}
        <FadeIn delay={0.2} className="mb-16">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-xl p-6 border border-primary/30">
              <Network className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-mono text-text mb-2">Bridge</h3>
              <p className="text-sm text-muted">
                Default mode. Containers get their own IP on a virtual network. Use port mapping to expose services.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-secondary/30">
              <Link className="w-8 h-8 text-secondary mb-3" />
              <h3 className="font-mono text-text mb-2">Host</h3>
              <p className="text-sm text-muted">
                Container shares the host&apos;s network stack directly. No isolation, but no NAT overhead.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-muted/30">
              <Shield className="w-8 h-8 text-muted mb-3" />
              <h3 className="font-mono text-text mb-2">None</h3>
              <p className="text-sm text-muted">
                Complete network isolation. Container has no external connectivity at all.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Interactive visualizer */}
        <FadeIn delay={0.3} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Explore: Network Modes
          </h3>
          <NetworkVisualizer />
        </FadeIn>

        {/* Container-to-container communication */}
        <FadeIn delay={0.4}>
          <div className="bg-terminal rounded-xl p-6 border border-muted/30">
            <h4 className="font-mono text-lg text-text mb-4">Container-to-Container Communication</h4>
            <p className="text-sm text-muted mb-4">
              Containers on the same network can reach each other by container name:
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-background rounded p-3">
                <span className="text-muted"># Create a custom network</span>
                <br />
                <span className="text-primary">docker network create myapp</span>
              </div>
              <div className="bg-background rounded p-3">
                <span className="text-muted"># Run containers on the network</span>
                <br />
                <span className="text-primary">docker run --network myapp --name db postgres</span>
                <br />
                <span className="text-primary">docker run --network myapp --name web myapp</span>
              </div>
              <div className="bg-background rounded p-3">
                <span className="text-muted"># web can now reach db by name</span>
                <br />
                <span className="text-secondary">postgres://db:5432/mydb</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
