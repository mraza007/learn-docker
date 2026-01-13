'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { FadeIn } from '@/components/ui';
import { InteractiveLayerBuilder } from '@/components/simulations/InteractiveLayerBuilder';
import { LayerCaching } from '@/components/simulations/LayerCaching';
import { LayerSharingVisualizer } from '@/components/simulations/LayerSharingVisualizer';
import { useProgressStore, useHydrated } from '@/stores/progressStore';
import { Layers, ChevronDown } from 'lucide-react';

type ActiveSection = 'builder' | 'cache' | 'sharing';

export function Layer2Images() {
  const { isUnlocked, unlockLayer } = useProgressStore();
  const hydrated = useHydrated();
  const [activeSection, setActiveSection] = useState<ActiveSection>('builder');
  const [sectionsCompleted, setSectionsCompleted] = useState({
    builder: false,
    cache: false,
    sharing: false,
  });

  const headerRef = useRef<HTMLDivElement>(null);

  // Auto-unlock Layer 3 after completing all sections or after a delay
  useEffect(() => {
    if (hydrated && isUnlocked(2)) {
      const allCompleted = Object.values(sectionsCompleted).every(v => v);
      const delay = allCompleted ? 1000 : 10000;

      const timer = setTimeout(() => {
        unlockLayer(3);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [hydrated, isUnlocked, unlockLayer, sectionsCompleted]);

  // Animate header on mount
  useEffect(() => {
    if (hydrated && isUnlocked(2) && headerRef.current) {
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

  // Don't render if not unlocked or not hydrated
  if (!hydrated || !isUnlocked(2)) {
    return null;
  }

  const handleBuilderComplete = () => {
    setSectionsCompleted(prev => ({ ...prev, builder: true }));
  };

  const sections = [
    {
      id: 'builder' as const,
      title: 'Build an Image',
      description: 'Learn how each Dockerfile instruction creates a layer',
    },
    {
      id: 'cache' as const,
      title: 'Layer Caching',
      description: 'Discover why layer order matters for fast builds',
    },
    {
      id: 'sharing' as const,
      title: 'Layer Sharing',
      description: 'See how images share layers to save storage',
    },
  ];

  return (
    <section id="layer-2" className="py-20 px-4 border-t border-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <div className="animate-item opacity-0 flex items-center justify-center gap-3 mb-4">
            <Layers className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-text">
              Images & <span className="text-primary">Layers</span>
            </h2>
          </div>
          <p className="animate-item opacity-0 text-muted text-lg max-w-2xl mx-auto">
            Docker images are built in layers. Understanding layers is key to building
            efficient images.
          </p>
        </div>

        {/* Quick intro */}
        <FadeIn className="mb-12">
          <div className="bg-surface rounded-xl p-6 border border-muted/30">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-mono font-bold">1</span>
                </div>
                <h4 className="font-mono text-sm text-text mb-1">Each instruction = 1 layer</h4>
                <p className="text-xs text-muted">FROM, RUN, COPY each create a layer</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-secondary font-mono font-bold">2</span>
                </div>
                <h4 className="font-mono text-sm text-text mb-1">Layers are cached</h4>
                <p className="text-xs text-muted">Unchanged layers are reused on rebuild</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-warning font-mono font-bold">3</span>
                </div>
                <h4 className="font-mono text-sm text-text mb-1">Layers are shared</h4>
                <p className="text-xs text-muted">Multiple images can share base layers</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Section Tabs */}
        <FadeIn delay={0.2} className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const isComplete = sectionsCompleted[section.id];

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
                    transition-all border ${
                      isActive
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-surface border-muted/30 text-muted hover:border-primary/30 hover:text-text'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                    ${isComplete ? 'bg-primary text-background' : 'bg-muted/30'}`}>
                    {isComplete ? '✓' : index + 1}
                  </span>
                  {section.title}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted mt-3">
            {sections.find(s => s.id === activeSection)?.description}
          </p>
        </FadeIn>

        {/* Active Section Content */}
        <FadeIn delay={0.3} key={activeSection}>
          {activeSection === 'builder' && (
            <InteractiveLayerBuilder onComplete={handleBuilderComplete} />
          )}

          {activeSection === 'cache' && (
            <LayerCaching />
          )}

          {activeSection === 'sharing' && (
            <LayerSharingVisualizer />
          )}
        </FadeIn>

        {/* Navigation hint */}
        <FadeIn delay={0.4} className="mt-12 text-center">
          <p className="text-xs text-muted">
            {activeSection === 'builder' && !sectionsCompleted.builder && (
              <>Build an image with at least 3 layers to continue</>
            )}
            {activeSection === 'builder' && sectionsCompleted.builder && (
              <>Try Layer Caching next to learn about caching</>
            )}
            {activeSection === 'cache' && (
              <>Click lines to mark them as changed, then rebuild</>
            )}
            {activeSection === 'sharing' && (
              <>Select multiple images to see shared layers</>
            )}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
