'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { FadeIn } from '@/components/ui';
import { NamespaceExplorer } from '@/components/simulations/NamespaceExplorer';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Shield } from 'lucide-react';

export function Layer3Isolation() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();
  const headerRef = useRef<HTMLDivElement>(null);

  // Auto-unlock Layer 4 after viewing this layer
  useEffect(() => {
    if (hydrated && isUnlocked(3)) {
      const timer = setTimeout(() => {
        unlockLayer(4);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer]);

  // Animate header
  useEffect(() => {
    if (hydrated && isUnlocked(3) && headerRef.current) {
      anime({
        targets: headerRef.current.querySelectorAll('.animate-item'),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutExpo',
      });
    }
  }, [hydrated, isUnlocked]);

  if (!hydrated || !isUnlocked(3)) {
    return null;
  }

  return (
    <section id="layer-3" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="animate-item opacity-0 text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            <span className="text-primary">Isolation</span> with Namespaces
          </h2>
          <p className="animate-item opacity-0 text-muted text-lg max-w-2xl mx-auto">
            Linux namespaces are the magic behind container isolation. They make containers
            think they&apos;re alone on the system.
          </p>
        </div>

        {/* Quick intro - the 4 main namespaces */}
        <FadeIn className="mb-12">
          <div className="bg-surface rounded-xl p-6 border border-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono text-text">What are Namespaces?</h3>
                <p className="text-xs text-muted">
                  Each namespace type isolates a different system resource
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'PID', desc: 'Process IDs', detail: 'Container sees only its processes' },
                { name: 'NET', desc: 'Network', detail: 'Own IP address & ports' },
                { name: 'MNT', desc: 'Filesystem', detail: 'Isolated root directory' },
                { name: 'USER', desc: 'Users', detail: 'Root in container ≠ root on host' },
              ].map((ns) => (
                <div key={ns.name} className="bg-background rounded-lg p-3 text-center">
                  <div className="font-mono text-primary text-sm font-bold">{ns.name}</div>
                  <div className="text-xs text-text">{ns.desc}</div>
                  <div className="text-[10px] text-muted mt-1">{ns.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Interactive namespace explorer */}
        <FadeIn delay={0.2} className="mb-12">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Explore: Same Command, Different World
          </h3>
          <NamespaceExplorer />
        </FadeIn>

        {/* Additional namespaces */}
        <FadeIn delay={0.3}>
          <div className="text-center text-sm text-muted">
            <p>Linux also provides IPC, UTS, and Cgroup namespaces for complete isolation.</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
