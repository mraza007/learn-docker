'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn } from '@/components/ui';
import { UnionFSVisualizer } from '@/components/simulations/UnionFSVisualizer';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { HardDrive, Database, FolderSync } from 'lucide-react';

export function Layer5Storage() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && isUnlocked(5)) {
      const timer = setTimeout(() => {
        unlockLayer(6);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer]);

  if (!hydrated || !isUnlocked(5)) {
    return null;
  }

  return (
    <section id="layer-5" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-text mb-4">
            <span className="text-primary">Storage</span> & Filesystems
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Union filesystems let containers share base layers while keeping their own changes separate.
          </p>
        </FadeIn>

        {/* Union FS explanation */}
        <FadeIn delay={0.2} className="mb-16">
          <div className="bg-surface rounded-xl p-8 border border-muted/30">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <HardDrive className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-mono text-text mb-3">Union Filesystems</h3>
                <p className="text-muted mb-4">
                  Docker uses a union filesystem (like OverlayFS) to stack image layers together.
                  Each layer is read-only. When a container writes data, it goes to a thin writable layer on top.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Database className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs text-muted">Images share layers</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <FolderSync className="w-5 h-5 mx-auto mb-1 text-secondary" />
                    <div className="text-xs text-muted">Copy-on-write</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <HardDrive className="w-5 h-5 mx-auto mb-1 text-warning" />
                    <div className="text-xs text-muted">Efficient storage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Interactive visualizer */}
        <FadeIn delay={0.3} className="mb-16">
          <h3 className="text-xl font-mono text-text mb-6 text-center">
            Try It: See How Changes Are Stored
          </h3>
          <UnionFSVisualizer />
        </FadeIn>

        {/* Volumes section */}
        <FadeIn delay={0.4} className="mb-16">
          <div className="bg-terminal rounded-xl p-6 border border-muted/30">
            <h4 className="font-mono text-lg text-text mb-4">Persisting Data with Volumes</h4>
            <p className="text-sm text-muted mb-4">
              Container writable layers are ephemeral—they disappear when the container is removed.
              For persistent data, use <span className="text-primary">volumes</span>:
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-background rounded p-3">
                <span className="text-muted"># Named volume (Docker manages location)</span>
                <br />
                <span className="text-primary">docker run -v mydata:/app/data myapp</span>
              </div>
              <div className="bg-background rounded p-3">
                <span className="text-muted"># Bind mount (specific host path)</span>
                <br />
                <span className="text-primary">docker run -v /host/path:/container/path myapp</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Key takeaway */}
        <FadeIn delay={0.5}>
          <div className="text-center text-sm text-muted">
            <p>Volumes exist outside the container lifecycle and can be shared between containers.</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
