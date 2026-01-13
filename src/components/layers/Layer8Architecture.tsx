'use client';

import { motion } from 'motion/react';
import { FadeIn } from '@/components/ui';
import { ArchitectureDiagram } from '@/components/simulations/ArchitectureDiagram';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { BookOpen, Rocket } from 'lucide-react';

export function Layer8Architecture() {
  const isUnlocked = useProgressStore((state) => state.isUnlocked(8));
  const hydrated = useHydrated();

  if (!hydrated || !isUnlocked) {
    return null;
  }

  return (
    <section id="layer-8" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            The Full <span className="text-primary">Picture</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Now you understand how all the pieces fit together. Here&apos;s Docker&apos;s complete architecture.
          </p>
        </FadeIn>

        {/* Architecture diagram */}
        <FadeIn delay={0.2} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Docker Architecture
          </h3>
          <ArchitectureDiagram />
        </FadeIn>

        {/* What happens when you run */}
        <FadeIn delay={0.3} className="mb-16">
          <div className="bg-terminal rounded-xl p-6 border border-muted/30">
            <h4 className="font-mono text-lg text-text mb-4">
              What happens when you run <code className="text-primary">docker run nginx</code>?
            </h4>
            <ol className="space-y-3 text-sm">
              {[
                { step: 'CLI sends request to Docker daemon via REST API', color: 'primary' },
                { step: 'Daemon checks if image exists locally, pulls if needed', color: 'secondary' },
                { step: 'Daemon tells containerd to create a container', color: 'warning' },
                { step: 'containerd creates an OCI bundle and calls runc', color: 'warning' },
                { step: 'runc uses Linux namespaces & cgroups to create isolated process', color: 'danger' },
                { step: 'Container process starts, runc exits, containerd monitors', color: 'muted' },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono
                    ${item.color === 'primary' ? 'bg-primary/20 text-primary' :
                      item.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                      item.color === 'warning' ? 'bg-warning/20 text-warning' :
                      item.color === 'danger' ? 'bg-danger/20 text-danger' :
                      'bg-muted/20 text-muted'}`}>
                    {i + 1}
                  </span>
                  <span className="text-muted">{item.step}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </FadeIn>

        {/* Next steps */}
        <FadeIn delay={0.4}>
          <h4 className="font-mono text-lg text-text mb-4 text-center">Keep Learning</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl p-4 border border-muted/30">
              <BookOpen className="w-6 h-6 text-secondary mb-2" />
              <h5 className="font-mono text-text mb-1">Deep Dives</h5>
              <ul className="text-sm text-muted space-y-1">
                <li>• Kubernetes for orchestration at scale</li>
                <li>• Container security & hardening</li>
                <li>• Building minimal images with multi-stage builds</li>
              </ul>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-muted/30">
              <Rocket className="w-6 h-6 text-primary mb-2" />
              <h5 className="font-mono text-text mb-1">Hands-On Practice</h5>
              <ul className="text-sm text-muted space-y-1">
                <li>• Containerize your own application</li>
                <li>• Build a CI/CD pipeline with Docker</li>
                <li>• Try building a container from scratch with namespaces</li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
